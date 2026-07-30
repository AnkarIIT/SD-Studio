import { execSync } from 'child_process';
import { resolve } from 'path';

const root = process.cwd();

let esbuildBin = '';
try {
  execSync('npx --no-install esbuild --version', { stdio: 'pipe', cwd: root, timeout: 5000 });
  esbuildBin = 'npx --no-install esbuild';
} catch {
  esbuildBin = `"${resolve(root, 'node_modules', 'esbuild', 'bin', 'esbuild')}"`;
}

// Compile server TS files, output alongside their source
execSync(`${esbuildBin} server/env.ts server/lib/*.ts server/routes/*.ts --format=esm --outbase=server --outdir=server --tree-shaking=false`, { stdio: 'pipe', cwd: root, timeout: 30000 });

// Compile src/constants.ts separately (needed by server/routes/public.ts)
execSync(`${esbuildBin} src/constants.ts --format=esm --outdir=src --tree-shaking=false`, { stdio: 'pipe', cwd: root, timeout: 30000 });
