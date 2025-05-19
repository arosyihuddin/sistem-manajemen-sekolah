import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rutas protegidas
router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

export default router;