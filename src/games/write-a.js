// Ateliê de Letras — Escola de Escrita
(() => {
  const { C, FONT } = window.AprincarConstants;
  const CFG = window.APRINCAR_GAME_CONFIG;

  class HandwritingScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);
      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateLetterChallenge({ rng, seed, level: this.level });
      
      if (Array.isArray(CFG.answers) && CFG.answers.length) {
        this.challenge.answer = CFG.answers[(this.level - 1) % CFG.answers.length];
      } else if (CFG.answer) {
        this.challenge.answer = CFG.answer;
      }

      this.promptText.setText(`Desenhe a letra ${this.challenge.answer}`);

      // Painel de referência à esquerda com a letra demonstrada
      const refGfx = this.add.graphics();
      refGfx.fillStyle(0xf1f5f9, 1);
      refGfx.fillRoundedRect(50, 160, 340, 360, 20);
      refGfx.lineStyle(3, 0xcbd5e1, 1);
      refGfx.strokeRoundedRect(50, 160, 340, 360, 20);

      const guideAlpha = Math.max(0.12, 0.45 - (this.level - 1) * 0.06);
      const letterRef = this.add.text(220, 340, this.challenge.answer, {
        fontFamily: FONT,
        fontSize: '240px',
        fontStyle: 'bold',
        color: '#8b5cf6'
      }).setOrigin(0.5);

      // Lousa mágica de desenho à direita
      const zoneGfx = this.add.graphics();
      zoneGfx.fillStyle(0xffffff, 1);
      zoneGfx.fillRoundedRect(420, 160, 480, 360, 20);
      zoneGfx.lineStyle(4, 0x8b5cf6, 0.4);
      zoneGfx.strokeRoundedRect(420, 160, 480, 360, 20);

      const guideGhost = this.add.text(660, 340, this.challenge.answer, {
        fontFamily: FONT,
        fontSize: '240px',
        fontStyle: 'bold',
        color: '#8b5cf6'
      }).setOrigin(0.5).setAlpha(guideAlpha);

      const zone = this.add.rectangle(660, 340, 480, 360, 0xffffff, 0.001).setInteractive();
      this.handwritingGraphics = this.add.graphics().lineStyle(12, C.blue, 0.9);
      this.roundGroup.add([refGfx, letterRef, zoneGfx, guideGhost, zone, this.handwritingGraphics]);

      this.strokes = [];
      let current = null;
      let previous = null;

      zone.on('pointerdown', p => {
        current = [];
        previous = { x: p.x, y: p.y };
        this.strokes.push(current);
        current.push(this.normPoint(p, zone));
        if (window.AprincarAudio) window.AprincarAudio.click();
      });

      zone.on('pointermove', p => {
        if (!p.isDown || !current || !previous) return;
        const point = this.normPoint(p, zone);
        if (current.length < 220) current.push(point);
        this.handwritingGraphics.lineBetween(previous.x, previous.y, p.x, p.y);
        previous = { x: p.x, y: p.y };
      });

      this.input.on('pointerup', () => {
        current = null;
        previous = null;
        this.updateState({ strokeCount: this.strokes.length });
      });

      // Botão Conferir
      const check = this.addCardButton(660, 560, 200, 60, 'Conferir', '__check__', C.sun, 'action');
      check.removeAllListeners('pointerup');
      check.on('pointerup', async () => {
        const result = await aprincar.capability.request('handwriting.evaluate', {
          symbol: this.challenge.answer,
          strokes: this.strokes
        });
        await this.submitResult(!!result?.recognized, {
          handwriting: result,
          symbol: this.challenge.answer,
          guideAlpha
        });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'handwriting',
        variant: 'letters',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        inputReady: true
      };
    }

    normPoint(p, zone) {
      const b = zone.getBounds();
      return { x: (p.x - b.left) / b.width, y: (p.y - b.top) / b.height, t: Date.now() };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(HandwritingScene));
})();
