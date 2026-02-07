import { Router } from "express";
import * as UserController from '../controller/user.controller.js';
import { body } from "express-validator";
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', body('email').isEmail(), body('password').isLength({ min: 6 }), UserController.createUserController);
router.post('/login', body('email').isEmail(), body('password').isLength({ min: 6 }), UserController.loginUserController);
router.get('/profile', authMiddleware.authUser, UserController.profileUserController);
router.post('/logout', authMiddleware.authUser, UserController.logoutUserController);
router.get('/get-all-accounts', authMiddleware.authUser, UserController.getAllAccountsController);
router.get('/get-all-transactions', authMiddleware.authUser, UserController.getAllTransactionsController);

export default router;
