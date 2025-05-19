import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  email: z.string().email('Email tidak valid'),
  role: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Password minimal 6 karakter'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password baru dan konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const result = await this.authService.login(username, password, ipAddress, userAgent);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: error.errors[0].message,
        });
      }
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, email, role } = registerSchema.parse(req.body);
      
      const result = await this.authService.register(username, password, email, role);
      
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: error.errors[0].message,
        });
      }
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      
      const result = await this.authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: error.errors[0].message,
        });
      }
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const result = await this.authService.logout(req.user.id, ipAddress, userAgent);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        status: 'success',
        data: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role.name,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}