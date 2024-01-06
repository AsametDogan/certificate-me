import mongoose, { Schema } from "mongoose";
import { ICertificate } from "../interfaces";


const CertificateSchema: Schema<ICertificate> = new Schema({
    title: { type: String, required: true },
    certificateImg: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    expirationDate: {type: Date, required: false}
});

const CertificateModel = mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default CertificateModel;