import { Types } from "mongoose";

export default interface ICertificate extends Document {
    _id?: Types.ObjectId | null
    title: string;
    certificateImg: string;
    ownerId: Types.ObjectId;
    createdDate: Date;
    isActive: boolean;
    expirationDate?: Date | null;
}