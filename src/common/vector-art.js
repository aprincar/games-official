// Procedural High-Quality Vector Art for Aprincar Games
window.AprincarVectorArt = (() => {
  return {
    // Draw an expressive Animal face / body into a Phaser Graphics or Container
    drawAnimal(graphics, type, x, y, size = 64) {
      graphics.save();
      const s = size / 64;
      graphics.fillStyle(0x0f172a, 0.10);
      graphics.fillEllipse(x + 2 * s, y + 28 * s, 46 * s, 10 * s);
      
      if (type === 'lion' || type === 'leao') {
        // Juba com profundidade
        graphics.fillStyle(0xb85b12, 1);
        graphics.fillCircle(x, y, 33 * s);
        graphics.fillStyle(0xde7b18, 1);
        graphics.fillCircle(x, y - 2 * s, 29 * s);
        // Cabeça
        graphics.fillStyle(0xf7b934, 1);
        graphics.fillCircle(x, y, 22 * s);
        graphics.fillStyle(0xffd765, 0.82);
        graphics.fillEllipse(x - 6 * s, y - 7 * s, 18 * s, 12 * s);
        // Orelhas
        graphics.fillStyle(0xd97706, 1);
        graphics.fillCircle(x - 18 * s, y - 18 * s, 8 * s);
        graphics.fillCircle(x + 18 * s, y - 18 * s, 8 * s);
        graphics.fillStyle(0xfef3c7, 1);
        graphics.fillCircle(x - 18 * s, y - 18 * s, 4 * s);
        graphics.fillCircle(x + 18 * s, y - 18 * s, 4 * s);
        // Focinho
        graphics.fillStyle(0xfef3c7, 1);
        graphics.fillEllipse(x, y + 6 * s, 14 * s, 10 * s);
        graphics.fillStyle(0x78350f, 1);
        graphics.fillTriangle(x - 4 * s, y + 2 * s, x + 4 * s, y + 2 * s, x, y + 6 * s);
        // Olhos
        graphics.fillStyle(0x1e293b, 1);
        graphics.fillCircle(x - 8 * s, y - 3 * s, 3.5 * s);
        graphics.fillCircle(x + 8 * s, y - 3 * s, 3.5 * s);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(x - 7 * s, y - 4 * s, 1.2 * s);
        graphics.fillCircle(x + 9 * s, y - 4 * s, 1.2 * s);
        // Bigodes
        graphics.lineStyle(1.5 * s, 0x78350f, 0.7);
        graphics.lineBetween(x - 8 * s, y + 6 * s, x - 18 * s, y + 4 * s);
        graphics.lineBetween(x + 8 * s, y + 6 * s, x + 18 * s, y + 4 * s);
      } else if (type === 'elephant' || type === 'elefante') {
        // Orelhas
        graphics.fillStyle(0x94a3b8, 1);
        graphics.fillEllipse(x - 22 * s, y - 4 * s, 18 * s, 26 * s);
        graphics.fillEllipse(x + 22 * s, y - 4 * s, 18 * s, 26 * s);
        graphics.fillStyle(0xfbcfe8, 0.7);
        graphics.fillEllipse(x - 22 * s, y - 4 * s, 10 * s, 16 * s);
        graphics.fillEllipse(x + 22 * s, y - 4 * s, 10 * s, 16 * s);
        // Cabeça
        graphics.fillStyle(0x64748b, 1);
        graphics.fillCircle(x, y, 22 * s);
        // Tromba
        graphics.fillStyle(0x64748b, 1);
        graphics.fillRoundedRect(x - 6 * s, y + 4 * s, 12 * s, 24 * s, 6 * s);
        // Presas
        graphics.fillStyle(0xffffff, 1);
        graphics.fillTriangle(x - 8 * s, y + 10 * s, x - 12 * s, y + 16 * s, x - 6 * s, y + 14 * s);
        graphics.fillTriangle(x + 8 * s, y + 10 * s, x + 12 * s, y + 16 * s, x + 6 * s, y + 14 * s);
        // Olhos
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillCircle(x - 9 * s, y - 4 * s, 3.5 * s);
        graphics.fillCircle(x + 9 * s, y - 4 * s, 3.5 * s);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(x - 8 * s, y - 5 * s, 1.2 * s);
        graphics.fillCircle(x + 10 * s, y - 5 * s, 1.2 * s);
      } else if (type === 'monkey' || type === 'macaco') {
        // Orelhas
        graphics.fillStyle(0x854d0e, 1);
        graphics.fillCircle(x - 22 * s, y - 2 * s, 10 * s);
        graphics.fillCircle(x + 22 * s, y - 2 * s, 10 * s);
        graphics.fillStyle(0xfde047, 0.8);
        graphics.fillCircle(x - 22 * s, y - 2 * s, 6 * s);
        graphics.fillCircle(x + 22 * s, y - 2 * s, 6 * s);
        // Cabeça
        graphics.fillStyle(0x713f12, 1);
        graphics.fillCircle(x, y, 22 * s);
        // Rosto
        graphics.fillStyle(0xfef08a, 1);
        graphics.fillEllipse(x - 7 * s, y - 4 * s, 10 * s, 12 * s);
        graphics.fillEllipse(x + 7 * s, y - 4 * s, 10 * s, 12 * s);
        graphics.fillEllipse(x, y + 8 * s, 16 * s, 11 * s);
        // Focinho & Boca
        graphics.fillStyle(0x713f12, 1);
        graphics.fillCircle(x - 3 * s, y + 4 * s, 1.5 * s);
        graphics.fillCircle(x + 3 * s, y + 4 * s, 1.5 * s);
        graphics.lineStyle(1.8 * s, 0x713f12, 1);
        graphics.beginPath();
        graphics.arc(x, y + 7 * s, 5 * s, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        // Olhos
        graphics.fillStyle(0x1e293b, 1);
        graphics.fillCircle(x - 6 * s, y - 4 * s, 3.5 * s);
        graphics.fillCircle(x + 6 * s, y - 4 * s, 3.5 * s);
      } else if (type === 'giraffe' || type === 'girafa') {
        // Chifres (ossicones)
        graphics.fillStyle(0xca8a04, 1);
        graphics.fillRect(x - 8 * s, y - 28 * s, 3 * s, 10 * s);
        graphics.fillRect(x + 5 * s, y - 28 * s, 3 * s, 10 * s);
        graphics.fillStyle(0xa16207, 1);
        graphics.fillCircle(x - 6.5 * s, y - 28 * s, 4 * s);
        graphics.fillCircle(x + 6.5 * s, y - 28 * s, 4 * s);
        // Orelhas
        graphics.fillStyle(0xfacc15, 1);
        graphics.fillEllipse(x - 20 * s, y - 14 * s, 12 * s, 6 * s);
        graphics.fillEllipse(x + 20 * s, y - 14 * s, 12 * s, 6 * s);
        // Cabeça
        graphics.fillStyle(0xfacc15, 1);
        graphics.fillRoundedRect(x - 16 * s, y - 18 * s, 32 * s, 36 * s, 14 * s);
        // Manchas
        graphics.fillStyle(0xa16207, 0.9);
        graphics.fillCircle(x - 8 * s, y - 10 * s, 5 * s);
        graphics.fillCircle(x + 8 * s, y - 8 * s, 4 * s);
        // Focinho
        graphics.fillStyle(0xfef08a, 1);
        graphics.fillEllipse(x, y + 10 * s, 16 * s, 10 * s);
        graphics.fillStyle(0x713f12, 1);
        graphics.fillCircle(x - 4 * s, y + 9 * s, 1.8 * s);
        graphics.fillCircle(x + 4 * s, y + 9 * s, 1.8 * s);
        // Olhos
        graphics.fillStyle(0x1e293b, 1);
        graphics.fillCircle(x - 8 * s, y - 2 * s, 3.5 * s);
        graphics.fillCircle(x + 8 * s, y - 2 * s, 3.5 * s);
      } else if (type === 'panda') {
        // Orelhas
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillCircle(x - 18 * s, y - 16 * s, 9 * s);
        graphics.fillCircle(x + 18 * s, y - 16 * s, 9 * s);
        // Cabeça
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(x, y, 22 * s);
        graphics.lineStyle(1.5 * s, 0xe2e8f0);
        graphics.strokeCircle(x, y, 22 * s);
        // Manchas dos olhos
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillEllipse(x - 9 * s, y - 3 * s, 8 * s, 6 * s);
        graphics.fillEllipse(x + 9 * s, y - 3 * s, 8 * s, 6 * s);
        // Olhos
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(x - 8 * s, y - 3 * s, 2.5 * s);
        graphics.fillCircle(x + 8 * s, y - 3 * s, 2.5 * s);
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillCircle(x - 8 * s, y - 3 * s, 1.2 * s);
        graphics.fillCircle(x + 8 * s, y - 3 * s, 1.2 * s);
        // Focinho
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillEllipse(x, y + 8 * s, 5 * s, 3.5 * s);
      } else {
        // Default Cute Puppy / Bear
        graphics.fillStyle(0xfb923c, 1);
        graphics.fillCircle(x - 16 * s, y - 14 * s, 8 * s);
        graphics.fillCircle(x + 16 * s, y - 14 * s, 8 * s);
        graphics.fillStyle(0xf97316, 1);
        graphics.fillCircle(x, y, 22 * s);
        graphics.fillStyle(0xffedd5, 1);
        graphics.fillEllipse(x, y + 6 * s, 14 * s, 10 * s);
        graphics.fillStyle(0x431407, 1);
        graphics.fillCircle(x - 8 * s, y - 4 * s, 3.5 * s);
        graphics.fillCircle(x + 8 * s, y - 4 * s, 3.5 * s);
        graphics.fillCircle(x, y + 4 * s, 3 * s);
      }
      graphics.restore();
    },

    // Approved glossy fruit set used by counting and classification games.
    drawFruit(graphics, type, x, y, size = 56) {
      graphics.save();
      const s = size / 56;
      const shadow = (w = 38, h = 9) => {
        graphics.fillStyle(0x0f172a, 0.11);
        graphics.fillEllipse(x + 2 * s, y + 23 * s, w * s, h * s);
      };
      const shine = (dx = -9, dy = -9, w = 7, h = 10) => {
        graphics.fillStyle(0xffffff, 0.42);
        graphics.fillEllipse(x + dx * s, y + dy * s, w * s, h * s);
      };
      const leaf = (dx = 7, dy = -22, rot = -0.35) => {
        graphics.save();
        graphics.translateCanvas(x + dx * s, y + dy * s);
        graphics.rotateCanvas(rot);
        graphics.fillStyle(0x22a447, 1);
        graphics.fillEllipse(0, 0, 12 * s, 6 * s);
        graphics.restore();
      };

      if (type === 'apple' || type === 'maca') {
        shadow(42, 9);
        graphics.fillStyle(0x7c2d12, 1); graphics.fillRect(x - 2 * s, y - 25 * s, 4 * s, 10 * s);
        leaf();
        graphics.fillStyle(0xd92e3d, 1); graphics.fillCircle(x - 8 * s, y - 1 * s, 17 * s); graphics.fillCircle(x + 8 * s, y - 1 * s, 17 * s);
        graphics.fillStyle(0xf04450, 1); graphics.fillCircle(x, y + 7 * s, 16 * s);
        shine(-10,-8,7,11);
      } else if (type === 'banana') {
        shadow(46, 8);
        graphics.lineStyle(19 * s, 0xe6a915, 1); graphics.beginPath(); graphics.arc(x + 7 * s, y - 8 * s, 29 * s, 1.05, 2.75); graphics.strokePath();
        graphics.lineStyle(13 * s, 0xffdf36, 1); graphics.beginPath(); graphics.arc(x + 7 * s, y - 9 * s, 28 * s, 1.05, 2.75); graphics.strokePath();
        graphics.lineStyle(4 * s, 0xfff19a, 0.8); graphics.beginPath(); graphics.arc(x + 4 * s, y - 12 * s, 25 * s, 1.18, 2.45); graphics.strokePath();
        graphics.fillStyle(0x713f12,1); graphics.fillCircle(x-17*s,y+13*s,3*s); graphics.fillCircle(x+24*s,y-18*s,4*s);
      } else if (type === 'orange' || type === 'laranja') {
        shadow(); leaf(8,-21,-0.2);
        graphics.fillStyle(0xe96c10,1); graphics.fillCircle(x,y,21*s);
        graphics.fillStyle(0xff861c,1); graphics.fillCircle(x-2*s,y-2*s,19*s);
        shine(-7,-8,8,10);
        graphics.fillStyle(0xfbbf24,0.36); for(const [dx,dy] of [[8,-5],[11,5],[-2,11]]) graphics.fillCircle(x+dx*s,y+dy*s,1.2*s);
      } else if (type === 'strawberry' || type === 'morango') {
        shadow(36,8);
        graphics.fillStyle(0xd92735,1); graphics.fillCircle(x,y-7*s,17*s); graphics.fillTriangle(x-16*s,y-5*s,x+16*s,y-5*s,x,y+24*s);
        graphics.fillStyle(0xf13b48,1); graphics.fillCircle(x-3*s,y-8*s,14*s); shine(-9,-11,6,8);
        graphics.fillStyle(0x22a447,1);
        graphics.fillTriangle(x-15*s,y-15*s,x-3*s,y-8*s,x-6*s,y-24*s); graphics.fillTriangle(x+15*s,y-15*s,x+3*s,y-8*s,x+6*s,y-24*s); graphics.fillTriangle(x-7*s,y-17*s,x+7*s,y-17*s,x,y-26*s);
        graphics.fillStyle(0xffdc63,1); for(const [dx,dy] of [[-8,-2],[7,-1],[-4,7],[5,9],[0,16]]) graphics.fillCircle(x+dx*s,y+dy*s,1.4*s);
      } else if (type === 'grape' || type === 'uva') {
        shadow(40,8); leaf(9,-24,-0.35);
        const pts=[[-10,-10],[2,-13],[13,-7],[-13,2],[0,0],[12,5],[-6,12],[7,15]];
        pts.forEach(([dx,dy],i)=>{graphics.fillStyle(i%2?0x7c3aed:0x9333ea,1);graphics.fillCircle(x+dx*s,y+dy*s,9*s);});
        shine(-14,-14,5,6);
      } else if (type === 'pear' || type === 'pera') {
        shadow(36,8); graphics.fillStyle(0x6b3d12,1);graphics.fillRect(x-1*s,y-26*s,3*s,9*s);leaf(7,-24,-.3);
        graphics.fillStyle(0x79bf19,1);graphics.fillCircle(x,y+7*s,18*s);graphics.fillEllipse(x,y-8*s,14*s,20*s);graphics.fillStyle(0xa4dd24,.75);graphics.fillEllipse(x-5*s,y-5*s,11*s,22*s);shine(-8,-10,5,9);
      } else if (type === 'watermelon' || type === 'melancia') {
        shadow(44,8); graphics.fillStyle(0x17853e,1); graphics.fillTriangle(x-25*s,y+17*s,x+24*s,y+17*s,x+19*s,y-18*s);
        graphics.fillStyle(0xf8f2d0,1);graphics.fillTriangle(x-21*s,y+13*s,x+20*s,y+13*s,x+16*s,y-14*s);
        graphics.fillStyle(0xf04755,1);graphics.fillTriangle(x-18*s,y+10*s,x+17*s,y+10*s,x+13*s,y-11*s);
        graphics.fillStyle(0x3f1d18,1);for(const [dx,dy] of [[-8,2],[2,5],[8,-1]]) graphics.fillEllipse(x+dx*s,y+dy*s,2*s,4*s);
      } else if (type === 'pineapple' || type === 'abacaxi') {
        shadow(34,8);graphics.fillStyle(0xf3a91a,1);graphics.fillEllipse(x,y+4*s,17*s,23*s);
        graphics.lineStyle(2*s,0xd58012,.7);for(let d=-12;d<=12;d+=8){graphics.lineBetween(x-14*s,y+(d-4)*s,x+14*s,y+(d+12)*s);graphics.lineBetween(x+14*s,y+(d-4)*s,x-14*s,y+(d+12)*s);}
        graphics.fillStyle(0x22a447,1);for(const dx of [-10,-5,0,5,10]) graphics.fillTriangle(x,y-18*s,x+dx*s,y-38*s,x+(dx+5)*s,y-17*s);
      } else if (type === 'mango' || type === 'manga') {
        shadow(39,8);leaf(8,-21,-.2);graphics.fillStyle(0xf59e0b,1);graphics.fillEllipse(x,y+2*s,20*s,24*s);graphics.fillStyle(0xffbf35,.9);graphics.fillEllipse(x-6*s,y-4*s,14*s,20*s);graphics.fillStyle(0xef4444,.45);graphics.fillEllipse(x+9*s,y-6*s,8*s,14*s);shine(-9,-9,5,8);
      } else if (type === 'kiwi') {
        shadow(36,8);graphics.fillStyle(0x8b5a2b,1);graphics.fillCircle(x,y,21*s);graphics.fillStyle(0x78c82f,1);graphics.fillCircle(x,y,17*s);graphics.fillStyle(0xfff6c5,1);graphics.fillEllipse(x,y,7*s,9*s);graphics.fillStyle(0x2b1b0f,1);for(let i=0;i<10;i++){const a=i*Math.PI/5;graphics.fillEllipse(x+Math.cos(a)*11*s,y+Math.sin(a)*11*s,1.2*s,2.2*s);}
        shine(-7,-9,5,7);
      } else {
        this.drawFruit(graphics, 'grape', x, y, size);
        graphics.restore();
        return;
      }
      graphics.restore();
    },

    // Draw Isometric 3D Wooden Toy Block
    drawIsometricBlock(graphics, x, y, width = 74, height = 64, baseColor = 0x8b5cf6) {
      graphics.save();
      const color = Phaser.Display.Color.IntegerToColor(baseColor);
      const topColor = Phaser.Display.Color.GetColor(Math.min(255, color.red + 40), Math.min(255, color.green + 40), Math.min(255, color.blue + 40));
      const shadowColor = Phaser.Display.Color.GetColor(Math.max(0, color.red - 45), Math.max(0, color.green - 45), Math.max(0, color.blue - 45));

      // Sombra projetada no chão
      graphics.fillStyle(0x000000, 0.12);
      graphics.fillRoundedRect(x - width / 2 + 4, y + height / 2 - 2, width, 14, 7);

      // Face Frontal Principal
      graphics.fillStyle(baseColor, 1);
      graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      graphics.lineStyle(2.5, shadowColor, 0.8);
      graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);

      // Chanfro Superior 3D
      graphics.fillStyle(topColor, 0.9);
      graphics.fillRoundedRect(x - width / 2 + 4, y - height / 2 + 3, width - 8, height * 0.35, 6);

      // Encaixe / Pino central de madeira
      graphics.fillStyle(topColor, 1);
      graphics.fillCircle(x, y - height / 2 + 2, 10);
      graphics.lineStyle(1.5, shadowColor, 0.6);
      graphics.strokeCircle(x, y - height / 2 + 2, 10);

      graphics.restore();
    },

    // Draw Recognizable Everyday Objects for Color Matching
    drawColorItem(graphics, itemKey, x, y, size = 68) {
      graphics.save();
      const s = size / 68;

      if (itemKey.includes('car') || itemKey.includes('carro')) {
        // Carrinho de brinquedo
        graphics.fillStyle(0xef4444, 1); // Vermelho
        graphics.fillRoundedRect(x - 28 * s, y - 8 * s, 56 * s, 22 * s, 6 * s);
        graphics.fillRoundedRect(x - 16 * s, y - 22 * s, 32 * s, 16 * s, 5 * s);
        // Janela
        graphics.fillStyle(0xe0f2fe, 1);
        graphics.fillRoundedRect(x - 12 * s, y - 19 * s, 24 * s, 11 * s, 3 * s);
        // Rodas
        graphics.fillStyle(0x1e293b, 1);
        graphics.fillCircle(x - 16 * s, y + 14 * s, 7 * s);
        graphics.fillCircle(x + 16 * s, y + 14 * s, 7 * s);
        graphics.fillStyle(0x94a3b8, 1);
        graphics.fillCircle(x - 16 * s, y + 14 * s, 3 * s);
        graphics.fillCircle(x + 16 * s, y + 14 * s, 3 * s);
      } else if (itemKey.includes('leaf') || itemKey.includes('folha')) {
        // Folha verde
        graphics.fillStyle(0x22c55e, 1);
        graphics.fillEllipse(x, y, 22 * s, 32 * s);
        graphics.lineStyle(2 * s, 0x15803d, 1);
        graphics.lineBetween(x, y - 26 * s, x, y + 26 * s);
        graphics.lineBetween(x, y - 10 * s, x - 12 * s, y - 18 * s);
        graphics.lineBetween(x, y - 2 * s, x + 12 * s, y - 10 * s);
        graphics.lineBetween(x, y + 8 * s, x - 12 * s, y);
      } else if (itemKey.includes('duck') || itemKey.includes('pato')) {
        // Patinho de borracha amarelo
        graphics.fillStyle(0xfacc15, 1);
        graphics.fillCircle(x - 4 * s, y - 10 * s, 14 * s); // Cabeça
        graphics.fillEllipse(x + 4 * s, y + 6 * s, 22 * s, 16 * s); // Corpo
        // Bico
        graphics.fillStyle(0xf97316, 1);
        graphics.fillTriangle(x - 16 * s, y - 10 * s, x - 26 * s, y - 7 * s, x - 16 * s, y - 4 * s);
        // Olho
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillCircle(x - 8 * s, y - 12 * s, 2.5 * s);
      } else if (itemKey.includes('grape') || itemKey.includes('uva')) {
        // Cacho de Uvas Roxas
        graphics.fillStyle(0x8b5cf6, 1);
        [-12, 0, 12].forEach(dx => graphics.fillCircle(x + dx * s, y - 10 * s, 9 * s));
        [-6, 6].forEach(dx => graphics.fillCircle(x + dx * s, y + 2 * s, 8.5 * s));
        graphics.fillCircle(x, y + 14 * s, 8 * s);
        // Folhinha
        graphics.fillStyle(0x16a34a, 1);
        graphics.fillEllipse(x + 4 * s, y - 22 * s, 8 * s, 4 * s);
      } else {
        // Barquinho Azul
        graphics.fillStyle(0x2563eb, 1);
        graphics.fillTriangle(x - 26 * s, y + 8 * s, x + 26 * s, y + 8 * s, x + 16 * s, y + 22 * s);
        graphics.fillTriangle(x - 26 * s, y + 8 * s, x + 16 * s, y + 22 * s, x - 16 * s, y + 22 * s);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillTriangle(x - 2 * s, y - 22 * s, x + 16 * s, y + 4 * s, x - 2 * s, y + 4 * s);
        graphics.fillStyle(0x78350f, 1);
        graphics.fillRect(x - 3 * s, y - 24 * s, 3 * s, 30 * s);
      }
      graphics.restore();
    },

    // Draw Steam Train Locomotive and Freight Wagons
    drawTrainLocomotive(graphics, x, y, width = 120, height = 75) {
      graphics.save();
      // Cabine
      graphics.fillStyle(0x2563eb, 1);
      graphics.fillRoundedRect(x + 10, y - height / 2 - 10, 45, height + 10, 8);
      // Janela da cabine
      graphics.fillStyle(0xe0f2fe, 1);
      graphics.fillRoundedRect(x + 20, y - height / 2, 25, 24, 4);
      // Caldeira
      graphics.fillStyle(0x3b82f6, 1);
      graphics.fillRoundedRect(x - 45, y - height / 2 + 10, 60, height - 10, 8);
      // Chaminé
      graphics.fillStyle(0x1e293b, 1);
      graphics.fillRoundedRect(x - 35, y - height / 2 - 18, 14, 28, 4);
      // Farol dianteiro dourado
      graphics.fillStyle(0xfbbf24, 1);
      graphics.fillCircle(x - 46, y + 4, 8);
      // Rodas
      graphics.fillStyle(0x0f172a, 1);
      graphics.fillCircle(x - 25, y + height / 2 + 4, 14);
      graphics.fillCircle(x + 10, y + height / 2 + 4, 14);
      graphics.fillCircle(x + 38, y + height / 2 + 4, 14);
      graphics.fillStyle(0x94a3b8, 1);
      graphics.fillCircle(x - 25, y + height / 2 + 4, 5);
      graphics.fillCircle(x + 10, y + height / 2 + 4, 5);
      graphics.fillCircle(x + 38, y + height / 2 + 4, 5);
      graphics.restore();
    },

    drawTrainWagon(graphics, x, y, width = 95, height = 60, color = 0x8b5cf6) {
      graphics.save();
      // Corpo do vagão
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      graphics.lineStyle(2, 0xffffff, 0.4);
      graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      // Engate
      graphics.fillStyle(0x475569, 1);
      graphics.fillRect(x - width / 2 - 8, y + 4, 10, 6);
      graphics.fillRect(x + width / 2 - 2, y + 4, 10, 6);
      // Rodas
      graphics.fillStyle(0x0f172a, 1);
      graphics.fillCircle(x - width / 3, y + height / 2 + 4, 11);
      graphics.fillCircle(x + width / 3, y + height / 2 + 4, 11);
      graphics.fillStyle(0x94a3b8, 1);
      graphics.fillCircle(x - width / 3, y + height / 2 + 4, 4);
      graphics.fillCircle(x + width / 3, y + height / 2 + 4, 4);
      graphics.restore();
    },

    // Draw Iridescent Floating Bubble
    drawBubble(graphics, x, y, radius = 45, color = 0x38bdf8) {
      graphics.save();
      // Glow exterior
      graphics.fillStyle(color, 0.25);
      graphics.fillCircle(x, y, radius + 3);
      // Corpo da bolha
      graphics.fillStyle(0xffffff, 0.35);
      graphics.fillCircle(x, y, radius);
      graphics.lineStyle(3, color, 0.75);
      graphics.strokeCircle(x, y, radius);
      // Brilho / Reflexo iridescente
      graphics.fillStyle(0xffffff, 0.85);
      graphics.fillEllipse(x - radius * 0.35, y - radius * 0.35, radius * 0.3, radius * 0.18);
      graphics.restore();
    }
  };
})();
