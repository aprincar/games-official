// Pintura Livre — Estúdio de Pintura
(() => {
  const { C, FONT } = window.AprincarConstants;
  const PAINT_COLORS = [C.blue, C.coral, C.leaf, C.sun, C.purple, C.orange, C.ink];

  class PaintFreeScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText('Estúdio Livre');
      this.promptText.setText('Crie do seu jeito — solte a imaginação!');

      this.selectedColor = C.blue;
      this.brushSize = 12;

      // Cavalete de Pintura / Canvas Central
      const canvasGfx = this.add.graphics();
      canvasGfx.fillStyle(0xffffff, 1);
      canvasGfx.fillRoundedRect(140, 160, 680, 370, 16);
      canvasGfx.lineStyle(3, 0xe2dfd7, 1);
      canvasGfx.strokeRoundedRect(140, 160, 680, 370, 16);

      const canvasZone = this.add.rectangle(480, 345, 680, 370, 0xffffff, 0.001).setInteractive();
      this.paintGraphics = this.add.graphics();
      this.roundGroup.add([canvasGfx, canvasZone, this.paintGraphics]);

      // Paleta de Cores à Esquerda
      PAINT_COLORS.forEach((color, i) => {
        const y = 190 + i * 48;
        const swatch = this.add.circle(80, y, 18, color).setInteractive({ useHandCursor: true });
        this.roundGroup.add(swatch);
        swatch.on('pointerup', () => {
          this.selectedColor = color;
          if (window.AprincarAudio) window.AprincarAudio.click();
          this.tweens.add({ targets: swatch, scale: 1.25, duration: 100, yoyo: true });
        });
      });

      this.paintStrokes = [];
      let current = null;
      let previous = null;

      canvasZone.on('pointerdown', p => {
        current = [];
        previous = { x: p.x, y: p.y, color: this.selectedColor, size: this.brushSize };
        this.paintStrokes.push(current);
        current.push(this.normPoint(p, canvasZone));
        this.updateState({ paintStrokeCount: this.paintStrokes.length });
      });

      canvasZone.on('pointermove', p => {
        if (!p.isDown || !current || !previous) return;
        const totalPoints = this.paintStrokes.reduce((sum, s) => sum + s.length, 0);
        if (totalPoints < 500) current.push(this.normPoint(p, canvasZone));
        
        this.paintGraphics.lineStyle(previous.size, previous.color, 0.95);
        this.paintGraphics.lineBetween(previous.x, previous.y, p.x, p.y);
        previous.x = p.x;
        previous.y = p.y;
      });

      this.input.on('pointerup', () => {
        current = null;
        previous = null;
      });

      // Botão Guardar Desenho
      const save = this.addCardButton(800, 560, 190, 58, 'Guardar desenho', 'Guardar desenho', C.leaf, 'action');
      save.removeAllListeners('pointerup');
      save.on('pointerup', async () => {
        await aprincar.storage.set('paint:last', {
          strokes: this.paintStrokes,
          savedAt: new Date().toISOString()
        });
        this.attempts++;
        if (window.AprincarFeedback) window.AprincarFeedback.celebrate(this, 480, 320);
        await aprincar.evidence.submit({
          skillId: 'creativity.visual-expression',
          result: 'observed',
          independent: true,
          assistance: 'none',
          difficulty: 0.2,
          confidence: 0.95,
          attempts: this.attempts,
          metadata: { level: this.level, creative: true, strokeCount: this.paintStrokes.length }
        });
        this.statusText.setText('Desenho guardado com carinho! ✨');
        this.updateState({ paintSaved: true, lastResult: 'observed' });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'paint',
        variant: 'creative',
        level: this.level,
        challenge: null,
        targets: this.testTargets,
        inputReady: true
      };
    }

    normPoint(p, zone) {
      const b = zone.getBounds();
      return { x: (p.x - b.left) / b.width, y: (p.y - b.top) / b.height, t: Date.now() };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(PaintFreeScene));
})();
