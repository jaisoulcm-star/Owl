// ==================== Procedural Architectural PBR Textures ====================
// Generates high-resolution, photorealistic seamless canvas textures for
// modern luxury villa materials with zero external network latency.

import * as THREE from 'three';

const textureCache = new Map();

function createProceduralCanvas(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 1. Natural Split-Face Travertine Stone
export function getTravertineTexture() {
  if (textureCache.has('travertine')) return textureCache.get('travertine');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    // Base warm limestone
    ctx.fillStyle = '#dfd7cc';
    ctx.fillRect(0, 0, w, h);

    // Subtle horizontal sedimentary layers
    for (let y = 0; y < h; y += 4) {
      const alpha = 0.04 + Math.sin(y * 0.08) * 0.03;
      ctx.fillStyle = y % 8 === 0 ? `rgba(180, 165, 150, ${alpha})` : `rgba(240, 235, 225, ${alpha})`;
      ctx.fillRect(0, y, w, 4);
    }

    // Split-face stone block ashlar pattern
    ctx.strokeStyle = 'rgba(120, 105, 90, 0.28)';
    ctx.lineWidth = 2;
    const rowH = 64;
    for (let y = 0; y < h; y += rowH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      const offset = (Math.floor(y / rowH) % 2) * 80;
      for (let x = offset; x < w + 160; x += 160) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }

    // Micro-pores and natural mineral specks
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  });

  tex.repeat.set(3, 2);
  textureCache.set('travertine', tex);
  return tex;
}

// 2. Smooth Exposed Architectural Concrete (Formwork with tie-holes)
export function getConcreteTexture() {
  if (textureCache.has('concrete')) return textureCache.get('concrete');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    // Pale architectural grey
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(0, 0, w, h);

    // Subtle formwork panel joints
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
    ctx.strokeRect(0, 0, w, h / 2);

    // Formwork tie-rod holes with soft shadows
    const holes = [
      [40, 40], [w - 40, 40],
      [40, h / 2 - 40], [w - 40, h / 2 - 40],
      [40, h / 2 + 40], [w - 40, h / 2 + 40],
      [40, h - 40], [w - 40, h - 40]
    ];

    holes.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(55, 65, 81, 0.45)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(31, 41, 55, 0.7)';
      ctx.fill();
    });

    // Cement grain noise
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  });

  tex.repeat.set(2, 2);
  textureCache.set('concrete', tex);
  return tex;
}

// 3. Warm Teak Wood Slats (Architectural Louvers)
export function getWoodSlatTexture() {
  if (textureCache.has('wood_slat')) return textureCache.get('wood_slat');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    // Warm rich teak base
    ctx.fillStyle = '#b4743c';
    ctx.fillRect(0, 0, w, h);

    const slatW = 16;
    const gapW = 4;
    const step = slatW + gapW;

    for (let x = 0; x < w; x += step) {
      // Wood plank tone variation
      const toneMod = (Math.sin(x * 0.4) + 1) * 12;
      ctx.fillStyle = `rgb(${180 + toneMod}, ${116 + toneMod * 0.7}, ${60 + toneMod * 0.5})`;
      ctx.fillRect(x, 0, slatW, h);

      // Subtle longitudinal wood grain lines
      ctx.strokeStyle = 'rgba(90, 50, 20, 0.18)';
      ctx.lineWidth = 1;
      for (let g = 0; g < 3; g++) {
        const gx = x + 3 + g * 4;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.bezierCurveTo(gx + 2, h * 0.3, gx - 2, h * 0.7, gx + 1, h);
        ctx.stroke();
      }

      // Slat bevel highlight
      ctx.fillStyle = 'rgba(255, 230, 190, 0.25)';
      ctx.fillRect(x, 0, 2, h);

      // Deep dark recessed shadow gap
      ctx.fillStyle = '#26170d';
      ctx.fillRect(x + slatW, 0, gapW, h);
    }
  });

  tex.repeat.set(2, 2);
  textureCache.set('wood_slat', tex);
  return tex;
}

