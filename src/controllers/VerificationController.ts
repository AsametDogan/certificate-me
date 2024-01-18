import { Request, Response } from "express";
import { User } from "../interfaces";
import MailSender from "../helpers/MailSender";
import { UserModel, VerificationModel } from "../models";
import Standardization from "../helpers/Standardization";
import Validation from "../helpers/Validation";
import bcrypt from 'bcrypt';



class VerificationController {
    sendCodeRegister = async (req: Request, res: Response) => {
        let { email } = req.body;
        email = Standardization.trim(email)

        if (!Validation.email(email)) {

            return res.status(409).json({
                message: `${email} mail formatında olmalıdır`, success: false
            })
        }

        try {
            const user: User | null = await UserModel.findOne({ email: { $in: [email] } });
            if (user) {
                return res.status(400).json({ message: `${email} ile ilişkilendirilmiş bir hesap bulunmakta`, success: false });
            }
        } catch (error) {
            res.status(500).json({ message: "Doğrulama kodu gönderilirken hata meydana geldi", success: false });

        }

        const verificationCode = MailSender.generateVerificationCode()
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
                const mailSender = new MailSender()
                const result = await mailSender.send(email, "Doğrulama Kodu", verificationCode)
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


    sendCodeToForgottenMail = async (req: Request, res: Response) => {
        try {
            let { email } = req.body;
            email = Standardization.trim(email);

            if (!Validation.email(email)) {

                return res.status(409).json({
                    message: `${email} mail formatında olmalıdır`, success: false
                })
            }

            const user = await UserModel.findOne({ email: { $in: [email] } });

            if (!user) {
                return res.status(401).json({ message: `${email} ile hesap bulunamadı`, success: false });
            }

            const verificationCode = MailSender.generateVerificationCode()

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

            const mailSender = new MailSender()
            const result = await mailSender.send(email, "Doğrulama Kodu", verificationCode)
            res.status(200).json({ message: "Doğrulama Kodu Gönderildi", success: true });
        } catch (error) {
            res.status(500).json({ message: "Doğrulama kodu gönderilemedi, daha sonra tekrar deneyin", success: false });
        }

    }

    verifyCode = async (req: Request, res: Response) => {
        let { email, verificationCode } = req.body
        email = Standardization.trim(email);
        verificationCode = Standardization.trim(verificationCode);
        try {

            const verification = await VerificationModel.findOne({ email })

            if (!verification) {
                return res.status(500).json({ message: "Lütfen daha sonra tekrar deneyin", success: false });
            }
            if (verification?.verificationCode !== verificationCode) {
                return res.status(401).json({ message: "Doğrulama kodu hatalı", success: false })
            }
            const expireMin = (new Date().getTime() - verification.createdDate?.getTime()) / (1000 * 60)
            if (expireMin > 3) {
                return res.status(403).json({ message: "Doğrulama zaman aşımına uğradı, lütfen tekrar deneyiniz", success: false })
            }

            const data = await VerificationModel.findByIdAndUpdate(verification._id,
                { verified: true, verificationDate: new Date() },
                { new: true }
            )
            return res.status(200).json({ message: "Doğrulama başarılı", success: true })

        } catch (error) {
            console.log({ verifyPassCode: "verify pass-5", error })
            return res.status(500).json({ message: "Doğrulama sırasında bir hata meydana geldi", success: false });
        }
    }
    setNewPass = async (req: Request, res: Response) => {
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
                return res.status(404).json({ message: "Doğrulama bilgisi bulunamadı, daha sonra tekrar deneyin", success: false });
            }
            if (verification.verified == false || verification.verificationDate == null) {
                return res.status(403).json({ message: "Doğrulanmamış işlem, lütfen tekrar deneyiniz", success: false })
            }
            const expireMin = (new Date().getTime() - verification.verificationDate?.getTime()) / (1000 * 60)
            if (expireMin > 3) {
                return res.status(403).json({ message: "Doğrulama zaman aşımına uğradı, lütfen tekrar deneyiniz", success: false })
            }

            user.password = hashedPassword
            await user.save()
            return res.status(200).json({ message: "Şifre değiştirme başarılı", success: true })
        } catch (error) {
            return res.status(500).json({ message: "Şifre yenilemede bir hata meydana geldi", success: false });
        }
    }


}
export default VerificationController