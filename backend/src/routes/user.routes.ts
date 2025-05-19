import { Router, Request, Response } from 'express';

// Placeholder routes
const router = Router();

// Rutas GET
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all users' });
});

router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get user by ID' });
});

// Rutas POST
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create user' });
});

// Rutas PUT
router.put('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Update user' });
});

// Rutas DELETE
router.delete('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Delete user' });
});

export default router;