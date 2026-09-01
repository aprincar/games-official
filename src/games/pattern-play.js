// Trem dos Padrões — Trem dos Padrões
(() => {
  const { C, FONT } = window.AprincarConstants;
  const PALETTE = [C.purple, C.coral, C.sun, C.leaf, C.sky];
  const TOKEN_COLORS = { '●': 0, '▲': 1, '■': 2, '◆': 3, '★': 4 };

  class PatternPlayScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);
      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generatePatternChallenge({ rng, seed, level: this.level });

      this.promptText.setText('Qual peça continua o padrão do trem?');

      // Trilhos de trem
      const trackGfx = this.add.graphics();
      trackGfx.lineStyle(6, 0x94a3b8, 1);
      trackGfx.lineBetween(60, 325, 900, 325);
      trackGfx.lineBetween(60, 335, 900, 335);
      // Dormentes de madeira
      trackGfx.lineStyle(4, 0x78350f, 0.8);
      for (let x = 70; x <= 890; x += 32) {
        trackGfx.lineBetween(x, 320, x, 340);
      }
      this.roundGroup.add(trackGfx);

      // Locomotiva na frente
      const locoGfx = this.add.graphics();
      window.AprincarVectorArt.drawTrainLocomotive(locoGfx, 820, 275);
      this.roundGroup.add(locoGfx);

      // Vagões com a sequência de padrão
      const sequence = this.challenge.sequence || [];
      const totalCars = sequence.length + 1; // +1 para o vagão com interrogação
      const startX = 720 - (totalCars - 1) * 105;

      sequence.forEach((token, i) => {
        const x = startX + i * 105;
        const y = 280;
        const colorIdx = TOKEN_COLORS[token] ?? (i % PALETTE.length);
        const wagonColor = PALETTE[colorIdx];

        const wagonGfx = this.add.graphics();
        window.AprincarVectorArt.drawTrainWagon(wagonGfx, x, y, 95, 60, wagonColor);
        const symbolText = this.add.text(x, y - 2, token, { fontFamily: FONT, fontSize: '38px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
        this.roundGroup.add([wagonGfx, symbolText]);
      });

      // Vagão final vazio com "?"
      const targetX = startX + sequence.length * 105;
      const targetY = 280;
      const targetWagonGfx = this.add.graphics();
      targetWagonGfx.fillStyle(0xe2e8f0, 0.6);
      targetWagonGfx.fillRoundedRect(targetX - 47, targetY - 30, 95, 60, 8);
      targetWagonGfx.lineStyle(3, 0x94a3b8, 1);
      targetWagonGfx.strokeRoundedRect(targetX - 47, targetY - 30, 95, 60, 8);
      const qMark = this.add.text(targetX, targetY - 2, '?', { fontFamily: FONT, fontSize: '36px', fontStyle: 'bold', color: '#64748b' }).setOrigin(0.5);
      this.roundGroup.add([targetWagonGfx, qMark]);
      this.target('pattern-slot', targetX, targetY, 100, 72, 'drop-zone');

      // Opções de resposta
      const options = this.challenge.options || [];
      options.forEach((t, i) => {
        const x = 480 + (i - (options.length - 1) / 2) * 125;
        const colorIdx = TOKEN_COLORS[t] ?? (i % PALETTE.length);
        this.addCardButton(x, 465, 95, 78, t, t, PALETTE[colorIdx], 'choice');
        const token = this.add.circle(x, 405, 30, PALETTE[colorIdx]).setInteractive({ draggable: true, useHandCursor: true });
        const tokenText = this.add.text(x, 405, t, { fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
        this.roundGroup.add([token, tokenText]);
        this.input.setDraggable(token);
        this.target(t, x, 405, 64, 64, 'drag-source');
        token.on('drag', (_pointer, _object, dragX, dragY) => { token.x = dragX; token.y = dragY; tokenText.x = dragX; tokenText.y = dragY; });
        token.on('dragend', () => {
          const inSlot = Math.abs(token.x - targetX) < 70 && Math.abs(token.y - targetY) < 60;
          if (inSlot) this.submitResult(t === this.challenge.answer, { selected: t, target: this.challenge.answer, interaction: 'drag' });
          else { token.x = x; token.y = 405; tokenText.x = x; tokenText.y = 405; }
          this.updateState({ lastGesture: 'drag' });
        });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'pattern',
        variant: 'train',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        inputReady: true
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(PatternPlayScene));
})();
