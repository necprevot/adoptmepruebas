import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';

const requester = supertest('http://localhost:8080');

describe('Testing Adoptions Module', function() {
    this.timeout(10000);
    
    let testUser;
    let testPet;
    let createdAdoption;
    
    // Crear datos de prueba antes de los tests
    before(async function() {
        // Crear usuario de prueba
        const userResponse = await requester
            .post('/api/sessions/register')
            .send({
                first_name: 'Test',
                last_name: 'Adoption',
                email: `adoption.test${Date.now()}@test.com`,
                password: 'test123'
            });
        
        // Obtener el usuario creado
        const usersResponse = await requester.get('/api/users');
        testUser = usersResponse.body.payload.find(u => 
            u.email.includes('adoption.test')
        );
        
        // Crear mascota de prueba
        const petResponse = await requester
            .post('/api/pets')
            .send({
                name: 'TestPet',
                specie: 'dog',
                birthDate: '2020-01-01'
            });
        
        testPet = petResponse.body.payload;
    });
    
    // Test 1: GET /api/adoptions - Obtener todas las adopciones
    describe('GET /api/adoptions', () => {
        it('Debe retornar todas las adopciones', async () => {
            const response = await requester.get('/api/adoptions');
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload');
            expect(response.body.payload).to.be.an('array');
        });
        
        it('Debe retornar un array aunque esté vacío', async () => {
            const response = await requester.get('/api/adoptions');
            
            expect(response.body.payload).to.be.an('array');
        });
    });
    
    // Test 2: POST /api/adoptions/:uid/:pid - Crear adopción
    describe('POST /api/adoptions/:uid/:pid', () => {
        it('Debe crear una adopción exitosamente', async () => {
            const response = await requester
                .post(`/api/adoptions/${testUser._id}/${testPet._id}`);
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('message', 'Pet adopted');
            
            // Guardar la adopción para tests posteriores
            const adoptionsResponse = await requester.get('/api/adoptions');
            createdAdoption = adoptionsResponse.body.payload[adoptionsResponse.body.payload.length - 1];
        });
        
        it('Debe fallar si el usuario no existe', async () => {
            const fakeUserId = new mongoose.Types.ObjectId();
            const response = await requester
                .post(`/api/adoptions/${fakeUserId}/${testPet._id}`);
            
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
            expect(response.body).to.have.property('error', 'user Not found');
        });
        
        it('Debe fallar si la mascota no existe', async () => {
            const fakePetId = new mongoose.Types.ObjectId();
            const response = await requester
                .post(`/api/adoptions/${testUser._id}/${fakePetId}`);
            
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
            expect(response.body).to.have.property('error', 'Pet not found');
        });
        
        it('Debe fallar si la mascota ya está adoptada', async () => {
            const response = await requester
                .post(`/api/adoptions/${testUser._id}/${testPet._id}`);
            
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
            expect(response.body).to.have.property('error', 'Pet is already adopted');
        });
        
        it('Debe fallar con ID de usuario inválido', async () => {
            const response = await requester
                .post(`/api/adoptions/invalidId/${testPet._id}`);
            
            expect(response.status).to.be.oneOf([400, 404, 500]);
            expect(response.body).to.have.property('status', 'error');
        });
        
        it('Debe fallar con ID de mascota inválido', async () => {
            const response = await requester
                .post(`/api/adoptions/${testUser._id}/invalidId`);
            
            expect(response.status).to.be.oneOf([400, 404, 500]);
            expect(response.body).to.have.property('status', 'error');
        });
    });
    
    // Test 3: GET /api/adoptions/:aid - Obtener adopción específica
    describe('GET /api/adoptions/:aid', () => {
        it('Debe retornar una adopción específica', async () => {
            // Crear una nueva mascota y adopción para este test
            const newPet = await requester
                .post('/api/pets')
                .send({
                    name: 'TestPet2',
                    specie: 'cat',
                    birthDate: '2021-01-01'
                });
            
            const newUser = await requester
                .post('/api/sessions/register')
                .send({
                    first_name: 'Test2',
                    last_name: 'Adoption2',
                    email: `adoption.test2${Date.now()}@test.com`,
                    password: 'test123'
                });
            
            const usersResponse = await requester.get('/api/users');
            const user2 = usersResponse.body.payload.find(u => 
                u.email.includes('adoption.test2')
            );
            
            await requester
                .post(`/api/adoptions/${user2._id}/${newPet.body.payload._id}`);
            
            const adoptionsResponse = await requester.get('/api/adoptions');
            const adoption = adoptionsResponse.body.payload[adoptionsResponse.body.payload.length - 1];
            
            const response = await requester.get(`/api/adoptions/${adoption._id}`);
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload');
            expect(response.body.payload).to.have.property('_id');
            expect(response.body.payload).to.have.property('owner');
            expect(response.body.payload).to.have.property('pet');
        });
        
        it('Debe fallar si la adopción no existe', async () => {
            const fakeAdoptionId = new mongoose.Types.ObjectId();
            const response = await requester.get(`/api/adoptions/${fakeAdoptionId}`);
            
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status', 'error');
            expect(response.body).to.have.property('error', 'Adoption not found');
        });
        
        it('Debe fallar con ID inválido', async () => {
            const response = await requester.get('/api/adoptions/invalidId');
            
            expect(response.status).to.be.oneOf([400, 404, 500]);
            expect(response.body).to.have.property('status', 'error');
        });
    });
    
    // Test 4: Validaciones de integridad
    describe('Validaciones de integridad de datos', () => {
        it('La adopción debe actualizar el array de pets del usuario', async () => {
            const userResponse = await requester.get(`/api/users/${testUser._id}`);
            const updatedUser = userResponse.body.payload;
            
            expect(updatedUser.pets).to.be.an('array');
            expect(updatedUser.pets.length).to.be.greaterThan(0);
        });
        
        it('La mascota adoptada debe tener adopted=true', async () => {
            const petsResponse = await requester.get('/api/pets');
            const adoptedPet = petsResponse.body.payload.find(p => p._id === testPet._id);
            
            expect(adoptedPet).to.have.property('adopted', true);
            expect(adoptedPet).to.have.property('owner');
        });
    });
    
    // Limpiar datos de prueba después de los tests
    after(async function() {
        // Aquí podrías limpiar los datos de prueba si lo deseas
        console.log('Tests de adopciones completados');
    });
});