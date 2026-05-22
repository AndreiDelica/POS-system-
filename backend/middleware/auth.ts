import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'delicas-secret-key-123';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    branch_id?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
};
