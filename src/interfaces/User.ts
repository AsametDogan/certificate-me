import { Schema } from "mongoose";

interface User {
    _id?: any | null;
    name: string;
    surname: string;
    email: string[];
    phone: string;
    password: string;
    profileImg: string;
    role: string;
    createdDate: Date;
    isActive: boolean;
}

export default User;
