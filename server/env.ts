import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

/** Resolve SQLite paths relative to prisma/ so DB works regardless of cwd */
function normalizeDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url?.startsWith('file:')) return;

  const filePart = url.slice('file:'.length);
  if (path.isAbsolute(filePart)) return;

  const prismaDir = path.join(projectRoot, 'prisma');
  const resolved = path.resolve(prismaDir, filePart.replace(/^\.\//, ''));
  process.env.DATABASE_URL = `file:${resolved}`;
}

normalizeDatabaseUrl();