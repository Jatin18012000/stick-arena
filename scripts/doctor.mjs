// Setup checker: `npm run doctor`
//
// Checks everything needed to run, build and test the game, and prints the
// fix for anything missing. Uses only Node built-ins, so it works before
// `npm install` has been run. Add --build to also run a production build.
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = path.join(root, 'node_modules');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

let problems = 0;
let warnings = 0;
const ok = (msg) => console.log(`  ok    ${msg}`);
const bad = (msg, fix) => { problems++; console.log(`  FAIL  ${msg}\n        fix: ${fix}`); };
const warn = (msg, fix) => { warnings++; console.log(`  warn  ${msg}\n        fix: ${fix}`); };

console.log(`\n${pkg.name} setup check\n`);

// 1. Node version: Vite needs ^20.19.0 or >=22.12.0.
const [major, minor] = process.versions.node.split('.').map(Number);
const nodeOk = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22;
if (nodeOk) ok(`Node ${process.versions.node}`);
else bad(`Node ${process.versions.node} is too old (need 20.19+ or 22.12+)`, 'install Node 22 LTS from https://nodejs.org or with nvm: `nvm install 22`');

// 2. npm is available.
const npm = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' });
if (npm.status === 0) ok(`npm ${npm.stdout.trim()}`);
else bad('npm not found', 'npm ships with Node; reinstall Node from https://nodejs.org');

// 3. Dependencies installed in this project (not picked up from a global
// install). Read straight from node_modules: some packages don't export
// their package.json.
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
let depsMissing = false;
for (const name of Object.keys(deps)) {
  const manifest = path.join(modules, name, 'package.json');
  if (existsSync(manifest)) ok(`${name} ${JSON.parse(readFileSync(manifest, 'utf8')).version}`);
  else depsMissing = true;
}
if (depsMissing) bad('dependencies are not installed', 'run `npm install` (or `npm ci` for the exact locked versions)');

// 4. Playwright's Chromium, needed only for `npm test`.
if (!depsMissing) {
  try {
    const { chromium } = await import(pathToFileURL(path.join(modules, 'playwright', 'index.mjs')).href);
    const exe = chromium.executablePath();
    if (exe && existsSync(exe)) ok('Chromium for the smoke test');
    else warn('Chromium for the smoke test is not installed (only needed for `npm test`)', 'run `npx playwright install chromium`');
  } catch {
    warn('could not load Playwright (only needed for `npm test`)', 'run `npm install`, then `npx playwright install chromium`');
  }
}

// 5. Optional: a real production build.
if (process.argv.includes('--build') && !depsMissing) {
  const build = spawnSync(process.execPath, [path.join(modules, 'vite', 'bin', 'vite.js'), 'build', '--logLevel', 'error'], { cwd: root, encoding: 'utf8' });
  if (build.status === 0 && existsSync(path.join(root, 'dist', 'index.html'))) ok('production build (dist/)');
  else bad('production build failed', `see the error below and open an issue if it persists\n${build.stderr || build.stdout}`);
}

console.log('');
if (problems) {
  console.log(`${problems} problem(s) to fix before \`npm run dev\` will work.\n`);
  process.exit(1);
}
console.log(warnings
  ? 'Ready to play: run `npm run dev`. (Fix the warning above to run the tests.)\n'
  : 'All good. Run `npm run dev` to play, or `npm test` to run the smoke test.\n');
