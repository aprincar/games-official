import assert from 'node:assert/strict';
import {
  assertNoPageErrors,
  mouseDrag,
  mouseTap,
  startBrowserHarness,
  targetBy,
  targetCenter,
  touchDrag,
  touchTap,
  waitFor,
  waitForInputReady,
  waitForResult,
} from './browser-harness.mjs';

const failures = [];
const harness = await startBrowserHarness();

async function delay(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function withGame(slug, options, fn) {
  const page = await harness.openGame(slug, options);
  try {
    const host = await page.host();
    assert.ok(host.events.some((event) => event.type === 'session.start'), slug + ': session.start nao chegou ao host');
    await fn(page);
    assertNoPageErrors(page);
  } finally {
    await page.close();
  }
}

async function scenario(name, fn) {
  try {
    await fn();
    console.log('✓ ' + name);
  } catch (error) {
    failures.push({ name, error });
    console.error('✗ ' + name + '\n  ' + (error && error.stack || error));
  }
}

function choiceTarget(state, value) {
  return targetCenter(targetBy(state, 'choice', value));
}

function wrongChoice(state) {
  return (state.targets || []).find((target) =>
    target.kind === 'choice' && target.value !== state.challenge.answer
  );
}

async function evidencePayloads(page) {
  const host = await page.host();
  return host.events
    .filter((event) => event.type === 'evidence.submit' && event.payload)
    .map((event) => event.payload);
}

async function waitForEvidenceCount(page, count) {
  return waitFor(async () => {
    const payloads = await evidencePayloads(page);
    return payloads.length >= count ? payloads : false;
  }, { label: page.slug + ': evidence count=' + count });
}

async function assertEvidence(page, result) {
  await waitFor(async () => {
    const payloads = await evidencePayloads(page);
    return payloads.some((payload) => payload.result === result);
  }, { label: page.slug + ': evidence ' + result });
}

await scenario('Conte os Bichos: falha, retry e sucesso observavel', async () => {
  await withGame('counting-animals', {}, async (page) => {
    let state = await page.state();
    const wrong = wrongChoice(state);
    assert.ok(wrong, 'counting-animals: alternativa incorreta ausente');
    await mouseTap(page.client, targetCenter(wrong));
    await waitForResult(page, 'failure');
    await waitForInputReady(page);

    state = await page.state();
    const animals = state.targets.filter((target) => target.kind === 'animal');
    assert.equal(animals.length, state.challenge.answer);
    for (const animal of animals) await mouseTap(page.client, targetCenter(animal));

    state = await page.state();
    assert.equal(state.tappedAnimals, state.challenge.answer);
    await mouseTap(page.client, choiceTarget(state, state.challenge.answer));
    await waitForResult(page, 'success');
    await assertEvidence(page, 'failure');
    await assertEvidence(page, 'success');
  });
});


await scenario('Familia Quantidades: portrait mobile mantem alvos visiveis e tocaveis', async () => {
  for (const slug of ['counting-animals', 'fruit-basket', 'block-tower']) {
    await withGame(
      slug,
      { touch: true, viewport: { width: 390, height: 844, mobile: true } },
      async (page) => {
        const state = await page.state();
        assert.equal(state.familyId, 'quantities');
        assert.equal(state.viewport.width, 390);
        assert.equal(state.viewport.height, 844);
        assert.equal(state.viewport.portrait, true);

        const interactive = (state.targets || []).filter((target) =>
          ['animal', 'choice', 'action', 'drag-source', 'toggle'].includes(target.kind)
        );
        assert.ok(interactive.length > 0, slug + ': nenhum alvo interativo publicado');

        for (const target of interactive) {
          assert.ok(target.w >= 52, slug + ': alvo estreito ' + target.kind + ' ' + target.value);
          assert.ok(target.h >= 52, slug + ': alvo baixo ' + target.kind + ' ' + target.value);
          assert.ok(target.x - target.w / 2 >= -1, slug + ': alvo saiu pela esquerda');
          assert.ok(target.x + target.w / 2 <= 391, slug + ': alvo saiu pela direita');
          assert.ok(target.y - target.h / 2 >= -1, slug + ': alvo saiu pelo topo');
          assert.ok(target.y + target.h / 2 <= 845, slug + ': alvo saiu pela base');
        }
      }
    );
  }
});

await scenario('Cesta de Frutas: tap fallback e remocao mantem visual e logica equivalentes', async () => {
  await withGame('fruit-basket', {}, async (page) => {
    let state = await page.state();
    const sources = state.targets.filter((target) => target.kind === 'toggle');

    await mouseTap(page.client, targetCenter(sources[0]));
    state = await waitFor(async () => {
      const current = await page.state();
      return current.selectedCount === 1 ? current : false;
    }, { label: 'fruit-basket: tap selectedCount=1' });

    let first = state.fruitStates.find((fruit) => fruit.id === sources[0].value);
    assert.equal(first.picked, true);
    assert.equal(first.basketIndex, 0);
    const firstSlot = { x: first.x, y: first.y };
    assert.ok(first.x >= state.basketBounds.left);
    assert.ok(first.x <= state.basketBounds.left + state.basketBounds.width);
    assert.ok(first.y >= state.basketBounds.top);
    assert.ok(first.y <= state.basketBounds.top + state.basketBounds.height);

    await mouseTap(page.client, targetCenter(sources[1]));
    state = await waitFor(async () => {
      const current = await page.state();
      return current.selectedCount === 2 ? current : false;
    }, { label: 'fruit-basket: tap selectedCount=2' });

    first = state.fruitStates.find((fruit) => fruit.id === sources[0].value);
    let second = state.fruitStates.find((fruit) => fruit.id === sources[1].value);
    assert.equal(second.basketIndex, 1);

    await mouseTap(page.client, { x: first.x, y: first.y });
    state = await waitFor(async () => {
      const current = await page.state();
      return current.selectedCount === 1 ? current : false;
    }, { label: 'fruit-basket: tap remove compacts basket' });

    first = state.fruitStates.find((fruit) => fruit.id === sources[0].value);
    second = state.fruitStates.find((fruit) => fruit.id === sources[1].value);
    assert.equal(first.picked, false);
    assert.equal(first.x, first.homeX);
    assert.equal(first.y, first.homeY);
    assert.equal(second.basketIndex, 0);
    assert.equal(second.x, firstSlot.x);
    assert.equal(second.y, firstSlot.y);
  });
});

await scenario('Cesta de Frutas: drag touch seleciona quantidade correta e conclui', async () => {
  await withGame('fruit-basket', { touch: true, viewport: { width: 390, height: 844, mobile: true } }, async (page) => {
    let state = await page.state();
    const sources = state.targets.filter((target) => target.kind === 'drag-source');
    const basket = targetCenter(targetBy(state, 'drop-zone', 'basket'));
    assert.ok(sources.length >= state.challenge.answer);

    for (let i = 0; i < state.challenge.answer; i++) {
      await touchDrag(page.client, targetCenter(sources[i]), basket);
      await waitFor(async () => {
        const current = await page.state();
        return current.selectedCount === i + 1;
      }, { label: 'fruit-basket: selectedCount=' + (i + 1) });
    }

    state = await page.state();
    assert.equal(state.lastGesture, 'drag');
    const pickedFruits = state.fruitStates.filter((fruit) => fruit.picked);
    assert.equal(pickedFruits.length, state.challenge.answer);
    assert.ok(pickedFruits.every((fruit) =>
      fruit.x >= state.basketBounds.left &&
      fruit.x <= state.basketBounds.left + state.basketBounds.width &&
      fruit.y >= state.basketBounds.top &&
      fruit.y <= state.basketBounds.top + state.basketBounds.height
    ));
    await mouseTap(page.client, targetCenter(targetBy(state, 'action', 'Conferir')));
    await waitForResult(page, 'success');
    await assertEvidence(page, 'success');
  });
});


await scenario('Torre de Blocos: tap fallback e remocao mantem pilha visual compacta', async () => {
  await withGame('block-tower', { viewport: { width: 390, height: 844, mobile: true } }, async (page) => {
    let state = await page.state();
    const sources = state.targets.filter((target) => target.kind === 'toggle');

    await mouseTap(page.client, targetCenter(sources[0]));
    state = await waitFor(async () => {
      const current = await page.state();
      return current.stackHeight === 1 ? current : false;
    }, { label: 'block-tower: tap stackHeight=1' });

    let first = state.blockStates.find((block) => block.id === sources[0].value);
    assert.equal(first.picked, true);
    assert.equal(first.stackIndex, 0);
    const firstStackSlot = { x: first.x, y: first.y };
    assert.ok(first.x >= state.towerBounds.left);
    assert.ok(first.x <= state.towerBounds.left + state.towerBounds.width);
    assert.ok(first.y >= state.towerBounds.top);
    assert.ok(first.y <= state.towerBounds.top + state.towerBounds.height);

    await mouseTap(page.client, targetCenter(sources[1]));
    state = await waitFor(async () => {
      const current = await page.state();
      return current.stackHeight === 2 ? current : false;
    }, { label: 'block-tower: tap stackHeight=2' });

    first = state.blockStates.find((block) => block.id === sources[0].value);
    let second = state.blockStates.find((block) => block.id === sources[1].value);
    assert.equal(second.stackIndex, 1);
    assert.ok(second.y < first.y);

    await mouseTap(page.client, { x: first.x, y: first.y });
    state = await waitFor(async () => {
      const current = await page.state();
      return current.stackHeight === 1 ? current : false;
    }, { label: 'block-tower: tap remove compacts stack' });

    first = state.blockStates.find((block) => block.id === sources[0].value);
    second = state.blockStates.find((block) => block.id === sources[1].value);
    assert.equal(first.picked, false);
    assert.equal(first.x, first.homeX);
    assert.equal(first.y, first.homeY);
    assert.equal(second.stackIndex, 0);
    assert.equal(second.x, firstStackSlot.x);
    assert.equal(second.y, firstStackSlot.y);
  });
});

await scenario('Torre de Blocos: drag pointer monta a torre e conclui', async () => {
  await withGame('block-tower', {}, async (page) => {
    let state = await page.state();
    const sources = state.targets.filter((target) => target.kind === 'drag-source');
    const tower = targetCenter(targetBy(state, 'stack-zone', 'tower'));
    assert.ok(sources.length >= state.challenge.answer);

    for (let i = 0; i < state.challenge.answer; i++) {
      await mouseDrag(page.client, targetCenter(sources[i]), tower);
      await waitFor(async () => {
        const current = await page.state();
        return current.selectedCount === i + 1 && current.stackHeight === i + 1;
      }, { label: 'block-tower: stackHeight=' + (i + 1) });
    }

    state = await page.state();
    assert.equal(state.lastGesture, 'drag');
    const pickedBlocks = state.blockStates.filter((block) => block.picked);
    assert.equal(pickedBlocks.length, state.challenge.answer);
    const towerCenterX = state.towerBounds.left + state.towerBounds.width / 2;
    assert.ok(pickedBlocks.every((block) =>
      Math.abs(block.x - towerCenterX) < 0.01 &&
      block.y >= state.towerBounds.top &&
      block.y <= state.towerBounds.top + state.towerBounds.height
    ));
    for (let index = 1; index < pickedBlocks.length; index++) {
      assert.ok(pickedBlocks[index].y < pickedBlocks[index - 1].y);
    }
    await mouseTap(page.client, targetCenter(targetBy(state, 'action', 'Conferir')));
    await waitForResult(page, 'success');
    await assertEvidence(page, 'success');
  });
});

await scenario('Mundo das Cores: erro de classificacao retorna e retry acerta', async () => {
  await withGame('color-match', {}, async (page) => {
    let state = await page.state();
    const source = targetCenter(targetBy(state, 'drag-source', 'source'));
    const wrong = state.targets.find((target) =>
      target.kind === 'drop-zone' && target.value !== state.challenge.answer
    );
    assert.ok(wrong, 'color-match: drop-zone incorreta ausente');

    await mouseDrag(page.client, source, targetCenter(wrong));
    await waitForResult(page, 'failure');
    await waitForInputReady(page);
    await delay(380);

    state = await page.state();
    await mouseDrag(
      page.client,
      targetCenter(targetBy(state, 'drag-source', 'source')),
      targetCenter(targetBy(state, 'drop-zone', state.challenge.answer))
    );
    await waitForResult(page, 'success');
    await assertEvidence(page, 'failure');
    await assertEvidence(page, 'success');
  });
});

await scenario('Familia Logica e Memoria: portrait mobile mantem alvos tocaveis', async () => {
  for (const slug of ['pattern-play', 'memory-animals']) {
    await withGame(
      slug,
      { touch: true, viewport: { width: 390, height: 844, mobile: true } },
      async (page) => {
        const state = await page.state();
        assert.equal(state.familyId, 'logic');
        assert.equal(state.viewport.width, 390);
        assert.equal(state.viewport.height, 844);
        assert.equal(state.viewport.portrait, true);

        const interactive = (state.targets || []).filter((target) =>
          ['choice', 'drag-source', 'drop-zone', 'memory-card'].includes(target.kind)
        );
        assert.ok(interactive.length > 0, slug + ': nenhum alvo interativo publicado');

        for (const target of interactive) {
          assert.ok(target.w >= 52, slug + ': alvo estreito ' + target.kind + ' ' + target.value);
          assert.ok(target.h >= 52, slug + ': alvo baixo ' + target.kind + ' ' + target.value);
          assert.ok(target.x - target.w / 2 >= -1, slug + ': alvo saiu pela esquerda');
          assert.ok(target.x + target.w / 2 <= 391, slug + ': alvo saiu pela direita');
          assert.ok(target.y - target.h / 2 >= -1, slug + ': alvo saiu pelo topo');
          assert.ok(target.y + target.h / 2 <= 845, slug + ': alvo saiu pela base');
        }
      }
    );
  }
});

await scenario('Trem dos Padroes: attempts, assistance, drag e reset por rodada', async () => {
  await withGame('pattern-play', { touch: true, viewport: { width: 390, height: 844, mobile: true } }, async (page) => {
    let state = await page.state();
    const initialLevel = state.level;
    const wrong = wrongChoice(state);
    assert.ok(wrong, 'pattern-play: alternativa incorreta ausente');

    await touchTap(page.client, targetCenter(wrong));
    await waitForEvidenceCount(page, 1);
    await waitForInputReady(page);

    await touchTap(page.client, targetCenter(wrong));
    await waitForEvidenceCount(page, 2);
    await waitForInputReady(page);

    state = await page.state();
    const correctToken = targetBy(state, 'drag-source', state.challenge.answer);
    const slot = targetBy(state, 'drop-zone', 'pattern-slot');
    await touchDrag(page.client, targetCenter(correctToken), targetCenter(slot));
    await waitForResult(page, 'success');
    let evidence = await waitForEvidenceCount(page, 3);

    assert.deepEqual(evidence.slice(0, 3).map((item) => item.attempts), [1, 2, 3]);
    assert.deepEqual(evidence.slice(0, 3).map((item) => item.independent), [true, false, false]);
    assert.deepEqual(evidence.slice(0, 3).map((item) => item.assistance), ['none', 'none', 'visual-cue']);
    assert.equal((await page.state()).lastGesture, 'drag');

    state = await waitFor(async () => {
      const current = await page.state();
      return current.level === initialLevel + 1 && current.inputReady === true ? current : false;
    }, { label: 'pattern-play: next round reset', timeoutMs: 8000 });

    const nextWrong = wrongChoice(state);
    assert.ok(nextWrong, 'pattern-play: alternativa incorreta da rodada 2 ausente');
    await touchTap(page.client, targetCenter(nextWrong));
    evidence = await waitForEvidenceCount(page, 4);

    assert.equal(evidence[3].attempts, 1);
    assert.equal(evidence[3].independent, true);
    assert.equal(evidence[3].assistance, 'none');
  });
});

await scenario('Familia Letras e Escrita: portrait mobile mantem alvos e desenho tocaveis', async () => {
  for (const slug of ['letter-hunt', 'write-a']) {
    await withGame(
      slug,
      { touch: true, viewport: { width: 390, height: 844, mobile: true } },
      async (page) => {
        const state = await page.state();
        assert.equal(state.familyId, 'literacy');
        assert.equal(state.viewport.width, 390);
        assert.equal(state.viewport.height, 844);
        assert.equal(state.viewport.portrait, true);

        const interactive = (state.targets || []).filter((target) =>
          ['choice', 'action', 'draw-zone'].includes(target.kind)
        );
        assert.ok(interactive.length > 0, slug + ': nenhum alvo interativo publicado');

        for (const target of interactive) {
          assert.ok(target.w >= 52, slug + ': alvo estreito ' + target.kind + ' ' + target.value);
          assert.ok(target.h >= 52, slug + ': alvo baixo ' + target.kind + ' ' + target.value);
          assert.ok(target.x - target.w / 2 >= -1, slug + ': alvo saiu pela esquerda');
          assert.ok(target.x + target.w / 2 <= 391, slug + ': alvo saiu pela direita');
          assert.ok(target.y - target.h / 2 >= -1, slug + ': alvo saiu pelo topo');
          assert.ok(target.y + target.h / 2 <= 845, slug + ': alvo saiu pela base');
        }
      }
    );
  }
});

await scenario('Caca as Letras: escolha errada e retry preservam o fluxo', async () => {
  await withGame('letter-hunt', { touch: true, viewport: { width: 390, height: 844, mobile: true } }, async (page) => {
    let state = await page.state();
    const wrong = wrongChoice(state);
    assert.ok(wrong, 'letter-hunt: alternativa incorreta ausente');
    await mouseTap(page.client, targetCenter(wrong));
    await waitForResult(page, 'failure');
    await waitForInputReady(page);

    state = await page.state();
    await mouseTap(page.client, choiceTarget(state, state.challenge.answer));
    await waitForResult(page, 'success');
    await assertEvidence(page, 'failure');
    await assertEvidence(page, 'success');
  });
});

await scenario('Atelie de Letras: capability reconhecida gera sucesso', async () => {
  await withGame(
    'write-a',
    { handwritingRecognized: true, touch: true, viewport: { width: 390, height: 844, mobile: true } },
    async (page) => {
    let state = await page.state();
    const zoneTarget = targetBy(state, 'draw-zone', 'handwriting-zone');
    const zone = targetCenter(zoneTarget);
    await touchDrag(
      page.client,
      { x: zone.x - zoneTarget.w * 0.22, y: zone.y - zoneTarget.h * 0.28 },
      { x: zone.x + zoneTarget.w * 0.22, y: zone.y + zoneTarget.h * 0.28 },
      14
    );
    state = await page.state();
    assert.ok(state.strokeCount >= 1, 'write-a: stroke nao foi registrado');

    await mouseTap(page.client, targetCenter(targetBy(state, 'action', 'Conferir')));
    await waitForResult(page, 'success');
    await assertEvidence(page, 'success');

    const host = await page.host();
    const capability = host.events.find((event) => event.type === 'capability.request');
    assert.equal(capability.payload.name, 'handwriting.evaluate');
    assert.equal(state.familyId, 'literacy');
    assert.equal(state.viewport.width, 390);
    assert.equal(state.viewport.height, 844);
    assert.equal(state.viewport.portrait, true);
    assert.ok(zoneTarget.w >= 300);
    assert.ok(zoneTarget.h >= 220);
  });
});

await scenario('Atelie de Letras: capability nao reconhecida gera falha recuperavel', async () => {
  await withGame(
    'write-a',
    { handwritingRecognized: false, touch: true, viewport: { width: 390, height: 844, mobile: true } },
    async (page) => {
    let state = await page.state();
    const zoneTarget = targetBy(state, 'draw-zone', 'handwriting-zone');
    const zone = targetCenter(zoneTarget);
    await touchDrag(
      page.client,
      { x: zone.x - zoneTarget.w * 0.18, y: zone.y - zoneTarget.h * 0.22 },
      { x: zone.x + zoneTarget.w * 0.18, y: zone.y + zoneTarget.h * 0.22 },
      10
    );
    state = await page.state();
    await mouseTap(page.client, targetCenter(targetBy(state, 'action', 'Conferir')));
    await waitForResult(page, 'failure');
    await waitForInputReady(page);
    await assertEvidence(page, 'failure');
  });
});

await scenario('Pintura Livre: desenho persiste no storage e produz evidence observado', async () => {
  await withGame('paint-free', {}, async (page) => {
    let state = await page.state();
    const canvas = { x: 480, y: 345 };
    await mouseDrag(page.client, { x: canvas.x - 120, y: canvas.y - 70 }, { x: canvas.x + 120, y: canvas.y + 75 }, 18);

    state = await page.state();
    assert.ok(state.paintStrokeCount >= 1, 'paint-free: stroke nao foi registrado');
    await mouseTap(page.client, targetCenter(targetBy(state, 'action', 'Guardar desenho')));

    await waitFor(async () => {
      const current = await page.state();
      return current.paintSaved === true && current.lastResult === 'observed';
    }, { label: 'paint-free: paintSaved' });

    const host = await page.host();
    assert.ok(host.storage['paint:last'], 'paint-free: storage paint:last ausente');
    assert.ok(Array.isArray(host.storage['paint:last'].strokes));
    await assertEvidence(page, 'observed');
    const evidence = await evidencePayloads(page);
    const observed = evidence.find((payload) => payload.result === 'observed');
    assert.equal(observed.attempts, 1);
    assert.equal(observed.independent, true);
    assert.equal(observed.assistance, 'none');
  });
});

await scenario('Memoria dos Bichos: mismatch desbloqueia e todos os pares concluem', async () => {
  await withGame('memory-animals', { touch: true, viewport: { width: 390, height: 844, mobile: true } }, async (page) => {
    let state = await page.state();
    const cards = state.challenge.cards;
    const first = cards[0];
    const mismatch = cards.find((card) => card.pairId !== first.pairId);
    assert.ok(mismatch, 'memory-animals: par divergente ausente');

    await touchTap(page.client, targetCenter(targetBy(state, 'memory-card', first.id)));
    await touchTap(page.client, targetCenter(targetBy(state, 'memory-card', mismatch.id)));
    await waitFor(async () => {
      const current = await page.state();
      return current.lastResult === 'failure' && current.inputReady === true;
    }, { label: 'memory-animals: mismatch retry', timeoutMs: 3500 });
    await delay(160);

    state = await page.state();
    const byPair = new Map();
    for (const card of state.challenge.cards) {
      if (!byPair.has(card.pairId)) byPair.set(card.pairId, []);
      byPair.get(card.pairId).push(card);
    }

    let expectedMatched = 0;
    for (const pair of byPair.values()) {
      const current = await page.state();
      await touchTap(page.client, targetCenter(targetBy(current, 'memory-card', pair[0].id)));
      await touchTap(page.client, targetCenter(targetBy(current, 'memory-card', pair[1].id)));
      expectedMatched += 1;
      await waitFor(async () => {
        const s = await page.state();
        return s.lastResult === 'success' ||
          (s.matchedPairs === expectedMatched && s.inputReady === true);
      }, { label: 'memory-animals: matchedPairs=' + expectedMatched, timeoutMs: 3500 });
      await delay(40);
    }

    await waitForResult(page, 'success', 3500);
    await assertEvidence(page, 'failure');
    await assertEvidence(page, 'success');
  });
});

await scenario('Formas no Espaco 3D: attempts, assistance, lock e retry coerentes', async () => {
  await withGame('space-shapes-3d', {}, async (page) => {
    await mouseDrag(page.client, { x: 420, y: 340 }, { x: 540, y: 340 }, 10);
    let state = await waitFor(async () => {
      const current = await page.state();
      return current.lastGesture === 'drag' ? current : false;
    }, { label: 'space-shapes-3d: drag' });

    for (let attempt = 1; attempt <= 2; attempt++) {
      const wrong = state.targets.find((candidate) => candidate.value !== state.challenge.answer);
      assert.ok(wrong, 'space-shapes-3d: target incorreto ausente');
      await mouseTap(page.client, targetCenter(wrong));
      await waitForEvidenceCount(page, attempt);
      state = await waitFor(async () => {
        const current = await page.state();
        return current.lastResult === 'failure' && current.inputReady === true ? current : false;
      }, { label: 'space-shapes-3d: retry ' + attempt });
    }

    assert.equal(state.assistance, 'visual-cue');
    const target = state.targets.find((candidate) => candidate.value === state.challenge.answer);
    assert.ok(target, 'space-shapes-3d: target correto ausente');
    await mouseTap(page.client, targetCenter(target));
    await waitForResult(page, 'success');
    const evidence = await waitForEvidenceCount(page, 3);

    assert.deepEqual(evidence.slice(0, 3).map((item) => item.attempts), [1, 2, 3]);
    assert.deepEqual(evidence.slice(0, 3).map((item) => item.independent), [true, false, false]);
    assert.deepEqual(evidence.slice(0, 3).map((item) => item.assistance), ['none', 'none', 'visual-cue']);
  });
});

await harness.close();

if (failures.length) {
  const summary = failures.map((failure) => '- ' + failure.name + ': ' + failure.error.message).join('\n');
  throw new Error('Browser quality gate falhou em ' + failures.length + ' cenario(s):\n' + summary);
}

console.log('Browser quality gate: 10 jogos oficiais exercitados com sucesso.');
