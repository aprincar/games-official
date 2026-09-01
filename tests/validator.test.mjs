import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function runFixture(manifest, html) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aprincar-official-validator-'));
  const dir = path.join(root, 'game');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(dir, 'game.html'), html);
  const result = spawnSync(process.execPath, ['scripts/validate.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, APRINCAR_GAMES_DIR: root },
    encoding: 'utf8',
  });
  fs.rmSync(root, { recursive: true, force: true });
  return result;
}

const baseManifest = {
  manifestVersion: 1,
  id: 'aprincar.fixture',
  kind: 'game',
  version: '1.0.0',
  publisher: 'aprincar',
  name: { 'pt-BR': 'Fixture' },
  engines: { aprincar: '^1.0.0', sdkProtocol: 1 },
  entrypoints: { game: 'game.html' },
  permissions: [], optionalPermissions: [],
  contributes: { skills: ['math.counting.1-10'] },
  offline: true,
  bundleMode: 'single-html',
};

test('official validator rejects unknown skills in isolated fixtures', () => {
  const result = runFixture({ ...baseManifest, contributes: { skills: ['bad.skill'] } }, '<script>1</script>');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unknown skill/i);
});

test('official validator rejects remote executable code in isolated fixtures', () => {
  const result = runFixture(baseManifest, '<script src="https://evil.example/game.js"></script>');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /remote executable/i);
});

test('all ten official games expose distinct V1.1 fantasies and mechanics', () => {
  const root = new URL('../games/', import.meta.url);
  const manifests = fs.readdirSync(root, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => JSON.parse(fs.readFileSync(new URL(`${item.name}/manifest.json`, root), 'utf8')));
  assert.equal(manifests.length, 10);
  assert.equal(new Set(manifests.map((manifest) => manifest.experience?.fantasy)).size, 10);
  assert.equal(new Set(manifests.map((manifest) => manifest.experience?.mechanic)).size, 10);
  for (const manifest of manifests) assert.ok(manifest.experience?.learningSignals?.length);
});
