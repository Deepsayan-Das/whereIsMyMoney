import Account from "../models/account.model.js";
import Transaction from "../models/transaction.model.js";

export const createAccount = async (userId, kind, balance) => {
    if (!userId || !kind || balance === undefined || balance === null)
        throw new Error("All fields are required");
    const account = await Account.create({ userId, kind, balance });
    return account;
}

export const getInfo = async (accountId) => {
    if (!accountId)
        throw new Error("Account ID is required");
    const account = await Account.findById(accountId);
    if (!account)
        throw new Error("Account not found");
    return account;
}

export const updateBudget = async (accountId, budget) => {
    if (!accountId)
        throw new Error("Account ID is required");
    if (budget === undefined || budget === null)
        throw new Error("Budget amount is required");

    const account = await Account.findByIdAndUpdate(
        accountId,
        { budget, budgetReached: false },
        { new: true }
    );

    if (!account)
        throw new Error("Account not found");

    return account;
}

export const checkBudgetStatus = async (accountId) => {
    if (!accountId)
        throw new Error("Account ID is required");

    const account = await Account.findById(accountId);
    if (!account)
        throw new Error("Account not found");

    if (!account.budget) {
        return {
            account,
            hasBudget: false,
            message: "No budget set for this account"
        };
    }

    const budgetReached = account.balance >= account.budget;

    if (budgetReached && !account.budgetReached) {
        account.budgetReached = true;
        await account.save();
    }

    return {
        account,
        hasBudget: true,
        budgetReached,
        remaining: account.budget - account.balance,
        percentageUsed: ((account.balance / account.budget) * 100).toFixed(2)
    };
}

export const resetBudgetFlag = async (accountId) => {
    if (!accountId)
        throw new Error("Account ID is required");

    const account = await Account.findByIdAndUpdate(
        accountId,
        { budgetReached: false },
        { new: true }
    );

    if (!account)
        throw new Error("Account not found");

    return account;
}

export const deleteAccount = async (accountId) => {
    if (!accountId)
        throw new Error("Account ID is required");

    const account = await Account.findById(accountId);
    if (!account)
        throw new Error("Account not found");

    if (account.balance !== 0)
        throw new Error("Cannot delete account with non-zero balance. Current balance: " + account.balance);

    await Account.findByIdAndDelete(accountId);
    return { message: "Account deleted successfully" };
}
export const getAllTransactionsByAccount = async (accountId) => {
    if (!accountId)
        throw new Error("Account ID is required");
    const transactions = await Transaction.find({ accountId });
    return transactions;
}