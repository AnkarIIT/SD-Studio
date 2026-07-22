import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import prisma from './database';
import { isDatabaseConfigured } from './orders';
import type { User } from '@prisma/client';

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET?.trim() ||
  process.env.ADMIN_API_KEY?.trim() ||
  process.env.VITE_ADMIN_API_KEY?.trim() ||
  'layerbound-admin-secret';

const JWT_EXPIRY = '1h';
const ENV_ADMIN_ID = 'env-super-admin';
const ENV_ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ENV_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

export interface AdminTokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function normalizeEmail(email?: string): string {
  return String(email ?? '').trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    if (!decoded?.id || !decoded?.role || !decoded?.email) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function isEnvAdminLogin(email: string, password: string): boolean {
  if (!ENV_ADMIN_PASSWORD || password !== ENV_ADMIN_PASSWORD) return false;
  if (!ENV_ADMIN_EMAIL) return true;
  return normalizeEmail(email) === ENV_ADMIN_EMAIL;
}

export function getEnvSuperAdmin(): { id: string; email: string; name: string; role: string; isActive: true } | null {
  if (!ENV_ADMIN_PASSWORD) return null;
  return {
    id: ENV_ADMIN_ID,
    email: ENV_ADMIN_EMAIL || 'admin@layerbound.local',
    name: 'Super Admin',
    role: 'super_admin',
    isActive: true,
  };
}

export async function getUserFromToken(
  token: string
): Promise<{ id: string; email: string; name: string; role: string; isActive: boolean } | null> {
  const payload = verifyAdminToken(token);
  if (!payload) return null;

  if (payload.id === ENV_ADMIN_ID) {
    return getEnvSuperAdmin();
  }

  if (!isDatabaseConfigured()) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user || !user.isActive) return null;
  return { id: user.id, email: user.email, name: user.name ?? '', role: user.role, isActive: user.isActive };
}

export async function findAdminByEmail(email: string): Promise<User | null> {
  if (!isDatabaseConfigured()) return null;
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return prisma.user.findUnique({ where: { email: normalized } });
}

export async function logAdminActivity(
  userId: string,
  action: string,
  changes?: Record<string, unknown>
): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await prisma.auditLog.create({
      data: {
        entity: 'admin',
        entityId: userId,
        action,
        changes: changes ? JSON.stringify(changes) : undefined,
      },
    });
  } catch {
    // Audit logging should not block admin flow.
  }
}

export function generateTotpSecret(): string {
  return speakeasy.generateSecret({ length: 32 }).base32!;
}

export function verifyTotpToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}

export async function enableTotpForUser(userId: string): Promise<{ secret: string; qrCodeUrl: string } | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const secret = generateTotpSecret();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const qrCodeUrl = speakeasy.otpauthURL({
      secret,
      label: `${user.email || 'Admin'} (${process.env.BRAND_NAME || 'Layerbound'})`,
      issuer: process.env.BRAND_NAME || 'Layerbound',
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totpSecret: secret, totpEnabled: false },
    });

    return { secret, qrCodeUrl };
  } catch {
    return null;
  }
}

export async function confirmTotpSetup(userId: string, token: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret) return false;

    const isValid = verifyTotpToken(token, user.totpSecret);
    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { totpEnabled: true },
      });
    }
    return isValid;
  } catch {
    return false;
  }
}

export async function disableTotpForUser(userId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { totpSecret: null, totpEnabled: false },
    });
    return true;
  } catch {
    return false;
  }
}
