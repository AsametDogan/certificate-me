import { Types } from "mongoose";

export default interface IUser extends Document {
    _id?: Types.ObjectId | null
    name: string;
    surname: string;
    email: string;
    phone?: string;
    password?: string | null;
    profileImg?: string;
    createdDate?: Date;
}
