import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

const root = process.cwd();

console.log('[vercel-build] Bundling api/index.ts -> api/index.js (ESM)');

try {
  execSync(
    'npx --no-install esbuild api/index.ts --bundle --platform=node --format=esm --outfile=api/index.js --external:@prisma/client',
    { stdio: 'inherit', cwd: root, timeout: 60000 }
  );
} catch {
  execSync(
    `node "${resolve(root, 'node_modules', 'esbuild', 'bin', 'esbuild')}" api/index.ts --bundle --platform=node --format=esm --outfile=api/index.js --external:@prisma/client`,
    { stdio: 'inherit', cwd: root, timeout: 60000 }
  );
}

if (existsSync(resolve(root, 'api', 'index.ts'))) {
  console.log('[vercel-build] Removing api/index.ts');
  rmSync(resolve(root, 'api', 'index.ts'));
}

if (existsSync(resolve(root, 'api', 'ping.cjs'))) {
  rmSync(resolve(root, 'api', 'ping.cjs'));
}

console.log('[vercel-build] Done.');
