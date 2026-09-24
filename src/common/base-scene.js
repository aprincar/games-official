// Base Game Scene providing standardized infrastructure and SDK bridge
(() => {
  const CFG = window.APRINCAR_GAME_CONFIG;
  const BRAND = window.APRINCAR_BRAND;
  const FONT = BRAND.fontFamily;
  const C = {
    bg: 0xf7f6f2,
    purple: 0x8b5cf6,
    blue: 0x2563eb,
    coral: 0xf43f5e,
    orange: 0xfb923c,
    sun: 0xfbcb24,
    leaf: 0x22c55e,
    sky: 0x38bdf8,
    ink: '#13203d',
    white: 0xffffff
  };

  class AprincarBaseScene extends Phaser.Scene {
    constructor(sceneKey = 'main') {
      super(sceneKey);
      this.level = 1;
      this.attempts = 0;
      this.consecutiveFailures = 0;
      this.locked = false;
      this.stars = 0;
      this.testTargets = [];
      this.challenge = null;
      this.mobileFirst = CFG.mobileFirst === true;
    }

    async create() {
      this.cameras.main.setBackgroundColor(C.bg);
      this.createChrome();

      if (this.mobileFirst) {
        this.scale.on('resize', () => {
          this.layoutChrome();
          if (typeof this.onViewportResize === 'function') this.onViewportResize();
        });
      }

      await aprincar.session.start({ mode: CFG.mode });
      this.nextRound();
    }

    createChrome() {
      this.headerBackground = this.add.rectangle(0, 0, 1, 1, C.white).setStrokeStyle(1, 0xe2dfd7);
      BRAND.addPhaser(this, this.mobileFirst ? 14 : 22, this.mobileFirst ? 14 : 16);

      this.titleText = this.add.text(0, 0, CFG.name, {
        fontFamily: FONT,
        fontSize: this.mobileFirst ? '20px' : '26px',
        fontStyle: 'bold',
        color: C.ink,
        align: 'center'
      }).setOrigin(0.5, 0);

      this.levelText = this.add.text(0, 0, 'Fase 1', {
        fontFamily: FONT,
        fontSize: this.mobileFirst ? '15px' : '18px',
        fontStyle: 'bold',
        color: '#6f5bd7'
      }).setOrigin(1, 0);

      this.promptText = this.add.text(0, 0, '', {
        fontFamily: FONT,
        fontSize: this.mobileFirst ? '23px' : '28px',
        fontStyle: 'bold',
        color: C.ink,
        align: 'center'
      }).setOrigin(0.5, 0);

      this.statusText = this.add.text(0, 0, '', {
        fontFamily: FONT,
        fontSize: this.mobileFirst ? '17px' : '22px',
        fontStyle: 'bold',
        color: '#5143a6',
        align: 'center'
      }).setOrigin(0.5);

      this.starText = this.add.text(0, 0, '⭐ 0', {
        fontFamily: FONT,
        fontSize: this.mobileFirst ? '17px' : '22px',
        fontStyle: 'bold',
        color: '#6f5bd7'
      });

      this.layoutChrome();
    }

    layoutChrome() {
      if (!this.mobileFirst) {
        this.headerBackground.setPosition(480, 50).setSize(960, 100);
        this.titleText.setPosition(480, 18).setWordWrapWidth(560);
        this.levelText.setPosition(910, 26);
        this.promptText.setPosition(480, 114).setWordWrapWidth(840);
        this.statusText.setPosition(480, 580).setWordWrapWidth(720);
        this.starText.setPosition(32, 574);
        return;
      }

      const layout = window.AprincarLayout.metrics(this);
      this.layout = layout;
      this.headerBackground
        .setPosition(layout.header.x, layout.header.y)
        .setSize(layout.header.width, layout.header.height);

      const titleWidth = Math.max(120, layout.width - 170);
      this.titleText
        .setPosition(layout.width / 2, 14)
        .setWordWrapWidth(titleWidth);

      this.levelText.setPosition(layout.width - layout.padding, 18);
      this.promptText
        .setPosition(layout.prompt.x, layout.prompt.y)
        .setWordWrapWidth(layout.prompt.width);

      this.statusText
        .setPosition(layout.footer.x, layout.height - 34)
        .setWordWrapWidth(Math.max(160, layout.footer.width - 110));

      this.starText.setPosition(layout.padding, layout.height - 42);
    }

    updateState(values = {}) {
      if (!window.__APRINCAR_GAME_STATE__) window.__APRINCAR_GAME_STATE__ = {};
      Object.assign(window.__APRINCAR_GAME_STATE__, values);
    }

    clearRound() {
      this.input.off('dragstart');
      this.input.off('drag');
      this.input.off('dragend');
      this.input.off('pointerdown');
      this.input.off('pointermove');
      this.input.off('pointerup');
      if (this.roundGroup) this.roundGroup.destroy(true);
      this.roundGroup = this.add.container(0, 0);
      this.statusText.setText('');
      this.locked = false;
      this.attempts = 0;
      this.consecutiveFailures = 0;
      this.testTargets = [];
      this.challenge = null;
      if (this.mobileFirst) this.layout = window.AprincarLayout.metrics(this);
    }

    target(value, x, y, w, h, kind) {
      this.testTargets.push({ value, x, y, w, h, kind });
    }

    addCardButton(x, y, w, h, label, value, color = C.white, kind = 'action') {
      if (this.mobileFirst) {
        const minimum = this.layout?.touchTarget ?? 52;
        w = Math.max(w, minimum);
        h = Math.max(h, minimum);
      }

      const box = this.add.rectangle(x, y, w, h, color)
        .setStrokeStyle(2, 0xe2dfd7)
        .setInteractive({ useHandCursor: true });

      const text = this.add.text(x, y, label, {
        fontFamily: FONT,
        fontSize: `${Math.min(this.mobileFirst ? 28 : 34, h * 0.44)}px`,
        fontStyle: 'bold',
        color: color === C.white ? C.ink : '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      this.roundGroup.add([box, text]);
      this.target(kind === 'action' ? label : value, x, y, w, h, kind);
      box.on('pointerup', () => this.choose(value, box));
      return box;
    }

    choose(value, source) {
      if (this.locked) return;
      this.submitResult(value === this.challenge.answer, {
        selected: value,
        target: this.challenge.answer,
        sourceX: source?.x
      });
    }

    async recordOutcome(result, metadata = {}, options = {}) {
      const failuresBeforeAttempt = this.consecutiveFailures;
      const assistance = options.assistance ??
        (result !== 'observed' && failuresBeforeAttempt >= 2 ? 'visual-cue' : 'none');
      const independent = options.independent ??
        (result === 'observed' ? true : failuresBeforeAttempt === 0);

      this.attempts += 1;
      const payload = {
        skillId: options.skillId ?? CFG.skillId,
        result,
        independent,
        assistance,
        difficulty: options.difficulty ?? this.challenge?.difficulty ?? 0.35,
        confidence: options.confidence ?? (result === 'failure' ? 0.8 : 0.95),
        attempts: this.attempts,
        metadata: { level: this.level, ...metadata }
      };

      const response = await aprincar.evidence.submit(payload);

      if (result === 'failure') this.consecutiveFailures += 1;
      else if (result === 'success') this.consecutiveFailures = 0;

      this.updateState({
        attempts: this.attempts,
        independent: payload.independent,
        assistance: payload.assistance
      });

      return response;
    }

    async recordEvidence(ok, metadata = {}) {
      return this.recordOutcome(ok ? 'success' : 'failure', metadata);
    }

    async submitResult(ok, metadata = {}) {
      if (this.locked) return;
      this.locked = true;
      this.updateState({ lastResult: ok ? 'success' : 'failure', inputReady: false });
      await this.recordEvidence(ok, metadata);

      if (ok) {
        this.stars += 2;
        this.starText.setText(`⭐ ${this.stars}`);
        if (window.AprincarFeedback) {
          const centerX = this.mobileFirst ? this.layout.stage.centerX : 480;
          const centerY = this.mobileFirst ? this.layout.stage.centerY : 320;
          window.AprincarFeedback.celebrate(this, centerX, centerY);
        }
        await aprincar.rewards.request({ reason: `${CFG.mode}-round`, amount: 2 });
        this.time.delayedCall(800, () => {
          this.level++;
          this.nextRound();
        });
      } else {
        if (window.AprincarAudio) window.AprincarAudio.softError();
        this.locked = false;
        this.updateState({ inputReady: true });

        if (this.consecutiveFailures >= 2) {
          const correctTarget = this.testTargets.find(
            (target) => target.kind === 'choice' && target.value === this.challenge?.answer
          );
          if (correctTarget && window.AprincarFeedback) {
            window.AprincarFeedback.showAssistanceHint(this, correctTarget);
          }
        }
      }
    }
  }

  window.AprincarBaseScene = AprincarBaseScene;
  window.AprincarConstants = { C, FONT };
})();
