// Pintura por Cores — Livro de Colorir
(() => {
  const { C, FONT } = window.AprincarConstants;
  const CFG = window.APRINCAR_GAME_CONFIG;

  const PALETTE = [
    { name: 'azul', color: C.blue, symbol: '●' },
    { name: 'amarelo', color: C.sun, symbol: '★' },
    { name: 'verde', color: C.leaf, symbol: '▲' },
    { name: 'coral', color: C.coral, symbol: '■' }
  ];

  class GuidedPaintingScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);
      this.promptText.setText('Escolha a tinta e pinte cada desenho pela pista de cor + símbolo');

      const layout = this.layout;
      const stage = layout.stage;
      const paletteHeight = layout.portrait ? 96 : 72;
      const buttonHeight = Math.max(layout.touchTarget, 58);
      const canvasTop = stage.top + paletteHeight + 10;
      const canvasBottom = stage.bottom - buttonHeight - 18;
      const canvasBounds = {
        left: stage.left,
        top: canvasTop,
        width: stage.width,
        height: Math.max(210, canvasBottom - canvasTop)
      };

      const paletteBounds = {
        left: stage.left,
        top: stage.top,
        width: stage.width,
        height: paletteHeight
      };
      const cells = window.AprincarLayout.row(PALETTE.length, paletteBounds, {
        gap: 8,
        minWidth: layout.touchTarget,
        maxWidth: 72
      });

      this.selected = PALETTE[0];
      this.painted = {};
      this.regionObjects = new Map();

      PALETTE.forEach((entry, index) => {
        const cell = cells[index];
        const size = Math.max(layout.touchTarget, Math.min(cell.width, cell.height, 64));
        const swatch = this.add.circle(cell.x, cell.y, size / 2 - 3, entry.color)
          .setStrokeStyle(3, entry.name === this.selected.name ? C.ink : 0xffffff)
          .setInteractive({ useHandCursor: true });
        const label = this.add.text(cell.x, cell.y, entry.symbol, {
          fontFamily: FONT,
          fontSize: `${Math.round(size * 0.40)}px`,
          fontStyle: 'bold',
          color: entry.name === 'amarelo' ? '#5b4200' : '#ffffff'
        }).setOrigin(0.5);
        this.roundGroup.add([swatch, label]);
        this.target(entry.name, cell.x, cell.y, size, size, 'palette-choice');
        swatch.on('pointerup', () => {
          if (this.locked) return;
          this.selected = entry;
          this.updateState({ selectedColor: entry.name, lastGesture: 'tap-color' });
        });
      });

      const roundShift = (this.level - 1) % PALETTE.length;
      const requirements = [
        PALETTE[(0 + roundShift) % PALETTE.length],
        PALETTE[(1 + roundShift) % PALETTE.length],
        PALETTE[(2 + roundShift) % PALETTE.length]
      ];

      const regions = [
        { id: 'circulo', type: 'circle', x: 0.24, y: 0.42, w: 0.25, h: 0.34, target: requirements[0] },
        { id: 'quadrado', type: 'rect', x: 0.72, y: 0.40, w: 0.30, h: 0.30, target: requirements[1] },
        { id: 'jardim', type: 'rect', x: 0.50, y: 0.78, w: 0.58, h: 0.20, target: requirements[2] }
      ];

      const board = this.add.graphics();
      board.fillStyle(0xffffff, 1);
      board.fillRoundedRect(canvasBounds.left, canvasBounds.top, canvasBounds.width, canvasBounds.height, 18);
      board.lineStyle(3, 0xe2e8f0, 1);
      board.strokeRoundedRect(canvasBounds.left, canvasBounds.top, canvasBounds.width, canvasBounds.height, 18);
      this.roundGroup.add(board);

      for (const region of regions) {
        const x = canvasBounds.left + region.x * canvasBounds.width;
        const y = canvasBounds.top + region.y * canvasBounds.height;
        const w = Math.max(layout.touchTarget, region.w * canvasBounds.width);
        const h = Math.max(layout.touchTarget, region.h * canvasBounds.height);
        let shape;
        if (region.type === 'circle') {
          shape = this.add.circle(x, y, Math.min(w, h) / 2, 0xf8fafc)
            .setStrokeStyle(4, 0x94a3b8);
        } else {
          shape = this.add.rectangle(x, y, w, h, 0xf8fafc)
            .setStrokeStyle(4, 0x94a3b8);
        }
        shape.setInteractive({ useHandCursor: true });

        const cue = this.add.circle(x, y - h / 2 + 18, 14, region.target.color)
          .setStrokeStyle(2, 0xffffff);
        const cueSymbol = this.add.text(x, y - h / 2 + 18, region.target.symbol, {
          fontFamily: FONT,
          fontSize: '12px',
          fontStyle: 'bold',
          color: region.target.name === 'amarelo' ? '#5b4200' : '#ffffff'
        }).setOrigin(0.5);

        this.roundGroup.add([shape, cue, cueSymbol]);
        this.regionObjects.set(region.id, shape);
        this.target(region.id, x, y, w, h, 'paint-region');

        shape.on('pointerup', () => {
          if (this.locked) return;
          shape.setFillStyle(this.selected.color, 1);
          this.painted[region.id] = this.selected.name;
          this.publish(regions, canvasBounds, 'paint-region');
        });
      }

      const check = this.addCardButton(
        stage.centerX,
        stage.bottom - buttonHeight / 2 - 3,
        Math.min(stage.width * 0.72, 260),
        buttonHeight,
        'Conferir pintura',
        '__check__',
        C.sun,
        'action'
      );
      check.removeAllListeners('pointerup');
      check.on('pointerup', async () => {
        if (this.locked) return;
        const correct = regions.filter((region) => this.painted[region.id] === region.target.name).length;
        const score = correct / regions.length;
        await this.submitResult(score === 1, {
          correctRegions: correct,
          totalRegions: regions.length,
          paintedRegions: Object.keys(this.painted).length
        });
      });

      this.challenge = {
        answer: 'all-regions-correct',
        difficulty: Math.min(0.75, 0.25 + this.level * 0.07)
      };
      this.publish(regions, canvasBounds, 'ready');
    }

    publish(regions, canvasBounds, lastGesture) {
      const layout = this.layout;
      this.updateState({
        mode: CFG.mode,
        variant: 'guided',
        familyId: 'creative',
        objective: CFG.objective,
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        painted: { ...this.painted },
        regionRequirements: regions.map((region) => ({
          id: region.id,
          color: region.target.name,
          symbol: region.target.symbol
        })),
        canvasBounds,
        selectedColor: this.selected.name,
        lastGesture,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
        inputReady: !this.locked
      });
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(GuidedPaintingScene));
})();
