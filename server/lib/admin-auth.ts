import type { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from './user-auth';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export async function requireAdmin(req: RequestWithUser, res: Response, next: NextFunction) {
  const key = String(req.headers['x-admin-key'] ?? '').trim();
  const expected =
    process.env.ADMIN_API_KEY?.trim() ||
    process.env.VITE_ADMIN_API_KEY?.trim() ||
    process.env.VITE_ADMIN_PASSWORD?.trim();

  if (key && expected && key === expected) {
    return next();
  }

  const authHeader = String(req.headers.authorization ?? '').trim();
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized — admin credentials required' });
    return;
  }

  const user = await getUserFromToken(token);
  if (!user || user.role !== 'super_admin') {
    res.status(403).json({ success: false, error: 'Access denied' });
    return;
  }

  req.user = { id: user.id, role: user.role };
  next();
}