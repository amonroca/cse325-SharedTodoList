import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET ?? 'dev-secret';

export interface AuthedRequest extends Request {
  userId?: number;
}

export function signToken(userId: number): string {
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  try {
    const payload = jwt.verify(header.slice(7), secret);
    req.userId = Number(payload.sub);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, please sign in again' });
  }
}
