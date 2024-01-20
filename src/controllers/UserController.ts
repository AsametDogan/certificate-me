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
        console.log(name, surname, email, password, phone)
        try {
            name = Standardization.trim(name)
            surname = Standardization.trim(surname)
            email = Standardization.trim(email)
            phone = Standardization.phone(phone)

            if (!Validation.email(email)) {

                return res.status(409).json({
                    message: `${email} mail formatında olmalıdır`, success: false
                })
            }
            const verifiedEmail = await VerificationModel.findOne({ email })
            if (!verifiedEmail) {
                return res.status(400).json({ message: `${email} doğrulanmamış mail`, success: false });
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
                profileImg: `http://localhost:8000/api/image/profile/${req.file?.filename}`,
                createdDate: new Date(),
            });

            await user.save();
            const token = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET_TOKEN || '');

            res.status(201).json({ data: { token, user }, success: true, message: "Kayıt Başarılı" });

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Kayıt olma sırasında hata meydana geldi" + error, success: false, data: error });
        }
    }
    login = async (req: Request, res: Response) => {
        let { email, password } = req.body;
        email = Standardization.trim(email)
        if (!Validation.email(email)) {

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

            const token = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET_TOKEN || '');
            const userInfo = { _id: user._id, name: user.name, email: user.email, phone: user.phone, profileImg: user.profileImg, role: user.role, createdDate: user.createdDate };
            res.status(200).json({ data: { token, user: userInfo }, success: true, message: "Giriş Başarılı" });
        } catch (error) {
            res.status(500).json({ message: "Giriş yapma sırasında hata meydana geldi", success: false, data: error });
        }
    }

    //get user details without password, createdDate, isActive, phone by params id 
    getUserInfo = async (req: Request, res: Response) => {
        const { _id } = req.params;
        try {
            const user = await UserModel.findById(_id, '-password -createdDate -isActive -role -__v') as User;
            if (!user) {
                return res.status(404).json({ message: "Kullanıcı bulunamadı.", success: false });
            }
            let assignments: any = [];
            try {
                let mailAssign = await AssignmentModel.find({ receiverInfo: ({ $in: user.email }) })
                    .populate({
                        path: 'certificateId',
                        model: 'Certificate', // Certificate model adı
                    })
                    .populate({
                        path: 'senderId',
                        model: 'User', // User model adı
                        select: ' name surname email profileImg',
                    });
                let phoneAssign = await AssignmentModel.find({ receiverInfo: user.phone })
                    .populate({
                        path: 'certificateId',
                        model: 'Certificate', // Certificate model adı
                    })
                    .populate({
                        path: 'senderId',
                        model: 'User', // User model adı
                        select: 'name surname email profileImg',
                    });
                assignments = [...mailAssign, ...phoneAssign]

            } catch (error) {
                console.log({ function: "getMyCertificate", error })
                return res.status(500).json({ message: "Sertifikalar getirilirken hata meydana geldi", success: false, data: error })
            }
            return res.status(200).json({
                data: { user, certificates: assignments }, success: true, message: `Kullanıcı bilgileri başarıyla getirildi`
            })


        } catch (error) {
            console.log({ function: "getUserInfo", error })
            return res.status(500).json({ message: "Sistemsel bir hata oluştu.", success: false })
        }
    }

    // search user according to name, surname, emails
    searchUsers = async (req: Request, res: Response) => {
    }

    deleteProfile = async (req: Request, res: Response) => {
        const userId = (req as RequestWithUser).user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
        }

        try {
            const deletedUser: any = await UserModel.findById(userId)
            if (deletedUser.email.length === 0) {
                return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
            }
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

    updateProfile = async (req: Request, res: Response) => {
        const user = (req as RequestWithUser).user;
        if (!user?._id) {
            return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
        }
        try {
            const { name, surname, password, phone, profileImg, emails } = req.body;
            let newEmails: any = [];
            console.log(emails)
            if (emails) {
                for (let email of emails) {
                    const foundEmail = await VerificationModel.findOne({ email: Standardization.trim(email) })
                    const foundUser = await UserModel.findOne({ email: { $in: [email] } })
                    if (foundEmail && foundEmail.verified && !foundUser) {
                        newEmails.push(email)
                    }
                }
            }
            let updatedUser;
            if (req.file?.filename) {
                updatedUser = await UserModel.findByIdAndUpdate(
                    user?._id,
                    {
                        name: Standardization.trim(name),
                        email: newEmails.length > 0 ? newEmails : user.email,
                        surname: Standardization.trim(surname),
                        phone: Standardization.trim(phone),
                        profileImg: req.file?.filename ? `http://localhost:8000/api/image/profile/${req.file?.filename}` : null,
                    },
                    { new: true, select: '-password' } // Güncellenmiş kullanıcıyı döndür ve şifreyi hariç tut
                );
            } else {
                updatedUser = await UserModel.findByIdAndUpdate(
                    user?._id,
                    {
                        name: Standardization.trim(name),
                        email: newEmails.length > 0 ? newEmails : user.email,
                        surname: Standardization.trim(surname),
                        phone: Standardization.trim(phone),
                    },
                    { new: true, select: '-password' } // Güncellenmiş kullanıcıyı döndür ve şifreyi hariç tut
                );
            }

            res.status(200).json({ data: updatedUser, message: "Güncelleme başarılı", success: true });
        } catch (error) {
            console.log({ location: "updateProfile", error })
            res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu', success: false });
        }
    }

    changeRole = async (req: Request, res: Response) => {
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