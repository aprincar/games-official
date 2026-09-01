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
      this.challenge = generateCountingChallenge({ rng, seed, level: this.level, theme: 'animals' });
      
      this.promptText.setText('Conte os bichos e escolha a quantidade correta');

      // Backdrop da savana
      const savannaBg = this.add.graphics();
      savannaBg.fillStyle(0xfef3c7, 0.4);
      savannaBg.fillRoundedRect(60, 160, 840, 260, 20);
      savannaBg.lineStyle(2, 0xfde68a, 0.8);
      savannaBg.strokeRoundedRect(60, 160, 840, 260, 20);
      this.roundGroup.add(savannaBg);

      const items = this.challenge.items || [];
      this.tappedAnimals = 0;
      const count = items.length;
      const cols = Math.min(5, Math.ceil(Math.sqrt(count)));
      const rows = Math.ceil(count / cols);
      const animalType = ANIMAL_TYPES[(this.level - 1) % ANIMAL_TYPES.length];

      items.forEach((_, i) => {
        const x = 480 - ((cols - 1) * 110) / 2 + (i % cols) * 110;
        const y = 235 + Math.floor(i / cols) * 95;

        const animalContainer = this.add.container(x, y);
        const animalGfx = this.add.graphics();
        window.AprincarVectorArt.drawAnimal(animalGfx, animalType, 0, 0, 72);
        
        // Touch hit area
        const hitZone = this.add.circle(0, 0, 42, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        animalContainer.add([animalGfx, hitZone]);
        this.roundGroup.add(animalContainer);
        this.target(`animal-${i + 1}`, x, y, 88, 88, 'animal');

        // Idle breathing tween
        this.tweens.add({
          targets: animalContainer,
          scaleY: 1.05,
          duration: 900 + (i % 3) * 150,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        hitZone.on('pointerdown', () => {
          if (!animalContainer.getData('counted')) {
            animalContainer.setData('counted', true);
            this.tappedAnimals += 1;
            this.add.text(x + 25, y - 28, String(this.tappedAnimals), { fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#166534', backgroundColor: '#dcfce7', padding: { x: 6, y: 3 } }).setOrigin(0.5);
            this.updateState({ tappedAnimals: this.tappedAnimals, lastGesture: 'tap-animal' });
          }
          if (window.AprincarAudio) window.AprincarAudio.pop();
          this.tweens.add({
            targets: animalContainer,
            scale: 1.25,
            duration: 120,
            yoyo: true,
            ease: 'Back.easeOut'
          });
        });
      });

      // Opções numéricas
      const optY = rows > 1 ? 485 : 455;
      const options = this.challenge.options || [count];
      options.forEach((n, i) => {
        const x = 480 + (i - (options.length - 1) / 2) * 125;
        this.addCardButton(x, optY, 100, 72, String(n), n, C.white, 'choice');
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'counting',
        variant: 'animals',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        inputReady: true
      };
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(CountingAnimalsScene));
})();
