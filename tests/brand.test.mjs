import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('official game runtimes consume the locked approved Aprincar identity', () => {
  const brand = fs.readFileSync(new URL('../src/runtime/brand.js', import.meta.url), 'utf8');
  const phaser = fs.readFileSync(new URL('../src/runtime/phaser-runtime.js', import.meta.url), 'utf8');
  const three = fs.readFileSync(new URL('../src/runtime/three-runtime.js', import.meta.url), 'utf8');
  const build = fs.readFileSync(new URL('../scripts/build-games.mjs', import.meta.url), 'utf8');

  assert.match(brand, /data-brand-version="approved-v1"/);
  assert.match(brand, /aprincar-approved/);
  assert.match(brand, /#2563EB/i);
  assert.match(brand, /#FBBF24/i);
  assert.match(brand, /fillTriangle/);
  assert.match(brand, /Poppins/);
  assert.match(brand, /quadraticBezierTo/);
  assert.match(phaser, /APRINCAR_BRAND/);
  assert.match(three, /APRINCAR_BRAND/);
  assert.match(build, /brand\.js/);
  assert.doesNotMatch(brand, /aprincar-star/);
  assert.doesNotMatch(brand, /add\.star/);
});
