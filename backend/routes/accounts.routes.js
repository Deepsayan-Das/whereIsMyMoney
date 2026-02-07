import { Router } from 'express';
import * as accountController from '../controller/accounts.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create-account', authMiddleware.authUser, accountController.createAccountController);
router.get('/get-info/:accountId', authMiddleware.authUser, accountController.getInfoController);
router.put('/update-budget/:accountId', authMiddleware.authUser, accountController.updateBudgetController);
router.get('/check-budget/:accountId', authMiddleware.authUser, accountController.checkBudgetController);
router.put('/reset-budget-flag/:accountId', authMiddleware.authUser, accountController.resetBudgetFlagController);
router.delete('/delete-account/:accountId', authMiddleware.authUser, accountController.deleteAccountController);
router.get('/get-all-transactions/:accountId', authMiddleware.authUser, accountController.getAllTransactionsByAccountController);

export default router;