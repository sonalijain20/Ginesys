const request = require('supertest');
const path = require('path');
const app = require('../app');

describe('Dog Image Routes', () => {
  let token = '';
  let uploadedId = '';

  beforeAll(async () => {
    //login to get the token
    const loginRes = await request(app).post('/api/auth/login').send({ username: 'sonalijain12', password: '123456' });
    token = loginRes.body.token;
  });

    //upload an image without token
    test('Upload an image without token', async () => {
        const res = await request(app)
          .post('/api/dogs')
          .attach('image', path.join(__dirname, 'sample.jpeg'));
    
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toMatch(/log-in first/i);
      });

  //upload an image
  test('Upload an image', async () => {
    const res = await request(app)
      .post('/api/dogs')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', path.join(__dirname, 'sample.jpeg'));

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/uploaded/i);
  });

  //fetch the list of uploaded images
  test('Fetch the list of uploaded images', async () => {
    const res = await request(app)
      .get('/api/dogs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    uploadedId = res.body.data[0]?.id;
  });

  test('Fetch a specific image by ID', async () => {
    const res = await request(app)
      .get(`/api/dogs/${uploadedId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/image/);
  });

  test('Delete the uploaded image', async () => {
    const res = await request(app)
      .delete(`/api/dogs/${uploadedId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Dog image deleted/i);
  });
});
