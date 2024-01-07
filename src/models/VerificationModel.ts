import mongoose, { Schema } from "mongoose";
import { Verification } from "../interfaces";

interface VerificationDoc extends Verification, Document { }

const VerificationSchema: Schema<VerificationDoc> = new Schema({
    email: { type: String, required: true },
    verified: { type: Boolean, required: true },
    verificationCode: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
});

const VerificationModel = mongoose.model<VerificationDoc>('Verification', VerificationSchema);

export default VerificationModel;