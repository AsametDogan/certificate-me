import mongoose, { Schema } from "mongoose";
import { Assignment } from "../interfaces";

interface AssignmentDoc extends Assignment {}

const AssignmentSchema: Schema<AssignmentDoc> = new Schema({
  senderId: { type: Schema.Types.ObjectId, required: true },
  certificateId: { type: Schema.Types.ObjectId, required: true },
  receiverInfo: { type: String, required: true },
  description: { type: String, default: null },
  assignDate: { type: Date, default: Date.now },
  expireDate: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
});

const AssignmentModel = mongoose.model<AssignmentDoc>('Assignment', AssignmentSchema);

export default AssignmentModel;