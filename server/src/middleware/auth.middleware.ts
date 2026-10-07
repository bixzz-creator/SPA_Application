import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User, IUser, UserRole } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    role: UserRole;
    name: string;
    email: string;
  };
}

interface JwtPayload {
  id: string;
  userId: string;
  role: UserRole;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token is no longer valid. User not found.',
      });
      return;
    }

    if (user.status === 'INACTIVE') {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact an administrator.',
      });
      return;
    }

    req.user = {
      id: (user as IUser & { _id: unknown })._id?.toString() ?? '',
      userId: user.userId,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Forbidden. Administrator access required.',
    });
    return;
  }
  next();
};
