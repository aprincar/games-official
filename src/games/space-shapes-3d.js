// Formas no Espaço 3D — Missão Espacial
(() => {
  const CFG = window.APRINCAR_GAME_CONFIG;
  const THREE = window.THREE;
  const root = document.getElementById('game');
  const BRAND = window.APRINCAR_BRAND;

  root.innerHTML = `
    <div class="three-ui">
      <div class="three-brand">${BRAND.lockupHtml}</div>
      <div id="three-level">Fase 1</div>
      <h1 id="three-prompt"></h1>
      <p id="three-status">Toque na forma correta.</p>
    </div>
    <canvas id="three-canvas"></canvas>
  `;

  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7f6f2);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x7b6bbd, 2.1));
  const light = new THREE.DirectionalLight(0xffffff, 2.2);
  light.position.set(4, 6, 5);
  scene.add(light);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let objects = [];
  let level = 1;
  let answer = '';
  let locked = false;
  let attempts = 0;
  let consecutiveFailures = 0;
  let downPoint;
  let lastPoint;
  let dragging = false;

  const defs = [
    {
      id: 'cube',
      label: 'cubo',
      geom: () => new THREE.BoxGeometry(1.6, 1.6, 1.6),
      color: 0x6f5bd7
    },
    {
      id: 'sphere',
      label: 'esfera',
      geom: () => new THREE.SphereGeometry(1.05, 40, 24),
      color: 0x62a6d8
    },
    {
      id: 'cone',
      label: 'cone',
      geom: () => new THREE.ConeGeometry(1.05, 1.9, 40),
      color: 0xf07867
    },
    {
      id: 'cylinder',
      label: 'cilindro',
      geom: () => new THREE.CylinderGeometry(0.95, 0.95, 1.8, 40),
      color: 0x65a67a
    }
  ];

  function viewport() {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth || 390;
    const height = rect.height || window.innerHeight || 844;
    return {
      rect,
      width,
      height,
      portrait: height >= width,
      touchTarget: Math.max(64, Math.min(92, Math.min(width, height) * 0.20))
    };
  }

  function positions(count, portrait) {
    if (!portrait) {
      return Array.from({ length: count }, (_, index) => ({
        x: (index - (count - 1) / 2) * 2.4,
        y: -0.15
      }));
    }

    if (count <= 3) {
      return [
        { x: -1.28, y: 0.72 },
        { x: 1.28, y: 0.72 },
        { x: 0, y: -1.45 }
      ].slice(0, count);
    }

    return [
      { x: -1.28, y: 0.92 },
      { x: 1.28, y: 0.92 },
      { x: -1.28, y: -1.38 },
      { x: 1.28, y: -1.38 }
    ].slice(0, count);
  }

  function layoutObjects() {
    const view = viewport();
    const layout = positions(objects.length, view.portrait);

    objects.forEach((object, index) => {
      const point = layout[index] || { x: 0, y: 0 };
      object.userData.baseX = point.x;
      object.userData.baseY = point.y;
      object.position.x = point.x;
      object.position.y = point.y;
      object.position.z = 0;
    });
  }

  function resize() {
    const view = viewport();
    renderer.setSize(view.width, view.height, false);

    camera.aspect = view.width / view.height;
    if (view.portrait) {
      camera.position.set(0, 0.05, 9.4);
    } else {
      camera.position.set(0, 0.35, 8.2);
    }
    camera.lookAt(0, -0.1, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    layoutObjects();
    publish();
  }

  addEventListener('resize', resize);

  function publishedTargets() {
    const view = viewport();
    camera.updateMatrixWorld(true);

    return objects.map((object) => {
      const projected = object.position.clone().project(camera);
      const rawX = ((projected.x + 1) / 2) * view.width;
      const rawY = (1 - (projected.y + 1) / 2) * view.height;
      const size = view.touchTarget;
      const x = Math.max(size / 2, Math.min(view.width - size / 2, rawX));
      const y = Math.max(size / 2, Math.min(view.height - size / 2, rawY));

      return {
        value: object.userData.id,
        kind: 'shape',
        x,
        y,
        w: size,
        h: size,
        normalized: {
          x: x / view.width,
          y: y / view.height
        }
      };
    });
  }

  function publish(values = {}) {
    const view = viewport();
    window.__APRINCAR_GAME_STATE__ = {
      mode: 'three',
      variant: CFG.variant,
      familyId: 'spatial',
      objective: CFG.objective,
      level,
      challenge: { answer },
      targets: publishedTargets(),
      viewport: {
        width: view.width,
        height: view.height,
        portrait: view.portrait
      },
      inputReady: !locked,
      attempts,
      ...values
    };
  }

  function round() {
    objects.forEach((object) => {
      scene.remove(object);
      object.geometry.dispose();
      object.material.dispose();
    });

    objects = [];
    locked = false;
    attempts = 0;
    consecutiveFailures = 0;

    document.getElementById('three-level').textContent = `Fase ${level}`;

    const seed = (Date.now() % 100000) + level * 131;
    const rng = createSeededRandom(seed);
    const shuffled = [...defs];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [
        shuffled[swapIndex],
        shuffled[index]
      ];
    }

    const pool = shuffled.slice(
      0,
      Math.min(4, 3 + Math.floor(level / 5))
    );
    answer = pool[Math.floor(rng() * pool.length)].id;

    const answerDef = pool.find((item) => item.id === answer);
    document.getElementById('three-prompt').textContent =
      `Encontre o ${answerDef.label}`;
    document.getElementById('three-status').textContent =
      'Arraste para observar e toque na forma correta.';

    pool.forEach((definition) => {
      const mesh = new THREE.Mesh(
        definition.geom(),
        new THREE.MeshStandardMaterial({
          color: definition.color,
          roughness: 0.45,
          metalness: 0.04
        })
      );
      mesh.userData = {
        ...definition,
        baseX: 0,
        baseY: 0
      };
      scene.add(mesh);
      objects.push(mesh);
    });

    resize();
    publish({ seed });
  }

  function showAnswerHint() {
    const correct = objects.find(
      (object) => object.userData.id === answer
    );
    if (!correct) return;

    correct.material.emissive.setHex(0xfbbf24);
    correct.material.emissiveIntensity = 0.45;
    correct.scale.setScalar(1.08);
    document.getElementById('three-status').textContent =
      'Dica: a forma certa está brilhando.';
  }

  async function choose(mesh) {
    if (locked) return;

    const failuresBeforeAttempt = consecutiveFailures;
    const assistance =
      failuresBeforeAttempt >= 2 ? 'visual-cue' : 'none';
    const independent = failuresBeforeAttempt === 0;
    const ok = mesh.userData.id === answer;

    locked = true;
    attempts += 1;

    document.getElementById('three-status').textContent =
      ok
        ? 'Isso! Você reconheceu a forma ✨'
        : 'Quase! Gire e observe de novo.';

    publish({
      lastResult: ok ? 'success' : 'failure',
      assistance,
      independent
    });

    if (window.AprincarAudio) {
      if (ok) window.AprincarAudio.success();
      else window.AprincarAudio.softError();
    }

    await aprincar.evidence.submit({
      skillId: CFG.skillId,
      result: ok ? 'success' : 'failure',
      independent,
      assistance,
      difficulty: Math.min(1, 0.25 + level * 0.045),
      confidence: ok ? 0.95 : 0.8,
      attempts,
      metadata: {
        level,
        target: answer,
        selected: mesh.userData.id
      }
    });

    if (ok) {
      consecutiveFailures = 0;
      await aprincar.rewards.request({
        reason: 'geometry-3d',
        amount: 2
      });
      setTimeout(() => {
        level += 1;
        round();
      }, 850);
      return;
    }

    consecutiveFailures += 1;
    locked = false;

    if (consecutiveFailures >= 2) showAnswerHint();

    publish({
      lastResult: 'failure',
      assistance:
        consecutiveFailures >= 2 ? 'visual-cue' : 'none',
      independent: false
    });
  }

  canvas.addEventListener('pointerdown', (event) => {
    dragging = false;
    downPoint = { x: event.clientX, y: event.clientY };
    lastPoint = { ...downPoint };
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!downPoint || !lastPoint) return;

    const dx = (event.clientX - lastPoint.x) * 0.012;
    const dy = (event.clientY - lastPoint.y) * 0.008;

    if (
      Math.hypot(
        event.clientX - downPoint.x,
        event.clientY - downPoint.y
      ) > 8
    ) {
      dragging = true;
      publish({ lastGesture: 'drag' });
    }

    objects.forEach((object) => {
      object.rotation.y += dx;
      object.rotation.x += dy;
    });

    lastPoint = {
      x: event.clientX,
      y: event.clientY
    };
  });

  canvas.addEventListener('pointerup', (event) => {
    const wasDragging = dragging;
    downPoint = undefined;
    lastPoint = undefined;
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);

    if (wasDragging) return;

    publish({ lastGesture: 'tap' });

    const rect = canvas.getBoundingClientRect();
    pointer.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(objects)[0];
    if (hit) choose(hit.object);
  });

  canvas.addEventListener('pointercancel', () => {
    downPoint = undefined;
    lastPoint = undefined;
    dragging = false;
  });

  (async () => {
    await aprincar.session.start({ mode: 'geometry-3d' });
    round();
  })();

  function loop(time) {
    objects.forEach((object, index) => {
      object.rotation.y += 0.004 + index * 0.001;
      object.position.y =
        object.userData.baseY +
        Math.sin(time * 0.001 + index) * 0.07;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
