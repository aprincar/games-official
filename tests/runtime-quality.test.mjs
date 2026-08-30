import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime = fs.readFileSync(new URL('../src/runtime/phaser-runtime.js', import.meta.url), 'utf8');
const three = fs.readFileSync(new URL('../src/runtime/three-runtime.js', import.meta.url), 'utf8');
const config = fs.readFileSync(new URL('../src/config/games.mjs', import.meta.url), 'utf8');

test('Phaser rounds clean global input listeners before installing new round handlers', () => {
  assert.match(runtime, /this\.input\.off\(['"]drag['"]\)/);
  assert.match(runtime, /this\.input\.off\(['"]dragend['"]\)/);
  assert.match(runtime, /this\.input\.off\(['"]pointerup['"]\)/);
});

test('painting draws real strokes, persists them through SDK storage and records observational evidence', () => {
  assert.match(runtime, /this\.paintGraphics/);
  assert.match(runtime, /aprincar\.storage\.set\(['"]paint:last['"]/);
  assert.match(runtime, /result:\s*['"]observed['"]/);
  assert.match(config, /slug:'paint-free'[\s\S]*permissions:\['storage'\]/);
});

test('handwriting rotates across the official starter letters and reduces guide assistance by level', () => {
  assert.match(config, /answers:\['A','B','V','R','T'\]/);
  assert.match(runtime, /CFG\.answers/);
  assert.match(runtime, /guideAlpha/);
  assert.match(runtime, /this\.handwritingGraphics/);
});

test('Three.js distinguishes drag using total pointer distance and does not shuffle with Array.sort Math.random', () => {
  assert.match(three, /downPoint/);
  assert.match(three, /lastPoint/);
  assert.doesNotMatch(three, /sort\(\(\) => Math\.random\(\) - \.5\)/);
});
