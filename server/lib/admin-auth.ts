import type { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = String(req.headers['x-admin-key'] ?? '').trim();
  const expected =
    process.env.ADMIN_API_KEY?.trim() ||
    process.env.VITE_ADMIN_API_KEY?.trim() ||
    process.env.VITE_ADMIN_PASSWORD?.trim() ||
    'layerbound2026';

  if (!key || key !== expected) {
    res.status(401).json({ success: false, error: 'Unauthorized — invalid admin key' });
    return;
  }
  next();
}