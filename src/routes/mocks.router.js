import { Router } from 'express';
import { generateMockUsers, generateMockPets } from '../utils/mocking.js';
import { usersService, petsService } from '../services/index.js';

const router = Router();

// Endpoint GET /mockingpets - Genera 100 mascotas
router.get('/mockingpets', (req, res) => {
    try {
        const pets = generateMockPets(100);
        res.send({ status: 'success', payload: pets });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

// Endpoint GET /mockingusers - Genera 50 usuarios
router.get('/mockingusers', async (req, res) => {
    try {
        const users = await generateMockUsers(50);
        res.send({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

// Endpoint POST /generateData - Genera e inserta datos en la BD
router.post('/generateData', async (req, res) => {
    try {
        const { users, pets } = req.body;
        
        // Validar que se reciban los parámetros
        if (!users || !pets) {
            return res.status(400).send({ 
                status: 'error', 
                error: 'Se requieren los parámetros "users" y "pets"' 
            });
        }

        // Validar que sean números
        if (isNaN(users) || isNaN(pets)) {
            return res.status(400).send({ 
                status: 'error', 
                error: 'Los parámetros "users" y "pets" deben ser números' 
            });
        }

        // Generar usuarios
        const mockUsers = await generateMockUsers(parseInt(users));
        
        // Generar mascotas
        const mockPets = generateMockPets(parseInt(pets));

const [usersInserted, petsInserted] = await Promise.all([
            usersService.insertMany(mockUsers),
            petsService.insertMany(mockPets)
        ]);

        res.send({ 
            status: 'success', 
            message: `Se insertaron ${usersInserted.length} usuarios y ${petsInserted.length} mascotas`,
            payload: {
                usersInserted: usersInserted.length,
                petsInserted: petsInserted.length
            }
        });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

export default router;