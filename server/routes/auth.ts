import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import nodemailer from 'nodemailer';
import { comparePassword, findAdminByEmail, getEnvSuperAdmin, isEnvAdminLogin, logAdminActivity, signAdminToken, normalizeEmail, verifyTotpToken } from '../lib/user-auth';
import { isDatabaseConfigured } from '../lib/orders';

const router = Router();

const otpStore = new Map<
  string,
  {
    email: string;
    userId: string;
    role: string;
    code: string;
    expiresAt: number;
    attempts: number;
  }
>();

function createTransporter() {
  const emailPassword = (process.env.EMAIL_PASSWORD ?? '').replace(/\s/g, '');
  if (!process.env.EMAIL_USER || !emailPassword) {
    throw new Error('Email delivery is not configured');
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: emailPassword },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: emailPassword },
  });
}

function generateSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendAdminOtp(email: string, code: string): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${process.env.BRAND_NAME || 'Admin'} login code`,
    text: `Your admin login code is ${code}. It expires in 5 minutes.`,
  });
}

async function getAdminUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const envAdmin = getEnvSuperAdmin();

  if (envAdmin && isEnvAdminLogin(email, password)) {
    return envAdmin;
  }

  if (!isDatabaseConfigured()) return null;

  const user = await findAdminByEmail(normalizedEmail);
  if (!user || !user.isActive) return null;
  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) return null;
  if (user.role !== 'super_admin' && user.role !== 'admin') return null;
  return user;
}

router.post('/admin/auth/login', async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '').trim();
  const code = String(req.body?.code ?? '').trim();
  const sessionId = String(req.body?.sessionId ?? '').trim();

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  if (code && sessionId) {
    const record = otpStore.get(sessionId);
    if (!record || record.email !== normalizeEmail(email) || Date.now() > record.expiresAt) {
      return res.status(401).json({ success: false, error: 'OTP expired or invalid session' });
    }

    if (record.attempts >= 5) {
      otpStore.delete(sessionId);
      return res.status(429).json({ success: false, error: 'Too many OTP attempts' });
    }

    if (record.code !== code) {
      record.attempts += 1;
      otpStore.set(sessionId, record);
      return res.status(401).json({ success: false, error: 'Invalid OTP code' });
    }

    otpStore.delete(sessionId);
    const token = signAdminToken({ id: record.userId, email: record.email, role: record.role });
    await logAdminActivity(record.userId, 'login', { method: '2fa' });
    return res.json({ success: true, token });
  }

  const user = await getAdminUser(email, password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const destinationEmail = normalizeEmail(email) || user.email;
  const sessionKey = generateSessionId();
  const codeValue = generateOtp();
  otpStore.set(sessionKey, {
    email: destinationEmail,
    userId: user.id,
    role: user.role,
    code: codeValue,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  });

  try {
    await sendAdminOtp(destinationEmail, codeValue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'OTP delivery failed';
    return res.status(500).json({ success: false, error: `Cannot send OTP: ${message}` });
  }

  return res.json({ success: true, requires2FA: true, sessionId: sessionKey });
});

router.post('/admin/auth/login-totp', async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '').trim();
  const totpCode = String(req.body?.totpCode ?? '').trim();

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = await getAdminUser(email, password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  // Env super admin doesn't support TOTP
  if (user.id === 'env-super-admin') {
    return res.status(400).json({ success: false, error: 'TOTP is not available for environment admin. Use email OTP instead.' });
  }

  // Check if user has TOTP enabled (database user)
  if (!('totpEnabled' in user) || !user.totpEnabled || !('totpSecret' in user) || !user.totpSecret) {
    return res.status(400).json({ success: false, error: 'TOTP is not enabled for this account' });
  }

  if (!totpCode) {
    return res.status(400).json({ success: false, error: 'TOTP code is required' });
  }

  const isValid = verifyTotpToken(totpCode, user.totpSecret);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Invalid TOTP code' });
  }

  const token = signAdminToken({ id: user.id, email: user.email, role: user.role });
  await logAdminActivity(user.id, 'login', { method: 'totp' });
  return res.json({ success: true, token });
});

export default router;
