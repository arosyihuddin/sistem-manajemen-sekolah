import { Router } from 'express';
import { KelasController } from '../controllers/kelas.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const kelasController = new KelasController();

// Rutas públicas (si se requieren)
// ...

// Rutas protegidas
router.use(authenticate);

// Rutas GET
router.get('/', kelasController.getKelasAll);
router.get('/:id', kelasController.getKelasById);
router.get('/:id/siswa', kelasController.getSiswaByKelasId);
router.get('/:id/mata-pelajaran', kelasController.getMataPelajaranByKelasId);

// Rutas POST
router.post('/', kelasController.createKelas);

// Rutas PUT
router.put('/:id', kelasController.updateKelas);

// Rutas DELETE
router.delete('/:id', kelasController.deleteKelas);

// Rutas adicionales
router.post('/:id/restore', kelasController.restoreKelas);

// Rutas para gestionar materias
router.post('/:id/mata-pelajaran/:mataPelajaranId', kelasController.addMataPelajaran);
router.delete('/:id/mata-pelajaran/:mataPelajaranId', kelasController.removeMataPelajaran);

export default router;