// src/routes/certificateRoutes.ts

import { Router } from 'express';
import CertificateController from '../controllers/CertificateController';
import { authMiddleware } from '../middlewares/authMiddleware';



const certificateRouter: Router = Router();
const certificateController = new CertificateController();

certificateRouter.post('/create', authMiddleware(["user"]), certificateController.create);
certificateRouter.get('/mycreated', authMiddleware(["user"]), certificateController.getMyCreated);





export default certificateRouter;
