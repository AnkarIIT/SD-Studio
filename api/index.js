import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '1mb' }));

app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

export default app;
