// Ateliê de Letras — Escola de Escrita
(() => {
  const { C, FONT } = window.AprincarConstants;
  const CFG = window.APRINCAR_GAME_CONFIG;

  class HandwritingScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.pendingEvaluation = false;
      this.levelText.setText(`Fase ${this.level}`);

      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateLetterChallenge({ rng, seed, level: this.level });

      if (Array.isArray(CFG.answers) && CFG.answers.length) {
        this.challenge.answer = CFG.answers[(this.level - 1) % CFG.answers.length];
      } else if (CFG.answer) {
        this.challenge.answer = CFG.answer;
      }

      const layout = this.layout;
      const stage = layout.stage;
      const guideAlpha = Math.max(0.12, 0.45 - (this.level - 1) * 0.06);

      this.promptText.setText(`Desenhe a letra ${this.challenge.answer}`);

      const buttonHeight = Math.max(layout.touchTarget, 58);
      const drawingBottom = stage.bottom - buttonHeight - 18;
      const referenceHeight = layout.portrait
        ? window.AprincarLayout.clamp(stage.height * 0.20, 96, 132)
        : window.AprincarLayout.clamp(stage.height * 0.62, 190, 300);
      const gap = layout.portrait ? 12 : 18;

      let referenceBounds;
      let drawingBounds;

      if (layout.portrait) {
        referenceBounds = {
          left: stage.left,
          top: stage.top + 6,
          width: stage.width,
          height: referenceHeight
        };
        drawingBounds = {
          left: stage.left,
          top: referenceBounds.top + referenceBounds.height + gap,
          width: stage.width,
          height: Math.max(
            220,
            drawingBottom - (referenceBounds.top + referenceBounds.height + gap)
          )
        };
      } else {
        const referenceWidth = Math.min(stage.width * 0.30, 260);
        referenceBounds = {
          left: stage.left,
          top: stage.top + 6,
          width: referenceWidth,
          height: drawingBottom - stage.top - 6
        };
        drawingBounds = {
          left: referenceBounds.left + referenceBounds.width + gap,
          top: stage.top + 6,
          width: Math.max(260, stage.width - referenceWidth - gap),
          height: drawingBottom - stage.top - 6
        };
      }

      const refGfx = this.add.graphics();
      refGfx.fillStyle(0xf1f5f9, 1);
      refGfx.fillRoundedRect(
        referenceBounds.left,
        referenceBounds.top,
        referenceBounds.width,
        referenceBounds.height,
        18
      );
      refGfx.lineStyle(2, 0xcbd5e1, 1);
      refGfx.strokeRoundedRect(
        referenceBounds.left,
        referenceBounds.top,
        referenceBounds.width,
        referenceBounds.height,
        18
      );

      const referenceFontSize = window.AprincarLayout.clamp(
        Math.min(referenceBounds.width, referenceBounds.height) * 0.68,
        58,
        layout.portrait ? 88 : 150
      );
      const letterRef = this.add.text(
        referenceBounds.left + referenceBounds.width / 2,
        referenceBounds.top + referenceBounds.height / 2,
        this.challenge.answer,
        {
          fontFamily: FONT,
          fontSize: `${Math.round(referenceFontSize)}px`,
          fontStyle: 'bold',
          color: '#8b5cf6'
        }
      ).setOrigin(0.5);

      const zoneGfx = this.add.graphics();
      zoneGfx.fillStyle(0xffffff, 1);
      zoneGfx.fillRoundedRect(
        drawingBounds.left,
        drawingBounds.top,
        drawingBounds.width,
        drawingBounds.height,
        18
      );
      zoneGfx.lineStyle(3, 0x8b5cf6, 0.35);
      zoneGfx.strokeRoundedRect(
        drawingBounds.left,
        drawingBounds.top,
        drawingBounds.width,
        drawingBounds.height,
        18
      );

      const guideFontSize = window.AprincarLayout.clamp(
        Math.min(drawingBounds.width, drawingBounds.height) * 0.62,
        110,
        layout.portrait ? 220 : 250
      );
      const zoneCenterX = drawingBounds.left + drawingBounds.width / 2;
      const zoneCenterY = drawingBounds.top + drawingBounds.height / 2;

      const guideGhost = this.add.text(
        zoneCenterX,
        zoneCenterY,
        this.challenge.answer,
        {
          fontFamily: FONT,
          fontSize: `${Math.round(guideFontSize)}px`,
          fontStyle: 'bold',
          color: '#8b5cf6'
        }
      ).setOrigin(0.5).setAlpha(guideAlpha);

      const zone = this.add.rectangle(
        zoneCenterX,
        zoneCenterY,
        drawingBounds.width,
        drawingBounds.height,
        0xffffff,
        0.001
      ).setInteractive();

      this.handwritingGraphics = this.add.graphics().lineStyle(
        layout.portrait ? 10 : 12,
        C.blue,
        0.9
      );

      this.roundGroup.add([
        refGfx,
        letterRef,
        zoneGfx,
        guideGhost,
        zone,
        this.handwritingGraphics
      ]);

      this.target(
        'handwriting-zone',
        zoneCenterX,
        zoneCenterY,
        drawingBounds.width,
        drawingBounds.height,
        'draw-zone'
      );

      this.strokes = [];
      let current = null;
      let previous = null;

      zone.on('pointerdown', (pointer) => {
        if (this.locked || this.pendingEvaluation) return;
        current = [];
        previous = { x: pointer.x, y: pointer.y };
        this.strokes.push(current);
        current.push(this.normPoint(pointer, zone));
        this.updateState({ strokeCount: this.strokes.length, lastGesture: 'draw' });
        if (window.AprincarAudio) window.AprincarAudio.click();
      });

      zone.on('pointermove', (pointer) => {
        if (
          this.locked ||
          this.pendingEvaluation ||
          !pointer.isDown ||
          !current ||
          !previous
        ) {
          return;
        }

        const point = this.normPoint(pointer, zone);
        if (current.length < 220) current.push(point);
        this.handwritingGraphics.lineBetween(
          previous.x,
          previous.y,
          pointer.x,
          pointer.y
        );
        previous = { x: pointer.x, y: pointer.y };
      });

      this.input.on('pointerup', () => {
        current = null;
        previous = null;
        this.updateState({ strokeCount: this.strokes.length, inputReady: true });
      });

      const check = this.addCardButton(
        stage.centerX,
        stage.bottom - buttonHeight / 2 - 4,
        Math.min(stage.width * 0.72, 240),
        buttonHeight,
        'Conferir',
        '__check__',
        C.sun,
        'action'
      );

      check.removeAllListeners('pointerup');
      check.on('pointerup', async () => {
        if (this.locked || this.pendingEvaluation) return;

        this.pendingEvaluation = true;
        this.updateState({ inputReady: false });
        try {
          const result = await aprincar.capability.request('handwriting.evaluate', {
            symbol: this.challenge.answer,
            strokes: this.strokes
          });

          this.pendingEvaluation = false;
          await this.submitResult(!!result?.recognized, {
            handwriting: result,
            symbol: this.challenge.answer,
            guideAlpha
          });
        } catch (error) {
          this.pendingEvaluation = false;
          this.updateState({ inputReady: true });
          throw error;
        }
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'handwriting',
        variant: 'letters',
        familyId: 'literacy',
        objective: CFG.objective,
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        drawingBounds,
        referenceBounds,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
        strokeCount: 0,
        attempts: this.attempts,
        inputReady: true
      };
    }

    normPoint(pointer, zone) {
      const bounds = zone.getBounds();
      return {
        x: (pointer.x - bounds.left) / bounds.width,
        y: (pointer.y - bounds.top) / bounds.height,
        t: Date.now()
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(HandwritingScene));
})();
