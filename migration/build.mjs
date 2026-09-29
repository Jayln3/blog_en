import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.dirname(new URL(import.meta.url).pathname);
const routes = JSON.parse(await fs.readFile(path.join(root, 'routes.json'), 'utf8'));
const output = path.join(root, 'public');
await fs.rm(output, { recursive: true, force: true });
for (const [oldPath, newPath] of Object.entries(routes)) {
  const target = 'https://jayln3.github.io' + newPath;
  const file = path.join(output, oldPath.endsWith('.html') ? oldPath : oldPath + 'index.html');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow">' +
    '<meta http-equiv="refresh" content="0;url=' + target + '"><link rel="canonical" href="' + target + '">' +
    '<title>Jayln3 — English blog moved</title></head><body><h1>Jayln3’s English blog has moved</h1>' +
    '<p><a href="' + target + '">Continue to the new site</a></p></body></html>\n');
}
await fs.writeFile(path.join(output, '.nojekyll'), '');
console.log('Created ' + Object.keys(routes).length + ' redirects to the unified bilingual blog.');
