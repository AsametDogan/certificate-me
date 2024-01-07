// src/routes/UserRoutes.ts

import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import UserController from '../controllers/UserController';

const router: Router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);

export default router;
