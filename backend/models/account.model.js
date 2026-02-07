import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    kind: {
        type: String,
        enum: ['saving', 'current', 'digitalWallet', 'cash'],
        default: 'cash',
        required: true
    },
    currency: {
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'NZD', 'JPY', 'CNY', 'RMB'],
        default: 'INR',
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        required: true
    },
    budget: {
        type: Number,
        default: null
    },
    budgetReached: {
        type: Boolean,
        default: false
    }

})

const Account = mongoose.model('Account', accountSchema);
export default Account;