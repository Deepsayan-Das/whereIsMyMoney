import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import userRoutes from '../routes/user.routes.js';
import { createTestUser } from './helpers.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/users', userRoutes);

describe('User Authentication', () => {
    describe('POST /api/users/register', () => {
        it('should register a new user with valid credentials', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe('newuser@example.com');
        });

        it('should reject registration with invalid email', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'invalidemail',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
        });

        it('should reject registration with short password', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'test@example.com',
                    password: '123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
        });

        it('should reject duplicate email registration', async () => {
            const email = 'duplicate@example.com';
            await createTestUser(email, 'password123');

            const response = await request(app)
                .post('/api/users/register')
                .send({
                    email,
                    password: 'password123'
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toContain('duplicate');
        });
    });

    describe('POST /api/users/login', () => {
        it('should login with valid credentials', async () => {
            await createTestUser('login@example.com', 'password123');

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
        });

        it('should reject login with wrong password', async () => {
            await createTestUser('user@example.com', 'correctpassword');

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'user@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toContain('Invalid password');
        });

        it('should reject login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toContain('not registered');
        });
    });

    describe('GET /api/users/profile', () => {
        it('should get user profile with valid token', async () => {
            const user = await createTestUser('profile@example.com', 'password123');
            const token = user.generateJWT();

            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.user.email).toBe('profile@example.com');
        });

        it('should reject access without token', async () => {
            const response = await request(app)
                .get('/api/users/profile');

            expect(response.status).toBe(500);
        });

        it('should reject access with invalid token', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer invalidtoken');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized');
        });
    });
});
