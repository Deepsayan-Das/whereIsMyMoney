import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

function connect() {
    console.log("Attempting to connect to MongoDB...");
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("MongoDB connected successfully");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });

    mongoose.connection.on('connected', () => {
        console.log('Mongoose wrapper: Connected to DB');
    });

    mongoose.connection.on('error', (err) => {
        console.error('Mongoose wrapper: Connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose wrapper: Disconnected');
    });
}
export default connect;