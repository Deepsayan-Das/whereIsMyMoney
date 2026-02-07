import Account from '../models/account.model.js';
import User from '../models/user.model.js';

export const createUser = async (email, password) => {
    if (!email || !password)
        throw new Error("Email and password are required");
    const hashedPassword = await User.hashPassword(password);
    const user = await User.create({ email, password: hashedPassword });
    return user;

}

export const loginUser = async (email, password) => {
    if (!email || !password)
        throw new Error("please provide both email and password");
    const user = await User.findOne({ email });
    if (!user)
        throw new Error("Email not registered try Registering first");
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid)
        throw new Error("Invalid password");
    return user;
}

export const profileUser = async (email) => {
    if (!email)
        throw new Error("Email is required");
    const user = await User.findOne({ email });
    if (!user)
        throw new Error("Email not registered try Registering first");
    return user;
}

export const getAllAccounts = async (userId) => {
    if (!userId)
        throw new Error("User ID is required");
    const accounts = await Account.find({ userId });
    return accounts;
}

export const getAllTransactions = async (userId) => {
    if (!userId)
        throw new Error("User ID is required");
    const transactions = await Transaction.find({ userId });
    return transactions;
}
