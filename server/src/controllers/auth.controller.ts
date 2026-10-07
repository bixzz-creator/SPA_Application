import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    const statusCode =
      message === 'Invalid credentials' ||
      message === 'Invalid role for this account'
        ? 401
        : 403;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
