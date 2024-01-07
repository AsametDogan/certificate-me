import { Request, Response } from "express";
import UserModel from "../models/UserModel";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from "multer"
import { AssignmentModel, VerificationModel } from "../models";
import { RequestWithUser, User } from "../interfaces";
import Standardization from "../helpers/Standardization";
import Validation from "../helpers/Validation";
//const uploadProfile = multer({ storage: profileImgStorage })


class UserController {
    register = async (req: Request, res: Response) => {
        let { name, surname, email, password, phone } = req.body
        try {
            name = Standardization.trim(name)
            surname = Standardization.trim(surname)
            email = Standardization.trim(email)
            phone = Standardization.phone(phone)

            if (Validation.email(email)) {

                return res.status(409).json({
                    message: `${email} mail formatında olmalıdır`, success: false
                })
            }

            const existingUser = await UserModel.findOne({ email: { $in: [email] } });
            if (existingUser) {

                return res.status(400).json({ message: `${email} ile bir hesap bulunmakta`, success: false });
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new UserModel({
                name,
                surname,
                email: [email],
                phone,
                role: "0",
                password: hashedPassword,
                profileImg: `https://rozetle.com:5001/api/image/profile/${req.file?.filename}`,
                createdDate: new Date(),
            });

            await user.save();
            const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET || '');

            res.status(201).json({ data: { token, user }, success: true, message: "Kayıt Başarılı" });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Kayıt olma sırasında hata meydana geldi", success: false, data: error });
        }
    }
    login = async (req: Request, res: Response) => {
        let { email, password } = req.body;
        email = Standardization.trim(email)
        if (Validation.email(email)) {

            return res.status(409).json({
                message: `${email} mail formatında olmalıdır`, success: false
            })
        }
        try {
            const user = await UserModel.findOne({ email: { $in: [email] } });
            if (!user) {
                return res.status(400).json({ message: `${email} ile bir hesap bulunamadı`, success: false });
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ message: "Şifre hatalı", success: false });
            }

            const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET || '');

            res.status(200).json({ data: { token, user }, success: true, message: "Giriş Başarılı" });
        } catch (error) {
            res.status(500).json({ message: "Giriş yapma sırasında hata meydana geldi", success: false, data: error });
        }
    }

    //get user details without password, createdDate, isActive, phone by params id 
    getUserInfo = async (req: Request, res: Response) => {
        const { _id } = req.params;
        try {
            const user = await UserModel.findById(_id, '-password -createdData -isActive -phone') as User;
            if (!user) {
                return res.status(404).json({ message: "Kullanıcı bulunamadı.", success: false });
            }
            return res.status(200).json({
                data: user, success: true, message: `Kullanıcı bilgileri başarıyla getirildi`
            })


        } catch (error) {
            console.log({ function: "getUserInfo", error })
            return res.status(500).json({ message: "Sistemsel bir hata oluştu.", success: false })
        }
    }

    // search user according to name, surname, emails
    searchUsers = async (req: Request, res: Response) => {
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
            if (verification.verified = false) {
                return res.status(403).json({ message: "Doğrulanmamış işlem, lütfen tekrar deneyiniz", success: false })
            }

            user.password = hashedPassword
            await user.save()
            return res.status(200).json({ message: "Şifre değiştirme başarılı", success: true })
        } catch (error) {
            return res.status(500).json({ message: "Şifre yenilemede bir hata meydana geldi", success: false });
        }
    }

    deleteProfile = async (req: RequestWithUser, res: Response) => {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
        }

        try {
            const deletedUser: any = await UserModel.findById(userId)
            deletedUser.email = []
            deletedUser.isActive = false
            await deletedUser.save()

            if (!deletedUser) {
                return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
            }

            //  await AssignmentModel.deleteMany({ senderId: userId })



            res.status(200).json({ message: 'Kullanıcı başarıyla silindi', success: true });
        } catch (error) {
            res.status(500).json({ message: 'Kullanıcı silinirken bir hata oluştu', success: false });
        }
    }

    updateProfile = async (req: RequestWithUser, res: Response) => {
        const userId = req.user?._id; // Middleware ile eklenen kullanıcı kimliğini al

        if (!userId) {
            return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
        }
        try {
            const { name, surname, password, phone, profileImg } = req.body;

            if (req.file?.filename) {
                await UserModel.findByIdAndUpdate(
                    userId,
                    {
                        name: Standardization.trim(name),
                        surname: Standardization.trim(surname),
                        phone: Standardization.trim(phone),
                        profileImg: req.file?.filename ? `https://rozetle.com:5001/api/image/profile/${req.file?.filename}` : null,
                    },
                    { new: true, select: '-password' } // Güncellenmiş kullanıcıyı döndür ve şifreyi hariç tut
                );
            } else {
                await UserModel.findByIdAndUpdate(
                    userId,
                    {
                        name: Standardization.trim(name),
                        surname: Standardization.trim(surname),
                        phone: Standardization.trim(phone),
                    },
                    { new: true, select: '-password' } // Güncellenmiş kullanıcıyı döndür ve şifreyi hariç tut
                );
            }

            res.status(200).json({ data: null, message: "Güncelleme başarılı", success: true });
        } catch (error) {
            console.log({ location: "updateProfile", error })
            res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu', success: false });
        }
    }

    changeRole = async (req: RequestWithUser, res: Response) => {
        const { userId, newRole } = req.body
        try {
            const userToUpdate: any = await UserModel.findById(userId)
            if (!userToUpdate) {
                return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
            }
            userToUpdate.role = newRole
            await userToUpdate.save()
            res.status(200).json({ data: userToUpdate, message: "Güncelleme başarılı", success: true });
        } catch (error) {
            console.log({ location: "changeRole", error })
            res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu', success: false });
        }


    }

}

export default UserController