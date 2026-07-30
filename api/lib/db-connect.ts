import '../env';
import prisma from './database';

export async function connectDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) {
    console.warn('⚠️  DATABASE_URL missing — orders API disabled');
    return false;
  }

  try {
    await prisma.$connect();
    await prisma.$queryRawUnsafe('SELECT 1');
    console.log('✅ Database connected');
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Database connection failed:', message);
    console.error('   Run: npm run db:push');
    return false;
  }
}
