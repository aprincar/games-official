// Cesta de Frutas — Feira da Cesta
(() => {
  const { C, FONT } = window.AprincarConstants;
  const FRUIT_TYPES = ['apple', 'orange', 'strawberry', 'banana'];

  class FruitBasketScene extends window.AprincarBaseScene {
    nextRound() {
      this.clearRound();
      this.levelText.setText(`Fase ${this.level}`);
      const seed = (Date.now() % 100000) + this.level * 97;
      const rng = createSeededRandom(seed);
      this.challenge = generateCountingChallenge({ rng, seed, level: this.level, theme: 'fruit' });
      this.selected = 0;
      this.basket = [];
      this.fruits = [];

      this.promptText.setText(`Coloque ${this.challenge.answer} frutas na cesta`);

      const basketContainer = this.add.container(480, 430);
      const basketGfx = this.add.graphics();
      basketGfx.fillStyle(0xc98749, 1);
      basketGfx.fillRoundedRect(-140, -45, 280, 90, 16);
      basketGfx.lineStyle(4, 0x8f5b2c, 1);
      basketGfx.strokeRoundedRect(-140, -45, 280, 90, 16);
      basketGfx.lineStyle(2, 0x8f5b2c, 0.45);
      for (let x = -110; x <= 110; x += 30) basketGfx.lineBetween(x, -40, x, 40);

      this.counter = this.add.text(0, 0, '0', {
        fontFamily: FONT,
        fontSize: '46px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      basketContainer.add([basketGfx, this.counter]);
      this.roundGroup.add(basketContainer);

      const count = Math.min(10, this.challenge.answer + 3);
      for (let i = 0; i < count; i++) {
        const x = 200 + (i % 5) * 140;
        const y = 205 + Math.floor(i / 5) * 90;
        const fruitType = FRUIT_TYPES[i % FRUIT_TYPES.length];

        const fruitContainer = this.add.container(x, y);
        const fruitGfx = this.add.graphics();
        window.AprincarVectorArt.drawFruit(fruitGfx, fruitType, 0, 0, 58);
        const hitZone = this.add.circle(0, 0, 44, 0xffffff, 0.001);
        fruitContainer.add([fruitGfx, hitZone]);
        fruitContainer.setSize(88, 88);
        this.roundGroup.add(fruitContainer);

        const fruit = {
          id: `fruit-${i + 1}`,
          container: fruitContainer,
          homeX: x,
          homeY: y
        };
        this.fruits.push(fruit);

        this.target(fruit.id, x, y, 88, 88, 'drag-source');
        this.target(fruit.id, x, y, 88, 88, 'toggle');

        window.AprincarInputGestures.attachTapOrDrag(this, fruitContainer, {
          threshold: 10,
          onDrag: (pointer) => {
            if (this.locked) return;
            fruitContainer.x = pointer.x;
            fruitContainer.y = pointer.y;
          },
          onDragEnd: () => {
            if (this.locked) {
              this.syncFruit(fruit);
              return;
            }

            const inBasket = Phaser.Geom.Rectangle.Contains(
              new Phaser.Geom.Rectangle(340, 365, 280, 130),
              fruitContainer.x,
              fruitContainer.y
            );

            if (inBasket) {
              this.placeFruit(fruit);
              if (window.AprincarAudio) window.AprincarAudio.drop();
            } else if (fruitContainer.getData('picked') === true) {
              this.removeFruit(fruit);
              if (window.AprincarAudio) window.AprincarAudio.pop();
            } else {
              this.restoreFruit(fruit);
            }

            this.publishFruits('drag');
          },
          onTap: () => {
            if (this.locked) return;

            if (fruitContainer.getData('picked') === true) {
              this.removeFruit(fruit);
              if (window.AprincarAudio) window.AprincarAudio.pop();
              this.publishFruits('tap-remove');
              return;
            }

            this.placeFruit(fruit);
            this.tweens.add({ targets: basketContainer, scale: 1.06, duration: 100, yoyo: true });
            if (window.AprincarAudio) window.AprincarAudio.drop();
            this.publishFruits('tap-fallback');
          }
        });
      }

      this.target('basket', 480, 430, 300, 150, 'drop-zone');
      const check = this.addCardButton(480, 535, 200, 60, 'Conferir', '__check__', C.sun, 'action');
      check.removeAllListeners('pointerup');
      check.on('pointerup', () => {
        if (this.locked) return;
        const ok = this.selected === this.challenge.answer;
        this.submitResult(ok, { selected: this.selected, target: this.challenge.answer });
      });

      window.__APRINCAR_GAME_STATE__ = {
        mode: 'counting',
        variant: 'fruit',
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        selectedCount: this.selected,
        fruitStates: this.fruitSnapshot(),
        attempts: this.attempts,
        inputReady: true
      };
    }

    placeFruit(fruit) {
      if (fruit.container.getData('picked') !== true) {
        fruit.container.setData('picked', true);
        this.basket.push(fruit);
      }
      this.syncBasket();
    }

    removeFruit(fruit) {
      fruit.container.setData('picked', false);
      this.basket = this.basket.filter((item) => item !== fruit);
      this.restoreFruit(fruit);
      this.syncBasket();
    }

    restoreFruit(fruit) {
      fruit.container.x = fruit.homeX;
      fruit.container.y = fruit.homeY;
      fruit.container.setAlpha(1);
      fruit.container.setScale(1);
    }

    syncFruit(fruit) {
      if (fruit.container.getData('picked') === true) this.syncBasket();
      else this.restoreFruit(fruit);
    }

    syncBasket() {
      this.basket.forEach((fruit, index) => {
        fruit.container.x = 380 + (index % 5) * 50;
        fruit.container.y = 405 + Math.floor(index / 5) * 42;
        fruit.container.setAlpha(1);
        fruit.container.setScale(0.82);
      });
      this.selected = this.basket.length;
      this.counter.setText(String(this.selected));
    }

    fruitSnapshot() {
      return this.fruits.map((fruit) => ({
        id: fruit.id,
        picked: fruit.container.getData('picked') === true,
        x: fruit.container.x,
        y: fruit.container.y,
        homeX: fruit.homeX,
        homeY: fruit.homeY,
        basketIndex: this.basket.indexOf(fruit)
      }));
    }

    publishFruits(lastGesture) {
      this.updateState({
        selectedCount: this.selected,
        fruitStates: this.fruitSnapshot(),
        lastGesture,
        inputReady: !this.locked
      });
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(FruitBasketScene));
})();
