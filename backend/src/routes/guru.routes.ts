import { Router } from 'express';
import { GuruController } from '../controllers/guru.controller';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const guruController = new GuruController();

// Configurasi multer untuk upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rutas públicas (si se requieren)
// ...

// Rutas protegidas
router.use(authenticate);

// Rutas GET
router.get('/', guruController.getGuruAll);
router.get('/:id', guruController.getGuruById);
router.get('/nip/:nip', guruController.getGuruByNIP);

// Rutas POST
router.post('/', guruController.createGuru);
router.post('/:id/upload-foto', upload.single('foto'), guruController.uploadFoto);
router.post('/:id/create-user', guruController.createUserForGuru);

// Rutas PUT
router.put('/:id', guruController.updateGuru);

// Rutas DELETE
router.delete('/:id', guruController.deleteGuru);

// Rutas adicionales
router.post('/:id/restore', guruController.restoreGuru);

// Rutas para gestionar materias
router.post('/:id/mata-pelajaran/:mataPelajaranId', guruController.addMataPelajaran);
router.delete('/:id/mata-pelajaran/:mataPelajaranId', guruController.removeMataPelajaran);

export default router;