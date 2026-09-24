// Conte os Bichos — Safari dos Bichos
(() => {
  const { C, FONT } = window.AprincarConstants;
  const ANIMAL_TYPES = ['lion', 'elephant', 'monkey', 'giraffe', 'panda'];

  class CountingAnimalsScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);

      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateCountingChallenge({
        rng,
        seed,
        level: this.level,
        theme: 'animals'
      });

      const layout = this.layout;
      const stage = layout.stage;
      const items = this.challenge.items || [];
      const count = items.length;
      const animalType = ANIMAL_TYPES[(this.level - 1) % ANIMAL_TYPES.length];

      this.tappedAnimals = 0;
      this.promptText.setText('Conte os bichos. Quantos tem aqui?');

      const choiceHeight = Math.max(layout.touchTarget, 58);
      const choiceTop = stage.bottom - choiceHeight - 8;
      const animalArea = {
        left: stage.left,
        top: stage.top + 8,
        width: stage.width,
        height: Math.max(180, choiceTop - stage.top - 24),
      };

      const savannaBg = this.add.graphics();
      savannaBg.fillStyle(0xfef3c7, 0.42);
      savannaBg.fillRoundedRect(
        animalArea.left,
        animalArea.top,
        animalArea.width,
        animalArea.height,
        20
      );
      savannaBg.lineStyle(2, 0xfde68a, 0.85);
      savannaBg.strokeRoundedRect(
        animalArea.left,
        animalArea.top,
        animalArea.width,
        animalArea.height,
        20
      );
      this.roundGroup.add(savannaBg);

      const cols = window.AprincarLayout.columnsFor(
        count,
        layout,
        layout.portrait ? 4 : 5
      );
      const grid = window.AprincarLayout.grid(count, animalArea, {
        cols,
        gapX: layout.portrait ? 8 : 14,
        gapY: layout.portrait ? 8 : 12
      });

      items.forEach((_, index) => {
        const cell = grid.points[index];
        const visualSize = window.AprincarLayout.clamp(
          Math.min(cell.width, cell.height) * 0.72,
          52,
          layout.portrait ? 76 : 88
        );
        const hitSize = Math.max(layout.touchTarget, visualSize + 10);

        const animalContainer = this.add.container(cell.x, cell.y);
        const animalGfx = this.add.graphics();
        window.AprincarVectorArt.drawAnimal(
          animalGfx,
          animalType,
          0,
          0,
          visualSize
        );

        const hitZone = this.add
          .circle(0, 0, hitSize / 2, 0xffffff, 0.001)
          .setInteractive({ useHandCursor: true });

        animalContainer.add([animalGfx, hitZone]);
        this.roundGroup.add(animalContainer);
        this.target(
          `animal-${index + 1}`,
          cell.x,
          cell.y,
          hitSize,
          hitSize,
          'animal'
        );

        this.tweens.add({
          targets: animalContainer,
          scaleY: 1.045,
          duration: 900 + (index % 3) * 150,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        hitZone.on('pointerdown', () => {
          if (this.locked) return;

          if (!animalContainer.getData('counted')) {
            animalContainer.setData('counted', true);
            this.tappedAnimals += 1;

            const badge = this.add.text(
              cell.x + visualSize * 0.28,
              cell.y - visualSize * 0.34,
              String(this.tappedAnimals),
              {
                fontFamily: FONT,
                fontSize: layout.portrait ? '17px' : '20px',
                fontStyle: 'bold',
                color: '#166534',
                backgroundColor: '#dcfce7',
                padding: { x: 5, y: 3 }
              }
            ).setOrigin(0.5);

            this.roundGroup.add(badge);
            this.updateState({
              tappedAnimals: this.tappedAnimals,
              lastGesture: 'tap-animal'
            });
          }

          if (window.AprincarAudio) window.AprincarAudio.pop();
          this.tweens.add({
            targets: animalContainer,
            scale: 1.18,
            duration: 120,
            yoyo: true,
            ease: 'Back.easeOut'
          });
        });
      });

      const options = this.challenge.options || [count];
      const choiceBounds = {
        left: stage.left,
        top: choiceTop,
        width: stage.width,
        height: choiceHeight
      };
      const choices = window.AprincarLayout.row(options.length, choiceBounds, {
        gap: layout.portrait ? 8 : 14,
        minWidth: layout.touchTarget,
        maxWidth: layout.portrait ? 82 : 108
      });

      options.forEach((value, index) => {
        const slot = choices[index];
        this.addCardButton(
          slot.x,
          slot.y,
          slot.width,
          choiceHeight,
          String(value),
          value,
          C.white,
          'choice'
        );
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'counting',
        variant: 'animals',
        familyId: 'quantities',
        objective: window.APRINCAR_GAME_CONFIG.objective,
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
        tappedAnimals: this.tappedAnimals,
        attempts: this.attempts,
        inputReady: true
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(CountingAnimalsScene));
})();
