(() => {
  const colors = Object.freeze({
    blue: '#2563EB',
    blueStrong: '#1D4ED8',
    secondary: '#0EA5E9',
    sun: '#FBBF24',
    orange: '#F59E0B',
    leaf: '#10B981',
    coral: '#EF4444',
    purple: '#7C3AED',
    navy: '#0F172A',
    ink: '#14213F',
  });

  const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" data-brand-version="approved-v1" aria-hidden="true"><defs><linearGradient id="a" x1="8" y1="8" x2="56" y2="58"><stop stop-color="#0EA5E9"/><stop offset=".5" stop-color="#2563EB"/><stop offset="1" stop-color="#1D4ED8"/></linearGradient></defs><g id="aprincar-approved"><path d="M12 52C14.5 28 23 12 32 12s17.5 16 20 40" fill="none" stroke="url(#a)" stroke-width="13" stroke-linecap="round"/><path d="M27 29.8c0-2.2 2.4-3.5 4.2-2.3l12.4 8c1.7 1.1 1.7 3.6 0 4.7l-12.4 8A2.8 2.8 0 0 1 27 45.9V29.8Z" fill="#FBBF24"/></g></svg>`;
  const wordmark = `<span style="color:${colors.navy}">Apr</span><span style="color:${colors.blue}">incar</span>`;
  const lockupHtml = `<span class="aprincar-game-lockup">${markSvg}<span class="aprincar-game-wordmark">${wordmark}</span></span>`;
  const fontFamily = '"Poppins",Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

  function addPhaser(scene, x = 18, y = 12) {
    const mark = scene.add.container(x, y);
    const glyph = scene.add.graphics();

    // Keep the approved rounded-A silhouette with Graphics primitives that are
    // supported by every Phaser 3 build shipped in the single-file games.
    glyph.lineStyle(9, 0x2563eb, 1);
    glyph.beginPath();
    glyph.moveTo(3, 37);
    glyph.lineTo(13, 10);
    glyph.lineTo(20, 4);
    glyph.lineTo(27, 10);
    glyph.lineTo(38, 37);
    glyph.strokePath();

    glyph.fillStyle(0xfbbf24, 1);
    glyph.fillTriangle(17, 15, 17, 31, 30, 23);

    const apr = scene.add.text(48, 6, 'Apr', {
      fontFamily,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colors.navy,
    });
    const incar = scene.add.text(47 + apr.width, 6, 'incar', {
      fontFamily,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colors.blue,
    });

    mark.add([glyph, apr, incar]);
    mark.setData('brandVersion', 'approved-v1');
    return mark;
  }

  window.APRINCAR_BRAND = Object.freeze({ colors, fontFamily, markSvg, lockupHtml, addPhaser });
})();