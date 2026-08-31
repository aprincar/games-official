// Procedural High-Quality Vector Art for Aprincar Games
window.AprincarVectorArt = (() => {
  return {
    // Draw an expressive Animal face / body into a Phaser Graphics or Container
    drawAnimal(graphics, type, x, y, size = 64) {
      graphics.save();
      const s = size / 64;
      
      if (type === 'lion' || type === 'leao') {
        // Juba
        graphics.fillStyle(0xd97706, 1);
        graphics.fillCircle(x, y, 32 * s);
        // Cabeça
        graphics.fillStyle(0xfbbf24, 1);
        graphics.fillCircle(x, y, 22 * s);
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

    // Draw Realistic Tasty Fruits
    drawFruit(graphics, type, x, y, size = 56) {
      graphics.save();
      const s = size / 56;

      if (type === 'apple' || type === 'maca') {
        // Maçã Vermelha
        graphics.fillStyle(0x15803d, 1);
        graphics.fillEllipse(x + 6 * s, y - 22 * s, 8 * s, 5 * s); // Folha
        graphics.fillStyle(0x78350f, 1);
        graphics.fillRect(x - 1.5 * s, y - 24 * s, 3 * s, 8 * s); // Cabinho
        graphics.fillStyle(0xef4444, 1);
        graphics.fillCircle(x - 8 * s, y - 2 * s, 16 * s);
        graphics.fillCircle(x + 8 * s, y - 2 * s, 16 * s);
        graphics.fillCircle(x, y + 6 * s, 15 * s);
        // Brilho
        graphics.fillStyle(0xffffff, 0.45);
        graphics.fillEllipse(x - 10 * s, y - 8 * s, 5 * s, 8 * s);
      } else if (type === 'banana') {
        // Banana Amarela
        graphics.lineStyle(16 * s, 0xfacc15, 1);
        graphics.beginPath();
        graphics.arc(x + 10 * s, y - 10 * s, 26 * s, 1.2, 2.7);
        graphics.strokePath();
        graphics.fillStyle(0x713f12, 1);
        graphics.fillCircle(x - 14 * s, y + 12 * s, 3 * s); // Ponta
        graphics.fillCircle(x + 22 * s, y - 16 * s, 4 * s); // Topo
      } else if (type === 'orange' || type === 'laranja') {
        // Laranja
        graphics.fillStyle(0x16a34a, 1);
        graphics.fillEllipse(x + 5 * s, y - 20 * s, 9 * s, 5 * s); // Folha
        graphics.fillStyle(0x78350f, 1);
        graphics.fillRect(x - 1.5 * s, y - 20 * s, 3 * s, 6 * s); // Cabinho
        graphics.fillStyle(0xf97316, 1);
        graphics.fillCircle(x, y, 20 * s);
        graphics.fillStyle(0xfbbf24, 0.4);
        graphics.fillCircle(x - 6 * s, y - 6 * s, 8 * s);
      } else if (type === 'strawberry' || type === 'morango') {
        // Morango
        graphics.fillStyle(0xdc2626, 1);
        graphics.fillTriangle(x - 16 * s, y - 10 * s, x + 16 * s, y - 10 * s, x, y + 20 * s);
        graphics.fillCircle(x, y - 6 * s, 16 * s);
        // Folhas verdes no topo
        graphics.fillStyle(0x16a34a, 1);
        graphics.fillTriangle(x - 12 * s, y - 16 * s, x - 4 * s, y - 8 * s, x, y - 20 * s);
        graphics.fillTriangle(x + 12 * s, y - 16 * s, x + 4 * s, y - 8 * s, x, y - 20 * s);
        // Sementinhas douradas
        graphics.fillStyle(0xfef08a, 0.9);
        graphics.fillCircle(x - 6 * s, y - 2 * s, 1.2 * s);
        graphics.fillCircle(x + 6 * s, y - 2 * s, 1.2 * s);
        graphics.fillCircle(x, y + 5 * s, 1.2 * s);
        graphics.fillCircle(x - 5 * s, y + 8 * s, 1.2 * s);
        graphics.fillCircle(x + 5 * s, y + 8 * s, 1.2 * s);
      } else {
        // Uva
        graphics.fillStyle(0x8b5cf6, 1);
        graphics.fillCircle(x - 7 * s, y - 6 * s, 8 * s);
        graphics.fillCircle(x + 7 * s, y - 6 * s, 8 * s);
        graphics.fillCircle(x, y + 4 * s, 8 * s);
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
