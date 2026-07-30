import dotenv from 'dotenv';

// Vercel handles environment variables via the dashboard,
// so we only need dotenv for local development.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
}
