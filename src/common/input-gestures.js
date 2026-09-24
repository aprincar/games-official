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

      this.isDragging = false;
      this.isDown = false;
      this.gestureHandled = false;

      this.setup();
    }

    setup() {
      this.gameObject.setInteractive({ draggable: true, useHandCursor: true });
      this.scene.input.setDraggable(this.gameObject);
      this.scene.input.dragDistanceThreshold = Math.max(
        this.scene.input.dragDistanceThreshold || 0,
        this.threshold
      );

      this.handlePointerDown = () => {
        this.isDragging = false;
        this.isDown = true;
        this.gestureHandled = false;
      };

      this.handleDragStart = (pointer, gameObject) => {
        if (gameObject !== this.gameObject || !this.isDown) return;
        this.isDragging = true;
        if (this.onDragStart) this.onDragStart(pointer, this.gameObject);
      };

      this.handleDrag = (pointer, gameObject, dragX, dragY) => {
        if (gameObject !== this.gameObject || !this.isDragging) return;
        if (this.onDrag) this.onDrag(pointer, this.gameObject, dragX, dragY);
      };

      this.handleDragEnd = (pointer, gameObject) => {
        if (gameObject !== this.gameObject || !this.isDragging) return;
        if (this.onDragEnd) this.onDragEnd(pointer, this.gameObject);
        this.gestureHandled = true;
        this.isDown = false;
        this.isDragging = false;
      };

      this.handlePointerUp = (pointer) => {
        if (this.isDragging) return;
        if (this.isDown && !this.gestureHandled && this.onTap) {
          this.onTap(pointer, this.gameObject);
        }
        this.isDown = false;
        this.isDragging = false;
        this.gestureHandled = false;
      };

      this.gameObject.on('pointerdown', this.handlePointerDown);
      this.gameObject.on('pointerup', this.handlePointerUp);
      this.scene.input.on('dragstart', this.handleDragStart);
      this.scene.input.on('drag', this.handleDrag);
      this.scene.input.on('dragend', this.handleDragEnd);
    }

    destroy() {
      this.gameObject.off('pointerdown', this.handlePointerDown);
      this.gameObject.off('pointerup', this.handlePointerUp);
      this.scene.input.off('dragstart', this.handleDragStart);
      this.scene.input.off('drag', this.handleDrag);
      this.scene.input.off('dragend', this.handleDragEnd);
    }
  }

  window.AprincarInputGestures = {
    TapOrDragController,
    attachTapOrDrag(scene, gameObject, options) {
      return new TapOrDragController(scene, gameObject, options);
    }
  };
})();
