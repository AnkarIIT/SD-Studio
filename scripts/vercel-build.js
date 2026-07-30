import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';
import { platform } from 'os';

const root = process.cwd();
const apiDir = resolve(root, 'api');
const esbuildBin = resolve(root, 'node_modules', '.bin', platform() === 'win32' ? 'esbuild.cmd' : 'esbuild');

console.log('[vercel-build] Bundling API entry point...');
execSync(
  `"${esbuildBin}" api/index.ts --bundle --platform=node --format=cjs --outfile=api/index.cjs --external:@prisma/client`,
  { stdio: 'inherit', cwd: root }
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

const oldJs = resolve(apiDir, 'index.js');
if (existsSync(oldJs)) {
  rmSync(oldJs);
}

console.log('[vercel-build] Done.');
