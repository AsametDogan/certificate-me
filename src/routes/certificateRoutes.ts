// src/routes/certificateRoutes.ts

import { Router } from 'express';
import CertificateController from '../controllers/CertificateController';
import { authMiddleware } from '../middlewares/authMiddleware';
import multer from 'multer';
import { certificateImgStorage } from '../helpers/Storage';


const uploadCertificate = multer({ storage: certificateImgStorage })

const certificateRouter: Router = Router();
const certificateController = new CertificateController();

certificateRouter.post('/', authMiddleware(["1"]), uploadCertificate.single('certificateImg'), certificateController.create);
certificateRouter.get('/', authMiddleware(["1"]), certificateController.getMyCreated);





export default certificateRouter;
