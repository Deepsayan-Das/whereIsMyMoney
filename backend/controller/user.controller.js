import { validationResult } from 'express-validator';
import User from '../models/user.model.js';
import * as UserServices from '../services/user.services.js';
import redisClient from '../services/redis.services.js';

export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const user = await UserServices.createUser(email, password);
        const token = user.generateJWT();
        return res.status(201).json({ user, token });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const loginUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { email, password } = req.body;
        const user = await UserServices.loginUser(email, password);
        const token = user.generateJWT();
        return res.status(200).json({ user, token })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const profileUserController = async (req, res) => {
    try {

        res.status(200).json({ user: req.user });
    } catch (error) {
        res.status(400).send(error.message);
    }
}
export const logoutUserController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        res.clearCookie('token');
        res.status(200).json({ message: "Logout successful" })
    } catch (err) {
        res.status(500).send(err.message);
    }
}
export const getAllAccountsController = async (req, res) => {
    try {
        const accounts = await UserServices.getAllAccounts(req.user._id);
        return res.status(200).json({ accounts });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
export const getAllTransactionsController = async (req, res) => {
    try {
        const transactions = await UserServices.getAllTransactions(req.user._id);
        return res.status(200).json({ transactions });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}