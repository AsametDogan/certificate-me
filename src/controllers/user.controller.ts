import { Request, Response } from "express";
import { IRequestWithFile, IRequestWithUser, IUser } from "../interfaces";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import multer from "multer";
import { trimPhone } from "../helpers/algorithms.helper";
import { profileImgStorage } from "../helpers/storage.helper";
import { isValidEmail } from "../helpers/validation.helper";
import UserModel from "../models/UserModel";
import { generateVerificationCode } from "../helpers/verification.code.helper";
import VerificationModel from "../models/VerificationModel";
import { sendVerificationCode } from "../helpers/verification.sender.helper";
import AssignmentModel from "../models/AssignmentModel";


const uploadProfile = multer({ storage: profileImgStorage })

const register = async (req: Request, res: Response) => {
    try {
        let { nickName, name, surname, email, password, phone } = req.body;
        name = name.trim();
        surname = surname.trim();
        email = email.toLowerCase().trim(); // register email string
        phone = trimPhone(phone)
        console.log("Register 1")
        if (!isValidEmail(email)) {
            console.log("Register 2")

            return res.status(409).json({

                message: `${email} mail formatında olmalıdır`, success: false
            })
        }
        try {
            const existingUser = await UserModel.findOne({ email: { $in: [email] } });
            console.log("Register 3")

            if (existingUser) {
                console.log("Register 4")

                return res.status(400).json({ message: `${email} ile bir hesap bulunmakta`, success: false });
            }
        } catch (error) {
            console.log("Register 5")

            return res.status(500).json({ message: `Kontrol sırasında hata oluştu, lütfen bildiriniz`, success: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            nickName,
            name,
            surname,
            email: [email],
            phone,
            role: "0",
            password: hashedPassword,
            profileImg: `https://rozetle.com:5001/api/image/profile/${req.file?.filename}`,
            createdDate: new Date(),
        });
        console.log("Register 6")
        // await sendParticipantBadge(email)
        await user.save();
        const token = jwt.sign({ _id: user._id}, process.env.TOKEN_SECRET || '');
        res.status(201).json({ data: { token }, success: true });
    } catch (error) {
        res.status(500).json({ message: "Kayıt olma sırasında hata meydana geldi", success: false });
    }
};


const sendParticipantBadge = async (data) => {
    const assignment = new AssignmentModel({
        description: "Etkinliğimize katıldığınız için teşekkürler...",
        senderId: "6547439b60eb6a846a2b51f6",
        receiverInfo: data,
        badgeId: "6546b60392f24080b04ff02e",
        assignDate: new Date(),
    });

    await assignment.save();
}

const login = async (req: Request, res: Response) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();
        const user: IUser | null = await UserModel.findOne({ email: { $in: [email] } });
        if (!user) {
            return res.status(401).json({ message: `${email} ile hesap bulunamadı`, success: false });
        }
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Şifre Yanlış', success: false });
        }
        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET || '');

        res.status(200).json({ data: { token }, success: true });

    } catch (error) {
        res.status(500).json({ message: "Giriş Yapılamadı", success: false });
    }
};

const getMyInfo = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }

    try {
        const user = await UserModel.findOne(userId).select('-password')

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
        }

        res.status(200).json({ data: user, success: true, message: "Kullanıcı bilgileri oluşturuldu" });
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı bilgileri getirilirken bir hata oluştu', success: false });
    }
}

const updateProfile = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id; // Middleware ile eklenen kullanıcı kimliğini al

    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }
    try {
        const { nickName, name, surname, password, phone, profileImg } = req.body;
        /*  let hashedPassword;
         if (password) {
             console.log("2")
 
             hashedPassword = await bcrypt.hash(password, 10);
         } */
        if (req.file?.filename) {
            await UserModel.findByIdAndUpdate(
                userId,
                {
                    nickName,
                    name,
                    surname,
                    phone: trimPhone(phone),
                    // password: hashedPassword,
                    profileImg: req.file?.filename ? `https://rozetle.com:5001/api/image/profile/${req.file?.filename}` : null,
                },
                { new: true, select: '-password' } // Güncellenmiş kullanıcıyı döndür ve şifreyi hariç tut
            );
        } else {
            await UserModel.findByIdAndUpdate(
                userId,
                {
                    nickName,
                    name,
                    surname,
                    phone: trimPhone(phone),
                },
                { new: true, select: '-password' } // Güncellenmiş kullanıcıyı döndür ve şifreyi hariç tut
            );
        }

        console.log("4")


        console.log("5")

        res.status(200).json({ data: null, message: "Güncelleme başarılı", success: true });
    } catch (error) {
        console.log({ location: "updateProfile", error })
        res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu', success: false });
    }
}

