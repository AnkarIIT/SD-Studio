import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';
import { platform } from 'os';

const root = process.cwd();
const apiDir = resolve(root, 'api');
const shell = platform() === 'win32' ? 'powershell.exe' : undefined;

console.log('[vercel-build] Bundling API entry point...');
execSync(
  `npx esbuild api/index.ts --bundle --platform=node --outfile=api/index.js --external:@prisma/client`,
  { stdio: 'inherit', cwd: root, shell }
);

const tsEntry = resolve(apiDir, 'index.ts');
if (existsSync(tsEntry)) {
  console.log('[vercel-build] Removing api/index.ts...');
  rmSync(tsEntry);
}

for (const dir of ['_lib', '_routes']) {
  const p = resolve(apiDir, dir);
  if (existsSync(p)) {
    console.log(`[vercel-build] Removing api/${dir}...`);
    rmSync(p, { recursive: true, force: true });
  }
}

console.log('[vercel-build] Done.');
