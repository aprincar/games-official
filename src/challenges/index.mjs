const COLOR_POOL = ['violet','coral','sun','leaf','sky'];
const COLOR_LABELS = {violet:'Roxo',coral:'Coral',sun:'Amarelo',leaf:'Verde',sky:'Azul'};
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MEMORY_POOLS = [
  ['🦕','🐼','🦊','🐯','🐸','🐙','🐶','🐱','🦁','🐵'],
  ['🍎','🍐','🍓','🍊','🍌','🥝','🍉','🍒','🥕','🌽'],
  ['⭐','🌙','☀️','☁️','🌈','⚽','🚗','🚀','🎈','🎵'],
];

export function createSeededRandom(seed = 1) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function int(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }
function pick(rng, list) { return list[Math.floor(rng() * list.length)]; }
function shuffle(rng, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function uniqueDistractors(rng, answer, min, max, count) {
  const set = new Set();
  while (set.size < count) {
    const v = int(rng, min, max);
    if (v !== answer) set.add(v);
  }
  return [...set];
}

export function validateChoiceChallenge(challenge) {
  const errors = [];
  if (!Array.isArray(challenge.options) || challenge.options.length < 2) errors.push('options');
  if (challenge.options?.filter((v) => v === challenge.answer).length !== 1) errors.push('answer-count');
  if (new Set(challenge.options ?? []).size !== (challenge.options ?? []).length) errors.push('duplicate-options');
  return { valid: errors.length === 0, errors };
}

export function generateCountingChallenge({ rng = Math.random, seed = Date.now(), level = 1, theme = 'animals' } = {}) {
  const max = Math.min(10, Math.max(3, 4 + Math.floor(level / 2)));
  const min = level > 8 ? 2 : 1;
  const answer = int(rng, min, max);
  const options = shuffle(rng, [answer, ...uniqueDistractors(rng, answer, 1, 10, level < 5 ? 2 : 3)]);
  return {
    type: 'counting', seed, level, theme, answer, options,
    items: Array.from({ length: answer }, (_, i) => ({ id: `item-${i + 1}` })),
    difficulty: Math.min(1, 0.18 + level * 0.04),
  };
}

export function generateColorChallenge({ rng = Math.random, seed = Date.now(), level = 1 } = {}) {
  const answer = pick(rng, COLOR_POOL);
  const count = Math.min(COLOR_POOL.length, level < 5 ? 3 : 4);
  const distractors = shuffle(rng, COLOR_POOL.filter((x) => x !== answer)).slice(0, count - 1);
  return {
    type: 'color', seed, level, answer,
    label: COLOR_LABELS[answer],
    options: shuffle(rng, [answer, ...distractors]),
    difficulty: Math.min(1, 0.2 + level * 0.045),
  };
}

export function generatePatternChallenge({ rng = Math.random, seed = Date.now(), level = 1 } = {}) {
  const tokens = shuffle(rng, ['●','▲','■','◆','★']);
  const patternLength = level < 7 ? 2 : level < 14 ? 3 : 4;
  const motif = tokens.slice(0, patternLength);
  const visible = Math.min(10, 5 + Math.floor(level / 3));
  const sequence = Array.from({ length: visible }, (_, i) => motif[i % motif.length]);
  const answer = motif[visible % motif.length];
  const optionCount = Math.min(4, Math.max(2, patternLength));
  const distractors = tokens.filter((x) => x !== answer).slice(0, optionCount - 1);
  return {
    type: 'pattern', seed, level, motif, sequence, answer,
    options: shuffle(rng, [answer, ...distractors]),
    difficulty: Math.min(1, 0.2 + level * 0.04),
  };
}

export function generateLetterChallenge({ rng = Math.random, seed = Date.now(), level = 1 } = {}) {
  const answer = pick(rng, LETTERS);
  const optionCount = level < 6 ? 4 : 6;
  const distractors = shuffle(rng, LETTERS.filter((x) => x !== answer)).slice(0, optionCount - 1);
  return {
    type: 'letter', seed, level, answer,
    options: shuffle(rng, [answer, ...distractors]),
    difficulty: Math.min(1, 0.18 + level * 0.04),
  };
}

export function generateMemoryChallenge({ rng = Math.random, seed = Date.now(), level = 1 } = {}) {
  const pairs = Math.min(10, Math.max(3, 3 + Math.floor((level - 1) / 3)));
  const pool = pick(rng, MEMORY_POOLS);
  const values = shuffle(rng, pool).slice(0, pairs);
  const cards = shuffle(rng, values.flatMap((value, pairIndex) => [
    { id: `${pairIndex}-a`, pairId: String(pairIndex), value },
    { id: `${pairIndex}-b`, pairId: String(pairIndex), value },
  ]));
  return {
    type: 'memory', seed, level, pairs, cards,
    previewMs: Math.max(500, 1800 - level * 55),
    difficulty: Math.min(1, 0.18 + level * 0.035),
  };
}
