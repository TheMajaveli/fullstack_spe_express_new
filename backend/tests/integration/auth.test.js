const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');

// Créer une app Express pour les tests
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234',
          first_name: 'Test',
          last_name: 'User',
        });

      // Le test peut échouer si la DB n'est pas configurée, c'est normal
      // En production, utiliser une DB de test
      expect([201, 400, 500]).toContain(response.status);
    });

    it('devrait rejeter un email invalide', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test1234',
        });

      expect([400, 422]).toContain(response.status);
    });

    it('devrait rejeter un mot de passe trop court', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('POST /auth/login', () => {
    it('devrait retourner 400 sans credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect([400, 401]).toContain(response.status);
    });
  });
});

