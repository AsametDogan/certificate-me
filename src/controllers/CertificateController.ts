import { Request, Response } from "express"
import { RequestWithUser } from "../interfaces"
import { CertificateModel } from "../models";



class CertificateController {
    create = async (req: RequestWithUser, res: Response) => {
        const userId = req.user._id;
        const { title, category } = req.body

        if (!title || !category) {
            return res.status(409).json({ message: `Sertifika kategorisi veya başlığı boş olamaz`, success: false })
        }

        if (!req.file) {
            return res.status(409).json({ message: `Sertifika resmi yüklenemedi`, success: false })

        }
        try {
            const certificate = new CertificateModel({
                ownerId: userId,
                title,
                category,
                certificateImg: `https://rozetle.com:5001/api/image/certificate/${req.file?.filename}`,
                createdDate: new Date(),
                isActive: true
            })
            await certificate.save()
            return res.status(200).json({ message: "Sertifika başarıyla oluşturuldu", success: true })
        } catch (error) {
            return res.status(500).json({ message: "Sertifika oluşturulurken hata meydana geldi", success: false })
        }
    }

    getMyCreated = async (req: RequestWithUser, res: Response) => {
        const userId = req.user._id;
        try {
            const certificates = await CertificateModel.find({ ownerId: userId })
            return res.status(200).json({ message: "Sertifikalar başarıyla getirildi", success: true, data: certificates })
        } catch (error) {
            return res.status(500).json({ message: "Sertifikalar getirilirken hata meydana geldi", success: false })
        }
    }
}


export default CertificateController