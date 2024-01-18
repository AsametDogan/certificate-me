import { Types } from "mongoose";

interface Verification {
    _id?: Types.ObjectId | null
    email: string,
    verified: boolean,
    verificationCode: string,
    createdDate: Date;
    verificationDate?: Date|null;
    
}

export default Verification