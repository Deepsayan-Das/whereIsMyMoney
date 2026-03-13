import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import transactionRoutes from '../routes/transaction.routes.js';
import Account from '../models/account.model.js';
import { createTestUser, createTestAccount, generateToken } from './helpers.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/transactions', transactionRoutes);

describe('Transaction Management', () => {
    let user, token, account;

    beforeEach(async () => {
        user = await createTestUser('transaction@example.com', 'password123');
        token = generateToken(user);
        account = await createTestAccount(user._id, 'cash', 1000);
    });

    describe('POST /api/transactions/create-transaction', () => {
        it('should create a credit transaction and increase balance', async () => {
            const response = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 500,
                    type: 'credit',
                    purpose: 'salary',
                    note: 'Monthly salary'
                });

            expect(response.status).toBe(201);
            expect(response.body.transaction.amount).toBe(500);
            expect(response.body.transaction.type).toBe('credit');
            expect(response.body.account.balance).toBe(1500);
            expect(response.body.transaction.balanceAfterTransaction).toBe(1500);
        });

        it('should create a debit transaction and decrease balance', async () => {
            const response = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 300,
                    type: 'debit',
                    purpose: 'groceries',
                    note: 'Weekly shopping'
                });

            expect(response.status).toBe(201);
            expect(response.body.transaction.amount).toBe(300);
            expect(response.body.transaction.type).toBe('debit');
            expect(response.body.account.balance).toBe(700);
            expect(response.body.transaction.balanceAfterTransaction).toBe(700);
        });

        it('should prevent overdraft', async () => {
            const response = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 2000,
                    type: 'debit',
                    purpose: 'purchase'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Insufficient funds');
        });

        it('should trigger budget notification when budget is reached', async () => {
            account.budget = 1200;
            await account.save();

            const response = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 500,
                    type: 'credit',
                    purpose: 'income'
                });

            expect(response.status).toBe(201);
            expect(response.body.account.balance).toBe(1500);
            expect(response.body.account.budgetReached).toBe(true);
        });

        it('should reject transaction for non-existent account', async () => {
            const response = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: '507f1f77bcf86cd799439011',
                    amount: 100,
                    type: 'debit',
                    purpose: 'test'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Account not found');
        });

        it('should reject transaction for unauthorized account', async () => {
            const otherUser = await createTestUser('other@example.com', 'password123');
            const otherAccount = await createTestAccount(otherUser._id, 'cash', 1000);

            const response = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: otherAccount._id,
                    amount: 100,
                    type: 'debit',
                    purpose: 'test'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Unauthorized');
        });

        it('should require all mandatory fields', async () => {
            const response = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 100
                    // Missing type and purpose
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('required');
        });
    });

    describe('Transaction Balance Updates', () => {
        it('should maintain correct balance after multiple transactions', async () => {
            // Credit 500
            await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 500,
                    type: 'credit',
                    purpose: 'income'
                });

            // Debit 200
            await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 200,
                    type: 'debit',
                    purpose: 'expense'
                });

            // Credit 100
            const response = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 100,
                    type: 'credit',
                    purpose: 'refund'
                });

            expect(response.body.account.balance).toBe(1400);
        });
    });

    describe('GET /api/transactions/get-transaction', () => {
        it('should get transaction by ID', async () => {
            const createResponse = await request(app)
                .post('/api/transactions/create-transaction')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    accountId: account._id,
                    amount: 250,
                    type: 'debit',
                    purpose: 'shopping'
                });

            const transactionId = createResponse.body.transaction._id;

            const response = await request(app)
                .get(`/api/transactions/get-transaction/${transactionId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.transaction._id).toBe(transactionId);
            expect(response.body.transaction.amount).toBe(250);
        });
    });
});
