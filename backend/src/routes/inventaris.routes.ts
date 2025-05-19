import { Router, Request, Response } from 'express';

// Placeholder routes
const router = Router();

// Rutas GET
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all inventaris' });
});

router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get inventaris by ID' });
});

// Rutas POST
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create inventaris' });
});

// Rutas PUT
router.put('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Update inventaris' });
});

// Rutas DELETE
router.delete('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Delete inventaris' });
});

export default router;