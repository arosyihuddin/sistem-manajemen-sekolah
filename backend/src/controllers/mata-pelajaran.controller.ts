import { Request, Response, NextFunction } from 'express';
import { MataPelajaranService } from '../services/mata-pelajaran.service';
import { z } from 'zod';

// Schema validasi untuk create dan update mata pelajaran
const mataPelajaranSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  kode: z.string().optional().nullable(),
  deskripsi: z.string().optional().nullable(),
  kkm: z.number().min(0).default(0),
  jumlahJam: z.number().min(0).default(0),
});

// Schema untuk guru
const guruSchema = z.object({
  guruIds: z.array(z.number()),
});

export class MataPelajaranController {
  private mataPelajaranService = new MataPelajaranService();

  getMataPelajaranAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;
      const status = req.query.status !== undefined 
        ? req.query.status === 'true' 
        : undefined;

      const result = await this.mataPelajaranService.findAll(
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

  getMataPelajaranById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.mataPelajaranService.findById(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createMataPelajaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mataPelajaranData = mataPelajaranSchema.parse(req.body);
      
      // Verificar si se envían guru
      let guruIds;
      if (req.body.guruIds) {
        guruIds = guruSchema.parse(req.body).guruIds;
      }
      
      const result = await this.mataPelajaranService.create(mataPelajaranData, guruIds);
      
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

  updateMataPelajaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const mataPelajaranData = mataPelajaranSchema.partial().parse(req.body);
      
      // Verificar si se envían guru
      let guruIds;
      if (req.body.guruIds !== undefined) {
        guruIds = guruSchema.parse(req.body).guruIds;
      }
      
      const result = await this.mataPelajaranService.update(id, mataPelajaranData, guruIds);
      
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

  deleteMataPelajaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.mataPelajaranService.delete(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  restoreMataPelajaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.mataPelajaranService.restore(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  addGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const guruId = Number(req.params.guruId);
      
      const result = await this.mataPelajaranService.addGuru(id, guruId);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  removeGuru = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const guruId = Number(req.params.guruId);
      
      const result = await this.mataPelajaranService.removeGuru(id, guruId);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getGuruByMataPelajaranId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      
      const result = await this.mataPelajaranService.getGuruByMataPelajaranId(id);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}