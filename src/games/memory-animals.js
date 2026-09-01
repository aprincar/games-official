// Memória dos Bichos — Reserva dos Pares
(() => {
  const { C, FONT } = window.AprincarConstants;

  class MemoryAnimalsScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);
      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateMemoryChallenge({ rng, seed, level: this.level });

      this.promptText.setText('Encontre todos os pares de bichos');

      this.memoryOpen = [];
      this.memoryMatched = 0;
      this.memoryMoves = 0;

      const cols = this.challenge.pairs <= 4 ? 4 : 5;
      const cards = this.challenge.cards || [];

      cards.forEach((card, i) => {
        const x = 480 - ((cols - 1) * 135) / 2 + (i % cols) * 135;
        const y = 230 + Math.floor(i / cols) * 115;

        const cardContainer = this.add.container(x, y);

        // Verso da Carta (Madeira roxa com estrela dourada)
        const backGfx = this.add.graphics();
        backGfx.fillStyle(0x7c3aed, 1);
        backGfx.fillRoundedRect(-58, -48, 116, 96, 12);
        backGfx.lineStyle(3, 0xfbbf24, 0.85);
        backGfx.strokeRoundedRect(-58, -48, 116, 96, 12);
        const starIcon = this.add.text(0, 0, '★', { fontFamily: FONT, fontSize: '42px', fontStyle: 'bold', color: '#fbbf24' }).setOrigin(0.5);

        // Frente da Carta (Branco com o animal)
        const frontGfx = this.add.graphics();
        frontGfx.fillStyle(0xffffff, 1);
        frontGfx.fillRoundedRect(-58, -48, 116, 96, 12);
        frontGfx.lineStyle(3, 0x10b981, 0.85);
        frontGfx.strokeRoundedRect(-58, -48, 116, 96, 12);
        const valueText = this.add.text(0, 0, card.value, { fontFamily: FONT, fontSize: '38px', fontStyle: 'bold', color: '#1e293b' }).setOrigin(0.5);
        frontGfx.setVisible(false);
        valueText.setVisible(false);

        const hitZone = this.add.rectangle(0, 0, 116, 96, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        cardContainer.add([backGfx, starIcon, frontGfx, valueText, hitZone]);
        cardContainer.setData('card', card);
        cardContainer.setData('backGfx', backGfx);
        cardContainer.setData('starIcon', starIcon);
        cardContainer.setData('frontGfx', frontGfx);
        cardContainer.setData('valueText', valueText);
        this.roundGroup.add(cardContainer);

        this.target(card.id, x, y, 116, 96, 'memory-card');

        hitZone.on('pointerup', () => this.flipCard(cardContainer));
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'memory',
        variant: 'animals',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        inputReady: true
      };
    }

    flipCard(cardContainer) {
      if (this.locked || cardContainer.getData('matched') || cardContainer.getData('open')) return;

      const backGfx = cardContainer.getData('backGfx');
      const starIcon = cardContainer.getData('starIcon');
      const frontGfx = cardContainer.getData('frontGfx');
      const valueText = cardContainer.getData('valueText');

      if (window.AprincarAudio) window.AprincarAudio.pop();

      // Animação 3D de giro de carta (Flip tween)
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

      this.memoryMoves++;
      this.locked = true;
      this.updateState({ inputReady: false });

      const [a, b] = this.memoryOpen;
      const same = a.getData('card').pairId === b.getData('card').pairId;

      this.time.delayedCall(450, async () => {
        if (same) {
          if (window.AprincarAudio) window.AprincarAudio.chime();
          a.setData('matched', true);
          b.setData('matched', true);
          this.memoryMatched++;
          this.updateState({ matchedPairs: this.memoryMatched, moves: this.memoryMoves });

          if (this.memoryMatched === this.challenge.pairs) {
            this.locked = false;
            await this.submitResult(true, { moves: this.memoryMoves, pairs: this.challenge.pairs });
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
                this.tweens.add({ targets: card, scaleX: 1, duration: 120 });
              }
            });
          }
          this.updateState({ lastResult: 'failure', moves: this.memoryMoves });
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
