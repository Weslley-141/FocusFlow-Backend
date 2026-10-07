import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

/** RN-14: toda rota protegida recebe o userId do JWT e filtra os dados por ele. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next(new AppError('Token de autenticação não fornecido', 401));
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
}
