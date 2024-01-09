import mongoose, { Schema } from "mongoose";
import { Certificate } from "../interfaces";

interface CertificateDoc extends Certificate { }

const CertificateSchema: Schema<CertificateDoc> = new Schema({
    ownerId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    certificateImg: { type: String, required: true },
    category: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
});

const CertificateModel = mongoose.model<CertificateDoc>('Certificate', CertificateSchema);

export default CertificateModel