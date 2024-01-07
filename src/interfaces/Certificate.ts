import { Types } from "mongoose";

interface Certificate {
    _id?: Types.ObjectId | null
    ownerId: Types.ObjectId;
    title: string;
    certificateImg: string;
    createdDate: Date;
    isActive: boolean;
    category: string
}

export default Certificate