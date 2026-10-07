import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Rota não encontrada', error: 'Rota não encontrada' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, error: err.message });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'JSON inválido', error: 'JSON inválido' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor', error: 'Erro interno do servidor' });
}
