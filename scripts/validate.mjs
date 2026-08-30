import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.env.APRINCAR_GAMES_DIR
  ? path.resolve(process.env.APRINCAR_GAMES_DIR)
  : new URL('../games/', import.meta.url).pathname;
const allowed = new Set([
  'storage', 'audio', 'haptics', 'fullscreen', 'drawing', 'handwriting',
  'camera', 'microphone', 'network', 'geolocation',
]);
const skillIds = new Set(JSON.parse(fs.readFileSync(new URL('../schemas/skill-ids.json', import.meta.url), 'utf8')));
const errors = [];
const directories = fs.existsSync(root)
  ? fs.readdirSync(root).map((name) => [name, path.join(root, name)]).filter(([, dir]) => fs.statSync(dir).isDirectory())
  : [];

if (directories.length === 0) errors.push('no official game directories found');

for (const [name, dir] of directories) {
  const manifestPath = path.join(dir, 'manifest.json');
  const htmlPath = path.join(dir, 'game.html');
  if (!fs.existsSync(manifestPath) || !fs.existsSync(htmlPath)) {
    errors.push(`${name}: missing manifest.json or game.html`);
    continue;
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    errors.push(`${name}: invalid manifest JSON (${error instanceof Error ? error.message : String(error)})`);
    continue;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (manifest.manifestVersion !== 1 || manifest.kind !== 'game' || manifest.bundleMode !== 'single-html')
    errors.push(`${name}: invalid extension contract`);
  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(String(manifest.id ?? ''))) errors.push(`${name}: invalid id`);
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(String(manifest.version ?? '')))
    errors.push(`${name}: invalid semantic version`);
  if (manifest.engines?.sdkProtocol !== 1 || typeof manifest.engines?.aprincar !== 'string')
    errors.push(`${name}: invalid Aprincar engine contract`);
  if (manifest.entrypoints?.game !== 'game.html') errors.push(`${name}: entrypoint must be game.html`);
  if (!Array.isArray(manifest.permissions) || !manifest.permissions.every((permission) => allowed.has(permission)))
    errors.push(`${name}: permission unsupported`);
  if (!Array.isArray(manifest.optionalPermissions) || !manifest.optionalPermissions.every((permission) => allowed.has(permission)))
    errors.push(`${name}: optional permission unsupported`);
  if (!Array.isArray(manifest.contributes?.skills) || manifest.contributes.skills.length === 0)
    errors.push(`${name}: skills missing`);
  else {
    for (const skill of [...manifest.contributes.skills, ...(manifest.contributes.secondarySkills ?? [])])
      if (!skillIds.has(skill)) errors.push(`${name}: unknown skill ${skill}`);
  }
  if (
    /<script[^>]+src=["']https?:\/\//i.test(html) ||
    /import\s*\([^)]*https?:\/\//i.test(html)
  )
    errors.push(`${name}: remote executable code forbidden`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${directories.length} official game extension(s)`);
