(() => {
  const colors = Object.freeze({
    blue: '#2563EB',
    sun: '#FBCB24',
    orange: '#FB923C',
    leaf: '#22C55E',
    coral: '#F43F5E',
    purple: '#8B5CF6',
    navy: '#13203D',
    ink: '#242523',
  });
  const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" data-brand-version="3" aria-hidden="true"><g id="aprincar-star"><path d="M32 5.4 39.4 21l17 2.3-12.5 12 3 16.9L32 44.1 17.1 52.2l3-16.9-12.5-12L24.6 21 32 5.4Z" fill="#FBCB24" stroke="#FB923C" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="25" cy="29" rx="3.2" ry="4.1" fill="#13203D"/><ellipse cx="39" cy="29" rx="3.2" ry="4.1" fill="#13203D"/><circle cx="26" cy="27.8" r="1" fill="#fff"/><circle cx="40" cy="27.8" r="1" fill="#fff"/><path d="M25 36c4.6 4.3 9.4 4.3 14 0" fill="none" stroke="#13203D" stroke-width="2.4" stroke-linecap="round"/></g></svg>`;
  const wordmark = [
    ['A', colors.blue], ['p', colors.sun], ['r', colors.leaf], ['i', colors.coral],
    ['n', colors.blue], ['c', colors.orange], ['a', colors.leaf], ['r', colors.purple],
  ].map(([letter, color]) => `<span style="color:${color}">${letter}</span>`).join('');
  const lockupHtml = `<span class="aprincar-game-lockup">${markSvg}<span class="aprincar-game-wordmark">${wordmark}</span></span>`;
  const fontFamily = 'ui-rounded,"Arial Rounded MT Bold","Trebuchet MS",Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

  function addPhaser(scene, x = 26, y = 16) {
    const mark = scene.add.container(x, y);
    const star = scene.add.star(20, 18, 5, 10, 21, 0xfbcb24).setStrokeStyle(2, 0xfb923c);
    const eyeLeft = scene.add.ellipse(14.5, 18, 3.8, 5, 0x13203d);
    const eyeRight = scene.add.ellipse(25.5, 18, 3.8, 5, 0x13203d);
    const smile = scene.add.arc(20, 23, 7, 20, 160, false, 0x000000, 0).setStrokeStyle(2, 0x13203d);
    const letters = 'Aprincar'.split('');
    const palette = [0x2563eb,0xfbcb24,0x22c55e,0xf43f5e,0x2563eb,0xfb923c,0x22c55e,0x8b5cf6];
    const word = [];
    let offset = 44;
    letters.forEach((letter, index) => {
      const node = scene.add.text(offset, 8, letter, { fontFamily, fontSize: '18px', fontStyle: 'bold', color: `#${palette[index].toString(16).padStart(6,'0')}` });
      offset += node.width - 1;
      word.push(node);
    });
    mark.add([star, eyeLeft, eyeRight, smile, ...word]);
    mark.setData('brandVersion', 3);
    return mark;
  }

  window.APRINCAR_BRAND = Object.freeze({ colors, fontFamily, markSvg, lockupHtml, addPhaser });
})();
