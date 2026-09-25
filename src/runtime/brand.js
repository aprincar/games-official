(() => {
  const colors = Object.freeze({
    blue: '#4F6EF7',
    blueStrong: '#3B55D9',
    sun: '#FFC83D',
    orange: '#FF9F43',
    leaf: '#2FC98F',
    coral: '#FF6B6B',
    purple: '#8B6FF7',
    navy: '#17213D',
    ink: '#20263A',
  });

  const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" data-brand-version="4" aria-hidden="true"><g id="aprincar-portal"><path d="M12.8 48.6 26.1 16.2c2.1-5.1 9.3-5.1 11.4 0l13.7 32.4c2.3 5.5-1.7 11.4-7.7 11.4H20.6c-6 0-10.1-5.9-7.8-11.4Z" fill="#4F6EF7"/><path d="M27.1 28.3c0-1.4 1.6-2.2 2.8-1.5l13.2 8.3a1.8 1.8 0 0 1 0 3L30 46.3a1.8 1.8 0 0 1-2.8-1.5V28.3Z" fill="#fff"/><circle cx="47.2" cy="15.5" r="6.3" fill="#FFC83D"/></g></svg>`;

  const wordmark =
    `<span style="color:${colors.navy}">Apr</span><span style="color:${colors.blue}">incar</span>`;

  const lockupHtml =
    `<span class="aprincar-game-lockup">${markSvg}<span class="aprincar-game-wordmark">${wordmark}</span></span>`;

  const fontFamily =
    'ui-rounded,"Arial Rounded MT Bold","Trebuchet MS",Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

  function addPhaser(scene, x = 26, y = 16) {
    const mark = scene.add.container(x, y);
    const glyph = scene.add.graphics();

    glyph.fillStyle(0x4f6ef7, 1);
    glyph.fillTriangle(3, 36, 20, 3, 38, 36);

    glyph.fillStyle(0xffffff, 1);
    glyph.fillTriangle(17, 14, 17, 29, 30, 21.5);

    glyph.fillStyle(0xffc83d, 1);
    glyph.fillCircle(35, 6, 5);

    const apr = scene.add.text(47, 7, 'Apr', {
      fontFamily,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colors.navy,
    });
    const incar = scene.add.text(47 + apr.width - 1, 7, 'incar', {
      fontFamily,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colors.blue,
    });

    mark.add([glyph, apr, incar]);
    mark.setData('brandVersion', 4);
    return mark;
  }

  window.APRINCAR_BRAND = Object.freeze({
    colors,
    fontFamily,
    markSvg,
    lockupHtml,
    addPhaser,
  });
})();
