// Shared tracing helpers for mobile-first pre-writing and handwriting games.
(() => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function toPixels(paths, bounds) {
    return paths.map((stroke) =>
      stroke.map(([x, y]) => ({
        x: bounds.left + x * bounds.width,
        y: bounds.top + y * bounds.height
      }))
    );
  }

  function drawGuide(graphics, paths, bounds, color, alpha = 0.28, width = 12) {
    const pixels = toPixels(paths, bounds);
    graphics.lineStyle(width, color, alpha);
    for (const stroke of pixels) {
      if (stroke.length < 2) continue;
      graphics.beginPath();
      graphics.moveTo(stroke[0].x, stroke[0].y);
      for (let index = 1; index < stroke.length; index += 1) {
        graphics.lineTo(stroke[index].x, stroke[index].y);
      }
      graphics.strokePath();
    }
    return pixels;
  }

  function normalizePoint(pointer, bounds) {
    return {
      x: clamp((pointer.x - bounds.left) / bounds.width, 0, 1),
      y: clamp((pointer.y - bounds.top) / bounds.height, 0, 1),
      t: Date.now()
    };
  }

  function samplePaths(paths, samplesPerSegment = 8) {
    const samples = [];
    for (const stroke of paths) {
      for (let index = 1; index < stroke.length; index += 1) {
        const [x1, y1] = stroke[index - 1];
        const [x2, y2] = stroke[index];
        for (let step = 0; step <= samplesPerSegment; step += 1) {
          const t = step / samplesPerSegment;
          samples.push({
            x: x1 + (x2 - x1) * t,
            y: y1 + (y2 - y1) * t
          });
        }
      }
    }
    return samples;
  }

  function coverage(strokes, paths, tolerance = 0.13) {
    const drawn = (strokes || []).flat().filter((point) =>
      Number.isFinite(point?.x) && Number.isFinite(point?.y)
    );
    const targets = samplePaths(paths);
    if (!drawn.length || !targets.length) return 0;

    let matched = 0;
    for (const target of targets) {
      const found = drawn.some(
        (point) => Math.hypot(point.x - target.x, point.y - target.y) <= tolerance
      );
      if (found) matched += 1;
    }
    return matched / targets.length;
  }

  window.AprincarTraceTools = {
    clamp,
    toPixels,
    drawGuide,
    normalizePoint,
    coverage
  };
})();
