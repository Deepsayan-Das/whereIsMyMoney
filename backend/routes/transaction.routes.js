import { Router } from "express"
import * as transactionController from '../controller/transaction.controller.js'
import * as authMiddleware from '../middleware/auth.middleware.js'

const router = Router();

router.post('/create-transaction', authMiddleware.authUser, transactionController.createTransactionController);
router.get('/get-transaction/:transactionId', authMiddleware.authUser, transactionController.getTransactionController);
router.put('/update-transaction/:transactionId', authMiddleware.authUser, transactionController.updateTransactionController);
router.delete('/delete-transaction/:transactionId', authMiddleware.authUser, transactionController.deleteTransactionController);

export default router;