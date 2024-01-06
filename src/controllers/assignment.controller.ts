import { Request, Response } from "express";
import { IAssignment, IRequestWithUser } from "../interfaces";
import { AssignmentModel, UserModel } from "../models";
import CertificateModel from "../models/CertificateModel";


const newAssign = async (req: IRequestWithUser, res: Response) => {
    try {
        const { description, receiverInfo, certificateId } = req.body;
        console.log(certificateId)
        const userId = req.user?._id;
        console.log({ message: "newAssign user: ", data: req.user })
        if (!userId) {
            return res.status(401).json({ message: 'Yetkilendirme hatası: uid' });
        }

        const existingAssignment: IAssignment | null = await AssignmentModel.findOne({
            senderId: userId,
            receiverInfo,
            certificateId,
        });
        if (req.user?.email.includes(receiverInfo)) {
            return res.status(400).json({ message: 'Kendinize sertifika gönderemezsiniz', success: false });

        }
        if (existingAssignment) {
            return res.status(400).json({ message: 'Bu sertifikayı zaten atadınız', success: false });
        }

        const certificate = await CertificateModel.findById(certificateId)

        if (!certificate) {
            return res.status(404).json({ message: 'Sertifika bulunamadı', success: false });
        }
        if (userId == null) {
            return res.status(401).json({ message: 'Yetkilendirme hatası: user role', success: false });
        }
        if (certificate.ownerId != userId) {
            return res.status(401).json({ message: 'Bu sertifikayı atamaya yetkiniz yoktur', success: false });
        }


        const assignment = new AssignmentModel({
            description,
            senderId: userId,
            receiverInfo,
            certificateId,
            assignDate: new Date(),
        });

        res.status(201).json({ message: 'Sertifika gönderildi', success: true, data: assignment._id, baseUrl: "https://www.rozetle.com/assign/" });
    } catch (error) {
        console.log({ message: 'Sertifika gönderilirken bir hata oluştu', error: error })
        res.status(500).json({ message: 'Sertifika gönderilirken bir hata oluştu', success: false });
    }
}

const getInfo = async (req: Request, res: Response) => {
    try {
        let infoData: any = []
        let allUsers: any = await UserModel.find().select("name surname email nickName phone email role")
        console.log(allUsers.length)

        if (allUsers.length > 0) {

            for (const user of allUsers) {
                const receivedCertificates = await AssignmentModel.find({ receiverInfo: { $in: user.email } || user?.phone })
                const sentCertificates = await AssignmentModel.find({ senderId: user._id })
                infoData.push({
                    ...user._doc,
                    receivedCount: receivedCertificates.length,
                    sentCount: sentCertificates.length
                })
            }
        }
        else {
            console.log("length else")
        }
        infoData = infoData.sort((a, b) => b.sentCount - a.sentCount);

        return res.status(200).json({ message: "Başarılı", data: infoData, success: true })
    } catch (error) {
        console.log({ location: getInfo, error })
        res.status(500).json({ message: 'Bir hata oluştu', success: false });
    }
}

const getAssignment = async (req: Request, res: Response) => {
    let { id } = req.params;
    console.log("getAssignment:   " + id)
    try {

        let assignment = await AssignmentModel.findById(id)
            .populate({
                populate: { path: "categoryId", model: "Category" },
                path: 'certificateId',
                model: 'Certificate', // Certificate model adı
            })
            .populate({
                path: 'senderId',
                model: 'User', // User model adı
                select: 'nickName name surname email profileImg',
            });
        if (!assignment) {
            return res.status(404).json({ data: null, message: "Sertifika bulunamadı, linki kontrol edin", success: false });
        }
        try {
            const sender = await UserModel.findById(assignment.senderId)
            const receiver = await UserModel.findOne({ email: { $in: [assignment.receiverInfo] } })
            if (!sender) {
                res.status(500).json({ data: null, message: "Gönderici bilgisi bulunamadı, hatalı işlem", success: false })
            }
            if (receiver) {
                res.status(200).json({ data: { assignment: assignment, receiver: { name: receiver.name, surname: receiver.surname, email: assignment.receiverInfo, profileImg: receiver.profileImg } }, message: "İşlem Başarılı", success: true })
            }
            else {
                res.status(200).json({ data: { assignment: assignment, receiver: { email: assignment.receiverInfo } } })
            }
        } catch (error) {
            console.log({ message: "getAssignment-1", error })
            return res.status(500).json({ data: null, message: "Bilinmeyen bir hata meydana geldi, lütfen daha sonra tekrar deneyin", success: false })
        }
    } catch (error) {
        console.log({ message: "getAssignment-2", error })

        return res.status(500).json({ data: null, message: "Bilinmeyen bir hata meydana geldi, lütfen daha sonra tekrar deneyin", success: false })
    }
}

const getMyReceived = async (req: IRequestWithUser, res: Response) => {
    const receiverEmail = req.user?.email;
    //const receiverPhone = req.user?.phone;
    if (!receiverEmail) {
        return res.status(401).json({ message: 'Alıcı iletişim adreslerini kontrol edin', succes: false });
    }

    try {
        const receivedCertificates = await AssignmentModel.find({ receiverInfo: { $in: receiverEmail } })
            .populate({
                path: 'certificateId',
                model: 'Certificate', // Certificate model adı
                populate: { path: "categoryId", model: "Category" },
            })
            .populate({
                path: 'senderId',
                model: 'User', // User model adı
                select: 'nickName name surname email profileImg',
            });
        if (!receivedCertificates) {
            return res.status(204).json({ message: 'Henüz hiç sertifika almadınız', succes: false });
        }

        res.status(200).json({ data: receivedCertificates, baseUrl: "https://www.rozetle.com/assign/", message: "İşlem Başarılı", succes: true });
    } catch (error) {
        console.log({ from: "getMyReceived", error })
        res.status(500).json({ message: 'Sertifika bilgileri getirilirken bir hata oluştu', succes: false });
    }
}


const getMySent = async (req: IRequestWithUser, res: Response) => {
    const senderId = req.user?._id;
    if (!senderId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', succes: false });
    }

    try {
        // tüm göndermeleri rozet bilgilerini categoryId ye açarak çek
        let sentCertifiactes = await AssignmentModel.find({ senderId })
            .populate({
                populate: { path: "categoryId", model: "Category" },
                path: 'certificateId',
                model: 'Certificate', // Certificate model adı
            })
        if (!sentCertifiactes) {
            return res.status(204).json({ data: [], baseUrl: "https://www.rozetle.com/assign/", message: "Henüz hiç sertifika göndermediniz", succes: true });
        }

        res.status(200).json({ message: "İşlem başarılı", data: sentCertifiactes, baseUrl: "https://www.rozetle.com/assign/", success: true })
    } catch (error) {
        res.status(500).json({ message: 'Sertifika bilgileri getirilirken bir hata oluştu', succes: false });
    }
}

export { getMyReceived, getMySent, newAssign, getAssignment, getInfo }