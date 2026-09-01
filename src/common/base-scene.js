// Base Game Scene providing standardized infrastructure and SDK bridge
(() => {
  const CFG = window.APRINCAR_GAME_CONFIG;
  const BRAND = window.APRINCAR_BRAND;
  const FONT = BRAND.fontFamily;
  const C = { bg: 0xf7f6f2, purple: 0x8b5cf6, blue: 0x2563eb, coral: 0xf43f5e, orange: 0xfb923c, sun: 0xfbcb24, leaf: 0x22c55e, sky: 0x38bdf8, ink: '#13203d', white: 0xffffff };

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
    }

    async create() {
      this.cameras.main.setBackgroundColor(C.bg);
      
      // Header decorativo
      this.add.rectangle(480, 50, 960, 100, C.white).setStrokeStyle(1, 0xe2dfd7);
      BRAND.addPhaser(this, 22, 16);
      this.titleText = this.add.text(480, 18, CFG.name, { fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color: C.ink }).setOrigin(0.5, 0);
      this.levelText = this.add.text(910, 26, 'Fase 1', { fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: '#6f5bd7' }).setOrigin(1, 0);
      
      // Instrução principal
      this.promptText = this.add.text(480, 114, '', { fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: C.ink, align: 'center', wordWrap: { width: 840 } }).setOrigin(0.5, 0);
      
      // Rodapé
      this.statusText = this.add.text(480, 580, '', { fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#5143a6' }).setOrigin(0.5);
      this.starText = this.add.text(32, 574, '⭐ 0', { fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#6f5bd7' });

      await aprincar.session.start({ mode: CFG.mode });
      this.nextRound();
    }

    updateState(values = {}) {
      if (!window.__APRINCAR_GAME_STATE__) window.__APRINCAR_GAME_STATE__ = {};
      Object.assign(window.__APRINCAR_GAME_STATE__, values);
    }

    clearRound() {
      this.input.off('drag');
      this.input.off('dragend');
      this.input.off('pointerdown');
      this.input.off('pointermove');
      this.input.off('pointerup');
      if (this.roundGroup) this.roundGroup.destroy(true);
      this.roundGroup = this.add.container(0, 0);
      this.statusText.setText('');
      this.locked = false;
      this.testTargets = [];
      this.challenge = null;
    }

    target(value, x, y, w, h, kind) {
      this.testTargets.push({ value, x, y, w, h, kind });
    }

    addCardButton(x, y, w, h, label, value, color = C.white, kind = 'action') {
      const box = this.add.rectangle(x, y, w, h, color).setStrokeStyle(2, 0xe2dfd7).setInteractive({ useHandCursor: true });
      const text = this.add.text(x, y, label, { fontFamily: FONT, fontSize: `${Math.min(34, h * 0.44)}px`, fontStyle: 'bold', color: color === C.white ? C.ink : '#ffffff' }).setOrigin(0.5);
      this.roundGroup.add([box, text]);
      this.target(kind === 'action' ? label : value, x, y, w, h, kind);
      box.on('pointerup', () => this.choose(value, box));
      return box;
    }

    choose(value, source) {
      if (this.locked) return;
      this.submitResult(value === this.challenge.answer, { selected: value, target: this.challenge.answer, sourceX: source?.x });
    }

    async recordEvidence(ok, metadata = {}) {
      this.attempts++;
      const assistanceLevel = this.consecutiveFailures >= 2 ? 'visual-cue' : 'none';
      return aprincar.evidence.submit({
        skillId: CFG.skillId,
        result: ok ? 'success' : 'failure',
        independent: this.consecutiveFailures === 0,
        assistance: assistanceLevel,
        difficulty: this.challenge?.difficulty ?? 0.35,
        confidence: ok ? 0.95 : 0.8,
        attempts: this.attempts,
        metadata: { level: this.level, ...metadata }
      });
    }

    async submitResult(ok, metadata = {}) {
      if (this.locked) return;
      this.locked = true;
      this.updateState({ lastResult: ok ? 'success' : 'failure', inputReady: false });
      await this.recordEvidence(ok, metadata);

      if (ok) {
        this.consecutiveFailures = 0;
        this.stars += 2;
        this.starText.setText(`⭐ ${this.stars}`);
        if (window.AprincarFeedback) window.AprincarFeedback.celebrate(this, 480, 320);
        await aprincar.rewards.request({ reason: `${CFG.mode}-round`, amount: 2 });
        this.time.delayedCall(800, () => {
          this.level++;
          this.nextRound();
        });
      } else {
        this.consecutiveFailures++;
        if (window.AprincarAudio) window.AprincarAudio.softError();
        this.locked = false;
        this.updateState({ inputReady: true });
        
        // Assistência progressiva suave se errar repetidamente
        if (this.consecutiveFailures >= 2) {
          const correctTarget = this.testTargets.find(t => t.kind === 'choice' && t.value === this.challenge?.answer);
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
