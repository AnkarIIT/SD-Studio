import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { resolve } from 'path';

const root = process.cwd();

console.log('[vercel-build] START');

let esbuildBin = '';
try {
  execSync('npx --no-install esbuild --version', { stdio: 'pipe', cwd: root, timeout: 10000 });
  esbuildBin = 'npx --no-install esbuild';
} catch {
  esbuildBin = `"${resolve(root, 'node_modules', 'esbuild', 'bin', 'esbuild')}"`;
}

console.log('[vercel-build] Compiling server/*.ts');
execSync(
  `${esbuildBin} server/env.ts server/lib/*.ts server/routes/*.ts --format=esm --outbase=server --outdir=server --tree-shaking=false`,
  { stdio: 'inherit', cwd: root, timeout: 30000 }
);

console.log('[vercel-build] Compiling src/constants.ts');
execSync(
  `${esbuildBin} src/constants.ts --format=esm --outdir=src --tree-shaking=false`,
  { stdio: 'inherit', cwd: root, timeout: 30000 }
);

const apiEntry = resolve(root, 'api', 'index.js');
if (existsSync(apiEntry)) {
  console.log('[vercel-build] api/index.js exists:', (statSync(apiEntry).size / 1024).toFixed(1) + 'kb');
} else {
  console.log('[vercel-build] ERROR: api/index.js not found!');
  process.exit(1);
}

console.log('[vercel-build] DONE');
