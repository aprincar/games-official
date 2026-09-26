(() => {
  const { C } = window.AprincarConstants;
  const CFG = window.APRINCAR_GAME_CONFIG;
  const TRACE = window.AprincarTraceTools;
  const PATHS = {
    I: [[[0.50, 0.18], [0.50, 0.82]]],
    L: [[[0.34, 0.18], [0.34, 0.80], [0.76, 0.80]]],
    T: [[[0.22, 0.20], [0.78, 0.20]], [[0.50, 0.20], [0.50, 0.82]]],
    V: [[[0.20, 0.20], [0.50, 0.82], [0.80, 0.20]]],
    A: [[[0.18, 0.82], [0.50, 0.18], [0.82, 0.82]], [[0.34, 0.58], [0.66, 0.58]]],
    E: [[[0.30, 0.18], [0.30, 0.82]], [[0.30, 0.20], [0.76, 0.20]], [[0.30, 0.50], [0.66, 0.50]], [[0.30, 0.80], [0.76, 0.80]]]
  };

  class PrintLettersScene extends window.AprincarBaseScene {
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
      this.promptText.setText(`Trace a letra de forma ${key}`);

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
        'print-letter-zone',
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
        variant: 'print',
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

  new Phaser.Game(window.createAprincarPhaserConfig(PrintLettersScene));
})();
