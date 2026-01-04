import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function run(cmd: string, args: string[], cwd: string) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status || 1);
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(currentDir, '..');
const clientDir = path.resolve(root, 'client');
const serverDir = path.resolve(root, 'server');
const sharedDir = path.resolve(root, 'shared');

// Build order: shared -> client -> server
run('npx', ['tsc', '-p', path.join(sharedDir, 'tsconfig.json')], root);
run('npm', ['run', 'build', '--workspace', '@irish-potions/client'], root);
run('npm', ['run', 'build', '--workspace', '@irish-potions/server'], root);

console.log('Build complete');
