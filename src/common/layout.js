// Mobile-first layout primitives shared by official Phaser games.
(() => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function metrics(scene) {
    const width = Number(scene.scale.width) || 390;
    const height = Number(scene.scale.height) || 844;
    const portrait = height >= width;
    const shortSide = Math.min(width, height);
    const padding = clamp(shortSide * 0.04, 14, 28);
    const headerHeight = portrait ? clamp(height * 0.085, 66, 78) : 62;
    const promptHeight = portrait ? clamp(height * 0.11, 74, 96) : 72;
    const footerHeight = portrait ? clamp(height * 0.13, 96, 122) : 86;
    const stageTop = headerHeight + promptHeight;
    const stageBottom = height - footerHeight;

    return {
      width,
      height,
      portrait,
      landscape: !portrait,
      padding,
      touchTarget: clamp(shortSide * 0.14, 52, 68),
      header: {
        x: width / 2,
        y: headerHeight / 2,
        width,
        height: headerHeight,
      },
      prompt: {
        x: width / 2,
        y: headerHeight + 8,
        width: width - padding * 2,
        height: promptHeight - 8,
      },
      stage: {
        left: padding,
        top: stageTop,
        right: width - padding,
        bottom: stageBottom,
        width: width - padding * 2,
        height: Math.max(160, stageBottom - stageTop),
        centerX: width / 2,
        centerY: stageTop + Math.max(160, stageBottom - stageTop) / 2,
      },
      footer: {
        x: width / 2,
        y: height - footerHeight / 2,
        width: width - padding * 2,
        height: footerHeight,
      },
    };
  }

  function columnsFor(count, metricsValue, preferred = 4) {
    const maxCols = metricsValue.portrait ? preferred : Math.max(preferred, 5);
    return Math.max(1, Math.min(count, maxCols));
  }

  function grid(count, bounds, options = {}) {
    const cols = Math.max(1, Math.min(count, options.cols || 4));
    const rows = Math.max(1, Math.ceil(count / cols));
    const gapX = options.gapX ?? 10;
    const gapY = options.gapY ?? 10;
    const cellWidth = (bounds.width - gapX * (cols - 1)) / cols;
    const cellHeight = (bounds.height - gapY * (rows - 1)) / rows;
    const points = [];

    for (let index = 0; index < count; index += 1) {
      const col = index % cols;
      const row = Math.floor(index / cols);
      points.push({
        x: bounds.left + cellWidth / 2 + col * (cellWidth + gapX),
        y: bounds.top + cellHeight / 2 + row * (cellHeight + gapY),
        width: cellWidth,
        height: cellHeight,
        row,
        col,
      });
    }

    return { cols, rows, cellWidth, cellHeight, points };
  }

  function row(count, bounds, options = {}) {
    const gap = options.gap ?? 10;
    const maxWidth = options.maxWidth ?? 104;
    const minWidth = options.minWidth ?? 54;
    const available = bounds.width - gap * Math.max(0, count - 1);
    const width = clamp(available / Math.max(1, count), minWidth, maxWidth);
    const total = width * count + gap * Math.max(0, count - 1);
    const start = bounds.left + (bounds.width - total) / 2;
    return Array.from({ length: count }, (_, index) => ({
      x: start + width / 2 + index * (width + gap),
      y: bounds.top + bounds.height / 2,
      width,
      height: bounds.height,
    }));
  }

  window.AprincarLayout = {
    clamp,
    metrics,
    columnsFor,
    grid,
    row,
  };
})();
