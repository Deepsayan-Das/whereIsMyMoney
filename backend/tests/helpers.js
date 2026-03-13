import User from '../models/user.model.js';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';

/**
 * Create a test user
 */
export const createTestUser = async (email = 'test@example.com', password = 'password123') => {
    const hashedPassword = await User.hashPassword(password);
    const user = await User.create({ email, password: hashedPassword });
    return user;
};

/**
 * Generate JWT token for a user
 */
export const generateToken = (user) => {
    return user.generateJWT();
};

/**
 * Create a test account for a user
 */
export const createTestAccount = async (userId, kind = 'cash', balance = 1000, budget = null) => {
    const account = await Account.create({
        userId,
        kind,
        balance,
        budget,
        budgetReached: false
    });
    return account;
};

/**
 * Create a test transaction
 */
export const createTestTransaction = async (userId, accountId, amount = 100, type = 'debit', purpose = 'test') => {
    const account = await Account.findById(accountId);
    const balanceAfterTransaction = type === 'credit'
        ? account.balance + amount
        : account.balance - amount;

    const transaction = await Transaction.create({
        userId,
        accountId,
        amount,
        type,
        purpose,
        balanceAfterTransaction,
        note: 'Test transaction'
    });

    return transaction;
};
