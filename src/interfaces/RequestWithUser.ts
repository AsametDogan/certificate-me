import { Request } from 'express';
import User from './User';

export default interface RequestWithUser extends Request {
    user: User;
}
