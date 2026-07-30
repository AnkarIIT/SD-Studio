import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
}
