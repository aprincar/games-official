import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSeededRandom,
  generateCountingChallenge,
  generateColorChallenge,
  generatePatternChallenge,
  generateLetterChallenge,
  generateMemoryChallenge,
  validateChoiceChallenge,
} from '../src/challenges/index.mjs';

function fuzz(count, factory, assertion) {
  for (let seed = 1; seed <= count; seed++) assertion(factory(createSeededRandom(seed), seed), seed);
}

test('counting challenges always contain the target exactly once', () => {
  fuzz(10_000, (rng, seed) => generateCountingChallenge({ rng, seed, level: 1 + (seed % 20) }), (c) => {
    assert.equal(validateChoiceChallenge(c).valid, true);
    assert.equal(c.options.filter((x) => x === c.answer).length, 1);
    assert.equal(c.items.length, c.answer);
  });
});

test('color challenges always contain one correct color', () => {
  fuzz(2_000, (rng, seed) => generateColorChallenge({ rng, seed, level: 1 + (seed % 12) }), (c) => {
    assert.equal(validateChoiceChallenge(c).valid, true);
    assert.equal(c.options.filter((x) => x === c.answer).length, 1);
  });
});

test('pattern challenges are solvable and answer appears once', () => {
  fuzz(5_000, (rng, seed) => generatePatternChallenge({ rng, seed, level: 1 + (seed % 18) }), (c) => {
    assert.equal(validateChoiceChallenge(c).valid, true);
    assert.equal(c.options.filter((x) => x === c.answer).length, 1);
    assert.ok(c.sequence.length >= 4);
  });
});

test('letter challenges contain target exactly once', () => {
  fuzz(2_000, (rng, seed) => generateLetterChallenge({ rng, seed, level: 1 + (seed % 15) }), (c) => {
    assert.equal(validateChoiceChallenge(c).valid, true);
    assert.equal(c.options.filter((x) => x === c.answer).length, 1);
  });
});

test('memory challenges contain every value exactly twice', () => {
  fuzz(1_000, (rng, seed) => generateMemoryChallenge({ rng, seed, level: 1 + (seed % 20) }), (c) => {
    const counts = new Map();
    for (const card of c.cards) counts.set(card.value, (counts.get(card.value) ?? 0) + 1);
    assert.equal(c.cards.length, c.pairs * 2);
    for (const n of counts.values()) assert.equal(n, 2);
  });
});
