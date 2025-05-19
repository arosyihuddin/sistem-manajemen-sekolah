import { Router, Request, Response } from 'express';
import multer from 'multer';

// Configuración multer para upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Placeholder routes dengan pendekatan sederhana
const router = Router();

// Rutas GET
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all siswa' });
});

router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get siswa by ID' });
});

router.get('/nis/:nis', (_req: Request, res: Response) => {
  res.json({ message: 'Get siswa by NIS' });
});

// Rutas POST
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create siswa' });
});

router.post('/:id/upload-foto', upload.single('foto'), (_req: Request, res: Response) => {
  res.json({ message: 'Upload foto' });
});

router.post('/:id/upload-dokumen-akta', upload.single('dokumen'), (_req: Request, res: Response) => {
  res.json({ message: 'Upload dokumen akta' });
});

router.post('/:id/create-user', (_req: Request, res: Response) => {
  res.json({ message: 'Create user for siswa' });
});

// Rutas PUT
router.put('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Update siswa' });
});

// Rutas DELETE
router.delete('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Delete siswa' });
});

// Rutas adicionales
router.post('/:id/restore', (_req: Request, res: Response) => {
  res.json({ message: 'Restore siswa' });
});

export default router;