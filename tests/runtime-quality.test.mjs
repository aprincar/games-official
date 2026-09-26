import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { games } from '../src/config/games.mjs';

const runtime = fs.readFileSync(new URL('../src/runtime/phaser-runtime.js', import.meta.url), 'utf8');
const three = fs.readFileSync(new URL('../src/runtime/three-runtime.js', import.meta.url), 'utf8');
const brand = fs.readFileSync(new URL('../src/runtime/brand.js', import.meta.url), 'utf8');
const fruitBasket = fs.readFileSync(new URL('../src/games/fruit-basket.js', import.meta.url), 'utf8');
const blockTower = fs.readFileSync(new URL('../src/games/block-tower.js', import.meta.url), 'utf8');
const browserHarness = fs.readFileSync(new URL('./browser-harness.mjs', import.meta.url), 'utf8');
const registryBuilder = fs.readFileSync(new URL('../scripts/build-registry.mjs', import.meta.url), 'utf8');
const prewriting = fs.readFileSync(new URL('../src/games/prewriting-trails.js', import.meta.url), 'utf8');
const printLettersSource = fs.readFileSync(new URL('../src/games/print-letters.js', import.meta.url), 'utf8');
const cursiveSource = fs.readFileSync(new URL('../src/games/cursive-letters.js', import.meta.url), 'utf8');
const guidedPaintingSource = fs.readFileSync(new URL('../src/games/guided-painting.js', import.meta.url), 'utf8');
const traceToolsSource = fs.readFileSync(new URL('../src/common/trace-tools.js', import.meta.url), 'utf8');

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


test('game runtime uses Aprincar portal brand v4 without the legacy star identity', () => {
  assert.match(brand, /data-brand-version="4"/);
  assert.match(brand, /aprincar-portal/);
  assert.match(brand, /#4F6EF7/i);
  assert.match(brand, /#FFC83D/i);
  assert.doesNotMatch(brand, /aprincar-star/);
  assert.doesNotMatch(brand, /brandVersion', 3/);
});


test('reversible counting publishes interactive targets at their current visual positions', () => {
  for (const source of [fruitBasket, blockTower]) {
    assert.match(source, /target\.x = .*\.container\.x/);
    assert.match(source, /target\.y = .*\.container\.y/);
    assert.match(source, /targets:\s*this\.testTargets/);
  }
});

test('browser harness waits for Chrome exit and retries temporary directory cleanup', () => {
  assert.match(browserHarness, /waitForProcessExit/);
  assert.match(browserHarness, /maxRetries:\s*8/);
  assert.match(browserHarness, /retryDelay:\s*75/);
});


test('registry publishes the canonical educational objective without changing Manifest Schema 1', () => {
  assert.match(registryBuilder, /gameConfigs/);
  assert.match(registryBuilder, /objective:\s*gameConfig\?\.objective/);
  assert.match(registryBuilder, /secondarySkills:\s*manifest\.contributes\.secondarySkills/);
  assert.match(registryBuilder, /\{ 'pt-BR': gameConfig\.objective \}/);
  assert.doesNotMatch(registryBuilder, /manifest\.manifestVersion\s*=/);
});


test('new writing progression shares path-based tracing and remains touch-first', () => {
  assert.match(traceToolsSource, /function coverage/);
  for (const source of [prewriting, printLettersSource, cursiveSource]) {
    assert.match(source, /draw-zone/);
    assert.match(source, /TRACE\.coverage/);
    assert.match(source, /inputReady:\s*true/);
  }
});

test('guided painting pairs color with symbols and exposes large paint regions', () => {
  assert.match(guidedPaintingSource, /paint-region/);
  assert.match(guidedPaintingSource, /symbol/);
  assert.match(guidedPaintingSource, /Conferir pintura/);
});
