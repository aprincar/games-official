import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('official game runtimes consume Aprincar Brand System v4 portal identity', () => {
  const brand = fs.readFileSync(new URL('../src/runtime/brand.js', import.meta.url), 'utf8');
  const phaser = fs.readFileSync(new URL('../src/runtime/phaser-runtime.js', import.meta.url), 'utf8');
  const three = fs.readFileSync(new URL('../src/runtime/three-runtime.js', import.meta.url), 'utf8');
  const build = fs.readFileSync(new URL('../scripts/build-games.mjs', import.meta.url), 'utf8');

  assert.match(brand, /data-brand-version="4"/);
  assert.match(brand, /aprincar-portal/);
  assert.match(brand, /#4F6EF7/i);
  assert.match(brand, /#FFC83D/i);
  assert.match(brand, /fillTriangle/);
  assert.match(phaser, /APRINCAR_BRAND/);
  assert.match(three, /APRINCAR_BRAND/);
  assert.match(build, /brand\.js/);
  assert.doesNotMatch(brand, /aprincar-star/);
  assert.doesNotMatch(brand, /add\.star/);
});
