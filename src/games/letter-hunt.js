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

      const layout = this.layout;
      const stage = layout.stage;
      const options = this.challenge.options || [];

      this.promptText.setText(`Encontre a letra ${this.challenge.answer}`);

      const cols = window.AprincarLayout.columnsFor(
        options.length,
        layout,
        layout.portrait ? 2 : 4
      );
      const grid = window.AprincarLayout.grid(options.length, {
        left: stage.left,
        top: stage.top + 12,
        width: stage.width,
        height: Math.max(220, stage.height - 30)
      }, {
        cols,
        gapX: layout.portrait ? 14 : 24,
        gapY: layout.portrait ? 18 : 16
      });

      options.forEach((letter, index) => {
        const cell = grid.points[index];
        const color = BUBBLE_COLORS[index % BUBBLE_COLORS.length];
        const diameter = window.AprincarLayout.clamp(
          Math.min(cell.width, cell.height) * 0.62,
          layout.touchTarget,
          layout.portrait ? 92 : 108
        );
        const radius = diameter / 2;

        const bubbleContainer = this.add.container(cell.x, cell.y);
        const bubbleGfx = this.add.graphics();
        window.AprincarVectorArt.drawBubble(
          bubbleGfx,
          0,
          0,
          radius,
          color
        );

        const letterText = this.add.text(0, 0, letter, {
          fontFamily: FONT,
          fontSize: `${Math.round(diameter * 0.48)}px`,
          fontStyle: 'bold',
          color: '#1e293b'
        }).setOrigin(0.5);

        const hitZone = this.add
          .circle(0, 0, Math.max(radius, layout.touchTarget / 2), 0xffffff, 0.001)
          .setInteractive({ useHandCursor: true });

        bubbleContainer.add([bubbleGfx, letterText, hitZone]);
        this.roundGroup.add(bubbleContainer);

        const hitSize = Math.max(diameter, layout.touchTarget);
        this.target(letter, cell.x, cell.y, hitSize, hitSize, 'choice');

        const floatDistance = layout.portrait ? 8 : 14;
        this.tweens.add({
          targets: bubbleContainer,
          y: cell.y - floatDistance,
          x: cell.x + Phaser.Math.Between(-floatDistance, floatDistance),
          duration: 1600 + (index % 3) * 250,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        hitZone.on('pointerup', () => {
          if (this.locked) return;
          if (window.AprincarAudio) window.AprincarAudio.pop();
          this.choose(letter, bubbleContainer);
        });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'letter',
        variant: 'hunt',
        familyId: 'literacy',
        objective: window.APRINCAR_GAME_CONFIG.objective,
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
        attempts: this.attempts,
        inputReady: true
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(LetterHuntScene));
})();
