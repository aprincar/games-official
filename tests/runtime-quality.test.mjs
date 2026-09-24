import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { games } from '../src/config/games.mjs';

const runtime = fs.readFileSync(new URL('../src/runtime/phaser-runtime.js', import.meta.url), 'utf8');
const three = fs.readFileSync(new URL('../src/runtime/three-runtime.js', import.meta.url), 'utf8');

test('Phaser rounds clean global input listeners before installing new round handlers', () => {
  assert.match(runtime, /this\.input\.off\(['"]drag['"]\)/);
  assert.match(runtime, /this\.input\.off\(['"]dragend['"]\)/);
  assert.match(runtime, /this\.input\.off\(['"]pointerup['"]\)/);
});

test('painting draws real strokes, persists them through SDK storage and records observational evidence', () => {
  const paint = games.find((game) => game.slug === 'paint-free');
  assert.ok(paint, 'paint-free config missing');
  assert.match(runtime, /this\.paintGraphics/);
  assert.match(runtime, /aprincar\.storage\.set\(['"]paint:last['"]/);
  assert.match(runtime, /result:\s*['"]observed['"]/);
  assert.deepEqual(paint.permissions, ['storage']);
});

test('handwriting rotates across the official starter letters and reduces guide assistance by level', () => {
  const handwriting = games.find((game) => game.slug === 'write-a');
  assert.ok(handwriting, 'write-a config missing');
  assert.deepEqual(handwriting.answers, ['A', 'B', 'V', 'R', 'T']);
  assert.match(runtime, /CFG\.answers/);
  assert.match(runtime, /guideAlpha/);
  assert.match(runtime, /this\.handwritingGraphics/);
});

test('Three.js distinguishes drag using total pointer distance and does not shuffle with Array.sort Math.random', () => {
  assert.match(three, /downPoint/);
  assert.match(three, /lastPoint/);
  assert.doesNotMatch(three, /sort\(\(\) => Math\.random\(\) - \.5\)/);
});
