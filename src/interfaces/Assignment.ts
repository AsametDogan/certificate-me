import { Types } from "mongoose";

interface Assignment {
    _id?: Types.ObjectId | null
    senderId: Types.ObjectId
    certificateId: Types.ObjectId
    receiverInfo: string;
    description?: string | null;
    assignDate: Date;
    expireDate?: Date | null
    isActive: boolean;
}

export default Assignment