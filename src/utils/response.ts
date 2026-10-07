import { Response } from 'express';

export const ok = (res: Response, data: unknown, message?: string, status = 200) =>
  res.status(status).json({ success: true, data, ...(message ? { message } : {}) });

export const created = (res: Response, data: unknown, message?: string) => ok(res, data, message, 201);

export const noContent = (res: Response) => res.status(204).send();
