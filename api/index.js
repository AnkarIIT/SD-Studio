import { PrismaClient } from '@prisma/client';
import express from 'express';

const app = express();

let prismaInitError = null;
try {
  const prisma = new PrismaClient();
} catch (e) {
  prismaInitError = e.message;
}

app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong', prismaError: prismaInitError });
});

export default app;
