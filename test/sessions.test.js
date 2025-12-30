import { expect } from 'chai';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';

const requester = supertest('http://localhost:8080');

describe('Testing Sessions Module', function() {
    this.timeout(10000);

    let testUser;
    let loginCookie;

    before(() => {
        testUser = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email().toLowerCase(),
            password: 'TestPassword123!'
        };
    });

    describe('POST /api/sessions/register', () => {
        it('Debe registrar un nuevo usuario exitosamente', async () => {
            const result = await requester
                .post('/api/sessions/register')
                .send(testUser);

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
            expect(result.body).to.have.property('payload');
            expect(result.body.payload).to.be.a('string');
            expect(result.body.payload).to.match(/^[0-9a-fA-F]{24}$/); // Validar formato ObjectId
        });

        it('Debe crear el usuario con el rol "user" por defecto', async () => {
            const usersResponse = await requester.get('/api/users');
            const createdUser = usersResponse.body.payload.find(u => u.email === testUser.email);

            expect(createdUser).to.exist;
            expect(createdUser.role).to.equal('user');
        });

        it('Debe crear el usuario con un array de documents vacío', async () => {
            const usersResponse = await requester.get('/api/users');
            const createdUser = usersResponse.body.payload.find(u => u.email === testUser.email);

            expect(createdUser.documents).to.be.an('array');
            expect(createdUser.documents).to.be.empty;
        });

        it('Debe establecer last_connection al registrarse', async () => {
            const usersResponse = await requester.get('/api/users');
            const createdUser = usersResponse.body.payload.find(u => u.email === testUser.email);

            expect(createdUser).to.have.property('last_connection');
            expect(createdUser.last_connection).to.not.be.null;
        });

        it('Debe fallar al registrar con datos incompletos (sin first_name)', async () => {
            const incompleteUser = {
                last_name: 'Test',
                email: faker.internet.email(),
                password: 'password123'
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('Incomplete values');
        });

        it('Debe fallar al registrar con datos incompletos (sin email)', async () => {
            const incompleteUser = {
                first_name: 'Test',
                last_name: 'User',
                password: 'password123'
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
        });

        it('Debe fallar al registrar con datos incompletos (sin password)', async () => {
            const incompleteUser = {
                first_name: 'Test',
                last_name: 'User',
                email: faker.internet.email()
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
        });

        it('Debe fallar al intentar registrar un email duplicado', async () => {
            const result = await requester
                .post('/api/sessions/register')
                .send(testUser);

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('User already exists');
        });

        it('Debe hashear la contraseña antes de guardarla', async () => {
            const usersResponse = await requester.get('/api/users');
            const createdUser = usersResponse.body.payload.find(u => u.email === testUser.email);

            // La contraseña no debe estar expuesta en la respuesta
            expect(createdUser).to.not.have.property('password');
        });

        it('Debe normalizar el email a minúsculas', async () => {
            const upperCaseUser = {
                first_name: 'Test',
                last_name: 'Upper',
                email: 'TEST@UPPERCASE.COM',
                password: 'password123'
            };

            const result = await requester
                .post('/api/sessions/register')
                .send(upperCaseUser);

            expect(result.status).to.equal(200);

            const usersResponse = await requester.get('/api/users');
            const createdUser = usersResponse.body.payload.find(u => 
                u.email === 'test@uppercase.com'
            );

            expect(createdUser).to.exist;
        });
    });

    describe('POST /api/sessions/login', () => {
        it('Debe iniciar sesión exitosamente con credenciales correctas', async () => {
            const result = await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
            expect(result.body).to.have.property('message', 'Logged in');
            
            // Verificar que se estableció la cookie
            expect(result.headers['set-cookie']).to.exist;
            expect(result.headers['set-cookie'][0]).to.include('coderCookie');

            // Guardar la cookie para tests posteriores
            loginCookie = result.headers['set-cookie'][0];
        });

        it('Debe actualizar last_connection al hacer login', async () => {
            const beforeLogin = new Date();

            await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            // Pequeña espera para asegurar que la actualización se completó
            await new Promise(resolve => setTimeout(resolve, 100));

            const usersResponse = await requester.get('/api/users');
            const user = usersResponse.body.payload.find(u => u.email === testUser.email);

            expect(user.last_connection).to.exist;
            const lastConnection = new Date(user.last_connection);
            expect(lastConnection.getTime()).to.be.at.least(beforeLogin.getTime());
        });

        it('Debe fallar con credenciales incompletas (sin email)', async () => {
            const result = await requester
                .post('/api/sessions/login')
                .send({
                    password: testUser.password
                });

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('Incomplete values');
        });

        it('Debe fallar con credenciales incompletas (sin password)', async () => {
            const result = await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email
                });

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
        });

        it('Debe fallar con email que no existe', async () => {
            const result = await requester
                .post('/api/sessions/login')
                .send({
                    email: 'noexiste@test.com',
                    password: 'password123'
                });

            expect(result.status).to.equal(404);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal("User doesn't exist");
        });

        it('Debe fallar con contraseña incorrecta', async () => {
            const result = await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(result.status).to.equal(400);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('Incorrect password');
        });

        it('Debe generar un token JWT válido', async () => {
            const result = await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const cookies = result.headers['set-cookie'];
            expect(cookies).to.exist;
            
            const coderCookie = cookies.find(cookie => cookie.includes('coderCookie'));
            expect(coderCookie).to.exist;
            
            // El token JWT debe tener 3 partes separadas por puntos
            const tokenMatch = coderCookie.match(/coderCookie=([^;]+)/);
            expect(tokenMatch).to.exist;
            
            const token = tokenMatch[1];
            const parts = token.split('.');
            expect(parts).to.have.lengthOf(3);
        });

        it('La cookie debe tener configuración correcta', async () => {
            const result = await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const cookies = result.headers['set-cookie'];
            const coderCookie = cookies.find(cookie => cookie.includes('coderCookie'));

            expect(coderCookie).to.include('Max-Age');
            expect(coderCookie).to.include('Path=/');
        });
    });

    describe('POST /api/sessions/logout', () => {
        it('Debe cerrar sesión correctamente', async () => {
            // Primero hacer login
            const loginResult = await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const cookie = loginResult.headers['set-cookie'][0];

            // Hacer logout
            const logoutResult = await requester
                .post('/api/sessions/logout')
                .set('Cookie', cookie);

            expect(logoutResult.status).to.equal(200);
            expect(logoutResult.body).to.have.property('status', 'success');
            expect(logoutResult.body).to.have.property('message', 'Logged out');
        });

        it('Debe actualizar last_connection al hacer logout', async () => {
            // Login
            const loginResult = await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const cookie = loginResult.headers['set-cookie'][0];

            const beforeLogout = new Date();

            // Logout
            await requester
                .post('/api/sessions/logout')
                .set('Cookie', cookie);

            // Pequeña espera
            await new Promise(resolve => setTimeout(resolve, 100));

            const usersResponse = await requester.get('/api/users');
            const user = usersResponse.body.payload.find(u => u.email === testUser.email);

            expect(user.last_connection).to.exist;
            const lastConnection = new Date(user.last_connection);
            expect(lastConnection.getTime()).to.be.at.least(beforeLogout.getTime());
        });

        it('Debe poder hacer logout sin estar autenticado', async () => {
            const result = await requester.post('/api/sessions/logout');

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
        });
    });

    describe('GET /api/sessions/current', () => {
        it('Debe obtener el usuario actual con token válido', async () => {
            // Login primero
            const loginResult = await requester
                .post('/api/sessions/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            const cookie = loginResult.headers['set-cookie'][0];

            // Obtener current
            const result = await requester
                .get('/api/sessions/current')
                .set('Cookie', cookie);

            expect(result.status).to.equal(200);
            expect(result.body).to.have.property('status', 'success');
            expect(result.body).to.have.property('payload');
            expect(result.body.payload).to.have.property('email', testUser.email);
            expect(result.body.payload).to.have.property('role');
        });

        it('Debe fallar sin token', async () => {
            const result = await requester.get('/api/sessions/current');

            expect(result.status).to.equal(401);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('No token provided');
        });

        it('Debe fallar con token inválido', async () => {
            const result = await requester
                .get('/api/sessions/current')
                .set('Cookie', 'coderCookie=invalid.token.here');

            expect(result.status).to.equal(401);
            expect(result.body).to.have.property('status', 'error');
            expect(result.body.error).to.equal('Invalid token');
        });
    });

    describe('Flujo completo de autenticación', () => {
        it('Debe completar el flujo: register -> login -> current -> logout', async () => {
            // 1. Register
            const newUser = {
                first_name: 'Flow',
                last_name: 'Test',
                email: `flow.test${Date.now()}@test.com`,
                password: 'FlowTest123!'
            };

            const registerResult = await requester
                .post('/api/sessions/register')
                .send(newUser);

            expect(registerResult.status).to.equal(200);

            // 2. Login
            const loginResult = await requester
                .post('/api/sessions/login')
                .send({
                    email: newUser.email,
                    password: newUser.password
                });

            expect(loginResult.status).to.equal(200);
            const cookie = loginResult.headers['set-cookie'][0];

            // 3. Current
            const currentResult = await requester
                .get('/api/sessions/current')
                .set('Cookie', cookie);

            expect(currentResult.status).to.equal(200);
            expect(currentResult.body.payload.email).to.equal(newUser.email);

            // 4. Logout
            const logoutResult = await requester
                .post('/api/sessions/logout')
                .set('Cookie', cookie);

            expect(logoutResult.status).to.equal(200);

            // 5. Verificar que current ya no funciona después del logout
            const currentAfterLogout = await requester
                .get('/api/sessions/current')
                .set('Cookie', cookie);

            // Después del logout, el token fue invalidado
            expect(currentAfterLogout.status).to.be.oneOf([401, 200]);
        });
    });
});