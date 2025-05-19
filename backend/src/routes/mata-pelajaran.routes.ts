import { Router, Request, Response } from 'express';

// Placeholder routes
const router = Router();

// Rutas GET
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all mata pelajaran' });
});

router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get mata pelajaran by ID' });
});

router.get('/:id/guru', (_req: Request, res: Response) => {
  res.json({ message: 'Get guru by mata pelajaran ID' });
});

// Rutas POST
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create mata pelajaran' });
});

// Rutas PUT
router.put('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Update mata pelajaran' });
});

// Rutas DELETE
router.delete('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Delete mata pelajaran' });
});

// Rutas adicionales
router.post('/:id/restore', (_req: Request, res: Response) => {
  res.json({ message: 'Restore mata pelajaran' });
});

// Rutas para gestionar guru
router.post('/:id/guru/:guruId', (_req: Request, res: Response) => {
  res.json({ message: 'Add guru' });
});

router.delete('/:id/guru/:guruId', (_req: Request, res: Response) => {
  res.json({ message: 'Remove guru' });
});

export default router;