// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestWithUser, Token } from '../interfaces';
import { UserModel } from '../models';

export const authMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Token not provided' });
    }

    try {
      const decoded: Token = jwt.verify(token, process.env.SECRET_TOKEN || "") as Token// Replace with your secret key

      if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }
      const foundUser = await UserModel.findById(decoded._id)
      console.log("-----------------")
      console.log({foundUser, message:"Boş birşeyler"})

      if (!foundUser) {
        return res.status(404).json({ function: "authMiddleware", success: false, message: "Kullanıcı bulunamadı" })
      }
      (req as RequestWithUser).user = foundUser;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  };
};
