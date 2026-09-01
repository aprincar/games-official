// Mundo das Cores — Ateliê das Cores
(() => {
  const { C, FONT } = window.AprincarConstants;
  const COLOR_HEX = { violet: C.purple, coral: C.coral, sun: C.sun, leaf: C.leaf, sky: C.sky };
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

      this.promptText.setText(`Leve a peça até a cor ${this.challenge.label}`);

      // Peça arrastável com objeto ilustrado
      const itemType = COLOR_ITEMS[this.challenge.answer] || 'car';
      const pieceContainer = this.add.container(180, 320);
      const pieceGfx = this.add.graphics();
      // Glow base
      pieceGfx.fillStyle(COLOR_HEX[this.challenge.answer] || C.blue, 0.25);
      pieceGfx.fillCircle(0, 0, 56);
      pieceGfx.lineStyle(3, COLOR_HEX[this.challenge.answer] || C.blue, 0.9);
      pieceGfx.strokeCircle(0, 0, 52);
      // Item ilustrado
      window.AprincarVectorArt.drawColorItem(pieceGfx, itemType, 0, 0, 72);

      const hitZone = this.add.circle(0, 0, 52, 0xffffff, 0.001).setInteractive({ draggable: true, useHandCursor: true });
      this.input.setDraggable(hitZone);
      pieceContainer.add([pieceGfx, hitZone]);
      this.roundGroup.add(pieceContainer);

      this.target('source', 180, 320, 108, 108, 'drag-source');

      // Casinhas de Cores (Drop Zones)
      const slots = [];
      const options = this.challenge.options || [];
      options.forEach((color, i) => {
        const x = 440 + i * 140;
        const slotContainer = this.add.container(x, 320);
        const slotGfx = this.add.graphics();
        const hex = COLOR_HEX[color] || C.purple;

        // Casinha estilizada
        slotGfx.fillStyle(hex, 0.18);
        slotGfx.fillRoundedRect(-55, -60, 110, 120, 16);
        slotGfx.lineStyle(4, hex, 0.9);
        slotGfx.strokeRoundedRect(-55, -60, 110, 120, 16);
        // Telhado da casinha
        slotGfx.fillStyle(hex, 0.85);
        slotGfx.fillTriangle(-60, -60, 60, -60, 0, -95);

        slotContainer.add(slotGfx);
        slotContainer.setData('color', color);
        this.roundGroup.add(slotContainer);

        this.target(color, x, 320, 110, 120, 'drop-zone');
        slots.push(slotContainer);
      });

      this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (gameObject === hitZone) {
          pieceContainer.x = pointer.x;
          pieceContainer.y = pointer.y;
        }
      });

      this.input.on('dragend', (pointer, gameObject) => {
        if (gameObject !== hitZone) return;

        const hit = slots.find(s => {
          const bounds = new Phaser.Geom.Rectangle(s.x - 55, s.y - 60, 110, 120);
          return Phaser.Geom.Intersects.CircleToRectangle(new Phaser.Geom.Circle(pieceContainer.x, pieceContainer.y, 40), bounds);
        });

        const ok = !!hit && hit.getData('color') === this.challenge.answer;
        this.submitResult(ok, { target: this.challenge.answer, selected: hit?.getData('color') ?? null });

        if (!ok) {
          if (window.AprincarAudio) window.AprincarAudio.softError();
          this.tweens.add({
            targets: pieceContainer,
            x: 180,
            y: 320,
            duration: 320,
            ease: 'Back.easeOut'
          });
        }
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'color',
        variant: 'colors',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        inputReady: true
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(ColorMatchScene));
})();
