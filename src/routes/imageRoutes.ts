import express from "express"
import {getCertificateImg, getProfileImg } from "../controllers/ImageController";

const imageRouter = express.Router();

imageRouter.get('/profile/:id', getProfileImg)
imageRouter.get('/certificate/:id',getCertificateImg )

export default imageRouter;