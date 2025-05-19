import { Router, Request, Response } from 'express';

// Placeholder routes
const router = Router();

// Rutas GET
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all absensi' });
});

router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get absensi by ID' });
});

// Rutas POST
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create absensi' });
});

// Rutas PUT
router.put('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Update absensi' });
});

// Rutas DELETE
router.delete('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Delete absensi' });
});

export default router;