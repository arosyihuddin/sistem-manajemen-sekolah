import { Request, Response, NextFunction } from 'express';
import { GuruService } from '../services/guru.service';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Schema validasi untuk create dan update guru
const guruSchema = z.object({
  nip: z.string().min(3, 'NIP minimal 3 karakter'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  tempatLahir: z.string().optional().nullable(),
  tanggalLahir: z.string().optional().nullable(),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']).optional().nullable(),
  agama: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  telepon: z.string().optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable(),
  pendidikanTerakhir: z.string().optional().nullable(),
  jurusan: z.string().optional().nullable(),
  tahunMulaiMengajar: z.number().optional().nullable(),
});

// Schema untuk mata pelajaran
const mataPelajaranSchema = z.object({
  mataPelajaranIds: z.array(z.number()),
});

// Schema untuk pembuatan user
const userSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  email: z.string().email('Email tidak valid').optional(),
});

export class GuruController {
  private guruService = new GuruService();

  getGuruAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;
      const status = req.query.status !== undefined 
        ? req.query.status === 'true' 
        : undefined;

      const result = await this.guruService.findAll(
        page,
        limit,
        search,
        status
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

  getGuruById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.guruService.findById(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getGuruByNIP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nip = req.params.nip;
      
      const result = await this.guruService.findByNIP(nip);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guruData = guruSchema.parse(req.body);
      
      // Verificar si se envían materias
      let mataPelajaranIds;
      if (req.body.mataPelajaranIds) {
        mataPelajaranIds = mataPelajaranSchema.parse(req.body).mataPelajaranIds;
      }
      
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
      
      const result = await this.guruService.create(
        guruData,
        mataPelajaranIds,
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

  updateGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const guruData = guruSchema.partial().parse(req.body);
      
      // Verificar si se envían materias
      let mataPelajaranIds;
      if (req.body.mataPelajaranIds !== undefined) {
        mataPelajaranIds = mataPelajaranSchema.parse(req.body).mataPelajaranIds;
      }
      
      const result = await this.guruService.update(id, guruData, mataPelajaranIds);
      
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

  deleteGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.guruService.delete(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  restoreGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.guruService.restore(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadFoto = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('File tidak ditemukan', 400);
      }
      
      const id = Number(req.params.id);
      const result = await this.guruService.uploadFoto(id, req.file);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createUserForGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const userData = userSchema.parse(req.body);
      
      const result = await this.guruService.createUserForGuru(
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

  addMataPelajaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const mataPelajaranId = Number(req.params.mataPelajaranId);
      
      const result = await this.guruService.addMataPelajaran(id, mataPelajaranId);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  removeMataPelajaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const mataPelajaranId = Number(req.params.mataPelajaranId);
      
      const result = await this.guruService.removeMataPelajaran(id, mataPelajaranId);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}