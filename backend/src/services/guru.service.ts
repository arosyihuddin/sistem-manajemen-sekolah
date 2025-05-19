import { AppDataSource } from '../config/database';
import { Guru } from '../entities/Guru';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { MataPelajaran } from '../entities/MataPelajaran';
import { AppError } from '../middleware/errorHandler';
import { DeepPartial, FindOptionsWhere, ILike, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcrypt';

export class GuruService {
  private guruRepository = AppDataSource.getRepository(Guru);
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);
  private mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: boolean
  ) {
    const whereClause: FindOptionsWhere<Guru> = {};
    
    if (search) {
      whereClause.nama = ILike(`%${search}%`);
    }
    
    if (status !== undefined) {
      whereClause.status = status;
    }

    const [guru, total] = await this.guruRepository.findAndCount({
      where: whereClause,
      relations: ['mataPelajaran', 'user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { nama: 'ASC' },
    });

    return {
      data: guru.map(g => ({
        ...g,
        user: g.user ? {
          id: g.user.id,
          username: g.user.username,
          email: g.user.email,
        } : undefined
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const guru = await this.guruRepository.findOne({
      where: { id },
      relations: ['mataPelajaran', 'user', 'kelasWali'],
    });

    if (!guru) {
      throw new AppError('Guru tidak ditemukan', 404);
    }

    return {
      ...guru,
      user: guru.user ? {
        id: guru.user.id,
        username: guru.user.username,
        email: guru.user.email,
      } : undefined
    };
  }

  async findByNIP(nip: string) {
    const guru = await this.guruRepository.findOne({
      where: { nip },
      relations: ['mataPelajaran', 'user', 'kelasWali'],
    });

    if (!guru) {
      throw new AppError('Guru tidak ditemukan', 404);
    }

    return {
      ...guru,
      user: guru.user ? {
        id: guru.user.id,
        username: guru.user.username,
        email: guru.user.email,
      } : undefined
    };
  }

  async create(guruData: DeepPartial<Guru>, mataPelajaranIds?: number[], createUser: boolean = false, username?: string, password?: string, email?: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si ya existe un NIP
      const existingGuru = await this.guruRepository.findOne({
        where: { nip: guruData.nip as string },
      });

      if (existingGuru) {
        throw new AppError('NIP sudah digunakan', 400);
      }

      let mataPelajaran: MataPelajaran[] = [];
      
      // Buscar materias si se proporcionan IDs
      if (mataPelajaranIds && mataPelajaranIds.length > 0) {
        mataPelajaran = await this.mataPelajaranRepository.findBy({
          id: In(mataPelajaranIds)
        });
        
        if (mataPelajaran.length !== mataPelajaranIds.length) {
          throw new AppError('Beberapa mata pelajaran tidak ditemukan', 404);
        }
      }

      let user = undefined;
      
      // Crear usuario si se solicita
      if (createUser && username && password) {
        // Verificar si username ya existe
        const existingUser = await this.userRepository.findOne({
          where: { username },
        });

        if (existingUser) {
          throw new AppError('Username sudah digunakan', 400);
        }

        // Obtener rol guru
        const guruRole = await this.roleRepository.findOne({
          where: { name: 'guru' },
        });

        if (!guruRole) {
          throw new AppError('Role guru tidak ditemukan', 404);
        }

        // Crear usuario
        user = this.userRepository.create({
          username,
          password: await bcrypt.hash(password, 12),
          email: email || `${username}@example.com`,
          role: guruRole,
          isActive: true,
        });

        user = await queryRunner.manager.save(user);
      }

      // Crear guru
      const newGuru = this.guruRepository.create({
        ...guruData,
        mataPelajaran,
        user,
      });

      const savedGuru = await queryRunner.manager.save(newGuru);

      await queryRunner.commitTransaction();
      
      return {
        ...savedGuru,
        user: savedGuru.user ? {
          id: savedGuru.user.id,
          username: savedGuru.user.username,
          email: savedGuru.user.email,
        } : undefined
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, guruData: DeepPartial<Guru>, mataPelajaranIds?: number[]) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar guru existente
      const guru = await this.guruRepository.findOne({
        where: { id },
        relations: ['mataPelajaran', 'user'],
      });

      if (!guru) {
        throw new AppError('Guru tidak ditemukan', 404);
      }

      // Verificar NIP único si se cambia
      if (guruData.nip && guruData.nip !== guru.nip) {
        const existingGuru = await this.guruRepository.findOne({
          where: { nip: guruData.nip as string },
        });

        if (existingGuru && existingGuru.id !== id) {
          throw new AppError('NIP sudah digunakan', 400);
        }
      }

      // Actualizar materias si se proporcionan
      if (mataPelajaranIds) {
        if (mataPelajaranIds.length > 0) {
          const mataPelajaran = await this.mataPelajaranRepository.findBy({
            id: In(mataPelajaranIds)
          });
          
          if (mataPelajaran.length !== mataPelajaranIds.length) {
            throw new AppError('Beberapa mata pelajaran tidak ditemukan', 404);
          }
          
          guru.mataPelajaran = mataPelajaran;
        } else {
          guru.mataPelajaran = [];
        }
      }

      // Actualizar guru
      const updatedGuru = this.guruRepository.merge(guru, guruData);
      const savedGuru = await queryRunner.manager.save(updatedGuru);

      await queryRunner.commitTransaction();

      return {
        ...savedGuru,
        user: savedGuru.user ? {
          id: savedGuru.user.id,
          username: savedGuru.user.username,
          email: savedGuru.user.email,
        } : undefined
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar guru
      const guru = await this.guruRepository.findOne({
        where: { id },
        relations: ['user', 'kelasWali'],
      });

      if (!guru) {
        throw new AppError('Guru tidak ditemukan', 404);
      }

      // Verificar si es wali kelas
      if (guru.kelasWali && guru.kelasWali.length > 0) {
        throw new AppError('Guru masih menjadi wali kelas, tidak dapat dihapus', 400);
      }

      // Soft delete (actualizar status)
      guru.status = false;
      await queryRunner.manager.save(guru);

      // Si tiene usuario, desactivarlo
      if (guru.user) {
        guru.user.isActive = false;
        await queryRunner.manager.save(guru.user);
      }

      await queryRunner.commitTransaction();

      return { message: 'Guru berhasil dihapus' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async restore(id: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar guru
      const guru = await this.guruRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!guru) {
        throw new AppError('Guru tidak ditemukan', 404);
      }

      // Restore (actualizar status)
      guru.status = true;
      await queryRunner.manager.save(guru);

      // Si tiene usuario, activarlo
      if (guru.user) {
        guru.user.isActive = true;
        await queryRunner.manager.save(guru.user);
      }

      await queryRunner.commitTransaction();

      return { message: 'Guru berhasil diaktifkan' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async uploadFoto(id: number, file: Express.Multer.File) {
    const guru = await this.guruRepository.findOne({
      where: { id },
    });

    if (!guru) {
      throw new AppError('Guru tidak ditemukan', 404);
    }

    // Eliminar foto anterior si existe
    if (guru.foto) {
      const oldFilePath = path.join(__dirname, '../../../uploads/guru', guru.foto);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Guardar nueva foto
    const fileName = `${Date.now()}_${file.originalname}`;
    guru.foto = fileName;
    await this.guruRepository.save(guru);

    // Mover archivo a destino final
    const filePath = path.join(__dirname, '../../../uploads/guru', fileName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      filename: fileName,
      path: `/uploads/guru/${fileName}`,
    };
  }

  async createUserForGuru(id: number, username: string, password: string, email?: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar guru
      const guru = await this.guruRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!guru) {
        throw new AppError('Guru tidak ditemukan', 404);
      }

      // Verificar si ya tiene usuario
      if (guru.user) {
        throw new AppError('Guru sudah memiliki user', 400);
      }

      // Verificar si username ya existe
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });

      if (existingUser) {
        throw new AppError('Username sudah digunakan', 400);
      }

      // Obtener rol guru
      const guruRole = await this.roleRepository.findOne({
        where: { name: 'guru' },
      });

      if (!guruRole) {
        throw new AppError('Role guru tidak ditemukan', 404);
      }

      // Crear usuario
      const user = this.userRepository.create({
        username,
        password: await bcrypt.hash(password, 12),
        email: email || `${username}@example.com`,
        role: guruRole,
        isActive: true,
      });

      const savedUser = await queryRunner.manager.save(user);

      // Asociar usuario a guru
      guru.user = savedUser;
      await queryRunner.manager.save(guru);

      await queryRunner.commitTransaction();

      return {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addMataPelajaran(id: number, mataPelajaranId: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar guru
      const guru = await this.guruRepository.findOne({
        where: { id },
        relations: ['mataPelajaran'],
      });

      if (!guru) {
        throw new AppError('Guru tidak ditemukan', 404);
      }

      // Buscar materia
      const mataPelajaran = await this.mataPelajaranRepository.findOneBy({ id: mataPelajaranId });

      if (!mataPelajaran) {
        throw new AppError('Mata pelajaran tidak ditemukan', 404);
      }

      // Verificar si ya tiene la materia
      const alreadyHasMataPelajaran = guru.mataPelajaran.some(mp => mp.id === mataPelajaranId);

      if (alreadyHasMataPelajaran) {
        throw new AppError('Guru sudah mengajar mata pelajaran ini', 400);
      }

      // Agregar materia
      guru.mataPelajaran.push(mataPelajaran);
      await queryRunner.manager.save(guru);

      await queryRunner.commitTransaction();

      return {
        message: 'Mata pelajaran berhasil ditambahkan',
        mataPelajaran,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeMataPelajaran(id: number, mataPelajaranId: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar guru
      const guru = await this.guruRepository.findOne({
        where: { id },
        relations: ['mataPelajaran'],
      });

      if (!guru) {
        throw new AppError('Guru tidak ditemukan', 404);
      }

      // Verificar si tiene la materia
      const hasMataPelajaran = guru.mataPelajaran.some(mp => mp.id === mataPelajaranId);

      if (!hasMataPelajaran) {
        throw new AppError('Guru tidak mengajar mata pelajaran ini', 400);
      }

      // Quitar materia
      guru.mataPelajaran = guru.mataPelajaran.filter(mp => mp.id !== mataPelajaranId);
      await queryRunner.manager.save(guru);

      await queryRunner.commitTransaction();

      return {
        message: 'Mata pelajaran berhasil dihapus',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}