import Transaction from "../models/transaction.model.js";
import Account from "../models/account.model.js";

export const createTransaction = async (userId, accountId, amount, type, purpose, note) => {
    if (!userId || !accountId || !amount || !type || !purpose)
        throw new Error("All fields are required");

    // Get the account
    const account = await Account.findById(accountId);
    if (!account)
        throw new Error("Account not found");

    // Check if account belongs to user
    if (account.userId.toString() !== userId.toString())
        throw new Error("Unauthorized: Account does not belong to user");

    // Calculate new balance
    let newBalance;
    if (type === 'credit') {
        // Credit = money coming in (income)
        newBalance = account.balance + amount;
    } else if (type === 'debit') {
        // Debit = money going out (expense)
        // Check if sufficient funds
        if (account.balance < amount)
            throw new Error("Insufficient funds. Current balance: " + account.balance);
        newBalance = account.balance - amount;
    } else {
        throw new Error("Invalid transaction type. Must be 'credit' or 'debit'");
    }

    // Create transaction with balance snapshot
    const transaction = await Transaction.create({
        userId,
        accountId,
        amount,
        type,
        purpose,
        note,
        balanceAfterTransaction: newBalance
    });

    // Update account balance
    account.balance = newBalance;

    // Check if budget is reached (for debit transactions)
    if (account.budget && newBalance >= account.budget && !account.budgetReached) {
        account.budgetReached = true;
    }

    await account.save();

    return { transaction, account };
}

export const getTransaction = async (transactionId) => {
    if (!transactionId)
        throw new Error("Transaction ID is required");
    const transaction = await Transaction.findById(transactionId);
    if (!transaction)
        throw new Error("Transaction not found");
    return transaction;
}

export const updateTransaction = async (transactionId, amount, type, purpose, note) => {
    if (!transactionId || !amount || !type || !purpose)
        throw new Error("All fields are required");
    const transaction = await Transaction.findById(transactionId);
    if (!transaction)
        throw new Error("Transaction not found");
    transaction.amount = amount;
    transaction.type = type;
    transaction.purpose = purpose;
    transaction.note = note;
    await transaction.save();
    return transaction;
}

export const deleteTransaction = async (transactionId) => {
    if (!transactionId)
        throw new Error("Transaction ID is required");
    const transaction = await Transaction.findById(transactionId);
    if (!transaction)
        throw new Error("Transaction not found");
    await transaction.remove();
    return transaction;
}