// 4. Modern Linear Flemish / Grey Brick
export function getModernBrickTexture() {
  if (textureCache.has('modern_brick')) return textureCache.get('modern_brick');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    // Mortar color
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, w, h);

    const brickH = 24;
    const brickW = 96;
    const mortar = 4;

    for (let y = 0; y < h; y += brickH + mortar) {
      const rowIdx = Math.floor(y / (brickH + mortar));
      const offsetX = (rowIdx % 2) * (brickW / 2);

      for (let x = -brickW + offsetX; x < w + brickW; x += brickW + mortar) {
        // Subtle brick color variation (warm charcoal / terracotta blend)
        const rand = (Math.sin(x * 0.1 + y * 0.2) + 1) * 0.5;
        const r = Math.floor(130 + rand * 40);
        const g = Math.floor(85 + rand * 30);
        const b = Math.floor(75 + rand * 25);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, brickW, brickH);

        // Brick top bevel highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(x, y, brickW, 2);

        // Brick bottom shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x, y + brickH - 2, brickW, 2);
      }
    }
  });

  tex.repeat.set(3, 3);
  textureCache.set('modern_brick', tex);
  return tex;
}

// 5. Dark Anthracite Slate
export function getSlateTexture() {
  if (textureCache.has('slate')) return textureCache.get('slate');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Chiseled horizontal clefts
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < w; x += 32) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 4);
      }
      ctx.stroke();
    }

    // Mineral flecks
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 20;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);
  });

  tex.repeat.set(2, 2);
  textureCache.set('slate', tex);
  return tex;
}

// 6. Polished Italian Carrara Marble Flooring
export function getMarbleTexture() {
  if (textureCache.has('marble')) return textureCache.get('marble');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // Elegant smoky grey veins
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.bezierCurveTo(w * 0.3, 140, w * 0.7, 40, w, 180);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 120);
    ctx.bezierCurveTo(w * 0.6, 220, w * 0.2, 340, w * 0.8, 500);
    ctx.stroke();

    // Delicate secondary veins
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.beginPath();
    ctx.moveTo(w * 0.7, 40);
    ctx.bezierCurveTo(w * 0.85, 120, w * 0.9, 280, w * 0.6, 420);
    ctx.stroke();

    // Tile seam grid (Large 1200x600mm luxury tiles)
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
  });

  tex.repeat.set(3, 3);
  textureCache.set('marble', tex);
  return tex;
}

// 7. Outdoor Geometric Pavers
export function getPaverTexture() {
  if (textureCache.has('paver')) return textureCache.get('paver');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    // Joint gravel
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, w, h);

    const pw = 128;
    const ph = 64;
    const joint = 4;

    for (let y = 0; y < h; y += ph) {
      const row = Math.floor(y / ph);
      const off = (row % 2) * (pw / 2);
      for (let x = -pw + off; x < w + pw; x += pw) {
        // Paver block
        const v = 160 + (Math.sin(x * 0.2 + y * 0.3) + 1) * 15;
        ctx.fillStyle = `rgb(${v}, ${v + 4}, ${v + 8})`;
        ctx.fillRect(x + joint, y + joint, pw - joint * 2, ph - joint * 2);

        // Chamfered edges
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + joint, y + joint, pw - joint * 2, ph - joint * 2);
      }
    }
  });

  tex.repeat.set(4, 4);
  textureCache.set('paver', tex);
  return tex;
}

// 8. Emerald Lawn Grass
export function getGrassTexture() {
  if (textureCache.has('grass')) return textureCache.get('grass');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, w, h);

    // Micro grass blade variation
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 32;
      data[i] = Math.min(255, Math.max(0, 21 + n * 0.5)); // R
      data[i + 1] = Math.min(255, Math.max(0, 128 + n));   // G
      data[i + 2] = Math.min(255, Math.max(0, 61 + n * 0.6)); // B
    }
    ctx.putImageData(imgData, 0, 0);
  });

  tex.repeat.set(6, 6);
  textureCache.set('grass', tex);
  return tex;
}

// 9. Warm Hardwood Parquet
export function getParquetTexture() {
  if (textureCache.has('parquet')) return textureCache.get('parquet');

  const tex = createProceduralCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#382212';
    ctx.fillRect(0, 0, w, h);

    const plankW = 256;
    const plankH = 32;
    for (let y = 0; y < h; y += plankH) {
      const row = Math.floor(y / plankH);
      const off = (row % 2) * 80;
      for (let x = -plankW + off; x < w + plankW; x += plankW) {
        const rand = (Math.sin(x * 0.05 + y * 0.1) + 1) * 0.5;
        const r = Math.floor(160 + rand * 30);
        const g = Math.floor(105 + rand * 20);
        const b = Math.floor(65 + rand * 15);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

        // Plank highlight & shadow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x + 1, y + 1, plankW - 2, 1);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + 1, y + plankH - 2, plankW - 2, 1);
      }
    }
  });

  tex.repeat.set(3, 3);
  textureCache.set('parquet', tex);
  return tex;
}
