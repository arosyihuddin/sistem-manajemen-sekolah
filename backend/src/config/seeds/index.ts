import { AppDataSource } from '../database';
import { Role } from '../../entities/Role';
import { User } from '../../entities/User';
import bcrypt from 'bcrypt';
import Logger from '../../utils/logger';

export const seedRoles = async () => {
  try {
    const roleRepository = AppDataSource.getRepository(Role);
    
    // Check if roles already exist
    const existingRoles = await roleRepository.find();
    if (existingRoles.length > 0) {
      Logger.info('Roles are already seeded, skipping...');
      return existingRoles;
    }
    
    // Create default roles
    const roles = roleRepository.create([
      {
        name: 'admin',
        description: 'Administrator dengan akses penuh ke sistem',
      },
      {
        name: 'guru',
        description: 'Guru dengan akses ke modul pembelajaran dan penilaian',
      },
      {
        name: 'siswa',
        description: 'Siswa dengan akses terbatas ke profil, jadwal, dan nilai',
      },
    ]);
    
    await roleRepository.save(roles);
    Logger.info('Default roles have been seeded successfully');
    
    return roles;
  } catch (error) {
    Logger.error('Error seeding roles:', error);
    throw error;
  }
};

export const seedAdminUser = async (roles: Role[]) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { username: 'admin' },
    });
    
    if (existingAdmin) {
      Logger.info('Admin user already exists, skipping...');
      return existingAdmin;
    }
    
    // Find admin role
    const adminRole = roles.find((role) => role.name === 'admin');
    if (!adminRole) {
      throw new Error('Admin role not found');
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = userRepository.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@school.com',
      isActive: true,
      role: adminRole,
    });
    
    await userRepository.save(admin);
    Logger.info('Admin user has been seeded successfully');
    
    return admin;
  } catch (error) {
    Logger.error('Error seeding admin user:', error);
    throw error;
  }
};

export const seedGuruUser = async (roles: Role[]) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if guru user already exists
    const existingGuru = await userRepository.findOne({
      where: { username: 'guru' },
    });
    
    if (existingGuru) {
      Logger.info('Guru user already exists, skipping...');
      return existingGuru;
    }
    
    // Find guru role
    const guruRole = roles.find((role) => role.name === 'guru');
    if (!guruRole) {
      throw new Error('Guru role not found');
    }
    
    // Create guru user
    const hashedPassword = await bcrypt.hash('guru123', 12);
    
    const guru = userRepository.create({
      username: 'guru',
      password: hashedPassword,
      email: 'guru@school.com',
      isActive: true,
      role: guruRole,
    });
    
    await userRepository.save(guru);
    Logger.info('Guru user has been seeded successfully');
    
    return guru;
  } catch (error) {
    Logger.error('Error seeding guru user:', error);
    throw error;
  }
};

export const seedSiswaUser = async (roles: Role[]) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if siswa user already exists
    const existingSiswa = await userRepository.findOne({
      where: { username: 'siswa' },
    });
    
    if (existingSiswa) {
      Logger.info('Siswa user already exists, skipping...');
      return existingSiswa;
    }
    
    // Find siswa role
    const siswaRole = roles.find((role) => role.name === 'siswa');
    if (!siswaRole) {
      throw new Error('Siswa role not found');
    }
    
    // Create siswa user
    const hashedPassword = await bcrypt.hash('siswa123', 12);
    
    const siswa = userRepository.create({
      username: 'siswa',
      password: hashedPassword,
      email: 'siswa@school.com',
      isActive: true,
      role: siswaRole,
    });
    
    await userRepository.save(siswa);
    Logger.info('Siswa user has been seeded successfully');
    
    return siswa;
  } catch (error) {
    Logger.error('Error seeding siswa user:', error);
    throw error;
  }
};

export const runSeeds = async () => {
  try {
    // Ensure database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    // Seed roles
    const roles = await seedRoles();
    
    // Seed users
    await Promise.all([
      seedAdminUser(roles),
      seedGuruUser(roles),
      seedSiswaUser(roles),
    ]);
    
    Logger.info('All seeds have been executed successfully');
    
    // Close the connection
    await AppDataSource.destroy();
  } catch (error) {
    Logger.error('Error executing seeds:', error);
    
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    
    process.exit(1);
  }
};

// Run seeds when this file is executed directly
if (require.main === module) {
  runSeeds();
}