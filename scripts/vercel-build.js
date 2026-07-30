import { execSync } from 'child_process';
import { existsSync, rmSync, statSync } from 'fs';
import { resolve } from 'path';

const root = process.cwd();

console.log('[vercel-build] START');

try {
  execSync(
    'npx --no-install esbuild api/index.ts --bundle --platform=node --format=esm --outfile=api/index.js --external:@prisma/client',
    { stdio: 'inherit', cwd: root, timeout: 60000 }
  );
} catch {
  console.log('[vercel-build] npx failed, trying direct path...');
  execSync(
    `node "${resolve(root, 'node_modules', 'esbuild', 'bin', 'esbuild')}" api/index.ts --bundle --platform=node --format=esm --outfile=api/index.js --external:@prisma/client`,
    { stdio: 'inherit', cwd: root, timeout: 60000 }
  );
}

const jsPath = resolve(root, 'api', 'index.js');
if (existsSync(jsPath)) {
  console.log('[vercel-build] Bundle created:', (statSync(jsPath).size / 1024 / 1024).toFixed(1) + 'mb');
} else {
  console.log('[vercel-build] ERROR: api/index.js not created!');
  process.exit(1);
}

if (existsSync(resolve(root, 'api', 'index.ts'))) {
  console.log('[vercel-build] Removing api/index.ts');
  rmSync(resolve(root, 'api', 'index.ts'));
}

console.log('[vercel-build] DONE');
