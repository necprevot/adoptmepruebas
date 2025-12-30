import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import { documentUploader } from '../utils/uploader.js';

const router = Router();

router.get('/', usersController.getAllUsers);
router.get('/:uid', usersController.getUser);
router.put('/:uid', usersController.updateUser);
router.delete('/:uid', usersController.deleteUser);

// Nuevo endpoint para subir documentos
router.post('/:uid/documents', 
    documentUploader.array('documents', 5), // Máximo 5 archivos
    usersController.uploadDocuments
);

export default router;