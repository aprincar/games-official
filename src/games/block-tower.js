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
      this.challenge = generateCountingChallenge({
        rng,
        seed,
        level: this.level,
        theme: 'blocks'
      });

      const layout = this.layout;
      const stage = layout.stage;

      this.selected = 0;
      this.stack = [];
      this.blocks = [];
      this.promptText.setText(`Monte uma torre com ${this.challenge.answer} blocos`);

      const buttonHeight = Math.max(layout.touchTarget, 58);
      const sourceArea = {
        left: stage.left,
        top: stage.top + 6,
        width: stage.width,
        height: Math.max(170, stage.height * 0.40)
      };
      const towerWidth = window.AprincarLayout.clamp(
        stage.width * 0.56,
        190,
        layout.portrait ? 250 : 310
      );
      const towerHeight = window.AprincarLayout.clamp(
        stage.height * 0.36,
        180,
        layout.portrait ? 260 : 300
      );
      const towerY = stage.top + stage.height * 0.67;

      this.towerBounds = {
        left: stage.centerX - towerWidth / 2,
        top: towerY - towerHeight / 2,
        width: towerWidth,
        height: towerHeight
      };

      const towerGuide = this.add.graphics();
      towerGuide.fillStyle(0xeef2ff, 0.52);
      towerGuide.fillRoundedRect(
        this.towerBounds.left,
        this.towerBounds.top,
        this.towerBounds.width,
        this.towerBounds.height,
        18
      );
      towerGuide.lineStyle(2, 0xa5b4fc, 0.75);
      towerGuide.strokeRoundedRect(
        this.towerBounds.left,
        this.towerBounds.top,
        this.towerBounds.width,
        this.towerBounds.height,
        18
      );
      this.roundGroup.add(towerGuide);

      const sourceCount = 10;
      const cols = window.AprincarLayout.columnsFor(
        sourceCount,
        layout,
        layout.portrait ? 4 : 5
      );
      const sourceGrid = window.AprincarLayout.grid(sourceCount, sourceArea, {
        cols,
        gapX: layout.portrait ? 8 : 14,
        gapY: layout.portrait ? 8 : 12
      });

      for (let index = 0; index < sourceCount; index += 1) {
        const cell = sourceGrid.points[index];
        const blockColor = BLOCK_COLORS[index % BLOCK_COLORS.length];
        const visualWidth = window.AprincarLayout.clamp(
          cell.width * 0.72,
          46,
          layout.portrait ? 66 : 78
        );
        const visualHeight = visualWidth * 0.82;
        const hitWidth = Math.max(layout.touchTarget, visualWidth + 8);
        const hitHeight = Math.max(layout.touchTarget, visualHeight + 8);

        const blockContainer = this.add.container(cell.x, cell.y);
        const blockGfx = this.add.graphics();
        window.AprincarVectorArt.drawIsometricBlock(
          blockGfx,
          0,
          0,
          visualWidth,
          visualHeight,
          blockColor
        );

        const hitZone = this.add.rectangle(
          0,
          0,
          hitWidth,
          hitHeight,
          0xffffff,
          0.001
        );

        blockContainer.add([blockGfx, hitZone]);
        blockContainer.setSize(hitWidth, hitHeight);
        this.roundGroup.add(blockContainer);

        const block = {
          id: `block-${index + 1}`,
          container: blockContainer,
          homeX: cell.x,
          homeY: cell.y,
          visualWidth,
          visualHeight
        };
        this.blocks.push(block);

        this.target(
          block.id,
          cell.x,
          cell.y,
          hitWidth,
          hitHeight,
          'drag-source'
        );
        this.target(
          block.id,
          cell.x,
          cell.y,
          hitWidth,
          hitHeight,
          'toggle'
        );

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

            const inTower = Phaser.Geom.Rectangle.Contains(
              new Phaser.Geom.Rectangle(
                this.towerBounds.left,
                this.towerBounds.top,
                this.towerBounds.width,
                this.towerBounds.height
              ),
              blockContainer.x,
              blockContainer.y
            );

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

      const check = this.addCardButton(
        stage.centerX,
        stage.bottom - buttonHeight / 2 - 4,
        Math.min(stage.width * 0.68, 230),
        buttonHeight,
        'Conferir',
        '__check__',
        C.leaf,
        'action'
      );

      this.target(
        'tower',
        stage.centerX,
        towerY,
        towerWidth,
        towerHeight,
        'stack-zone'
      );

      check.removeAllListeners('pointerup');
      check.on('pointerup', () => {
        if (this.locked) return;
        const ok = this.selected === this.challenge.answer;
        this.submitResult(ok, {
          selected: this.selected,
          target: this.challenge.answer
        });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'counting',
        variant: 'blocks',
        familyId: 'quantities',
        objective: window.APRINCAR_GAME_CONFIG.objective,
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        selectedCount: this.selected,
        stackHeight: this.stack.length,
        blockStates: this.blockSnapshot(),
        towerBounds: this.towerBounds,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
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
      this.tweens.add({
        targets: container,
        angle: 2,
        duration: 90,
        yoyo: true
      });
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
      const baseY = this.towerBounds.top + this.towerBounds.height - 32;
      const countForSpacing = Math.max(1, Math.max(this.stack.length, this.challenge.answer));
      const spacing = window.AprincarLayout.clamp(
        (this.towerBounds.height - 52) / Math.max(1, countForSpacing - 1),
        24,
        48
      );
      const scale =
        this.challenge.answer >= 8
          ? 0.72
          : this.challenge.answer >= 6
            ? 0.80
            : 0.90;

      this.stack.forEach((block, index) => {
        block.container.x = this.towerBounds.left + this.towerBounds.width / 2;
        block.container.y = baseY - index * spacing;
        block.container.setAlpha(1);
        block.container.setScale(scale);
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
        towerBounds: this.towerBounds,
        lastGesture,
        inputReady: !this.locked
      });
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(BlockTowerScene));
})();
