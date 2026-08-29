import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const games = new URL('../games/', import.meta.url).pathname;
let count = 0;
for (const slug of fs.readdirSync(games)) {
  const file = path.join(games, slug, 'game.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  for (let i = 0; i < scripts.length; i++) new vm.Script(scripts[i], { filename: `${slug}#${i}` });
  count++;
}
console.log(`Compiled inline JavaScript for ${count} generated game files`);
