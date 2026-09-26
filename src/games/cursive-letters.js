(() => {
  const { C } = window.AprincarConstants;
  const CFG = window.APRINCAR_GAME_CONFIG;
  const TRACE = window.AprincarTraceTools;
  const PATHS = {
    l: [[[0.30,0.76],[0.34,0.54],[0.38,0.28],[0.48,0.14],[0.58,0.24],[0.56,0.46],[0.48,0.68],[0.56,0.78],[0.72,0.70]]],
    i: [[[0.28,0.62],[0.34,0.46],[0.38,0.72],[0.48,0.78],[0.62,0.68]], [[0.36,0.30],[0.36,0.28]]],
    u: [[[0.22,0.48],[0.24,0.70],[0.34,0.78],[0.46,0.72],[0.52,0.50],[0.52,0.72],[0.62,0.78],[0.76,0.66]]],
    e: [[[0.20,0.62],[0.36,0.54],[0.56,0.54],[0.48,0.42],[0.30,0.44],[0.26,0.62],[0.38,0.76],[0.58,0.76],[0.76,0.64]]],
    m: [[[0.14,0.70],[0.22,0.48],[0.30,0.72],[0.38,0.48],[0.46,0.72],[0.54,0.48],[0.64,0.72],[0.80,0.64]]],
    li: [[[0.14,0.76],[0.18,0.48],[0.24,0.18],[0.34,0.14],[0.40,0.28],[0.34,0.56],[0.30,0.72],[0.42,0.78],[0.54,0.68],[0.58,0.50],[0.60,0.72],[0.72,0.78],[0.84,0.66]], [[0.58,0.34],[0.58,0.32]]],
    le: [[[0.12,0.76],[0.18,0.42],[0.24,0.18],[0.34,0.14],[0.40,0.30],[0.34,0.58],[0.30,0.72],[0.42,0.78],[0.52,0.66],[0.62,0.56],[0.76,0.56],[0.68,0.44],[0.54,0.46],[0.50,0.62],[0.62,0.76],[0.82,0.66]]],
    mi: [[[0.10,0.70],[0.18,0.48],[0.26,0.72],[0.34,0.48],[0.42,0.72],[0.50,0.48],[0.58,0.72],[0.68,0.66],[0.72,0.50],[0.74,0.72],[0.84,0.78],[0.90,0.68]], [[0.72,0.34],[0.72,0.32]]]
  };

  class CursiveLettersScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);
      const entries = CFG.answers || Object.keys(PATHS);
      const key = entries[(this.level - 1) % entries.length];
      const paths = PATHS[key];
      const layout = this.layout;
      const stage = layout.stage;
      const buttonHeight = Math.max(layout.touchTarget, 58);
      const drawingBounds = {
        left: stage.left,
        top: stage.top + 8,
        width: stage.width,
        height: Math.max(220, stage.height - buttonHeight - 28)
      };
      this.challenge = {
        answer: key,
        difficulty: Math.min(0.9, 0.28 + this.level * 0.08)
      };
      this.promptText.setText(`Acompanhe o movimento da cursiva: ${key}`);

      const background = this.add.graphics();
      background.fillStyle(0xffffff, 1);
      background.fillRoundedRect(
        drawingBounds.left,
        drawingBounds.top,
        drawingBounds.width,
        drawingBounds.height,
        18
      );
      background.lineStyle(3, 0xd9deea, 1);
      background.strokeRoundedRect(
        drawingBounds.left,
        drawingBounds.top,
        drawingBounds.width,
        drawingBounds.height,
        18
      );

      const guide = this.add.graphics();
      const guideAlpha = Math.max(0.13, 0.42 - (this.level - 1) * 0.035);
      const guidePixels = TRACE.drawGuide(
        guide,
        paths,
        drawingBounds,
        C.purple,
        guideAlpha,
        layout.portrait ? 14 : 12
      );
      const start = guidePixels[0]?.[0];
      if (start) {
        const marker = this.add.circle(start.x, start.y, 10, C.leaf, 0.95);
        const markerText = this.add.text(start.x + 16, start.y - 11, 'início', {
          fontFamily: window.AprincarConstants.FONT,
          fontSize: layout.portrait ? '12px' : '13px',
          fontStyle: 'bold',
          color: '#166534'
        });
        this.roundGroup.add([marker, markerText]);
      }

      const zone = this.add.rectangle(
        drawingBounds.left + drawingBounds.width / 2,
        drawingBounds.top + drawingBounds.height / 2,
        drawingBounds.width,
        drawingBounds.height,
        0xffffff,
        0.001
      ).setInteractive();

      const ink = this.add.graphics();
      this.roundGroup.add([background, guide, zone, ink]);
      this.target(
        'cursive-zone',
        drawingBounds.left + drawingBounds.width / 2,
        drawingBounds.top + drawingBounds.height / 2,
        drawingBounds.width,
        drawingBounds.height,
        'draw-zone'
      );

      this.strokes = [];
      let current = null;
      let previous = null;

      zone.on('pointerdown', (pointer) => {
        if (this.locked) return;
        current = [];
        previous = { x: pointer.x, y: pointer.y };
        this.strokes.push(current);
        current.push(TRACE.normalizePoint(pointer, drawingBounds));
        this.updateState({ strokeCount: this.strokes.length, lastGesture: 'draw' });
      });

      zone.on('pointermove', (pointer) => {
        if (this.locked || !pointer.isDown || !current || !previous) return;
        current.push(TRACE.normalizePoint(pointer, drawingBounds));
        ink.lineStyle(layout.portrait ? 10 : 9, C.blue, 0.92);
        ink.lineBetween(previous.x, previous.y, pointer.x, pointer.y);
        previous = { x: pointer.x, y: pointer.y };
      });

      this.input.on('pointerup', () => {
        current = null;
        previous = null;
        this.updateState({ strokeCount: this.strokes.length, inputReady: true });
      });

      const actionWidth = Math.min((stage.width - 12) / 2, 220);
      const buttonY = stage.bottom - buttonHeight / 2 - 2;
      const clear = this.addCardButton(
        stage.centerX - actionWidth / 2 - 6,
        buttonY,
        actionWidth,
        buttonHeight,
        'Limpar',
        '__clear__',
        C.white,
        'action'
      );
      const check = this.addCardButton(
        stage.centerX + actionWidth / 2 + 6,
        buttonY,
        actionWidth,
        buttonHeight,
        'Conferir',
        '__check__',
        C.sun,
        'action'
      );

      clear.removeAllListeners('pointerup');
      clear.on('pointerup', () => {
        if (this.locked) return;
        ink.clear();
        this.strokes = [];
        this.updateState({ strokeCount: 0, lastGesture: 'clear' });
      });

      check.removeAllListeners('pointerup');
      check.on('pointerup', async () => {
        if (this.locked) return;
        const tolerance = Math.max(0.085, 0.165 - (this.level - 1) * 0.01);
        const score = TRACE.coverage(this.strokes, paths, tolerance);
        const threshold = Math.min(0.86, 0.68 + (this.level - 1) * 0.025);
        await this.submitResult(score >= threshold, {
          traceKey: key,
          coverage: Number(score.toFixed(3)),
          threshold,
          tolerance
        });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: CFG.mode,
        variant: 'cursive',
        familyId: 'literacy',
        objective: CFG.objective,
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        drawingBounds,
        guidePoints: guidePixels,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
        strokeCount: 0,
        inputReady: true
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(CursiveLettersScene));
})();
