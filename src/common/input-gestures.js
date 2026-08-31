// TapOrDragController and Input Gestures Primitive for Aprincar Games
(() => {
  class TapOrDragController {
    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.GameObject} gameObject
     * @param {Object} options
     * @param {number} [options.threshold=10]
     * @param {Function} [options.onTap]
     * @param {Function} [options.onDragStart]
     * @param {Function} [options.onDrag]
     * @param {Function} [options.onDragEnd]
     */
    constructor(scene, gameObject, options = {}) {
      this.scene = scene;
      this.gameObject = gameObject;
      this.threshold = options.threshold ?? 10;
      this.onTap = options.onTap;
      this.onDragStart = options.onDragStart;
      this.onDrag = options.onDrag;
      this.onDragEnd = options.onDragEnd;

      this.downX = 0;
      this.downY = 0;
      this.isDragging = false;
      this.isDown = false;

      this.setup();
    }

    setup() {
      this.gameObject.setInteractive({ draggable: true, useHandCursor: true });
      this.scene.input.setDraggable(this.gameObject);

      this.gameObject.on('pointerdown', (pointer) => {
        this.downX = pointer.x;
        this.downY = pointer.y;
        this.isDragging = false;
        this.isDown = true;
      });

      this.gameObject.on('dragstart', (pointer) => {
        const dist = Phaser.Math.Distance.Between(this.downX, this.downY, pointer.x, pointer.y);
        if (dist >= this.threshold) {
          this.isDragging = true;
          if (this.onDragStart) this.onDragStart(pointer, this.gameObject);
        }
      });

      this.gameObject.on('drag', (pointer, dragX, dragY) => {
        const dist = Phaser.Math.Distance.Between(this.downX, this.downY, pointer.x, pointer.y);
        if (!this.isDragging && dist >= this.threshold) {
          this.isDragging = true;
          if (this.onDragStart) this.onDragStart(pointer, this.gameObject);
        }
        if (this.isDragging && this.onDrag) {
          this.onDrag(pointer, this.gameObject, dragX, dragY);
        }
      });

      this.gameObject.on('dragend', (pointer) => {
        if (this.isDragging) {
          if (this.onDragEnd) this.onDragEnd(pointer, this.gameObject);
        }
      });

      this.gameObject.on('pointerup', (pointer) => {
        const dist = Phaser.Math.Distance.Between(this.downX, this.downY, pointer.x, pointer.y);
        if (!this.isDragging && dist < this.threshold) {
          if (this.onTap) this.onTap(pointer, this.gameObject);
        }
        this.isDown = false;
        this.isDragging = false;
      });
    }

    destroy() {
      this.gameObject.off('pointerdown');
      this.gameObject.off('dragstart');
      this.gameObject.off('drag');
      this.gameObject.off('dragend');
      this.gameObject.off('pointerup');
    }
  }

  window.AprincarInputGestures = {
    TapOrDragController,
    attachTapOrDrag(scene, gameObject, options) {
      return new TapOrDragController(scene, gameObject, options);
    }
  };
})();
