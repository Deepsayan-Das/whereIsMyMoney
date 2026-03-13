import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import accountRoutes from '../routes/accounts.routes.js';
import { createTestUser, createTestAccount, generateToken } from './helpers.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/accounts', accountRoutes);

describe('Account Management', () => {
    let user, token;

    beforeEach(async () => {
        user = await createTestUser('account@example.com', 'password123');
        token = generateToken(user);
    });

    describe('POST /api/accounts/create-account', () => {
        it('should create a new account', async () => {
            const response = await request(app)
                .post('/api/accounts/create-account')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    kind: 'cash',
                    balance: 5000
                });

            expect(response.status).toBe(201);
            expect(response.body.account.kind).toBe('cash');
            expect(response.body.account.balance).toBe(5000);
            expect(response.body.account.userId.toString()).toBe(user._id.toString());
        });

        it('should reject account creation without authentication', async () => {
            const response = await request(app)
                .post('/api/accounts/create-account')
                .send({
                    kind: 'cash',
                    balance: 1000
                });

            expect(response.status).toBe(500);
        });
    });

    describe('Budget Management', () => {
        let account;

        beforeEach(async () => {
            account = await createTestAccount(user._id, 'cash', 1000);
        });

        it('should update account budget', async () => {
            const response = await request(app)
                .put(`/api/accounts/update-budget/${account._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ budget: 5000 });

            expect(response.status).toBe(200);
            expect(response.body.account.budget).toBe(5000);
            expect(response.body.account.budgetReached).toBe(false);
        });

        it('should check budget status', async () => {
            account.budget = 2000;
            await account.save();

            const response = await request(app)
                .get(`/api/accounts/check-budget/${account._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.hasBudget).toBe(true);
            expect(response.body.budgetReached).toBe(false);
            expect(response.body.remaining).toBe(1000);
        });

        it('should detect when budget is reached', async () => {
            account.budget = 500;
            account.balance = 600;
            await account.save();

            const response = await request(app)
                .get(`/api/accounts/check-budget/${account._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.budgetReached).toBe(true);
        });

        it('should handle accounts without budget', async () => {
            const response = await request(app)
                .get(`/api/accounts/check-budget/${account._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.hasBudget).toBe(false);
            expect(response.body.message).toContain('No budget set');
        });
    });

    describe('DELETE /api/accounts/delete-account', () => {
        it('should delete account with zero balance', async () => {
            const account = await createTestAccount(user._id, 'cash', 0);

            const response = await request(app)
                .delete(`/api/accounts/delete-account/${account._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('deleted successfully');
        });

        it('should prevent deletion of account with non-zero balance', async () => {
            const account = await createTestAccount(user._id, 'cash', 1000);

            const response = await request(app)
                .delete(`/api/accounts/delete-account/${account._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('non-zero balance');
        });
    });

    describe('GET /api/accounts/get-info', () => {
        it('should get account information', async () => {
            const account = await createTestAccount(user._id, 'saving', 1500, 3000);

            const response = await request(app)
                .get(`/api/accounts/get-info/${account._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.account.kind).toBe('saving');
            expect(response.body.account.balance).toBe(1500);
            expect(response.body.account.budget).toBe(3000);
        });
    });
});
