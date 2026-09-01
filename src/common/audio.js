// Procedural Web Audio Synthesizer for Aprincar Games (Zero external assets, zero CDN)
window.AprincarAudio = (() => {
  let ctx = null;
  let muted = false;

  function getContext() {
    if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, type, duration, gainStart = 0.15, gainEnd = 0.001) {
    if (muted) return;
    try {
      const audioCtx = getContext();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainStart, now);
      gain.gain.exponentialRampToValueAtTime(gainEnd, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (_) {}
  }

  return {
    setMuted(val) { muted = !!val; },
    isMuted() { return muted; },
    pop() { playTone(520, 'sine', 0.1, 0.12); },
    click() { playTone(800, 'triangle', 0.05, 0.08); },
    chime() {
      playTone(659.25, 'sine', 0.25, 0.1); // E5
      setTimeout(() => playTone(880, 'sine', 0.35, 0.12), 80); // A5
    },
    success() {
      playTone(523.25, 'sine', 0.2, 0.12); // C5
      setTimeout(() => playTone(659.25, 'sine', 0.2, 0.12), 90); // E5
      setTimeout(() => playTone(783.99, 'sine', 0.2, 0.14), 180); // G5
      setTimeout(() => playTone(1046.5, 'triangle', 0.45, 0.18), 270); // C6
    },
    softError() {
      playTone(280, 'sine', 0.18, 0.09);
      setTimeout(() => playTone(240, 'sine', 0.22, 0.07), 100);
    },
    swoosh() { playTone(350, 'triangle', 0.15, 0.08); },
    drop() { playTone(440, 'sine', 0.12, 0.12); },
    fanfare() {
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
        setTimeout(() => playTone(f, 'sine', 0.3, 0.14), i * 90);
      });
    }
  };
})();
