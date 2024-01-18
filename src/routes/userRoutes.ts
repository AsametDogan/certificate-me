// src/routes/UserRoutes.ts

import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import UserController from '../controllers/UserController';
import multer from "multer";
import { profileImgStorage } from '../helpers/Storage';



const uploadProfile = multer({ storage: profileImgStorage })

const userRouter: Router = Router();
const userController = new UserController();

userRouter.post('/register',uploadProfile.single('profileImg'), userController.register);
userRouter.post('/login', userController.login);

userRouter.get("/:_id",userController.getUserInfo)
userRouter.delete("/delete",authMiddleware(["0"]),userController.deleteProfile)
userRouter.put("/update",authMiddleware(["0"]), uploadProfile.single('profileImg'), userController.updateProfile)

userRouter.post("/changeRole",authMiddleware(["2"]), userController.changeRole)




export default userRouter;
