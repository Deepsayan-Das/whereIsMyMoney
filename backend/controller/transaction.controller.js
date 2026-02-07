import { validationResult } from "express-validator";
import * as TransactionServices from '../services/transaction.services.js';

export const createTransactionController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { accountId, amount, type, purpose, note } = req.body;
        const result = await TransactionServices.createTransaction(req.user._id, accountId, amount, type, purpose, note);
        return res.status(201).json(result);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
export const getTransactionController = async (req, res) => {
    try {
        const transaction = await TransactionServices.getTransaction(req.params.transactionId);
        return res.status(200).json({ transaction });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const updateTransactionController = async (req, res) => {
    try {
        const { transactionId, amount, type, purpose, note } = req.body;
        const transaction = await TransactionServices.updateTransaction(transactionId, amount, type, purpose, note);
        return res.status(200).json({ transaction });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const deleteTransactionController = async (req, res) => {
    try {
        const transaction = await TransactionServices.deleteTransaction(req.params.transactionId);
        return res.status(200).json({ transaction });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}