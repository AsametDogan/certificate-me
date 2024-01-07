

import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../interfaces';

interface UserDoc extends User, Document { }

const UserSchema: Schema<UserDoc> = new Schema({
    
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: [{ type: String, required: true, unique: true }],
    phone: { type: String, required: true },
    password: { type: String, required: true },
    profileImg: { type: String, required: true },
    role: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
});

const UserModel = mongoose.model<UserDoc>('User', UserSchema);

export default UserModel;