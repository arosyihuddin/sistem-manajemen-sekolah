import { Router, Request, Response } from 'express';

// Placeholder routes
const router = Router();

// Rutas GET
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all jadwal' });
});

router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get jadwal by ID' });
});

// Rutas POST
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create jadwal' });
});

// Rutas PUT
router.put('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Update jadwal' });
});

// Rutas DELETE
router.delete('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Delete jadwal' });
});

export default router;