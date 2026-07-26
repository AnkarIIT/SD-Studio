import app from '../server';

// This is required for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  try {
    // Forward the request to the Express app
    return app(req, res);
  } catch (error: any) {
    console.error('Vercel Function Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
