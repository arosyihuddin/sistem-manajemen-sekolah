import 'reflect-metadata';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppDataSource } from './config/database';
import Logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import path from 'path';

// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import siswaRoutes from './routes/siswa.routes';
import guruRoutes from './routes/guru.routes';
import kelasRoutes from './routes/kelas.routes';
import mataPelajaranRoutes from './routes/mata-pelajaran.routes';
import jadwalRoutes from './routes/jadwal.routes';
import absensiRoutes from './routes/absensi.routes';
import nilaiRoutes from './routes/nilai.routes';
import pembayaranRoutes from './routes/pembayaran.routes';
import inventarisRoutes from './routes/inventaris.routes';

// Cargar variables de entorno
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/mata-pelajaran', mataPelajaranRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/nilai', nilaiRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/inventaris', inventarisRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Inicializar conexión a la base de datos
    await AppDataSource.initialize();
    Logger.info('Database connection established successfully');

    app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    Logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();