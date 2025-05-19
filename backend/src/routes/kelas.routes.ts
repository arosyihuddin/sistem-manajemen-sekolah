import { Router, Request, Response } from 'express';

// Placeholder routes
const router = Router();

// Rutas GET
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all kelas' });
});

router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get kelas by ID' });
});

router.get('/:id/siswa', (_req: Request, res: Response) => {
  res.json({ message: 'Get siswa by kelas ID' });
});

router.get('/:id/mata-pelajaran', (_req: Request, res: Response) => {
  res.json({ message: 'Get mata pelajaran by kelas ID' });
});

// Rutas POST
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create kelas' });
});

// Rutas PUT
router.put('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Update kelas' });
});

// Rutas DELETE
router.delete('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Delete kelas' });
});

// Rutas adicionales
router.post('/:id/restore', (_req: Request, res: Response) => {
  res.json({ message: 'Restore kelas' });
});

// Rutas para gestionar materias
router.post('/:id/mata-pelajaran/:mataPelajaranId', (_req: Request, res: Response) => {
  res.json({ message: 'Add mata pelajaran' });
});

router.delete('/:id/mata-pelajaran/:mataPelajaranId', (_req: Request, res: Response) => {
  res.json({ message: 'Remove mata pelajaran' });
});

export default router;