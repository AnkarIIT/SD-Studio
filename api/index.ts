// GLOBAL ERROR HANDLER FOR VERCEL
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

import app from '../server.ts';

export default async function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (error: any) {
    console.error('CRITICAL SERVER ERROR:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Critical Server Error',
        message: error.message,
        path: req.url
      });
    }
  }
}
