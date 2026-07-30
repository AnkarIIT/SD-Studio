import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const root = process.cwd();

let esbuildBin = '';
try {
  execSync('npx --no-install esbuild --version', { stdio: 'pipe', cwd: root, timeout: 5000 });
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

for (const f of TS_FILES) {
  const name = f.replace(/.*[/\\]/, '').replace(/\.ts$/, '');
  execSync(
    `${esbuildBin} "${f}" --format=esm --outfile=api/_lib/${name}.js --tree-shaking=false`,
    { stdio: 'pipe', cwd: root, timeout: 30000 }
  );
}

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
for (const file of files) {
  const fp = join(libDir, file);
  let content = readFileSync(fp, 'utf8');
  let changed = false;
  for (const [from, to] of REWRITES) {
    const newContent = content.replaceAll(from, to);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  if (changed) writeFileSync(fp, content, 'utf8');
}
