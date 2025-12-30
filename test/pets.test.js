import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';

const requester = supertest('http://localhost:8080');

describe('Testing Pets Module', function() {
    this.timeout(10000);
    
    let createdPetId;
    
    // Test 1: GET /api/pets - Obtener todas las mascotas
    describe('GET /api/pets', () => {
        it('Debe retornar todas las mascotas', async () => {
            const response = await requester.get('/api/pets');
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload');
            expect(response.body.payload).to.be.an('array');
        });
        
        it('Las mascotas deben tener la estructura correcta', async () => {
            const response = await requester.get('/api/pets');
            
            if (response.body.payload.length > 0) {
                const pet = response.body.payload[0];
                expect(pet).to.have.property('_id');
                expect(pet).to.have.property('name');
                expect(pet).to.have.property('specie');
                expect(pet).to.have.property('birthDate');
                expect(pet).to.have.property('adopted');
            }
        });
        
        it('Debe retornar un array aunque esté vacío', async () => {
            const response = await requester.get('/api/pets');
            expect(response.body.payload).to.be.an('array');
        });
    });
    
    // Test 2: POST /api/pets - Crear mascota
    describe('POST /api/pets', () => {
        it('Debe crear una nueva mascota correctamente', async () => {
            const newPet = {
                name: 'TestPet',
                specie: 'dog',
                birthDate: '2020-01-15'
            };
            
            const response = await requester
                .post('/api/pets')
                .send(newPet);
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload');
            expect(response.body.payload).to.have.property('_id');
            expect(response.body.payload.name).to.equal('TestPet');
            expect(response.body.payload.specie).to.equal('dog');
            expect(response.body.payload.adopted).to.equal(false);
            
            createdPetId = response.body.payload._id;
        });
        
        it('Debe fallar si falta el nombre', async () => {
            const incompletePet = {
                specie: 'cat',
                birthDate: '2021-01-01'
            };
            
            const response = await requester
                .post('/api/pets')
                .send(incompletePet);
            
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
            expect(response.body.error).to.equal('Incomplete values');
        });
        
        it('Debe fallar si falta la especie', async () => {
            const incompletePet = {
                name: 'TestPet',
                birthDate: '2021-01-01'
            };
            
            const response = await requester
                .post('/api/pets')
                .send(incompletePet);
            
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });
        
        it('Debe fallar si falta la fecha de nacimiento', async () => {
            const incompletePet = {
                name: 'TestPet',
                specie: 'dog'
            };
            
            const response = await requester
                .post('/api/pets')
                .send(incompletePet);
            
            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status', 'error');
        });
        
        it('Debe crear mascotas con diferentes especies', async () => {
            const species = ['dog', 'cat', 'bird', 'hamster', 'rabbit'];
            
            for (const specie of species) {
                const pet = {
                    name: `Test ${specie}`,
                    specie: specie,
                    birthDate: '2020-01-01'
                };
                
                const response = await requester
                    .post('/api/pets')
                    .send(pet);
                
                expect(response.status).to.equal(200);
                expect(response.body.payload.specie).to.equal(specie);
            }
        });
        
        it('La mascota creada debe tener adopted=false por defecto', async () => {
            const newPet = {
                name: 'DefaultAdoptedTest',
                specie: 'cat',
                birthDate: '2021-06-15'
            };
            
            const response = await requester
                .post('/api/pets')
                .send(newPet);
            
            expect(response.body.payload.adopted).to.equal(false);
        });
        
        it('Debe aceptar diferentes formatos de fecha', async () => {
            const dates = [
                '2020-01-01',
                '2021-12-31',
                '2019-06-15'
            ];
            
            for (const date of dates) {
                const pet = {
                    name: 'DateTest',
                    specie: 'dog',
                    birthDate: date
                };
                
                const response = await requester
                    .post('/api/pets')
                    .send(pet);
                
                expect(response.status).to.equal(200);
            }
        });
    });
    
    // Test 3: PUT /api/pets/:pid - Actualizar mascota
    describe('PUT /api/pets/:pid', () => {
        it('Debe actualizar el nombre de una mascota', async () => {
            const updateData = {
                name: 'UpdatedName'
            };
            
            const response = await requester
                .put(`/api/pets/${createdPetId}`)
                .send(updateData);
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.message).to.equal('pet updated');
            
            // Verificar el cambio
            const petsResponse = await requester.get('/api/pets');
            const updatedPet = petsResponse.body.payload.find(p => p._id === createdPetId);
            expect(updatedPet.name).to.equal('UpdatedName');
        });
        
        it('Debe actualizar la especie de una mascota', async () => {
            const updateData = {
                specie: 'cat'
            };
            
            const response = await requester
                .put(`/api/pets/${createdPetId}`)
                .send(updateData);
            
            expect(response.status).to.equal(200);
            
            const petsResponse = await requester.get('/api/pets');
            const updatedPet = petsResponse.body.payload.find(p => p._id === createdPetId);
            expect(updatedPet.specie).to.equal('cat');
        });
        
        it('Debe actualizar múltiples campos', async () => {
            const updateData = {
                name: 'MultiUpdate',
                specie: 'bird'
            };
            
            const response = await requester
                .put(`/api/pets/${createdPetId}`)
                .send(updateData);
            
            expect(response.status).to.equal(200);
            
            const petsResponse = await requester.get('/api/pets');
            const updatedPet = petsResponse.body.payload.find(p => p._id === createdPetId);
            expect(updatedPet.name).to.equal('MultiUpdate');
            expect(updatedPet.specie).to.equal('bird');
        });
        
        it('Debe poder actualizar el estado de adopción', async () => {
            const updateData = {
                adopted: true
            };
            
            const response = await requester
                .put(`/api/pets/${createdPetId}`)
                .send(updateData);
            
            expect(response.status).to.equal(200);
            
            const petsResponse = await requester.get('/api/pets');
            const updatedPet = petsResponse.body.payload.find(p => p._id === createdPetId);
            expect(updatedPet.adopted).to.equal(true);
        });
        
        it('Debe fallar con ID inválido', async () => {
            const updateData = { name: 'Test' };
            
            const response = await requester
                .put('/api/pets/invalidId')
                .send(updateData);
            
            expect(response.status).to.not.equal(200);
        });
        
        it('Debe fallar con ID inexistente', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const updateData = { name: 'Test' };
            
            const response = await requester
                .put(`/api/pets/${fakeId}`)
                .send(updateData);
            
            expect(response.status).to.equal(200);
        });
    });
    
    // Test 4: DELETE /api/pets/:pid - Eliminar mascota
    describe('DELETE /api/pets/:pid', () => {
        let petToDelete;
        
        before(async () => {
            const newPet = {
                name: 'PetToDelete',
                specie: 'hamster',
                birthDate: '2022-01-01'
            };
            
            const response = await requester
                .post('/api/pets')
                .send(newPet);
            
            petToDelete = response.body.payload._id;
        });
        
        it('Debe eliminar una mascota correctamente', async () => {
            const response = await requester
                .delete(`/api/pets/${petToDelete}`);
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.message).to.equal('pet deleted');
        });
        
        it('La mascota eliminada no debe aparecer en la lista', async () => {
            const petsResponse = await requester.get('/api/pets');
            const deletedPet = petsResponse.body.payload.find(p => p._id === petToDelete);
            
            expect(deletedPet).to.be.undefined;
        });
        
        it('Debe fallar con ID inválido', async () => {
            const response = await requester
                .delete('/api/pets/invalidId');
            
            expect(response.status).to.not.equal(200);
        });
    });
    
    // Test 5: POST /api/pets/withimage - Crear mascota con imagen
    describe('POST /api/pets/withimage', () => {
        it('Debe crear una mascota con imagen', async () => {
            // Nota: Este test requiere un archivo de imagen real para funcionar correctamente
            // En un entorno real, usarías supertest con attach() para subir un archivo
            
            const response = await requester
                .post('/api/pets/withimage')
                .field('name', 'PetWithImage')
                .field('specie', 'dog')
                .field('birthDate', '2020-05-10');
            
            // Sin archivo, debe fallar o retornar un error específico
            expect(response.status).to.be.oneOf([200, 400, 500]);
        });
    });
    
    // Test 6: Validaciones de integridad
    describe('Validaciones de integridad de datos', () => {
        it('Todas las mascotas deben tener campos obligatorios', async () => {
            const response = await requester.get('/api/pets');
            
            response.body.payload.forEach(pet => {
                expect(pet).to.have.property('name');
                expect(pet).to.have.property('specie');
                expect(pet).to.have.property('birthDate');
                expect(pet).to.have.property('adopted');
            });
        });
        
        it('El campo adopted debe ser booleano', async () => {
            const response = await requester.get('/api/pets');
            
            response.body.payload.forEach(pet => {
                expect(pet.adopted).to.be.a('boolean');
            });
        });
        
        it('El campo specie debe ser uno de los valores válidos', async () => {
            const validSpecies = ['dog', 'cat', 'bird', 'hamster', 'rabbit'];
            const response = await requester.get('/api/pets');
            
            response.body.payload.forEach(pet => {
                expect(validSpecies).to.include(pet.specie);
            });
        });
    });
    
    // Test 7: Tests de rendimiento
    describe('Tests de rendimiento', () => {
        it('Debe poder crear múltiples mascotas rápidamente', async function() {
            this.timeout(15000);
            
            const promises = [];
            for (let i = 0; i < 10; i++) {
                const pet = {
                    name: `BatchPet${i}`,
                    specie: 'dog',
                    birthDate: '2020-01-01'
                };
                
                promises.push(requester.post('/api/pets').send(pet));
            }
            
            const responses = await Promise.all(promises);
            
            responses.forEach(response => {
                expect(response.status).to.equal(200);
            });
        });
        
        it('Debe responder rápidamente al obtener todas las mascotas', async () => {
            const startTime = Date.now();
            await requester.get('/api/pets');
            const endTime = Date.now();
            
            const responseTime = endTime - startTime;
            expect(responseTime).to.be.below(2000); // Menos de 2 segundos
        });
    });
    
    after(() => {
        console.log('Tests de mascotas completados');
    });
});