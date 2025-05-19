import { Router, Request, Response } from 'express';
import multer from 'multer';

// Configuración multer para upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Placeholder routes
const router = Router();

// Rutas GET
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all guru' });
});

router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get guru by ID' });
});

router.get('/nip/:nip', (_req: Request, res: Response) => {
  res.json({ message: 'Get guru by NIP' });
});

// Rutas POST
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create guru' });
});

router.post('/:id/upload-foto', upload.single('foto'), (_req: Request, res: Response) => {
  res.json({ message: 'Upload foto' });
});

router.post('/:id/create-user', (_req: Request, res: Response) => {
  res.json({ message: 'Create user for guru' });
});

// Rutas PUT
router.put('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Update guru' });
});

// Rutas DELETE
router.delete('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Delete guru' });
});

// Rutas adicionales
router.post('/:id/restore', (_req: Request, res: Response) => {
  res.json({ message: 'Restore guru' });
});

// Rutas para gestionar materias
router.post('/:id/mata-pelajaran/:mataPelajaranId', (_req: Request, res: Response) => {
  res.json({ message: 'Add mata pelajaran' });
});

router.delete('/:id/mata-pelajaran/:mataPelajaranId', (_req: Request, res: Response) => {
  res.json({ message: 'Remove mata pelajaran' });
});

export default router;