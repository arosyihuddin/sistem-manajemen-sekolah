import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { LogActivity } from '../entities/LogActivity';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);
  private logActivityRepository = AppDataSource.getRepository(LogActivity);

  async login(username: string, password: string, ipAddress?: string, userAgent?: string) {
    // 1. Buscar usuario por username
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });

    if (!user) {
      throw new AppError('Username atau password salah', 401);
    }

    // 2. Verificar el estado de la cuenta
    if (!user.isActive) {
      throw new AppError('Akun dinonaktifkan. Silakan hubungi admin.', 401);
    }

    // 3. Verificar la contraseña
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError('Username atau password salah', 401);
    }

    // 4. Generar token JWT
    const token = this.signToken(user.id);

    // 5. Actualizar último inicio de sesión
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // 6. Registrar actividad de inicio de sesión
    await this.logActivityRepository.save({
      action: 'LOGIN',
      description: `User ${user.username} logged in`,
      ipAddress,
      userAgent,
      user,
    });

    // 7. Devolver información de usuario y token
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
      token,
    };
  }

  async register(
    username: string,
    password: string,
    email: string,
    roleName: string = 'siswa'
  ) {
    // 1. Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new AppError('Username sudah digunakan', 400);
      }
      if (existingUser.email === email) {
        throw new AppError('Email sudah digunakan', 400);
      }
    }

    // 2. Obtener el rol
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (!role) {
      throw new AppError('Role tidak ditemukan', 400);
    }

    // 3. Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Crear usuario
    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      role,
      isActive: true,
    });

    await this.userRepository.save(newUser);

    // 5. Generar token
    const token = this.signToken(newUser.id);

    // 6. Devolver información de usuario
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: role.name,
      token,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // 1. Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // 2. Verificar contraseña actual
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      throw new AppError('Password saat ini salah', 401);
    }

    // 3. Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 4. Actualizar contraseña
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await this.userRepository.save(user);

    return { message: 'Password berhasil diubah' };
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // Registrar actividad de cierre de sesión
    await this.logActivityRepository.save({
      action: 'LOGOUT',
      description: `User ${user.username} logged out`,
      ipAddress,
      userAgent,
      user,
    });

    return { message: 'Berhasil logout' };
  }

  private signToken(id: string) {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
  }
}