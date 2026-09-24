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
      this.challenge = generateCountingChallenge({
        rng,
        seed,
        level: this.level,
        theme: 'fruit'
      });

      const layout = this.layout;
      const stage = layout.stage;

      this.selected = 0;
      this.basket = [];
      this.fruits = [];
      this.promptText.setText(`Coloque ${this.challenge.answer} frutas na cesta`);

      const buttonHeight = Math.max(layout.touchTarget, 58);
      const basketWidth = window.AprincarLayout.clamp(
        stage.width * 0.82,
        250,
        layout.portrait ? 330 : 380
      );
      const basketHeight = window.AprincarLayout.clamp(
        stage.height * 0.17,
        88,
        118
      );
      const basketY = stage.top + stage.height * 0.67;

      this.basketBounds = {
        left: stage.centerX - basketWidth / 2,
        top: basketY - basketHeight / 2,
        width: basketWidth,
        height: basketHeight
      };

      const basketContainer = this.add.container(stage.centerX, basketY);
      const basketGfx = this.add.graphics();
      basketGfx.fillStyle(0xc98749, 1);
      basketGfx.fillRoundedRect(
        -basketWidth / 2,
        -basketHeight / 2,
        basketWidth,
        basketHeight,
        16
      );
      basketGfx.lineStyle(4, 0x8f5b2c, 1);
      basketGfx.strokeRoundedRect(
        -basketWidth / 2,
        -basketHeight / 2,
        basketWidth,
        basketHeight,
        16
      );
      basketGfx.lineStyle(2, 0x8f5b2c, 0.4);
      for (
        let x = -basketWidth / 2 + 28;
        x <= basketWidth / 2 - 28;
        x += Math.max(28, basketWidth / 9)
      ) {
        basketGfx.lineBetween(
          x,
          -basketHeight / 2 + 8,
          x,
          basketHeight / 2 - 8
        );
      }

      this.counter = this.add.text(0, 0, '0', {
        fontFamily: FONT,
        fontSize: layout.portrait ? '36px' : '42px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);

      basketContainer.add([basketGfx, this.counter]);
      this.roundGroup.add(basketContainer);

      const count = Math.min(10, this.challenge.answer + 3);
      const fruitArea = {
        left: stage.left,
        top: stage.top + 6,
        width: stage.width,
        height: Math.max(170, stage.height * 0.43)
      };
      const cols = window.AprincarLayout.columnsFor(
        count,
        layout,
        layout.portrait ? 4 : 5
      );
      const fruitGrid = window.AprincarLayout.grid(count, fruitArea, {
        cols,
        gapX: layout.portrait ? 8 : 14,
        gapY: layout.portrait ? 8 : 12
      });

      const slotCols = Math.min(5, count);
      const slotRows = Math.ceil(count / slotCols);
      const slotWidth = basketWidth / slotCols;
      const slotHeight = basketHeight / Math.max(1, slotRows);
      this.basketSlots = Array.from({ length: count }, (_, index) => {
        const col = index % slotCols;
        const row = Math.floor(index / slotCols);
        return {
          x:
            this.basketBounds.left +
            slotWidth * col +
            slotWidth / 2,
          y:
            this.basketBounds.top +
            slotHeight * row +
            slotHeight / 2
        };
      });

      for (let index = 0; index < count; index += 1) {
        const cell = fruitGrid.points[index];
        const fruitType = FRUIT_TYPES[index % FRUIT_TYPES.length];
        const visualSize = window.AprincarLayout.clamp(
          Math.min(cell.width, cell.height) * 0.64,
          46,
          layout.portrait ? 62 : 70
        );
        const hitSize = Math.max(layout.touchTarget, visualSize + 10);

        const fruitContainer = this.add.container(cell.x, cell.y);
        const fruitGfx = this.add.graphics();
        window.AprincarVectorArt.drawFruit(
          fruitGfx,
          fruitType,
          0,
          0,
          visualSize
        );

        const hitZone = this.add.circle(0, 0, hitSize / 2, 0xffffff, 0.001);
        fruitContainer.add([fruitGfx, hitZone]);
        fruitContainer.setSize(hitSize, hitSize);
        this.roundGroup.add(fruitContainer);

        const fruit = {
          id: `fruit-${index + 1}`,
          container: fruitContainer,
          homeX: cell.x,
          homeY: cell.y,
          visualSize
        };
        this.fruits.push(fruit);

        this.target(fruit.id, cell.x, cell.y, hitSize, hitSize, 'drag-source');
        this.target(fruit.id, cell.x, cell.y, hitSize, hitSize, 'toggle');

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
              new Phaser.Geom.Rectangle(
                this.basketBounds.left,
                this.basketBounds.top,
                this.basketBounds.width,
                this.basketBounds.height
              ),
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
            this.tweens.add({
              targets: basketContainer,
              scale: 1.04,
              duration: 100,
              yoyo: true
            });
            if (window.AprincarAudio) window.AprincarAudio.drop();
            this.publishFruits('tap-fallback');
          }
        });
      }

      this.target(
        'basket',
        stage.centerX,
        basketY,
        basketWidth,
        basketHeight,
        'drop-zone'
      );

      const check = this.addCardButton(
        stage.centerX,
        stage.bottom - buttonHeight / 2 - 4,
        Math.min(stage.width * 0.68, 230),
        buttonHeight,
        'Conferir',
        '__check__',
        C.sun,
        'action'
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
        variant: 'fruit',
        familyId: 'quantities',
        objective: window.APRINCAR_GAME_CONFIG.objective,
        level: this.level,
        challenge: this.challenge,
        targets: this.testTargets,
        selectedCount: this.selected,
        fruitStates: this.fruitSnapshot(),
        basketBounds: this.basketBounds,
        viewport: {
          width: layout.width,
          height: layout.height,
          portrait: layout.portrait
        },
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
        const slot = this.basketSlots[index];
        fruit.container.x = slot.x;
        fruit.container.y = slot.y;
        fruit.container.setAlpha(1);
        fruit.container.setScale(this.layout.portrait ? 0.74 : 0.82);
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
        basketBounds: this.basketBounds,
        lastGesture,
        inputReady: !this.locked
      });
    }
  }

  new Phaser.Game(window.createAprincarPhaserConfig(FruitBasketScene));
})();
