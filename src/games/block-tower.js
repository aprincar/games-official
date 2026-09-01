// Torre de Blocos — Obra da Torre
(() => {
  const { C, FONT } = window.AprincarConstants;
  const BLOCK_COLORS = [C.purple, C.coral, C.sun, C.leaf, C.sky];

  class BlockTowerScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);
      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateCountingChallenge({ rng, seed, level: this.level, theme: 'blocks' });
      this.selected = 0;
      this.stack = [];

      this.promptText.setText(`Monte uma torre com ${this.challenge.answer} blocos`);

      // Canteiro de obras com blocos disponíveis
      for (let i = 0; i < 10; i++) {
        const x = 165 + (i % 5) * 135;
        const y = 210 + Math.floor(i / 5) * 90;
        const blockColor = BLOCK_COLORS[i % BLOCK_COLORS.length];

        const blockContainer = this.add.container(x, y);
        const blockGfx = this.add.graphics();
        window.AprincarVectorArt.drawIsometricBlock(blockGfx, 0, 0, 78, 64, blockColor);
        const hitZone = this.add.rectangle(0, 0, 88, 74, 0xffffff, 0.001);
        blockContainer.add([blockGfx, hitZone]);
        this.roundGroup.add(blockContainer);

        this.target(`block-${i + 1}`, x, y, 88, 74, 'drag-source');
        this.target(`block-${i + 1}`, x, y, 88, 74, 'toggle');

        window.AprincarInputGestures.attachTapOrDrag(this, hitZone, {
          threshold: 10,
          onDrag: (_pointer, _gameObject, dragX, dragY) => {
            blockContainer.x = dragX;
            blockContainer.y = dragY;
          },
          onDragEnd: () => {
            const inTower = blockContainer.x > 340 && blockContainer.x < 620 && blockContainer.y > 325;
            const picked = blockContainer.getData('picked') === true;
            if (inTower && !picked) {
              blockContainer.setData('picked', true);
              this.stack.push(blockContainer);
              this.selected += 1;
              blockContainer.x = 480;
              blockContainer.y = 430 - (this.stack.length - 1) * 58;
              this.tweens.add({ targets: blockContainer, angle: 2, duration: 90, yoyo: true });
              if (window.AprincarAudio) window.AprincarAudio.drop();
            } else if (!inTower && picked) {
              blockContainer.setData('picked', false);
              this.stack = this.stack.filter((item) => item !== blockContainer);
              this.selected = Math.max(0, this.selected - 1);
              blockContainer.x = x;
              blockContainer.y = y;
              if (window.AprincarAudio) window.AprincarAudio.pop();
            }
            this.updateState({ selectedCount: this.selected, stackHeight: this.stack.length, lastGesture: 'drag', inputReady: true });
          },
          onTap: () => {
            const picked = blockContainer.getData('picked') === true;
            if (picked) {
              blockContainer.setData('picked', false);
              this.stack = this.stack.filter((item) => item !== blockContainer);
              this.selected = Math.max(0, this.selected - 1);
              this.tweens.add({ targets: blockContainer, alpha: 1, scale: 1, duration: 150 });
              if (window.AprincarAudio) window.AprincarAudio.pop();
              this.updateState({ selectedCount: this.selected, stackHeight: this.stack.length, lastGesture: 'tap-remove', inputReady: true });
              return;
            }
            blockContainer.setData('picked', true);
            this.stack.push(blockContainer);
            this.selected += 1;
            this.tweens.add({ targets: blockContainer, alpha: 0.75, scale: 0.85, duration: 150 });
            if (window.AprincarAudio) window.AprincarAudio.drop();
            this.updateState({ selectedCount: this.selected, stackHeight: this.stack.length, lastGesture: 'tap-fallback', inputReady: true });
          }
        });
      }

      // Botão de Conferir
      const check = this.addCardButton(780, 500, 160, 60, 'Conferir', '__check__', C.leaf, 'action');
      this.target('tower', 340, 330, 280, 220, 'stack-zone');
      check.removeAllListeners('pointerup');
      check.on('pointerup', () => {
        const ok = this.selected === this.challenge.answer;
        this.submitResult(ok, { selected: this.selected, target: this.challenge.answer });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'counting',
        variant: 'blocks',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        inputReady: true
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(BlockTowerScene));
})();
