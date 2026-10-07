import { Request, Response, NextFunction } from 'express';

const MAX_DELAY_MS = 10000;

/**
 * Middleware to simulate API delay for demonstrating async processing.
 * Usage: GET /api/records?delay=3000
 */
export const delayMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const rawDelay = req.query['delay'];
  if (rawDelay !== undefined) {
    const delay = parseInt(rawDelay as string, 10);
    if (!isNaN(delay) && delay > 0 && delay <= MAX_DELAY_MS) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  next();
};
