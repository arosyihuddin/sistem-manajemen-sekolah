import { AppDataSource } from '../config/database';
import { MataPelajaran } from '../entities/MataPelajaran';
import { Guru } from '../entities/Guru';
import { AppError } from '../middleware/errorHandler';
import { DeepPartial, FindOptionsWhere, ILike, In } from 'typeorm';

export class MataPelajaranService {
  private mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
  private guruRepository = AppDataSource.getRepository(Guru);

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: boolean
  ) {
    const whereClause: FindOptionsWhere<MataPelajaran> = {};
    
    if (search) {
      whereClause.nama = ILike(`%${search}%`);
    }
    
    if (status !== undefined) {
      whereClause.status = status;
    }

    const [mataPelajaran, total] = await this.mataPelajaranRepository.findAndCount({
      where: whereClause,
      relations: ['guru'],
      skip: (page - 1) * limit,
      take: limit,
      order: { nama: 'ASC' },
    });

    return {
      data: mataPelajaran,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const mataPelajaran = await this.mataPelajaranRepository.findOne({
      where: { id },
      relations: ['guru', 'nilai', 'jadwal'],
    });

    if (!mataPelajaran) {
      throw new AppError('Mata pelajaran tidak ditemukan', 404);
    }

    return mataPelajaran;
  }

  async create(mataPelajaranData: DeepPartial<MataPelajaran>, guruIds?: number[]) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar código único si se proporciona
      if (mataPelajaranData.kode) {
        const existingMataPelajaran = await this.mataPelajaranRepository.findOne({
          where: { kode: mataPelajaranData.kode as string },
        });

        if (existingMataPelajaran) {
          throw new AppError('Kode mata pelajaran sudah digunakan', 400);
        }
      }

      let guru: Guru[] = [];
      
      // Buscar guru si se proporcionan IDs
      if (guruIds && guruIds.length > 0) {
        guru = await this.guruRepository.findBy({
          id: In(guruIds)
        });
        
        if (guru.length !== guruIds.length) {
          throw new AppError('Beberapa guru tidak ditemukan', 404);
        }
      }

      // Crear mata pelajaran
      const newMataPelajaran = this.mataPelajaranRepository.create({
        ...mataPelajaranData,
        guru,
      });

      const savedMataPelajaran = await queryRunner.manager.save(newMataPelajaran);

      await queryRunner.commitTransaction();
      
      return savedMataPelajaran;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, mataPelajaranData: DeepPartial<MataPelajaran>, guruIds?: number[]) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar mata pelajaran existente
      const mataPelajaran = await this.mataPelajaranRepository.findOne({
        where: { id },
        relations: ['guru'],
      });

      if (!mataPelajaran) {
        throw new AppError('Mata pelajaran tidak ditemukan', 404);
      }

      // Verificar código único si se cambia
      if (mataPelajaranData.kode && mataPelajaranData.kode !== mataPelajaran.kode) {
        const existingMataPelajaran = await this.mataPelajaranRepository.findOne({
          where: { kode: mataPelajaranData.kode as string },
        });

        if (existingMataPelajaran && existingMataPelajaran.id !== id) {
          throw new AppError('Kode mata pelajaran sudah digunakan', 400);
        }
      }

      // Actualizar guru si se proporcionan
      if (guruIds !== undefined) {
        if (guruIds.length > 0) {
          const guru = await this.guruRepository.findBy({
            id: In(guruIds)
          });
          
          if (guru.length !== guruIds.length) {
            throw new AppError('Beberapa guru tidak ditemukan', 404);
          }
          
          mataPelajaran.guru = guru;
        } else {
          mataPelajaran.guru = [];
        }
      }

      // Actualizar mata pelajaran
      const updatedMataPelajaran = this.mataPelajaranRepository.merge(mataPelajaran, mataPelajaranData);
      const savedMataPelajaran = await queryRunner.manager.save(updatedMataPelajaran);

      await queryRunner.commitTransaction();

      return savedMataPelajaran;
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
      // Buscar mata pelajaran
      const mataPelajaran = await this.mataPelajaranRepository.findOne({
        where: { id },
        relations: ['jadwal', 'nilai'],
      });

      if (!mataPelajaran) {
        throw new AppError('Mata pelajaran tidak ditemukan', 404);
      }

      // Verificar si está en uso
      if (
        (mataPelajaran.jadwal && mataPelajaran.jadwal.length > 0) ||
        (mataPelajaran.nilai && mataPelajaran.nilai.length > 0)
      ) {
        throw new AppError('Mata pelajaran masih digunakan, tidak dapat dihapus', 400);
      }

      // Soft delete (actualizar status)
      mataPelajaran.status = false;
      await queryRunner.manager.save(mataPelajaran);

      await queryRunner.commitTransaction();

      return { message: 'Mata pelajaran berhasil dihapus' };
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
      // Buscar mata pelajaran
      const mataPelajaran = await this.mataPelajaranRepository.findOne({
        where: { id },
      });

      if (!mataPelajaran) {
        throw new AppError('Mata pelajaran tidak ditemukan', 404);
      }

      // Restore (actualizar status)
      mataPelajaran.status = true;
      await queryRunner.manager.save(mataPelajaran);

      await queryRunner.commitTransaction();

      return { message: 'Mata pelajaran berhasil diaktifkan' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addGuru(id: number, guruId: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar mata pelajaran
      const mataPelajaran = await this.mataPelajaranRepository.findOne({
        where: { id },
        relations: ['guru'],
      });

      if (!mataPelajaran) {
        throw new AppError('Mata pelajaran tidak ditemukan', 404);
      }

      // Buscar guru
      const guru = await this.guruRepository.findOneBy({ id: guruId });

      if (!guru) {
        throw new AppError('Guru tidak ditemukan', 404);
      }

      // Verificar si ya tiene el guru
      const alreadyHasGuru = mataPelajaran.guru.some(g => g.id === guruId);

      if (alreadyHasGuru) {
        throw new AppError('Mata pelajaran sudah memiliki guru ini', 400);
      }

      // Agregar guru
      mataPelajaran.guru.push(guru);
      await queryRunner.manager.save(mataPelajaran);

      await queryRunner.commitTransaction();

      return {
        message: 'Guru berhasil ditambahkan',
        guru,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeGuru(id: number, guruId: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar mata pelajaran
      const mataPelajaran = await this.mataPelajaranRepository.findOne({
        where: { id },
        relations: ['guru'],
      });

      if (!mataPelajaran) {
        throw new AppError('Mata pelajaran tidak ditemukan', 404);
      }

      // Verificar si tiene el guru
      const hasGuru = mataPelajaran.guru.some(g => g.id === guruId);

      if (!hasGuru) {
        throw new AppError('Mata pelajaran tidak memiliki guru ini', 400);
      }

      // Quitar guru
      mataPelajaran.guru = mataPelajaran.guru.filter(g => g.id !== guruId);
      await queryRunner.manager.save(mataPelajaran);

      await queryRunner.commitTransaction();

      return {
        message: 'Guru berhasil dihapus',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getGuruByMataPelajaranId(id: number) {
    const mataPelajaran = await this.mataPelajaranRepository.findOne({
      where: { id },
      relations: ['guru', 'guru.user'],
    });

    if (!mataPelajaran) {
      throw new AppError('Mata pelajaran tidak ditemukan', 404);
    }

    return mataPelajaran.guru.map(g => ({
      ...g,
      user: g.user ? {
        id: g.user.id,
        username: g.user.username,
        email: g.user.email,
      } : undefined
    }));
  }
}