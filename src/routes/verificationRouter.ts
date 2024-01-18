// src/routes/verificationRoutes.ts

import { Router } from 'express';
import VerificationController from '../controllers/VerificationController';



const verificationRoutes: Router = Router();
const verificationController = new VerificationController();

verificationRoutes.post('/sendRegister', verificationController.sendCodeRegister);
verificationRoutes.post('/sendForget', verificationController.sendCodeToForgottenMail);
verificationRoutes.post('/verify', verificationController.verifyCode);
verificationRoutes.post("/setpass",verificationController.setNewPass)





export default verificationRoutes;
