// Torre de Blocos — Obra da Torre
(() => {
  const { C } = window.AprincarConstants;
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
      this.blocks = [];

      this.promptText.setText(`Monte uma torre com ${this.challenge.answer} blocos`);

      for (let i = 0; i < 10; i++) {
        const x = 165 + (i % 5) * 135;
        const y = 210 + Math.floor(i / 5) * 90;
        const blockColor = BLOCK_COLORS[i % BLOCK_COLORS.length];

        const blockContainer = this.add.container(x, y);
        const blockGfx = this.add.graphics();
        window.AprincarVectorArt.drawIsometricBlock(blockGfx, 0, 0, 78, 64, blockColor);
        const hitZone = this.add.rectangle(0, 0, 88, 74, 0xffffff, 0.001);
        blockContainer.add([blockGfx, hitZone]);
        blockContainer.setSize(88, 74);
        this.roundGroup.add(blockContainer);

        const block = {
          id: `block-${i + 1}`,
          container: blockContainer,
          homeX: x,
          homeY: y
        };
        this.blocks.push(block);

        this.target(block.id, x, y, 88, 74, 'drag-source');
        this.target(block.id, x, y, 88, 74, 'toggle');

        window.AprincarInputGestures.attachTapOrDrag(this, blockContainer, {
          threshold: 10,
          onDrag: (pointer) => {
            if (this.locked) return;
            blockContainer.x = pointer.x;
            blockContainer.y = pointer.y;
          },
          onDragEnd: () => {
            if (this.locked) {
              this.syncBlock(block);
              return;
            }

            const inTower =
              blockContainer.x > 340 &&
              blockContainer.x < 620 &&
              blockContainer.y > 325;

            if (inTower) {
              this.placeBlock(block);
              if (window.AprincarAudio) window.AprincarAudio.drop();
            } else if (blockContainer.getData('picked') === true) {
              this.removeBlock(block);
              if (window.AprincarAudio) window.AprincarAudio.pop();
            } else {
              this.restoreBlock(block);
            }

            this.publishBlocks('drag');
          },
          onTap: () => {
            if (this.locked) return;

            if (blockContainer.getData('picked') === true) {
              this.removeBlock(block);
              if (window.AprincarAudio) window.AprincarAudio.pop();
              this.publishBlocks('tap-remove');
              return;
            }

            this.placeBlock(block);
            if (window.AprincarAudio) window.AprincarAudio.drop();
            this.publishBlocks('tap-fallback');
          }
        });
      }

      const check = this.addCardButton(780, 500, 160, 60, 'Conferir', '__check__', C.leaf, 'action');
      this.target('tower', 480, 440, 280, 220, 'stack-zone');
      check.removeAllListeners('pointerup');
      check.on('pointerup', () => {
        if (this.locked) return;
        const ok = this.selected === this.challenge.answer;
        this.submitResult(ok, { selected: this.selected, target: this.challenge.answer });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'counting',
        variant: 'blocks',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        selectedCount: this.selected,
        stackHeight: this.stack.length,
        blockStates: this.blockSnapshot(),
        attempts: this.attempts,
        inputReady: true
      };
    }

    placeBlock(block) {
      const container = block.container;
      if (container.getData('picked') !== true) {
        container.setData('picked', true);
        this.stack.push(block);
      }
      this.selected = this.stack.length;
      this.syncStack();
      this.tweens.add({ targets: container, angle: 2, duration: 90, yoyo: true });
    }

    removeBlock(block) {
      block.container.setData('picked', false);
      this.stack = this.stack.filter((item) => item !== block);
      this.selected = this.stack.length;
      this.restoreBlock(block);
      this.syncStack();
    }

    restoreBlock(block) {
      block.container.x = block.homeX;
      block.container.y = block.homeY;
      block.container.setAlpha(1);
      block.container.setScale(1);
    }

    syncBlock(block) {
      if (block.container.getData('picked') === true) this.syncStack();
      else this.restoreBlock(block);
    }

    syncStack() {
      this.stack.forEach((block, index) => {
        block.container.x = 480;
        block.container.y = 430 - index * 58;
        block.container.setAlpha(1);
        block.container.setScale(1);
      });
      this.selected = this.stack.length;
    }

    blockSnapshot() {
      return this.blocks.map((block) => ({
        id: block.id,
        picked: block.container.getData('picked') === true,
        x: block.container.x,
        y: block.container.y,
        homeX: block.homeX,
        homeY: block.homeY,
        stackIndex: this.stack.indexOf(block)
      }));
    }

    publishBlocks(lastGesture) {
      this.updateState({
        selectedCount: this.selected,
        stackHeight: this.stack.length,
        blockStates: this.blockSnapshot(),
        lastGesture,
        inputReady: !this.locked
      });
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(BlockTowerScene));
})();
