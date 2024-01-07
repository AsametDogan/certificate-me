// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestWithUser, Token } from '../interfaces';

export const authMiddleware = (allowedRoles: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
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

      req.userId = decoded._id;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  };
};
