#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const maintainedRoots = ['scripts', 'src', 'test'];
const modules = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(file);
    else if (/\.(?:js|mjs)$/.test(entry.name)) modules.push(file);
  }
}

for (const root of maintainedRoots) collect(root);
modules.sort();
for (const module of modules) {
  execFileSync(process.execPath, ['--check', module], { stdio: 'inherit' });
  const source = fs.readFileSync(module, 'utf8');
  const imports = source.matchAll(/(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g);
  for (const [, specifier] of imports) {
    if (!specifier.startsWith('.')) continue;
    const importedFile = path.resolve(path.dirname(module), specifier);
    if (!fs.existsSync(importedFile)) throw new Error(`${module} imports missing module ${specifier}`);
  }
}
console.log(`Syntax and imports checked for ${modules.length} maintained JavaScript modules.`);
