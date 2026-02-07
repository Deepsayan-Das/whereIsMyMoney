import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: [6, 'Email must be at least 6 characters long'],
        maxLength: [100, 'Email must be at most 100 characters long'],
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: [6, 'Password must be at least 6 characters long'],
        maxLength: [100, 'Password must be at most 100 characters long']
    }
})

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
}
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateJWT = function () {
    return jwt.sign({ email: this.email, _id: this._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
}

const User = mongoose.model('User', userSchema);
export default User;
