import mongoose, { Schema,Document } from "mongoose";
import { Verification } from "../interfaces";

interface VerificationDoc extends Verification { }

const VerificationSchema: Schema<VerificationDoc> = new Schema({
    email: { type: String, required: true },
    verified: { type: Boolean, required: true },
    verificationCode: { type: String, required: true },
    verificationDate:{type:Date, required:false},
    createdDate: { type: Date, default: Date.now },
});

const VerificationModel = mongoose.model<VerificationDoc>('Verification', VerificationSchema);

export default VerificationModel;