const verifyMailSender = async (req: Request, res: Response) => {
    let { email } = req.body;
    email = email.toLowerCase().trim();
    try {
        const user: IUser | null = await UserModel.findOne({ email: { $in: [email] } });
        if (user) {
            return res.status(400).json({ message: `${email} ile ilişkilendirilmiş bir hesap bulunmakta`, success: false });
        }
    } catch (error) {
        res.status(500).json({ message: "Doğrulama kodu gönderilirken hata meydana geldi", success: false });

    }
    const verificationCode = generateVerificationCode()
    try {
        const foundedVerify = await VerificationModel.findOne({ email })
        if (foundedVerify) {
            foundedVerify.verificationCode = verificationCode;
            foundedVerify.verified = false
            foundedVerify.createdDate = new Date()
            await foundedVerify.save()
        }
        else {
            const verification = new VerificationModel({
                email: email,
                verified: false,
                verificationCode: verificationCode,
                createdDate: new Date(),
            });
            await verification.save();
        }
        try {
            const result = await sendVerificationCode(email, verificationCode)
            if (result) {
                res.status(200).json({ message: "Doğrulama Kodu Gönderildi", success: true });
            }
            else {
                throw new Error("Mail Gönderme başarısız");
            }
        } catch (error) {
            res.status(500).json({ message: "Doğrulama kodu gönderilirken hata meydana geldi", success: false });
        }

    } catch (error) {
        res.status(500).json({ message: "Doğrulama kodu kayıt edilirken hata meydana geldi", success: false });
    }
}

const forgottenPassMailSender = async (req: Request, res: Response) => {
    try {
        let { email } = req.body;
        email = email.toLowerCase().trim();
        const user = await UserModel.findOne({ email: { $in: [email] } });
        if (!user) {
            return res.status(401).json({ message: `${email} ile hesap bulunamadı`, success: false });
        }
        const verificationCode = generateVerificationCode()
        try {
            const foundedVerify = await VerificationModel.findOne({ email })
            if (foundedVerify) {
                foundedVerify.verificationCode = verificationCode;
                foundedVerify.createdDate = new Date()
                await foundedVerify.save()
            }
            else {
                const verification = new VerificationModel({
                    email: email,
                    verified: false,
                    verificationCode: verificationCode,
                    createdDate: new Date(),
                });
                await verification.save();
            }
        } catch (error) {
            res.status(500).json({ message: "Doğrulama kodu kayıt edilirken hata meydana geldi", success: false });
        }
        await sendVerificationCode(email, verificationCode)
        res.status(200).json({ message: "Doğrulama Kodu Gönderildi", success: true });
    } catch (error) {
        res.status(500).json({ message: "Doğrulama kodu gönderilemedi, daha sonra tekrar deneyin", success: false });
    }
}

const verifyPassCode = async (req: Request, res: Response) => {
    let { email, verificationCode } = req.body
    email = email.toLowerCase().trim();
    verificationCode = verificationCode.trim()
    console.log("verify pass-1")
    try {
        //const foundedVerify = await VerificationModel.findOne({ email })
        console.log({ email, verificationCode })
        const verification = await VerificationModel.findOne({ email })
        console.log(verification)
        if (!verification) {
            console.log("verify pass-2")
            return res.status(500).json({ message: "Sistem bakımda, lütfen daha sonra tekrar deneyin", success: false });
        }
        if (verification?.verificationCode !== verificationCode) {
            console.log("verify pass-3")
            return res.status(401).json({ message: "Doğrulama kodu hatalı", success: false })
        }
        const data = await VerificationModel.findByIdAndUpdate(verification._id,
            { verified: true },
            { new: true }
        )
        console.log("verify pass-4")
        return res.status(200).json({ message: "Doğrulama başarılı", success: true })

    } catch (error) {
        console.log("verify pass-5")
        return res.status(500).json({ message: "Doğrulama sırasında bir hata meydana geldi", success: false });
    }
}

const setNewPass = async (req: Request, res: Response) => {
    let { email, newPass } = req.body
    email = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(newPass, 10);
    try {
        const user = await UserModel.findOne({ email: { $in: [email] } });
        if (!user) {
            return res.status(401).json({ message: `${email} ile ilişkilendirilmiş hesap bulunamadı`, success: false });
        }

        const verification = await VerificationModel.findOne({ email })
        if (!verification) {
            res.status(404).json({ message: "Doğrulama bilgisi bulunamadı, daha sonra tekrar deneyin", success: false });
        }
        if (verification!.verified = false) {
            res.status(403).json({ message: "Doğrulanmamış işlem, lütfen tekrar deneyiniz", success: false })
        }

        user.password = hashedPassword
        await user.save()
        res.status(200).json({ message: "Şifre değiştirme başarılı", success: true })
    } catch (error) {
        res.status(500).json({ message: "Şifre yenilemede bir hata meydana geldi", success: false });
    }
}





export {
    register,
    login,
    updateProfile,
    getMyInfo,
    verifyPassCode,
    setNewPass,
    forgottenPassMailSender,
    verifyMailSender,

}