// Caça às Letras — Caça ao Tesouro das Letras
(() => {
  const { C, FONT } = window.AprincarConstants;
  const BUBBLE_COLORS = [C.purple, C.coral, C.sun, C.leaf, C.sky];

  class LetterHuntScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);
      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateLetterChallenge({ rng, seed, level: this.level });

      this.promptText.setText(`Encontre a letra ${this.challenge.answer}`);

      // Posições espalhadas pelo céu
      const basePositions = [
        { x: 200, y: 250 }, { x: 380, y: 230 }, { x: 580, y: 260 }, { x: 760, y: 235 },
        { x: 290, y: 400 }, { x: 480, y: 410 }, { x: 670, y: 390 }
      ];
      const positions = Phaser.Utils.Array.Shuffle(basePositions).slice(0, this.challenge.options.length);

      this.challenge.options.forEach((letter, i) => {
        const p = positions[i];
        const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];

        const bubbleContainer = this.add.container(p.x, p.y);
        const bubbleGfx = this.add.graphics();
        window.AprincarVectorArt.drawBubble(bubbleGfx, 0, 0, 52, color);

        const letterText = this.add.text(0, 0, letter, {
          fontFamily: FONT,
          fontSize: '48px',
          fontStyle: 'bold',
          color: '#1e293b'
        }).setOrigin(0.5);

        const hitZone = this.add.circle(0, 0, 52, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        bubbleContainer.add([bubbleGfx, letterText, hitZone]);
        this.roundGroup.add(bubbleContainer);

        this.target(letter, p.x, p.y, 104, 104, 'choice');

        // Animação de flutuação suave (gentle floating)
        this.tweens.add({
          targets: bubbleContainer,
          y: p.y - 18,
          x: p.x + Phaser.Math.Between(-12, 12),
          duration: 1600 + (i % 3) * 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        hitZone.on('pointerup', () => {
          if (window.AprincarAudio) window.AprincarAudio.pop();
          this.choose(letter, bubbleContainer);
        });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'letter',
        variant: 'hunt',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        inputReady: true
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(LetterHuntScene));
})();
