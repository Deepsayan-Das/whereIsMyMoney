import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    balanceAfterTransaction: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        required: false
    }

})

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;