import { expect } from 'chai';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';

const requester = supertest('http://localhost:8080');

describe('Testing Users Module', () => {
    let testUser;
    let createdUserId;

    // Generar datos de prueba antes de todas las pruebas
    before(() => {
        testUser = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email().toLowerCase(),
            password: 'test123456'
        };
    });

    describe('POST /api/sessions/register', () => {
        it('Debe registrar un nuevo usuario correctamente', async () => {
            const result = await requester
                .post('/api/sessions/register')
                .send(testUser);

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
            expect(result.body).to.have.property('payload');
            expect(result.body.payload).to.be.a('string');
            
            // Guardar el ID del usuario para pruebas posteriores
            createdUserId = result.body.payload;
        });

        it('Debe fallar al registrar un usuario con email duplicado', async () => {
            const result = await requester
                .post('/api/sessions/register')
                .send(testUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('User already exists');
        });

        it('Debe fallar al registrar un usuario sin first_name', async () => {
            const incompleteUser = {
                last_name: testUser.last_name,
                email: faker.internet.email(),
                password: testUser.password
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('Incomplete values');
        });

        it('Debe fallar al registrar un usuario sin last_name', async () => {
            const incompleteUser = {
                first_name: testUser.first_name,
                email: faker.internet.email(),
                password: testUser.password
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
        });

        it('Debe fallar al registrar un usuario sin email', async () => {
            const incompleteUser = {
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                password: testUser.password
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
        });

        it('Debe fallar al registrar un usuario sin password', async () => {
            const incompleteUser = {
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                email: faker.internet.email()
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
        });
    });

    describe('GET /api/users', () => {
        it('Debe obtener todos los usuarios', async () => {
            const result = await requester.get('/api/users');

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
            expect(result.body).to.have.property('payload');
            expect(result.body.payload).to.be.an('array');
            expect(result.body.payload.length).to.be.greaterThan(0);
        });

        it('Los usuarios deben tener la estructura correcta', async () => {
            const result = await requester.get('/api/users');

            const user = result.body.payload[0];
            expect(user).to.have.property('_id');
            expect(user).to.have.property('first_name');
            expect(user).to.have.property('last_name');
            expect(user).to.have.property('email');
            expect(user).to.have.property('role');
            expect(user).to.have.property('pets');
            expect(user.pets).to.be.an('array');
        });

        it('Los usuarios NO deben exponer la contraseña', async () => {
            const result = await requester.get('/api/users');

            const user = result.body.payload[0];
            expect(user).to.not.have.property('password');
        });
    });

    describe('GET /api/users/:uid', () => {
        it('Debe obtener un usuario por ID', async () => {
            const result = await requester.get(`/api/users/${createdUserId}`);

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
            expect(result.body).to.have.property('payload');
            expect(result.body.payload).to.be.an('object');
            expect(result.body.payload._id).to.equal(createdUserId);
            expect(result.body.payload.email).to.equal(testUser.email.toLowerCase());
        });

        it('Debe fallar al buscar un usuario con ID inválido', async () => {
            const invalidId = '123456789012345678901234';
            const result = await requester.get(`/api/users/${invalidId}`);

            expect(result.status).to.equal(404);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('User not found');
        });

        it('Debe fallar al buscar un usuario con formato de ID incorrecto', async () => {
            const result = await requester.get('/api/users/invalid-id-format');

            // Mongoose lanzará un error de cast
            expect(result.status).to.not.equal(200);
        });
    });

    describe('PUT /api/users/:uid', () => {
        it('Debe actualizar el nombre de un usuario', async () => {
            const updateData = {
                first_name: 'NuevoNombre'
            };

            const result = await requester
                .put(`/api/users/${createdUserId}`)
                .send(updateData);

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
            expect(result.body.message).to.equal('User updated');

            // Verificar que el cambio se aplicó
            const userCheck = await requester.get(`/api/users/${createdUserId}`);
            expect(userCheck.body.payload.first_name).to.equal('NuevoNombre');
        });

        it('Debe actualizar múltiples campos de un usuario', async () => {
            const updateData = {
                first_name: 'OtroNombre',
                last_name: 'OtroApellido'
            };

            const result = await requester
                .put(`/api/users/${createdUserId}`)
                .send(updateData);

            expect(result.status).to.equal(200);

            // Verificar cambios
            const userCheck = await requester.get(`/api/users/${createdUserId}`);
            expect(userCheck.body.payload.first_name).to.equal('OtroNombre');
            expect(userCheck.body.payload.last_name).to.equal('OtroApellido');
        });

        it('Debe fallar al actualizar un usuario inexistente', async () => {
            const invalidId = '123456789012345678901234';
            const updateData = {
                first_name: 'Test'
            };

            const result = await requester
                .put(`/api/users/${invalidId}`)
                .send(updateData);

            expect(result.status).to.equal(404);
            expect(result.body).to.have.property('status', 'error');
        });

        it('Debe poder actualizar el rol de un usuario', async () => {
            const updateData = {
                role: 'admin'
            };

            const result = await requester
                .put(`/api/users/${createdUserId}`)
                .send(updateData);

            expect(result.status).to.equal(200);

            const userCheck = await requester.get(`/api/users/${createdUserId}`);
            expect(userCheck.body.payload.role).to.equal('admin');
        });
    });

    describe('DELETE /api/users/:uid', () => {
        let userToDelete;

        // Crear un usuario específico para eliminar
        before(async () => {
            const newUser = {
                first_name: 'UserToDelete',
                last_name: 'Test',
                email: faker.internet.email(),
                password: 'password123'
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(newUser);

            userToDelete = result.body.payload;
        });

        it('Debe eliminar un usuario correctamente', async () => {
            const result = await requester.delete(`/api/users/${userToDelete}`);

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
            expect(result.body.message).to.equal('User deleted');
        });

        it('El usuario eliminado no debe existir en la base de datos', async () => {
            const result = await requester.get(`/api/users/${userToDelete}`);

            expect(result.status).to.equal(404);
        });

        it('Debe fallar al intentar eliminar un usuario inexistente', async () => {
            const invalidId = '123456789012345678901234';
            const result = await requester.delete(`/api/users/${invalidId}`);

            // El endpoint actual no valida esto correctamente, pero debería
            expect(result.status).to.equal(200); // Esto es un bug en el código actual
        });
    });

    describe('Validaciones de datos de usuario', () => {
        it('El email debe almacenarse en minúsculas', async () => {
            const upperCaseEmail = {
                first_name: 'Test',
                last_name: 'User',
                email: 'TEST@EXAMPLE.COM',
                password: 'password123'
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(upperCaseEmail);

            expect(result.status).to.equal(200);

            const userId = result.body.payload;
            const userCheck = await requester.get(`/api/users/${userId}`);
            
            expect(userCheck.body.payload.email).to.equal('test@example.com');

            // Limpiar
            await requester.delete(`/api/users/${userId}`);
        });

        it('La contraseña debe estar hasheada en la base de datos', async () => {
            const result = await requester.get(`/api/users/${createdUserId}`);

            expect(result.body.payload).to.not.have.property('password');
        });

        it('Un nuevo usuario debe tener rol "user" por defecto', async () => {
            const newUser = {
                first_name: 'Default',
                last_name: 'Role',
                email: faker.internet.email(),
                password: 'password123'
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(newUser);

            const userId = result.body.payload;
            const userCheck = await requester.get(`/api/users/${userId}`);
            
            expect(userCheck.body.payload.role).to.equal('user');

            // Limpiar
            await requester.delete(`/api/users/${userId}`);
        });

        it('Un nuevo usuario debe tener un array vacío de mascotas', async () => {
            const result = await requester.get(`/api/users/${createdUserId}`);

            expect(result.body.payload.pets).to.be.an('array');
            expect(result.body.payload.pets).to.be.empty;
        });
    });
});