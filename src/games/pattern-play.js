// Trem dos Padrões — um único conjunto de opções suporta tap ou drag.
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

      const layout = this.layout;
      const stage = layout.stage;
      const sequence = this.challenge.sequence || [];
      const options = this.challenge.options || [];

      this.promptText.setText('Qual peça continua o padrão?');

      const stripTop = stage.top + 20;
      const stripHeight = window.AprincarLayout.clamp(
        stage.height * 0.28,
        120,
        layout.portrait ? 170 : 150
      );
      const railY = stripTop + stripHeight * 0.55;
      const totalCars = sequence.length + 1;
      const availableWidth = stage.width - 12;
      const carWidth = window.AprincarLayout.clamp(
        availableWidth / Math.max(totalCars, 1) - 4,
        26,
        layout.portrait ? 52 : 62
      );
      const carHeight = window.AprincarLayout.clamp(carWidth * 0.72, 24, 48);
      const gap = Math.max(3, (availableWidth - carWidth * totalCars) / Math.max(totalCars - 1, 1));
      const totalWidth = carWidth * totalCars + gap * Math.max(totalCars - 1, 0);
      const startX = stage.centerX - totalWidth / 2 + carWidth / 2;

      const track = this.add.graphics();
      track.lineStyle(layout.portrait ? 3 : 4, 0x94a3b8, 0.8);
      track.lineBetween(
        stage.left + 4,
        railY + carHeight * 0.46,
        stage.right - 4,
        railY + carHeight * 0.46
      );
      this.roundGroup.add(track);

      sequence.forEach((token, index) => {
        const x = startX + index * (carWidth + gap);
        const colorIndex = TOKEN_COLORS[token] ?? index % PALETTE.length;
        const color = PALETTE[colorIndex];

        const wagon = this.add.graphics();
        wagon.fillStyle(color, 0.92);
        wagon.fillRoundedRect(
          x - carWidth / 2,
          railY - carHeight / 2,
          carWidth,
          carHeight,
          Math.min(10, carHeight * 0.2)
        );
        const symbol = this.add.text(x, railY, token, {
          fontFamily: FONT,
          fontSize: `${Math.round(window.AprincarLayout.clamp(carHeight * 0.56, 16, 28))}px`,
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5);

        this.roundGroup.add([wagon, symbol]);
      });

      const targetX = startX + sequence.length * (carWidth + gap);
      const targetY = railY;
      const targetSize = Math.max(layout.touchTarget, carWidth + 12);

      const targetGfx = this.add.graphics();
      targetGfx.fillStyle(0xe2e8f0, 0.78);
      targetGfx.fillRoundedRect(
        targetX - targetSize / 2,
        targetY - targetSize / 2,
        targetSize,
        targetSize,
        12
      );
      targetGfx.lineStyle(3, 0x8b5cf6, 0.75);
      targetGfx.strokeRoundedRect(
        targetX - targetSize / 2,
        targetY - targetSize / 2,
        targetSize,
        targetSize,
        12
      );
      const question = this.add.text(targetX, targetY, '?', {
        fontFamily: FONT,
        fontSize: `${Math.round(targetSize * 0.46)}px`,
        fontStyle: 'bold',
        color: '#64748b'
      }).setOrigin(0.5);

      this.roundGroup.add([targetGfx, question]);
      this.target('pattern-slot', targetX, targetY, targetSize, targetSize, 'drop-zone');

      const optionsTop = stripTop + stripHeight + 24;
      const optionBounds = {
        left: stage.left,
        top: optionsTop,
        width: stage.width,
        height: Math.max(
          layout.touchTarget + 24,
          stage.bottom - optionsTop - 12
        )
      };
      const optionSlots = window.AprincarLayout.row(options.length, optionBounds, {
        gap: layout.portrait ? 12 : 18,
        minWidth: layout.touchTarget,
        maxWidth: layout.portrait ? 82 : 96
      });

      options.forEach((tokenValue, index) => {
        const slot = optionSlots[index];
        const colorIndex = TOKEN_COLORS[tokenValue] ?? index % PALETTE.length;
        const color = PALETTE[colorIndex];
        const size = Math.max(layout.touchTarget, Math.min(slot.width, 82));
        const tokenContainer = this.add.container(slot.x, slot.y);
        const circle = this.add.circle(0, 0, size / 2, color);
        const tokenText = this.add.text(0, 0, tokenValue, {
          fontFamily: FONT,
          fontSize: `${Math.round(size * 0.46)}px`,
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5);

        tokenContainer.add([circle, tokenText]);
        tokenContainer.setSize(size, size);
        this.roundGroup.add(tokenContainer);

        this.target(tokenValue, slot.x, slot.y, size, size, 'choice');
        this.target(tokenValue, slot.x, slot.y, size, size, 'drag-source');

        const restore = () => {
          tokenContainer.x = slot.x;
          tokenContainer.y = slot.y;
          tokenContainer.setScale(1);
        };

        window.AprincarInputGestures.attachTapOrDrag(this, tokenContainer, {
          threshold: 10,
          onDragStart: () => {
            if (!this.locked) tokenContainer.setScale(1.06);
          },
          onDrag: (pointer) => {
            if (this.locked) return;
            tokenContainer.x = pointer.x;
            tokenContainer.y = pointer.y;
          },
          onDragEnd: () => {
            if (this.locked) {
              restore();
              return;
            }

            const inSlot =
              Math.abs(tokenContainer.x - targetX) <= targetSize * 0.72 &&
              Math.abs(tokenContainer.y - targetY) <= targetSize * 0.72;

            if (inSlot) {
              this.updateState({ lastGesture: 'drag' });
              this.submitResult(tokenValue === this.challenge.answer, {
                selected: tokenValue,
                target: this.challenge.answer,
                interaction: 'drag'
              });
            } else {
              restore();
              this.updateState({ lastGesture: 'drag-cancel' });
            }
          },
          onTap: () => {
            if (this.locked) return;
            this.updateState({ lastGesture: 'tap' });
            this.submitResult(tokenValue === this.challenge.answer, {
              selected: tokenValue,
              target: this.challenge.answer,
              interaction: 'tap'
            });
          }
        });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'pattern',
        variant: 'train',
        familyId: 'logic',
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

  new Phaser.Game(window.createAprincarPhaserConfig(PatternPlayScene));
})();
