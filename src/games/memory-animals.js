// Memória dos Bichos — Reserva dos Pares
(() => {
  const { FONT } = window.AprincarConstants;

  class MemoryAnimalsScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);

      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateMemoryChallenge({ rng, seed, level: this.level });

      const layout = this.layout;
      const stage = layout.stage;
      const cards = this.challenge.cards || [];

      this.promptText.setText('Encontre todos os pares');
      this.memoryOpen = [];
      this.memoryMatched = 0;
      this.memoryMoves = 0;

      let cols;
      if (layout.portrait) {
        cols = cards.length <= 8 ? 2 : cards.length <= 12 ? 3 : 4;
      } else {
        cols = Math.min(5, Math.ceil(cards.length / 2));
      }

      const grid = window.AprincarLayout.grid(cards.length, {
        left: stage.left,
        top: stage.top + 8,
        width: stage.width,
        height: Math.max(240, stage.height - 16)
      }, {
        cols,
        gapX: layout.portrait ? 10 : 14,
        gapY: layout.portrait ? 10 : 12
      });

      cards.forEach((card, index) => {
        const cell = grid.points[index];
        const cardWidth = window.AprincarLayout.clamp(
          cell.width * 0.88,
          layout.touchTarget,
          layout.portrait ? 128 : 132
        );
        const cardHeight = window.AprincarLayout.clamp(
          cell.height * 0.86,
          layout.touchTarget,
          layout.portrait ? 112 : 106
        );

        const cardContainer = this.add.container(cell.x, cell.y);

        const backGfx = this.add.graphics();
        backGfx.fillStyle(0x7c3aed, 1);
        backGfx.fillRoundedRect(
          -cardWidth / 2,
          -cardHeight / 2,
          cardWidth,
          cardHeight,
          12
        );
        backGfx.lineStyle(3, 0xfbbf24, 0.85);
        backGfx.strokeRoundedRect(
          -cardWidth / 2,
          -cardHeight / 2,
          cardWidth,
          cardHeight,
          12
        );

        const starIcon = this.add.text(0, 0, '★', {
          fontFamily: FONT,
          fontSize: `${Math.round(Math.min(cardWidth, cardHeight) * 0.42)}px`,
          fontStyle: 'bold',
          color: '#fbbf24'
        }).setOrigin(0.5);

        const frontGfx = this.add.graphics();
        frontGfx.fillStyle(0xffffff, 1);
        frontGfx.fillRoundedRect(
          -cardWidth / 2,
          -cardHeight / 2,
          cardWidth,
          cardHeight,
          12
        );
        frontGfx.lineStyle(3, 0x10b981, 0.85);
        frontGfx.strokeRoundedRect(
          -cardWidth / 2,
          -cardHeight / 2,
          cardWidth,
          cardHeight,
          12
        );

        const valueText = this.add.text(0, 0, card.value, {
          fontFamily: FONT,
          fontSize: `${Math.round(Math.min(cardWidth, cardHeight) * 0.40)}px`,
          fontStyle: 'bold',
          color: '#1e293b'
        }).setOrigin(0.5);

        frontGfx.setVisible(false);
        valueText.setVisible(false);

        const hitZone = this.add
          .rectangle(0, 0, cardWidth, cardHeight, 0xffffff, 0.001)
          .setInteractive({ useHandCursor: true });

        cardContainer.add([backGfx, starIcon, frontGfx, valueText, hitZone]);
        cardContainer.setData('card', card);
        cardContainer.setData('backGfx', backGfx);
        cardContainer.setData('starIcon', starIcon);
        cardContainer.setData('frontGfx', frontGfx);
        cardContainer.setData('valueText', valueText);
        this.roundGroup.add(cardContainer);

        this.target(
          card.id,
          cell.x,
          cell.y,
          cardWidth,
          cardHeight,
          'memory-card'
        );

        hitZone.on('pointerup', () => this.flipCard(cardContainer));
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'memory',
        variant: 'animals',
        familyId: 'logic',
        objective: window.APRINCAR_GAME_CONFIG.objective,
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        matchedPairs: 0,
        moves: 0,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
        attempts: this.attempts,
        inputReady: true
      };
    }

    flipCard(cardContainer) {
      if (
        this.locked ||
        cardContainer.getData('matched') ||
        cardContainer.getData('open')
      ) {
        return;
      }

      const backGfx = cardContainer.getData('backGfx');
      const starIcon = cardContainer.getData('starIcon');
      const frontGfx = cardContainer.getData('frontGfx');
      const valueText = cardContainer.getData('valueText');

      if (window.AprincarAudio) window.AprincarAudio.pop();

      this.tweens.add({
        targets: cardContainer,
        scaleX: 0,
        duration: 120,
        onComplete: () => {
          cardContainer.setData('open', true);
          backGfx.setVisible(false);
          starIcon.setVisible(false);
          frontGfx.setVisible(true);
          valueText.setVisible(true);

          this.tweens.add({
            targets: cardContainer,
            scaleX: 1,
            duration: 120
          });
        }
      });

      this.memoryOpen.push(cardContainer);
      if (this.memoryOpen.length !== 2) return;

      this.memoryMoves += 1;
      this.locked = true;
      this.updateState({ inputReady: false, moves: this.memoryMoves });

      const [a, b] = this.memoryOpen;
      const same = a.getData('card').pairId === b.getData('card').pairId;

      this.time.delayedCall(450, async () => {
        if (same) {
          if (window.AprincarAudio) window.AprincarAudio.chime();
          a.setData('matched', true);
          b.setData('matched', true);
          this.memoryMatched += 1;
          this.updateState({
            matchedPairs: this.memoryMatched,
            moves: this.memoryMoves
          });

          if (this.memoryMatched === this.challenge.pairs) {
            this.locked = false;
            await this.submitResult(true, {
              moves: this.memoryMoves,
              pairs: this.challenge.pairs
            });
          }
        } else {
          for (const card of [a, b]) {
            this.tweens.add({
              targets: card,
              scaleX: 0,
              duration: 120,
              onComplete: () => {
                card.setData('open', false);
                card.getData('frontGfx').setVisible(false);
                card.getData('valueText').setVisible(false);
                card.getData('backGfx').setVisible(true);
                card.getData('starIcon').setVisible(true);
                this.tweens.add({
                  targets: card,
                  scaleX: 1,
                  duration: 120
                });
              }
            });
          }

          this.updateState({
            lastResult: 'failure',
            moves: this.memoryMoves
          });
          await this.recordEvidence(false, { memoryMismatch: true });
        }

        this.memoryOpen = [];
        this.locked = false;
        this.updateState({ inputReady: true });
      });
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(MemoryAnimalsScene));
})();
