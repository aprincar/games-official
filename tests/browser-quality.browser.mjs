import assert from 'node:assert/strict';
import {
  assertNoPageErrors,
  mouseDrag,
  mouseTap,
  startBrowserHarness,
  targetBy,
  targetCenter,
  touchDrag,
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

async function assertEvidence(page, result) {
  await waitFor(async () => {
    const host = await page.host();
    return host.events.some((event) =>
      event.type === 'evidence.submit' && event.payload && event.payload.result === result
    );
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

await scenario('Cesta de Frutas: drag touch seleciona quantidade correta e conclui', async () => {
  await withGame('fruit-basket', {}, async (page) => {
    await page.client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
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

    await page.client.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    state = await page.state();
    assert.equal(state.lastGesture, 'drag');
    await mouseTap(page.client, targetCenter(targetBy(state, 'action', 'Conferir')));
    await waitForResult(page, 'success');
    await assertEvidence(page, 'success');
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

await scenario('Trem dos Padroes: alternativa errada permite retry e acerto', async () => {
  await withGame('pattern-play', {}, async (page) => {
    let state = await page.state();
    const wrong = wrongChoice(state);
    assert.ok(wrong, 'pattern-play: alternativa incorreta ausente');
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

await scenario('Caca as Letras: escolha errada e retry preservam o fluxo', async () => {
  await withGame('letter-hunt', {}, async (page) => {
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
  await withGame('write-a', { handwritingRecognized: true }, async (page) => {
    let state = await page.state();
    const zone = targetCenter(targetBy(state, 'draw-zone', 'handwriting-zone'));
    await mouseDrag(page.client, { x: zone.x - 70, y: zone.y - 90 }, { x: zone.x + 65, y: zone.y + 90 }, 14);
    state = await page.state();
    assert.ok(state.strokeCount >= 1, 'write-a: stroke nao foi registrado');

    await mouseTap(page.client, targetCenter(targetBy(state, 'action', 'Conferir')));
    await waitForResult(page, 'success');
    await assertEvidence(page, 'success');

    const host = await page.host();
    const capability = host.events.find((event) => event.type === 'capability.request');
    assert.equal(capability.payload.name, 'handwriting.evaluate');
  });
});

await scenario('Atelie de Letras: capability nao reconhecida gera falha recuperavel', async () => {
  await withGame('write-a', { handwritingRecognized: false }, async (page) => {
    let state = await page.state();
    const zone = targetCenter(targetBy(state, 'draw-zone', 'handwriting-zone'));
    await mouseDrag(page.client, { x: zone.x - 50, y: zone.y - 80 }, { x: zone.x + 50, y: zone.y + 80 }, 10);
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
    const canvas = targetCenter(targetBy(state, 'draw-zone', 'paint-canvas'));
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
  });
});

await scenario('Memoria dos Bichos: mismatch desbloqueia e todos os pares concluem', async () => {
  await withGame('memory-animals', {}, async (page) => {
    let state = await page.state();
    const cards = state.challenge.cards;
    const first = cards[0];
    const mismatch = cards.find((card) => card.pairId !== first.pairId);
    assert.ok(mismatch, 'memory-animals: par divergente ausente');

    await mouseTap(page.client, targetCenter(targetBy(state, 'memory-card', first.id)));
    await mouseTap(page.client, targetCenter(targetBy(state, 'memory-card', mismatch.id)));
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

    for (const pair of byPair.values()) {
      const current = await page.state();
      await mouseTap(page.client, targetCenter(targetBy(current, 'memory-card', pair[0].id)));
      await mouseTap(page.client, targetCenter(targetBy(current, 'memory-card', pair[1].id)));
      await waitFor(async () => {
        const s = await page.state();
        return s.matchedPairs >= 1 && s.inputReady === true || s.lastResult === 'success';
      }, { label: 'memory-animals: pair processed', timeoutMs: 3500 });
      await delay(40);
    }

    await waitForResult(page, 'success', 3500);
    await assertEvidence(page, 'failure');
    await assertEvidence(page, 'success');
  });
});

await scenario('Formas no Espaco 3D: drag para observar e tap correto conclui', async () => {
  await withGame('space-shapes-3d', {}, async (page) => {
    await mouseDrag(page.client, { x: 420, y: 340 }, { x: 540, y: 340 }, 10);
    let state = await waitFor(async () => {
      const current = await page.state();
      return current.lastGesture === 'drag' ? current : false;
    }, { label: 'space-shapes-3d: drag' });

    const target = state.targets.find((candidate) => candidate.value === state.challenge.answer);
    assert.ok(target, 'space-shapes-3d: target correto ausente');
    await mouseTap(page.client, targetCenter(target));
    await waitForResult(page, 'success');
    await assertEvidence(page, 'success');
  });
});

await harness.close();

if (failures.length) {
  const summary = failures.map((failure) => '- ' + failure.name + ': ' + failure.error.message).join('\n');
  throw new Error('Browser quality gate falhou em ' + failures.length + ' cenario(s):\n' + summary);
}

console.log('Browser quality gate: 10 jogos oficiais exercitados com sucesso.');
