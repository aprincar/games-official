// Mundo das Cores — Ateliê das Cores
(() => {
  const { C } = window.AprincarConstants;
  const COLOR_HEX = {
    violet: C.purple,
    coral: C.coral,
    sun: C.sun,
    leaf: C.leaf,
    sky: C.sky
  };
  const COLOR_ITEMS = {
    coral: 'car',
    leaf: 'leaf',
    sun: 'duck',
    violet: 'grape',
    sky: 'boat'
  };

  class ColorMatchScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);

      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateColorChallenge({ rng, seed, level: this.level });

      const layout = this.layout;
      const stage = layout.stage;
      const options = this.challenge.options || [];
      const itemType = COLOR_ITEMS[this.challenge.answer] || 'car';

      this.promptText.setText(`Leve a peça até a cor ${this.challenge.label}`);

      const sourceY = stage.top + Math.min(120, stage.height * 0.20);
      const sourceDiameter = window.AprincarLayout.clamp(
        layout.touchTarget * 1.45,
        78,
        layout.portrait ? 96 : 112
      );

      const pieceContainer = this.add.container(stage.centerX, sourceY);
      const pieceGfx = this.add.graphics();
      const answerColor = COLOR_HEX[this.challenge.answer] || C.blue;
      pieceGfx.fillStyle(answerColor, 0.22);
      pieceGfx.fillCircle(0, 0, sourceDiameter / 2);
      pieceGfx.lineStyle(3, answerColor, 0.9);
      pieceGfx.strokeCircle(0, 0, sourceDiameter / 2 - 4);
      window.AprincarVectorArt.drawColorItem(
        pieceGfx,
        itemType,
        0,
        0,
        sourceDiameter * 0.66
      );

      const hitZone = this.add.circle(
        0,
        0,
        sourceDiameter / 2,
        0xffffff,
        0.001
      );

      pieceContainer.add([pieceGfx, hitZone]);
      pieceContainer.setSize(sourceDiameter, sourceDiameter);
      this.roundGroup.add(pieceContainer);
      this.target(
        'source',
        stage.centerX,
        sourceY,
        sourceDiameter,
        sourceDiameter,
        'drag-source'
      );

      const gridTop = sourceY + sourceDiameter / 2 + 28;
      const gridBottom = stage.bottom - 12;
      const dropArea = {
        left: stage.left,
        top: gridTop,
        width: stage.width,
        height: Math.max(170, gridBottom - gridTop)
      };
      const cols = layout.portrait ? Math.min(2, options.length) : options.length;
      const grid = window.AprincarLayout.grid(options.length, dropArea, {
        cols,
        gapX: layout.portrait ? 14 : 20,
        gapY: layout.portrait ? 18 : 14
      });

      const slots = [];
      options.forEach((color, index) => {
        const cell = grid.points[index];
        const hex = COLOR_HEX[color] || C.purple;
        const slotWidth = window.AprincarLayout.clamp(
          cell.width * 0.78,
          layout.touchTarget,
          layout.portrait ? 132 : 150
        );
        const slotHeight = window.AprincarLayout.clamp(
          cell.height * 0.70,
          layout.touchTarget,
          layout.portrait ? 112 : 130
        );

        const slotContainer = this.add.container(cell.x, cell.y);
        const slotGfx = this.add.graphics();
        slotGfx.fillStyle(hex, 0.18);
        slotGfx.fillRoundedRect(
          -slotWidth / 2,
          -slotHeight / 2 + 10,
          slotWidth,
          slotHeight - 10,
          16
        );
        slotGfx.lineStyle(4, hex, 0.9);
        slotGfx.strokeRoundedRect(
          -slotWidth / 2,
          -slotHeight / 2 + 10,
          slotWidth,
          slotHeight - 10,
          16
        );
        slotGfx.fillStyle(hex, 0.85);
        slotGfx.fillTriangle(
          -slotWidth / 2 - 4,
          -slotHeight / 2 + 10,
          slotWidth / 2 + 4,
          -slotHeight / 2 + 10,
          0,
          -slotHeight / 2 - 18
        );

        slotContainer.add(slotGfx);
        slotContainer.setData('color', color);
        slotContainer.setData('width', slotWidth);
        slotContainer.setData('height', slotHeight);
        this.roundGroup.add(slotContainer);

        this.target(
          color,
          cell.x,
          cell.y,
          slotWidth,
          slotHeight,
          'drop-zone'
        );
        slots.push(slotContainer);
      });

      window.AprincarInputGestures.attachTapOrDrag(this, pieceContainer, {
        threshold: 10,
        onDrag: (pointer) => {
          if (this.locked) return;
          pieceContainer.x = pointer.x;
          pieceContainer.y = pointer.y;
          this.updateState({ lastGesture: 'drag' });
        },
        onDragEnd: () => {
          if (this.locked) {
            this.restorePiece(pieceContainer, stage.centerX, sourceY);
            return;
          }

          const hit = slots.find((slot) => {
            const width = slot.getData('width');
            const height = slot.getData('height');
            return Phaser.Geom.Rectangle.Contains(
              new Phaser.Geom.Rectangle(
                slot.x - width / 2,
                slot.y - height / 2,
                width,
                height
              ),
              pieceContainer.x,
              pieceContainer.y
            );
          });

          const selected = hit?.getData('color') ?? null;
          const ok = selected === this.challenge.answer;
          this.submitResult(ok, {
            target: this.challenge.answer,
            selected,
            interaction: 'drag'
          });

          if (!ok) {
            this.restorePiece(pieceContainer, stage.centerX, sourceY, true);
          }
        }
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'color',
        variant: 'colors',
        familyId: 'creative',
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

    restorePiece(piece, x, y, tween = false) {
      if (tween) {
        this.tweens.add({
          targets: piece,
          x,
          y,
          duration: 260,
          ease: 'Back.easeOut'
        });
        return;
      }
      piece.x = x;
      piece.y = y;
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(ColorMatchScene));
})();
