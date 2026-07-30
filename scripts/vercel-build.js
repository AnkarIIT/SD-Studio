import { execSync } from 'child_process';
import { existsSync, statSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const root = process.cwd();

console.log('[vercel-build] START');

let esbuildBin = '';
try {
  execSync('npx --no-install esbuild --version', { stdio: 'pipe', cwd: root, timeout: 10000 });
  esbuildBin = 'npx --no-install esbuild';
} catch {
  esbuildBin = `"${resolve(root, 'node_modules', 'esbuild', 'bin', 'esbuild')}"`;
}

const TS_FILES = [
  'server/env.ts',
  'server/lib/analytics.ts',
  'server/lib/cashfree.ts',
  'server/lib/catalog.ts',
  'server/lib/database.ts',
  'server/lib/db-connect.ts',
  'server/lib/order-access.ts',
  'server/lib/orders.ts',
  'server/lib/payment-queue.ts',
  'server/lib/razorpay.ts',
  'server/lib/site-config.ts',
  'server/lib/timeline.ts',
  'server/routes/commerce.ts',
  'server/routes/public.ts',
  'server/routes/webhooks.ts',
  'src/constants.ts',
];

console.log('[vercel-build] Compiling to api/_lib/');
for (const f of TS_FILES) {
  const name = f.replace(/.*[/\\]/, '').replace(/\.ts$/, '');
  execSync(
    `${esbuildBin} "${f}" --format=esm --outfile=api/_lib/${name}.js --tree-shaking=false`,
    { stdio: 'inherit', cwd: root, timeout: 30000 }
  );
}

console.log('[vercel-build] Fixing import paths');
const REWRITES = [
  ['"../env"', '"./env.js"'],
  ['"../lib/database"', '"./database.js"'],
  ['"../lib/orders"', '"./orders.js"'],
  ['"../lib/site-config"', '"./site-config.js"'],
  ['"../lib/catalog"', '"./catalog.js"'],
  ['"../lib/order-access"', '"./order-access.js"'],
  ['"../lib/timeline"', '"./timeline.js"'],
  ['"../lib/analytics"', '"./analytics.js"'],
  ['"../lib/razorpay"', '"./razorpay.js"'],
  ['"../lib/payment-queue"', '"./payment-queue.js"'],
  ['"../lib/db-connect"', '"./db-connect.js"'],
  ['"../../src/constants"', '"./constants.js"'],
  ['"./database"', '"./database.js"'],
  ['"./orders"', '"./orders.js"'],
  ['"./public"', '"./public.js"'],
  ['"./webhooks"', '"./webhooks.js"'],
  ['"./catalog"', '"./catalog.js"'],
  ['"./site-config"', '"./site-config.js"'],
  ['"./timeline"', '"./timeline.js"'],
];

const libDir = join(root, 'api/_lib');
const files = readdirSync(libDir).filter(f => f.endsWith('.js'));
let totalChanges = 0;
for (const file of files) {
  const fp = join(libDir, file);
  let content = readFileSync(fp, 'utf8');
  let changed = false;
  for (const [from, to] of REWRITES) {
    const count = (content.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const newContent = content.replaceAll(from, to);
    if (newContent !== content) {
      totalChanges += count;
      content = newContent;
      changed = true;
    }
  }
  if (changed) writeFileSync(fp, content, 'utf8');
}
console.log('[vercel-build] Rewrote', totalChanges, 'import paths');

const apiEntry = resolve(root, 'api', 'index.js');
if (existsSync(apiEntry)) {
  console.log('[vercel-build] api/index.js exists:', (statSync(apiEntry).size / 1024).toFixed(1) + 'kb');
} else {
  console.log('[vercel-build] ERROR: api/index.js not found!');
  process.exit(1);
}

console.log('[vercel-build] DONE');
