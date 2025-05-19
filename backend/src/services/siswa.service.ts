import { AppDataSource } from '../config/database';
import { Siswa } from '../entities/Siswa';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Kelas } from '../entities/Kelas';
import { AppError } from '../middleware/errorHandler';
import { DeepPartial, FindOptionsWhere, ILike } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcrypt';

export class SiswaService {
  private siswaRepository = AppDataSource.getRepository(Siswa);
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);
  private kelasRepository = AppDataSource.getRepository(Kelas);

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: boolean,
    kelasId?: number
  ) {
    const whereClause: FindOptionsWhere<Siswa> = {};
    
    if (search) {
      whereClause.nama = ILike(`%${search}%`);
    }
    
    if (status !== undefined) {
      whereClause.status = status;
    }
    
    if (kelasId) {
      whereClause.kelas = { id: kelasId };
    }

    const [siswa, total] = await this.siswaRepository.findAndCount({
      where: whereClause,
      relations: ['kelas', 'user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { nama: 'ASC' },
    });

    return {
      data: siswa.map(s => ({
        ...s,
        user: s.user ? {
          id: s.user.id,
          username: s.user.username,
          email: s.user.email,
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
    const siswa = await this.siswaRepository.findOne({
      where: { id },
      relations: ['kelas', 'user'],
    });

    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }

    // Transform user data to remove sensitive information
    return {
      ...siswa,
      user: siswa.user ? {
        id: siswa.user.id,
        username: siswa.user.username,
        email: siswa.user.email,
      } : undefined
    };
  }

  async findByNIS(nis: string) {
    const siswa = await this.siswaRepository.findOne({
      where: { nis },
      relations: ['kelas', 'user'],
    });

    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }

    return {
      ...siswa,
      user: siswa.user ? {
        id: siswa.user.id,
        username: siswa.user.username,
        email: siswa.user.email,
      } : undefined
    };
  }

  async create(siswaData: DeepPartial<Siswa>, createUser: boolean = false, username?: string, password?: string, email?: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si ya existe un NIS
      const existingSiswa = await this.siswaRepository.findOne({
        where: { nis: siswaData.nis as string },
      });

      if (existingSiswa) {
        throw new AppError('NIS sudah digunakan', 400);
      }

      // Verificar kelas si se proporciona
      let kelas = undefined;
      if (siswaData.kelas && (siswaData.kelas as any).id) {
        kelas = await this.kelasRepository.findOne({
          where: { id: (siswaData.kelas as any).id },
        });

        if (!kelas) {
          throw new AppError('Kelas tidak ditemukan', 404);
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

        // Obtener rol siswa
        const siswaRole = await this.roleRepository.findOne({
          where: { name: 'siswa' },
        });

        if (!siswaRole) {
          throw new AppError('Role siswa tidak ditemukan', 404);
        }

        // Crear usuario
        user = this.userRepository.create({
          username,
          password: await bcrypt.hash(password, 12),
          email: email || `${username}@example.com`,
          role: siswaRole,
          isActive: true,
        });

        user = await queryRunner.manager.save(user);
      }

      // Crear siswa
      const newSiswa = this.siswaRepository.create({
        ...siswaData,
        kelas,
        user,
      });

      const savedSiswa = await queryRunner.manager.save(newSiswa);

      await queryRunner.commitTransaction();
      
      return {
        ...savedSiswa,
        user: savedSiswa.user ? {
          id: savedSiswa.user.id,
          username: savedSiswa.user.username,
          email: savedSiswa.user.email,
        } : undefined
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, siswaData: DeepPartial<Siswa>) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar siswa existente
      const siswa = await this.siswaRepository.findOne({
        where: { id },
        relations: ['kelas', 'user'],
      });

      if (!siswa) {
        throw new AppError('Siswa tidak ditemukan', 404);
      }

      // Verificar NIS único si se cambia
      if (siswaData.nis && siswaData.nis !== siswa.nis) {
        const existingSiswa = await this.siswaRepository.findOne({
          where: { nis: siswaData.nis as string },
        });

        if (existingSiswa && existingSiswa.id !== id) {
          throw new AppError('NIS sudah digunakan', 400);
        }
      }

      // Verificar kelas si se proporciona
      if (siswaData.kelas && (siswaData.kelas as any).id) {
        const kelas = await this.kelasRepository.findOne({
          where: { id: (siswaData.kelas as any).id },
        });

        if (!kelas) {
          throw new AppError('Kelas tidak ditemukan', 404);
        }

        siswaData.kelas = kelas;
      }

      // Actualizar siswa
      const updatedSiswa = this.siswaRepository.merge(siswa, siswaData);
      const savedSiswa = await queryRunner.manager.save(updatedSiswa);

      await queryRunner.commitTransaction();

      return {
        ...savedSiswa,
        user: savedSiswa.user ? {
          id: savedSiswa.user.id,
          username: savedSiswa.user.username,
          email: savedSiswa.user.email,
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
      // Buscar siswa
      const siswa = await this.siswaRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!siswa) {
        throw new AppError('Siswa tidak ditemukan', 404);
      }

      // Soft delete (actualizar status)
      siswa.status = false;
      await queryRunner.manager.save(siswa);

      // Si tiene usuario, desactivarlo
      if (siswa.user) {
        siswa.user.isActive = false;
        await queryRunner.manager.save(siswa.user);
      }

      await queryRunner.commitTransaction();

      return { message: 'Siswa berhasil dihapus' };
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
      // Buscar siswa
      const siswa = await this.siswaRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!siswa) {
        throw new AppError('Siswa tidak ditemukan', 404);
      }

      // Restore (actualizar status)
      siswa.status = true;
      await queryRunner.manager.save(siswa);

      // Si tiene usuario, activarlo
      if (siswa.user) {
        siswa.user.isActive = true;
        await queryRunner.manager.save(siswa.user);
      }

      await queryRunner.commitTransaction();

      return { message: 'Siswa berhasil diaktifkan' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async uploadFoto(id: number, file: Express.Multer.File) {
    const siswa = await this.siswaRepository.findOne({
      where: { id },
    });

    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }

    // Eliminar foto anterior si existe
    if (siswa.foto) {
      const oldFilePath = path.join(__dirname, '../../../uploads/siswa', siswa.foto);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Guardar nueva foto
    const fileName = `${Date.now()}_${file.originalname}`;
    siswa.foto = fileName;
    await this.siswaRepository.save(siswa);

    // Mover archivo a destino final
    const filePath = path.join(__dirname, '../../../uploads/siswa', fileName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      filename: fileName,
      path: `/uploads/siswa/${fileName}`,
    };
  }

  async uploadDokumenAkta(id: number, file: Express.Multer.File) {
    const siswa = await this.siswaRepository.findOne({
      where: { id },
    });

    if (!siswa) {
      throw new AppError('Siswa tidak ditemukan', 404);
    }

    // Eliminar documento anterior si existe
    if (siswa.dokumenAkta) {
      const oldFilePath = path.join(__dirname, '../../../uploads/siswa', siswa.dokumenAkta);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Guardar nuevo documento
    const fileName = `${Date.now()}_${file.originalname}`;
    siswa.dokumenAkta = fileName;
    await this.siswaRepository.save(siswa);

    // Mover archivo a destino final
    const filePath = path.join(__dirname, '../../../uploads/siswa', fileName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      filename: fileName,
      path: `/uploads/siswa/${fileName}`,
    };
  }

  async createUserForSiswa(id: number, username: string, password: string, email?: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar siswa
      const siswa = await this.siswaRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!siswa) {
        throw new AppError('Siswa tidak ditemukan', 404);
      }

      // Verificar si ya tiene usuario
      if (siswa.user) {
        throw new AppError('Siswa sudah memiliki user', 400);
      }

      // Verificar si username ya existe
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });

      if (existingUser) {
        throw new AppError('Username sudah digunakan', 400);
      }

      // Obtener rol siswa
      const siswaRole = await this.roleRepository.findOne({
        where: { name: 'siswa' },
      });

      if (!siswaRole) {
        throw new AppError('Role siswa tidak ditemukan', 404);
      }

      // Crear usuario
      const user = this.userRepository.create({
        username,
        password: await bcrypt.hash(password, 12),
        email: email || `${username}@example.com`,
        role: siswaRole,
        isActive: true,
      });

      const savedUser = await queryRunner.manager.save(user);

      // Asociar usuario a siswa
      siswa.user = savedUser;
      await queryRunner.manager.save(siswa);

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
}