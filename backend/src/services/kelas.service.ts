import { AppDataSource } from '../config/database';
import { Kelas } from '../entities/Kelas';
import { Guru } from '../entities/Guru';
import { MataPelajaran } from '../entities/MataPelajaran';
import { TahunAjaran } from '../entities/TahunAjaran';
import { AppError } from '../middleware/errorHandler';
import { DeepPartial, FindOptionsWhere, ILike, In } from 'typeorm';

export class KelasService {
  private kelasRepository = AppDataSource.getRepository(Kelas);
  private guruRepository = AppDataSource.getRepository(Guru);
  private mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
  private tahunAjaranRepository = AppDataSource.getRepository(TahunAjaran);

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    tingkat?: string,
    jurusan?: string,
    tahunAjaranId?: number,
    status?: boolean
  ) {
    const whereClause: FindOptionsWhere<Kelas> = {};
    
    if (search) {
      whereClause.nama = ILike(`%${search}%`);
    }
    
    if (tingkat) {
      whereClause.tingkat = tingkat;
    }
    
    if (jurusan) {
      whereClause.jurusan = jurusan;
    }
    
    if (tahunAjaranId) {
      whereClause.tahunAjaran = { id: tahunAjaranId };
    }
    
    if (status !== undefined) {
      whereClause.status = status;
    }

    const [kelas, total] = await this.kelasRepository.findAndCount({
      where: whereClause,
      relations: ['waliKelas', 'tahunAjaran', 'mataPelajaran'],
      skip: (page - 1) * limit,
      take: limit,
      order: { nama: 'ASC' },
    });

    return {
      data: kelas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id },
      relations: ['waliKelas', 'tahunAjaran', 'mataPelajaran', 'siswa', 'jadwal', 'jadwal.mataPelajaran', 'jadwal.guru'],
    });

    if (!kelas) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    return kelas;
  }

  async create(kelasData: DeepPartial<Kelas>, mataPelajaranIds?: number[]) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar wali kelas si se proporciona
      let waliKelas = undefined;
      if (kelasData.waliKelas && (kelasData.waliKelas as any).id) {
        waliKelas = await this.guruRepository.findOne({
          where: { id: (kelasData.waliKelas as any).id },
        });

        if (!waliKelas) {
          throw new AppError('Guru tidak ditemukan', 404);
        }
      }

      // Verificar tahun ajaran si se proporciona
      let tahunAjaran = undefined;
      if (kelasData.tahunAjaran && (kelasData.tahunAjaran as any).id) {
        tahunAjaran = await this.tahunAjaranRepository.findOne({
          where: { id: (kelasData.tahunAjaran as any).id },
        });

        if (!tahunAjaran) {
          throw new AppError('Tahun ajaran tidak ditemukan', 404);
        }
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

      // Crear kelas
      const newKelas = this.kelasRepository.create({
        ...kelasData,
        waliKelas,
        tahunAjaran,
        mataPelajaran,
      });

      const savedKelas = await queryRunner.manager.save(newKelas);

      await queryRunner.commitTransaction();
      
      return savedKelas;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, kelasData: DeepPartial<Kelas>, mataPelajaranIds?: number[]) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar kelas existente
      const kelas = await this.kelasRepository.findOne({
        where: { id },
        relations: ['waliKelas', 'tahunAjaran', 'mataPelajaran'],
      });

      if (!kelas) {
        throw new AppError('Kelas tidak ditemukan', 404);
      }

      // Verificar wali kelas si se proporciona
      if (kelasData.waliKelas) {
        if ((kelasData.waliKelas as any).id) {
          const waliKelas = await this.guruRepository.findOne({
            where: { id: (kelasData.waliKelas as any).id },
          });

          if (!waliKelas) {
            throw new AppError('Guru tidak ditemukan', 404);
          }

          kelasData.waliKelas = waliKelas;
        } else {
          kelasData.waliKelas = null;
        }
      }

      // Verificar tahun ajaran si se proporciona
      if (kelasData.tahunAjaran) {
        if ((kelasData.tahunAjaran as any).id) {
          const tahunAjaran = await this.tahunAjaranRepository.findOne({
            where: { id: (kelasData.tahunAjaran as any).id },
          });

          if (!tahunAjaran) {
            throw new AppError('Tahun ajaran tidak ditemukan', 404);
          }

          kelasData.tahunAjaran = tahunAjaran;
        } else {
          kelasData.tahunAjaran = null;
        }
      }

      // Actualizar materias si se proporcionan
      if (mataPelajaranIds !== undefined) {
        if (mataPelajaranIds.length > 0) {
          const mataPelajaran = await this.mataPelajaranRepository.findBy({
            id: In(mataPelajaranIds)
          });
          
          if (mataPelajaran.length !== mataPelajaranIds.length) {
            throw new AppError('Beberapa mata pelajaran tidak ditemukan', 404);
          }
          
          kelas.mataPelajaran = mataPelajaran;
        } else {
          kelas.mataPelajaran = [];
        }
      }

      // Actualizar kelas
      const updatedKelas = this.kelasRepository.merge(kelas, kelasData);
      const savedKelas = await queryRunner.manager.save(updatedKelas);

      await queryRunner.commitTransaction();

      return savedKelas;
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
      // Buscar kelas
      const kelas = await this.kelasRepository.findOne({
        where: { id },
        relations: ['siswa'],
      });

      if (!kelas) {
        throw new AppError('Kelas tidak ditemukan', 404);
      }

      // Verificar si tiene estudiantes
      if (kelas.siswa && kelas.siswa.length > 0) {
        throw new AppError('Kelas masih memiliki siswa, tidak dapat dihapus', 400);
      }

      // Soft delete (actualizar status)
      kelas.status = false;
      await queryRunner.manager.save(kelas);

      await queryRunner.commitTransaction();

      return { message: 'Kelas berhasil dihapus' };
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
      // Buscar kelas
      const kelas = await this.kelasRepository.findOne({
        where: { id },
      });

      if (!kelas) {
        throw new AppError('Kelas tidak ditemukan', 404);
      }

      // Restore (actualizar status)
      kelas.status = true;
      await queryRunner.manager.save(kelas);

      await queryRunner.commitTransaction();

      return { message: 'Kelas berhasil diaktifkan' };
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
      // Buscar kelas
      const kelas = await this.kelasRepository.findOne({
        where: { id },
        relations: ['mataPelajaran'],
      });

      if (!kelas) {
        throw new AppError('Kelas tidak ditemukan', 404);
      }

      // Buscar materia
      const mataPelajaran = await this.mataPelajaranRepository.findOneBy({ id: mataPelajaranId });

      if (!mataPelajaran) {
        throw new AppError('Mata pelajaran tidak ditemukan', 404);
      }

      // Verificar si ya tiene la materia
      const alreadyHasMataPelajaran = kelas.mataPelajaran.some(mp => mp.id === mataPelajaranId);

      if (alreadyHasMataPelajaran) {
        throw new AppError('Kelas sudah memiliki mata pelajaran ini', 400);
      }

      // Agregar materia
      kelas.mataPelajaran.push(mataPelajaran);
      await queryRunner.manager.save(kelas);

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
      // Buscar kelas
      const kelas = await this.kelasRepository.findOne({
        where: { id },
        relations: ['mataPelajaran'],
      });

      if (!kelas) {
        throw new AppError('Kelas tidak ditemukan', 404);
      }

      // Verificar si tiene la materia
      const hasMataPelajaran = kelas.mataPelajaran.some(mp => mp.id === mataPelajaranId);

      if (!hasMataPelajaran) {
        throw new AppError('Kelas tidak memiliki mata pelajaran ini', 400);
      }

      // Quitar materia
      kelas.mataPelajaran = kelas.mataPelajaran.filter(mp => mp.id !== mataPelajaranId);
      await queryRunner.manager.save(kelas);

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

  async getSiswaByKelasId(id: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id },
      relations: ['siswa', 'siswa.user'],
    });

    if (!kelas) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    return kelas.siswa.map(s => ({
      ...s,
      user: s.user ? {
        id: s.user.id,
        username: s.user.username,
        email: s.user.email,
      } : undefined
    }));
  }

  async getMataPelajaranByKelasId(id: number) {
    const kelas = await this.kelasRepository.findOne({
      where: { id },
      relations: ['mataPelajaran'],
    });

    if (!kelas) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    return kelas.mataPelajaran;
  }
}