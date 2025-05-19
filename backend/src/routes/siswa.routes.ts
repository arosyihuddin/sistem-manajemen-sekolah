import { Router } from 'express';
import { SiswaController } from '../controllers/siswa.controller';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const siswaController = new SiswaController();

// Configurasi multer untuk upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rutas públicas (si se requieren)
// ...

// Rutas protegidas
router.use(authenticate);

// Rutas GET
router.get('/', siswaController.getSiswaAll);
router.get('/:id', siswaController.getSiswaById);
router.get('/nis/:nis', siswaController.getSiswaByNIS);

// Rutas POST
router.post('/', siswaController.createSiswa);
router.post('/:id/upload-foto', upload.single('foto'), siswaController.uploadFoto);
router.post('/:id/upload-dokumen-akta', upload.single('dokumen'), siswaController.uploadDokumenAkta);
router.post('/:id/create-user', siswaController.createUserForSiswa);

// Rutas PUT
router.put('/:id', siswaController.updateSiswa);

// Rutas DELETE
router.delete('/:id', siswaController.deleteSiswa);

// Rutas adicionales
router.post('/:id/restore', siswaController.restoreSiswa);

export default router;