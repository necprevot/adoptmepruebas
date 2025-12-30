import { Router } from 'express';
import petsController from '../controllers/pets.controller.js';
import { petUploader } from '../utils/uploader.js';

const router = Router();

router.get('/', petsController.getAllPets);
router.post('/', petsController.createPet);
router.post('/withimage', petUploader.single('image'), petsController.createPetWithImage);
router.put('/:pid', petsController.updatePet);
router.delete('/:pid', petsController.deletePet);

export default router;