import { Request, Response } from "express"
import { Assignment, RequestWithUser } from "../interfaces"
import { AssignmentModel, CertificateModel } from "../models"
import Standardization from "../helpers/Standardization"
import Validation from "../helpers/Validation"



class AssignmentController {
    send = async (req: Request, res: Response) => {
        const user = (req as RequestWithUser).user
        let { receiverInfo, certificateId, description, expireDate } = req.body

        const existingAssignment: Assignment | null = await AssignmentModel.findOne({
            senderId: user._id,
            certificateId,
            receiverInfo
        })
        if (user?.email.includes(receiverInfo) || user?.phone === receiverInfo) {
            return res.status(400).json({ message: 'Kendinize sertifika atayamazsınız', success: false });

        }
        if (existingAssignment) {
            return res.status(409).json({ message: "Bu kişiye zaten bu sertifika gönderilmiş", success: false })
        }

        const certificate = await CertificateModel.findById(certificateId)
        if (!certificate) {
            return res.status(404).json({ message: 'Sertifika Bulunamadı', success: false });
        }

        if (certificate.ownerId.toString() !== user._id.toString()) {
            console.log(certificate.ownerId.toString())

            return res.status(400).json({ message: 'Bu sertifika size ait değil', success: false });
        }

        if (!Validation.email(receiverInfo)) {
            receiverInfo = Standardization.phone(receiverInfo)
        } else {
            receiverInfo = Standardization.trim(receiverInfo)
        }
        try {
            const assignment = new AssignmentModel({
                senderId: user._id,
                certificateId,
                receiverInfo,
                description,
                assignDate: new Date(),
                expireDate,
                isActive: true
            })
            await assignment.save()
            return res.status(200).json({ message: "Sertifika başarıyla gönderildi", success: true })
        } catch (error) {
            console.log({ function: "sendCertificate", error })
            return res.status(500).json({ message: "Sertifika gönderilirken hata meydana geldi", success: false, data: error })
        }
    }
    getMySent = async (req: Request, res: Response) => {
        const user = (req as RequestWithUser).user
        console.log(user)
        try {
            const assignments = await AssignmentModel.find({ senderId: user._id })
            .populate({
                path: 'certificateId',
                model: 'Certificate', // Certificate model adı
            })
            .populate({
                path: 'senderId',
                model: 'User', // User model adı
                select: ' name surname email profileImg',
            });
            console.log(assignments)
            return res.status(200).json({ message: "Sertifikalar başarıyla getirildi", success: true, data: assignments })
        } catch (error) {
            console.log({ function: "getMyCertificate", error })
            return res.status(500).json({ message: "Sertifikalar getirilirken hata meydana geldi", success: false, data: error })
        }
    }

    getMyReceived = async (req: Request, res: Response) => {
        const user = (req as RequestWithUser).user

        const receiverEmails = user.email
        const receiverPhone = user.phone
        try {
            let mailAssign = await AssignmentModel.find({ receiverInfo: ({ $in: receiverEmails }) })
                .populate({
                    path: 'certificateId',
                    model: 'Certificate', // Certificate model adı
                })
                .populate({
                    path: 'senderId',
                    model: 'User', // User model adı
                    select: ' name surname email profileImg',
                });
            let phoneAssign = await AssignmentModel.find({ receiverInfo: receiverPhone })
                .populate({
                    path: 'certificateId',
                    model: 'Certificate', // Certificate model adı
                    populate: { path: "categoryId", model: "Category" },
                })
                .populate({
                    path: 'senderId',
                    model: 'User', // User model adı
                    select: 'name surname email profileImg',
                });
            mailAssign = [...mailAssign, ...phoneAssign]
            if (!mailAssign) {
                return res.status(204).json({ message: 'Henüz hiç sertifika almadınız', data: [], succes: true });
            }

            res.status(200).json({ data: mailAssign.reverse(), message: "İşlem Başarılı", succes: true });
        } catch (error) {
            console.log({ function: "getMyCertificate", error })
            return res.status(500).json({ message: "Sertifikalar getirilirken hata meydana geldi", success: false, data: error })
        }
    }


}
export default AssignmentController