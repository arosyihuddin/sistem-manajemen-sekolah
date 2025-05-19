import { Request, Response, NextFunction } from 'express';
import { KelasService } from '../services/kelas.service';
import { z } from 'zod';

// Schema validasi untuk create dan update kelas
const kelasSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  tingkat: z.string().optional().nullable(),
  jurusan: z.string().optional().nullable(),
  kodeKelas: z.string().optional().nullable(),
  ruangan: z.string().optional().nullable(),
  waliKelas: z.object({
    id: z.number()
  }).optional().nullable(),
  tahunAjaran: z.object({
    id: z.number()
  }).optional().nullable(),
});

// Schema untuk mata pelajaran
const mataPelajaranSchema = z.object({
  mataPelajaranIds: z.array(z.number()),
});

export class KelasController {
  private kelasService = new KelasService();

  getKelasAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;
      const tingkat = req.query.tingkat as string;
      const jurusan = req.query.jurusan as string;
      const tahunAjaranId = req.query.tahunAjaranId 
        ? Number(req.query.tahunAjaranId) 
        : undefined;
      const status = req.query.status !== undefined 
        ? req.query.status === 'true' 
        : undefined;

      const result = await this.kelasService.findAll(
        page,
        limit,
        search,
        tingkat,
        jurusan,
        tahunAjaranId,
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

  getKelasById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.kelasService.findById(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kelasData = kelasSchema.parse(req.body);
      
      // Verificar si se envían materias
      let mataPelajaranIds;
      if (req.body.mataPelajaranIds) {
        mataPelajaranIds = mataPelajaranSchema.parse(req.body).mataPelajaranIds;
      }
      
      const result = await this.kelasService.create(kelasData, mataPelajaranIds);
      
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

  updateKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const kelasData = kelasSchema.partial().parse(req.body);
      
      // Verificar si se envían materias
      let mataPelajaranIds;
      if (req.body.mataPelajaranIds !== undefined) {
        mataPelajaranIds = mataPelajaranSchema.parse(req.body).mataPelajaranIds;
      }
      
      const result = await this.kelasService.update(id, kelasData, mataPelajaranIds);
      
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

  deleteKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.kelasService.delete(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  restoreKelas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.kelasService.restore(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  addMataPelajaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const mataPelajaranId = Number(req.params.mataPelajaranId);
      
      const result = await this.kelasService.addMataPelajaran(id, mataPelajaranId);
      
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
      
      const result = await this.kelasService.removeMataPelajaran(id, mataPelajaranId);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSiswaByKelasId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.kelasService.getSiswaByKelasId(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMataPelajaranByKelasId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.kelasService.getMataPelajaranByKelasId(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}