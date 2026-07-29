import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function getSecret(): string {
  return (
    process.env.ORDER_ACCESS_SECRET?.trim() ||
    'sd-order-access-dev'
  );
}

type TokenPayload = { email: string; exp: number };

function sign(payload: TokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token: string): string | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    if (!payload.email || Date.now() > payload.exp) return null;
    return payload.email.trim().toLowerCase();
  } catch {
    return null;
  }
}

export function createOrderAccessToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  return sign({ email: normalized, exp: Date.now() + TOKEN_TTL_MS });
}

export function getOrderAccessEmailFromRequest(req: Request): string | null {
  const auth = String(req.headers.authorization ?? '');
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const headerToken = String(req.headers['x-order-token'] ?? '').trim();
  const token = bearer || headerToken;
  if (!token) return null;
  return verify(token);
}

export function requireOrderEmailMatch(req: Request, res: Response, next: NextFunction) {
  const email = getOrderAccessEmailFromRequest(req);
  if (!email) {
    res.status(401).json({
      success: false,
      error: 'Order access token required — verify OTP first',
    });
    return;
  }

  const queryEmail = String(req.query.email ?? '')
    .trim()
    .toLowerCase();
  if (queryEmail && queryEmail !== email) {
    res.status(403).json({ success: false, error: 'Token does not match requested email' });
    return;
  }

  (req as Request & { orderAccessEmail?: string }).orderAccessEmail = email;
  next();
}

export type RequestWithOrderAccess = Request & { orderAccessEmail?: string };