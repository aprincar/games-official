// Procedural Visual Feedback and Celebrations for Aprincar Games
window.AprincarFeedback = (() => {
  return {
    celebrate(scene, x = 480, y = 320) {
      // Sound
      if (window.AprincarAudio) window.AprincarAudio.success();

      // Confetti & Starburst
      const colors = [0xfbbf24, 0xf43f5e, 0x2563eb, 0x22c55e, 0x8b5cf6, 0xfb923c];
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const speed = Phaser.Math.Between(120, 260);
        const color = colors[i % colors.length];
        const particle = scene.add.circle(x, y, Phaser.Math.Between(5, 9), color);
        
        scene.tweens.add({
          targets: particle,
          x: x + Math.cos(angle) * speed,
          y: y + Math.sin(angle) * speed + Phaser.Math.Between(20, 60),
          alpha: 0,
          scale: 0.2,
          duration: Phaser.Math.Between(600, 900),
          ease: 'Cubic.easeOut',
          onComplete: () => particle.destroy()
        });
      }

      // Golden Expanding Ring
      const ring = scene.add.graphics();
      ring.lineStyle(6, 0xfbbf24, 0.9);
      ring.strokeCircle(x, y, 20);
      scene.tweens.add({
        targets: ring,
        scale: 4.5,
        alpha: 0,
        duration: 650,
        ease: 'Quad.easeOut',
        onComplete: () => ring.destroy()
      });
    },

    softErrorFeedback(scene, object) {
      if (window.AprincarAudio) window.AprincarAudio.softError();
      if (!object) return;

      const origX = object.x;
      scene.tweens.add({
        targets: object,
        x: origX + 12,
        duration: 60,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => { object.x = origX; }
      });
    },

    showAssistanceHint(scene, target) {
      if (!target) return;
      const hint = scene.add.graphics();
      hint.lineStyle(4, 0xfbbf24, 0.85);
      hint.strokeRoundedRect(target.x - target.w / 2 - 6, target.y - target.h / 2 - 6, target.w + 12, target.h + 12, 12);
      
      scene.tweens.add({
        targets: hint,
        alpha: 0.2,
        scale: 1.08,
        duration: 500,
        yoyo: true,
        repeat: 4,
        onComplete: () => hint.destroy()
      });
    }
  };
})();
