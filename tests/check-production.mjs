import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const dir='dist/turismo-app/browser';const code=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
assert(!code.includes('admin@demo.com'));assert(!code.includes('app-guia-demo-v2'));console.log('Production bundle excludes demo credentials and simulation.');
