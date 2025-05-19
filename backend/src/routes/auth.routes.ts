import { Router, Request, Response } from 'express';

// Placeholder controller dengan routes sederhana
const router = Router();

// Placeholder untuk login
router.post('/login', (_req: Request, res: Response) => {
  res.json({ message: 'Login endpoint' });
});

// Placeholder untuk register
router.post('/register', (_req: Request, res: Response) => {
  res.json({ message: 'Register endpoint' });
});

// Placeholder untuk get me
router.get('/me', (_req: Request, res: Response) => {
  res.json({ message: 'Get me endpoint' });
});

// Placeholder untuk change password
router.post('/change-password', (_req: Request, res: Response) => {
  res.json({ message: 'Change password endpoint' });
});

// Placeholder untuk logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logout endpoint' });
});

export default router;