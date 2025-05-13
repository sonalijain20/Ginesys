const request = require('supertest');
const app = require('../app');
const testingPort = process.env.TESTING_PORT || 3000;

const userObject = { username: 'sonalitest122', password: 'Test1234' }


describe('Auth Routes', () => {
    let server;

    beforeAll(() => {
        server = app.listen(testingPort);
    });

    afterAll((done) => {
        server.close(done);
    });

    // //   Register a new user
    test('Register a new user', async () => {
        const res = await request(server)
            .post('/api/auth/register')
            .send(userObject);

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toMatch(/User registered successfully/i);
    });

    //register an existing user
    test('Register an existing user', async () => {
        const res = await request(server)
            .post('/api/auth/register')
            .send({ username: 'testuser', password: 'Test1234' });

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toMatch(/Username already exists./i);
    });

    //Register with a blank username
    test('Register a user with blank username', async () => {
        const res = await request(server)
            .post('/api/auth/register')
            .send({ username: '', password: 'Test1234' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/Username and password are required/i);
    });

    //login with correct credentials
    test('Login with correct credentials', async () => {
        const res = await request(server)
            .post('/api/auth/login')
            .send(userObject);

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    //login with incorrect credentials
    test('Login with incorrect credentials', async () => {
        const res = await request(server)
            .post('/api/auth/login')
            .send({ username: 'testuser', password: 'Test12324' });

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toMatch(/Invalid Credentials/i);
    });
});
