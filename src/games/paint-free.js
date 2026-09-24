// Pintura Livre — Estúdio de Pintura
(() => {
  const { C } = window.AprincarConstants;
  const PAINT_COLORS = [C.blue, C.coral, C.leaf, C.sun, C.purple, C.orange, C.ink];

  class PaintFreeScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText('Estúdio Livre');
      this.promptText.setText('Crie do seu jeito — solte a imaginação!');

      const layout = this.layout;
      const stage = layout.stage;
      this.selectedColor = C.blue;
      this.brushSize = layout.portrait ? 10 : 12;
      this.paintStrokes = [];

      const buttonHeight = Math.max(layout.touchTarget, 58);
      const paletteHeight = layout.portrait ? 118 : 82;
      const paletteBounds = {
        left: stage.left,
        top: stage.top + 4,
        width: stage.width,
        height: paletteHeight
      };

      const paletteCols = layout.portrait ? 4 : 7;
      const paletteGrid = window.AprincarLayout.grid(
        PAINT_COLORS.length,
        paletteBounds,
        {
          cols: paletteCols,
          gapX: layout.portrait ? 8 : 12,
          gapY: 8
        }
      );

      PAINT_COLORS.forEach((color, index) => {
        const cell = paletteGrid.points[index];
        const size = Math.max(layout.touchTarget, Math.min(cell.width, cell.height, 58));
        const swatch = this.add
          .circle(cell.x, cell.y, size / 2 - 4, color)
          .setStrokeStyle(color === C.ink ? 2 : 0, 0xffffff)
          .setInteractive({ useHandCursor: true });

        const hit = this.add
          .circle(cell.x, cell.y, size / 2, 0xffffff, 0.001)
          .setInteractive({ useHandCursor: true });

        this.roundGroup.add([swatch, hit]);
        this.target(`color-${index}`, cell.x, cell.y, size, size, 'palette-choice');

        hit.on('pointerup', () => {
          if (this.locked) return;
          this.selectedColor = color;
          if (window.AprincarAudio) window.AprincarAudio.click();
          this.tweens.add({
            targets: swatch,
            scale: 1.22,
            duration: 100,
            yoyo: true
          });
          this.updateState({ selectedColor: color, lastGesture: 'tap-color' });
        });
      });

      const canvasTop = paletteBounds.top + paletteBounds.height + 10;
      const canvasBottom = stage.bottom - buttonHeight - 18;
      const drawingBounds = {
        left: stage.left,
        top: canvasTop,
        width: stage.width,
        height: Math.max(220, canvasBottom - canvasTop)
      };

      const canvasGfx = this.add.graphics();
      canvasGfx.fillStyle(0xffffff, 1);
      canvasGfx.fillRoundedRect(
        drawingBounds.left,
        drawingBounds.top,
        drawingBounds.width,
        drawingBounds.height,
        16
      );
      canvasGfx.lineStyle(3, 0xe2dfd7, 1);
      canvasGfx.strokeRoundedRect(
        drawingBounds.left,
        drawingBounds.top,
        drawingBounds.width,
        drawingBounds.height,
        16
      );

      const canvasZone = this.add
        .rectangle(
          drawingBounds.left + drawingBounds.width / 2,
          drawingBounds.top + drawingBounds.height / 2,
          drawingBounds.width,
          drawingBounds.height,
          0xffffff,
          0.001
        )
        .setInteractive();

      this.paintGraphics = this.add.graphics();
      this.roundGroup.add([canvasGfx, canvasZone, this.paintGraphics]);
      this.target(
        'paint-zone',
        drawingBounds.left + drawingBounds.width / 2,
        drawingBounds.top + drawingBounds.height / 2,
        drawingBounds.width,
        drawingBounds.height,
        'draw-zone'
      );

      let current = null;
      let previous = null;

      canvasZone.on('pointerdown', (pointer) => {
        if (this.locked) return;
        current = [];
        previous = {
          x: pointer.x,
          y: pointer.y,
          color: this.selectedColor,
          size: this.brushSize
        };
        this.paintStrokes.push(current);
        current.push(this.normPoint(pointer, canvasZone));
        this.updateState({
          paintStrokeCount: this.paintStrokes.length,
          lastGesture: 'draw'
        });
      });

      canvasZone.on('pointermove', (pointer) => {
        if (this.locked || !pointer.isDown || !current || !previous) return;

        const totalPoints = this.paintStrokes.reduce(
          (sum, stroke) => sum + stroke.length,
          0
        );
        if (totalPoints < 500) current.push(this.normPoint(pointer, canvasZone));

        this.paintGraphics.lineStyle(
          previous.size,
          previous.color,
          0.95
        );
        this.paintGraphics.lineBetween(
          previous.x,
          previous.y,
          pointer.x,
          pointer.y
        );
        previous.x = pointer.x;
        previous.y = pointer.y;
      });

      this.input.on('pointerup', () => {
        current = null;
        previous = null;
        this.updateState({
          paintStrokeCount: this.paintStrokes.length,
          inputReady: true
        });
      });

      const save = this.addCardButton(
        stage.centerX,
        stage.bottom - buttonHeight / 2 - 4,
        Math.min(stage.width * 0.72, 250),
        buttonHeight,
        'Guardar desenho',
        'Guardar desenho',
        C.leaf,
        'action'
      );

      save.removeAllListeners('pointerup');
      save.on('pointerup', async () => {
        if (this.locked) return;
        this.locked = true;
        this.updateState({ inputReady: false });

        try {
          await aprincar.storage.set('paint:last', {
            strokes: this.paintStrokes,
            savedAt: new Date().toISOString()
          });

          await this.recordOutcome(
            'observed',
            {
              creative: true,
              strokeCount: this.paintStrokes.length
            },
            {
              skillId: 'creativity.visual-expression',
              independent: true,
              assistance: 'none',
              difficulty: 0.2,
              confidence: 0.95
            }
          );

          if (window.AprincarFeedback) {
            window.AprincarFeedback.celebrate(
              this,
              stage.centerX,
              stage.centerY
            );
          }

          this.statusText.setText('Desenho guardado com carinho! ✨');
          this.updateState({
            paintSaved: true,
            lastResult: 'observed'
          });
        } finally {
          this.locked = false;
          this.updateState({ inputReady: true });
        }
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'paint',
        variant: 'creative',
        familyId: 'creative',
        objective: window.APRINCAR_GAME_CONFIG.objective,
        level: this.level,
        challenge: null,
        targets: this.testTargets,
        drawingBounds,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
        paintStrokeCount: 0,
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

  new Phaser.Game(window.createAprincarPhaserConfig(PaintFreeScene));
})();
