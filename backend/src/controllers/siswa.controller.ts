import { Request, Response, NextFunction } from 'express';
import { SiswaService } from '../services/siswa.service';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import { AuthRequest } from '../middleware/auth';

// Schema validasi untuk create dan update siswa
const siswaSchema = z.object({
  nis: z.string().min(3, 'NIS minimal 3 karakter'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  tempatLahir: z.string().optional().nullable(),
  tanggalLahir: z.string().optional().nullable(),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']).optional().nullable(),
  agama: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  telepon: z.string().optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable(),
  namaAyah: z.string().optional().nullable(),
  namaIbu: z.string().optional().nullable(),
  pekerjaanAyah: z.string().optional().nullable(),
  pekerjaanIbu: z.string().optional().nullable(),
  teleponOrtu: z.string().optional().nullable(),
  alamatOrtu: z.string().optional().nullable(),
  tahunMasuk: z.number().optional().nullable(),
  kelas: z.object({
    id: z.number()
  }).optional().nullable(),
});

// Schema untuk pembuatan user
const userSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  email: z.string().email('Email tidak valid').optional(),
});

// Storage config para multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

export class SiswaController {
  private siswaService = new SiswaService();

  getSiswaAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;
      const status = req.query.status !== undefined 
        ? req.query.status === 'true' 
        : undefined;
      const kelasId = req.query.kelasId 
        ? Number(req.query.kelasId) 
        : undefined;

      const result = await this.siswaService.findAll(
        page,
        limit,
        search,
        status,
        kelasId
      );

      res.status(200).json({
        status: 'success',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getSiswaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.siswaService.findById(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSiswaByNIS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nis = req.params.nis;
      
      const result = await this.siswaService.findByNIS(nis);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const siswaData = siswaSchema.parse(req.body);
      
      // Verificar si se envían datos de usuario
      let createUser = false;
      let username, password, email;
      
      if (req.body.user) {
        const userData = userSchema.parse(req.body.user);
        createUser = true;
        username = userData.username;
        password = userData.password;
        email = userData.email;
      }
      
      const result = await this.siswaService.create(
        siswaData,
        createUser,
        username,
        password,
        email
      );
      
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: error.errors[0].message,
        });
      }
      next(error);
    }
  };

  updateSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const siswaData = siswaSchema.partial().parse(req.body);
      
      const result = await this.siswaService.update(id, siswaData);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: error.errors[0].message,
        });
      }
      next(error);
    }
  };

  deleteSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.siswaService.delete(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  restoreSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.siswaService.restore(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadFoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Multer middleware yang dieksekusi di router
    try {
      if (!req.file) {
        throw new AppError('File tidak ditemukan', 400);
      }
      
      const id = Number(req.params.id);
      const result = await this.siswaService.uploadFoto(id, req.file);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadDokumenAkta = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Multer middleware yang dieksekusi di router
    try {
      if (!req.file) {
        throw new AppError('File tidak ditemukan', 400);
      }
      
      const id = Number(req.params.id);
      const result = await this.siswaService.uploadDokumenAkta(id, req.file);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createUserForSiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const userData = userSchema.parse(req.body);
      
      const result = await this.siswaService.createUserForSiswa(
        id,
        userData.username,
        userData.password,
        userData.email
      );
      
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: error.errors[0].message,
        });
      }
      next(error);
    }
  };
}