import { Request, Response } from "express";
import { readFile } from 'fs/promises'

const getProfileImg = async (req: Request, res: Response) => {
    try {
        let { id } = req.params;
       
        const filePath = `./media/profile/${id}`;
        const data = await readFile(filePath);
        res.setHeader('Content-Type', 'image');
        res.status(200).send(data);
    } catch (error) {
        res.status(500).json({ message: "Resim Yüklenemedi: \n", error })
    }
}
const getCertificateImg = async (req: Request, res: Response) => {
    try {
        let { id } = req.params;
        const filePath = `./media/certificate/${id}`;
        const data = await readFile(filePath);
        res.setHeader('Content-Type', 'image');
        res.status(200).send(data);
    } catch (error) {
        res.status(500).json({ message: "Resim Yüklenemedi: \n", error })
    }
}


export {
    getProfileImg, getCertificateImg
}