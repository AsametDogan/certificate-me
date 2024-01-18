

import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../interfaces';

interface UserDoc extends User { }

const UserSchema: Schema<UserDoc> = new Schema({
    
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: [{ type: String, required: true, unique: true }],
    phone: { type: String, required: true },
    password: { type: String, required: true },
    //set profileImg nullable

    profileImg: { type: String, required: false },
    role: { type: String, required: false,default:"user" },
    createdDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true},
});

const UserModel = mongoose.model<UserDoc>('User', UserSchema);

export default UserModel;