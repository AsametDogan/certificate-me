// src/routes/UserRoutes.ts

import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import UserController from '../controllers/UserController';

const userRouter: Router = Router();
const userController = new UserController();

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);

export default userRouter;
