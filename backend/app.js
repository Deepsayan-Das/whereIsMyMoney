import express from 'express';
import dotenv from 'dotenv';
import router from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import accountRouter from './routes/accounts.routes.js';
import transactionRouter from './routes/transaction.routes.js';
import cors from 'cors'

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}))
app.use('/api/users', router);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);


app.get('/', (req, res) => {
    res.send('API online');
})

export default app;