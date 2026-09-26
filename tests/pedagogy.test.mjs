import test from 'node:test';
import assert from 'node:assert/strict';
import { games } from '../src/config/games.mjs';

test('official catalog has unique ids/slugs and explicit mobile-first age design', () => {
  assert.equal(games.length, 14);
  assert.equal(new Set(games.map((game) => game.id)).size, games.length);
  assert.equal(new Set(games.map((game) => game.slug)).size, games.length);

  for (const game of games) {
    assert.equal(game.mobileFirst, true, `${game.slug}: mobileFirst must be true`);
    assert.ok(game.objective?.trim(), `${game.slug}: objective missing`);
    assert.ok(game.familyId, `${game.slug}: family missing`);
    assert.ok(game.experience?.mechanic, `${game.slug}: mechanic missing`);
    assert.ok(game.experience?.interaction, `${game.slug}: interaction missing`);
    assert.ok(game.experience?.progression?.adaptive, `${game.slug}: adaptive progression missing`);
    assert.ok(Array.isArray(game.ages) && game.ages.length === 2, `${game.slug}: age range missing`);
    const [min, max] = game.ages;
    assert.ok(Number.isInteger(min) && Number.isInteger(max), `${game.slug}: age range not integer`);
    assert.ok(min >= 2 && max <= 10 && min <= max, `${game.slug}: invalid age range`);
    assert.ok(game.ageDesign?.literacyDependency, `${game.slug}: literacyDependency missing`);
    assert.ok(game.ageDesign?.motorDemand, `${game.slug}: motorDemand missing`);
    assert.ok(game.ageDesign?.scaffolding?.trim(), `${game.slug}: scaffolding missing`);
    if (min < 6) {
      assert.notEqual(
        game.ageDesign.literacyDependency,
        'independent',
        `${game.slug}: early-childhood game cannot depend on independent reading`
      );
    }
  }
});

test('age guidance aligns the audited starter experiences', () => {
  const expected = {
    'counting-animals': [4, 7],
    'fruit-basket': [4, 7],
    'block-tower': [4, 7],
    'color-match': [2, 5],
    'pattern-play': [4, 8],
    'letter-hunt': [4, 7],
    'write-a': [4, 7],
    'paint-free': [2, 10],
    'memory-animals': [3, 7],
    'space-shapes-3d': [5, 9],
    'prewriting-trails': [3, 6],
    'print-letters': [4, 7],
    'cursive-letters': [6, 9],
    'guided-painting': [3, 5]
  };

  for (const [slug, ages] of Object.entries(expected)) {
    assert.deepEqual(games.find((game) => game.slug === slug)?.ages, ages, `${slug}: audited ages changed`);
  }
});

test('writing and painting progression uses distinct mechanics instead of duplicate games', () => {
  const expectedMechanics = {
    'prewriting-trails': 'trace-path',
    'print-letters': 'trace-print-letter',
    'cursive-letters': 'trace-cursive',
    'paint-free': 'free-draw',
    'guided-painting': 'paint-regions'
  };

  for (const [slug, mechanic] of Object.entries(expectedMechanics)) {
    assert.equal(
      games.find((game) => game.slug === slug)?.experience?.mechanic,
      mechanic,
      `${slug}: mechanic should remain distinct`
    );
  }
});
