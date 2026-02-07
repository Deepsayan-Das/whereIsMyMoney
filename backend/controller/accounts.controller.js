import { validationResult } from 'express-validator';
import * as accountServices from '../services/accounts.services.js'
export const createAccountController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { kind, balance } = req.body;
        const account = await accountServices.createAccount(req.user._id, kind, balance);
        return res.status(201).json({ account });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getInfoController = async (req, res) => {
    try {
        const account = await accountServices.getInfo(req.params.accountId);
        return res.status(200).json({ account });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const updateBudgetController = async (req, res) => {
    try {
        const { budget } = req.body;
        const account = await accountServices.updateBudget(req.params.accountId, budget);
        return res.status(200).json({
            message: "Budget updated successfully",
            account
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const checkBudgetController = async (req, res) => {
    try {
        const budgetStatus = await accountServices.checkBudgetStatus(req.params.accountId);
        return res.status(200).json(budgetStatus);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const resetBudgetFlagController = async (req, res) => {
    try {
        const account = await accountServices.resetBudgetFlag(req.params.accountId);
        return res.status(200).json({
            message: "Budget flag reset successfully",
            account
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const deleteAccountController = async (req, res) => {
    try {
        const result = await accountServices.deleteAccount(req.params.accountId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
export const getAllTransactionsByAccountController = async (req, res) => {
    try {
        const transactions = await accountServices.getAllTransactionsByAccount(req.params.accountId);
        return res.status(200).json({ transactions });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}