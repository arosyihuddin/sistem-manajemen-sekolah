import { Router } from 'express';
import { MataPelajaranController } from '../controllers/mata-pelajaran.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const mataPelajaranController = new MataPelajaranController();

// Rutas públicas (si se requieren)
// ...

// Rutas protegidas
router.use(authenticate);

// Rutas GET
router.get('/', mataPelajaranController.getMataPelajaranAll);
router.get('/:id', mataPelajaranController.getMataPelajaranById);
router.get('/:id/guru', mataPelajaranController.getGuruByMataPelajaranId);

// Rutas POST
router.post('/', mataPelajaranController.createMataPelajaran);

// Rutas PUT
router.put('/:id', mataPelajaranController.updateMataPelajaran);

// Rutas DELETE
router.delete('/:id', mataPelajaranController.deleteMataPelajaran);

// Rutas adicionales
router.post('/:id/restore', mataPelajaranController.restoreMataPelajaran);

// Rutas para gestionar guru
router.post('/:id/guru/:guruId', mataPelajaranController.addGuru);
router.delete('/:id/guru/:guruId', mataPelajaranController.removeGuru);

export default router;