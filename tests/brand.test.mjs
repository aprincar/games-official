import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('official game runtimes consume Aprincar Brand System v3 star identity', () => {
  const brand = fs.readFileSync(new URL('../src/runtime/brand.js', import.meta.url), 'utf8');
  const phaser = fs.readFileSync(new URL('../src/runtime/phaser-runtime.js', import.meta.url), 'utf8');
  const three = fs.readFileSync(new URL('../src/runtime/three-runtime.js', import.meta.url), 'utf8');
  const build = fs.readFileSync(new URL('../scripts/build-games.mjs', import.meta.url), 'utf8');

  assert.match(brand, /data-brand-version="3"/);
  assert.match(brand, /aprincar-star/);
  assert.match(brand, /#FBCB24/i);
  assert.match(brand, /#2563EB/i);
  assert.match(brand, /add\.star/);
  assert.match(phaser, /APRINCAR_BRAND/);
  assert.match(three, /APRINCAR_BRAND/);
  assert.match(build, /brand\.js/);
  assert.doesNotMatch(brand, /aprincar-mark-pieces/);
});
