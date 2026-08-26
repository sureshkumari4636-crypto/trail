// Utility to generate realistic fundus simulation data URLs and realistic Grad-CAM heatmaps
import { DRStage } from '../types/dr';

export interface Hotspot {
  x: number;
  y: number;
  radius: number;
  intensity: number;
}

/**
 * Draws a realistic synthetic retinal fundus onto a canvas
 */
export function generateSyntheticFundus(
  stage: DRStage,
  width: number = 600,
  height: number = 600,
  isBlurry: boolean = false
): { dataUrl: string; hotspots: Hotspot[] } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: '', hotspots: [] };

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.46;

  // 1. Black background
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, width, height);

  // 2. Circular Retina Mask
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // 3. Fundus Base Gradient (Orange-Red with realistic choroidal depth)
  const baseGrad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
  baseGrad.addColorStop(0, '#c34a26');
  baseGrad.addColorStop(0.5, '#a6331a');
  baseGrad.addColorStop(0.85, '#731a0d');
  baseGrad.addColorStop(1.0, '#380c05');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 4. Subtle retinal texture / granularity
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      const noise = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.6));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.3));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 5. Optic Disc (Nasal side, typically brighter yellowish circle)
  const discX = cx + radius * 0.44;
  const discY = cy - radius * 0.05;
  const discR = radius * 0.16;

  const discGrad = ctx.createRadialGradient(discX, discY, discR * 0.2, discX, discY, discR);
  discGrad.addColorStop(0, '#fff4cc');
  discGrad.addColorStop(0.6, '#ffd57d');
  discGrad.addColorStop(0.9, '#e09848');
  discGrad.addColorStop(1, '#ab5c23');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(discX, discY, discR, 0, Math.PI * 2);
  ctx.fill();

  // Cup inside disc
  ctx.fillStyle = '#fffce0';
  ctx.beginPath();
  ctx.arc(discX - discR * 0.1, discY, discR * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 6. Fovea & Macula (Temporal side, darker avascular zone)
  const maculaX = cx - radius * 0.25;
  const maculaY = cy + radius * 0.05;
  const maculaR = radius * 0.26;

  const maculaGrad = ctx.createRadialGradient(maculaX, maculaY, maculaR * 0.1, maculaX, maculaY, maculaR);
  maculaGrad.addColorStop(0, '#4e1208');
  maculaGrad.addColorStop(0.4, '#6b190c');
  maculaGrad.addColorStop(0.8, '#8b2413');
  maculaGrad.addColorStop(1, 'rgba(139, 36, 19, 0)');
  ctx.fillStyle = maculaGrad;
  ctx.beginPath();
  ctx.arc(maculaX, maculaY, maculaR, 0, Math.PI * 2);
  ctx.fill();

  // Foveal reflex point
  ctx.fillStyle = 'rgba(255, 220, 180, 0.4)';
  ctx.beginPath();
  ctx.arc(maculaX, maculaY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 7. Retinal Blood Vessels (Arcades emerging from Optic Disc)
  ctx.strokeStyle = '#5a0d05';
  ctx.lineCap = 'round';

  const drawVesselArcade = (startX: number, startY: number, ctrlX1: number, ctrlY1: number, ctrlX2: number, ctrlY2: number, endX: number, endY: number, width: number) => {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(ctrlX1, ctrlY1, ctrlX2, ctrlY2, endX, endY);
    ctx.stroke();

    // Secondary smaller branches
    ctx.lineWidth = width * 0.55;
    ctx.beginPath();
    ctx.moveTo((startX + ctrlX1) / 2, (startY + ctrlY1) / 2);
    ctx.quadraticCurveTo(ctrlX1 - 25, ctrlY1 + 15, ctrlX1 - 50, ctrlY1 - 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((ctrlX2 + endX) / 2, (ctrlY2 + endY) / 2);
    ctx.quadraticCurveTo(ctrlX2 + 10, ctrlY2 - 30, endX + 15, endY - 40);
    ctx.stroke();
  };

  // Superior Temporal Arcade
  drawVesselArcade(discX, discY, discX - radius * 0.3, cy - radius * 0.55, maculaX, cy - radius * 0.5, maculaX - radius * 0.4, cy - radius * 0.3, 4.5);
  // Inferior Temporal Arcade
  drawVesselArcade(discX, discY, discX - radius * 0.3, cy + radius * 0.55, maculaX, cy + radius * 0.5, maculaX - radius * 0.4, cy + radius * 0.3, 4.2);
  // Superior Nasal Arcade
  drawVesselArcade(discX, discY, discX + radius * 0.2, cy - radius * 0.4, discX + radius * 0.35, cy - radius * 0.45, discX + radius * 0.42, cy - radius * 0.3, 3.2);
  // Inferior Nasal Arcade
  drawVesselArcade(discX, discY, discX + radius * 0.2, cy + radius * 0.4, discX + radius * 0.35, cy + radius * 0.45, discX + radius * 0.42, cy + radius * 0.3, 3.0);

  // 8. Inject Stage-Specific Diabetic Retinopathy Lesions & compute Grad-CAM Hotspots
  const hotspots: Hotspot[] = [];

  if (stage === 0) {
    // Normal retina: Grad-CAM typically focuses symmetrically on macula and optic nerve head
    hotspots.push(
      { x: maculaX, y: maculaY, radius: radius * 0.22, intensity: 0.85 },
      { x: discX, y: discY, radius: radius * 0.18, intensity: 0.65 }
    );
  } else if (stage === 1) {
    // Mild DR: A few tiny microaneurysms (red pinpoint dots) around the macula
    const maPositions = [
      { x: maculaX + 35, y: maculaY - 25 },
      { x: maculaX - 45, y: maculaY + 30 },
      { x: maculaX + 20, y: maculaY + 45 },
    ];
    maPositions.forEach((pos) => {
      ctx.fillStyle = '#450704';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Outer micro-halo
      ctx.fillStyle = 'rgba(120, 20, 10, 0.4)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      hotspots.push({ x: pos.x, y: pos.y, radius: 45, intensity: 0.95 });
    });
  } else if (stage === 2) {
    // Moderate DR: Microaneurysms + Blot Hemorrhages + Hard Exudates (yellow lipid deposits)
    const blotHemorrhages = [
      { x: maculaX - 55, y: maculaY - 45, r: 6 },
      { x: maculaX + 65, y: maculaY + 25, r: 8 },
      { x: cx - 20, y: cy - 70, r: 7 },
      { x: discX - 60, y: discY + 60, r: 6.5 },
    ];
    blotHemorrhages.forEach((h) => {
      ctx.fillStyle = '#3b0604';
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, h.r, h.r * 0.7, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      hotspots.push({ x: h.x, y: h.y, radius: 55, intensity: 0.88 });
    });

    // Hard Exudates (bright yellowish clusters)
    const exudates = [
      { x: maculaX + 45, y: maculaY - 35 },
      { x: maculaX + 52, y: maculaY - 30 },
      { x: maculaX + 40, y: maculaY - 42 },
      { x: maculaX - 35, y: maculaY + 55 },
      { x: maculaX - 42, y: maculaY + 62 },
    ];
    exudates.forEach((e) => {
      ctx.fillStyle = '#fff4a3';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 2.8, 0, Math.PI * 2);
      ctx.fill();
      hotspots.push({ x: e.x, y: e.y, radius: 40, intensity: 0.92 });
    });
  } else if (stage === 3) {
    // Severe NPDR: 4-2-1 Rule: Widespread Hemorrhages in all quadrants, Cotton Wool Spots, Venous Beading
    // Cotton Wool Spots (white-grey fluffy infarcts)
    const cws = [
      { x: maculaX - 70, y: maculaY - 30, r: 12 },
      { x: cx + 10, y: cy - 90, r: 14 },
      { x: maculaX - 30, y: cy + 85, r: 11 },
    ];
    cws.forEach((c) => {
      const cGrad = ctx.createRadialGradient(c.x, c.y, 1, c.x, c.y, c.r);
      cGrad.addColorStop(0, 'rgba(240, 245, 255, 0.85)');
      cGrad.addColorStop(0.7, 'rgba(215, 225, 240, 0.4)');
      cGrad.addColorStop(1, 'rgba(200, 210, 220, 0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      hotspots.push({ x: c.x, y: c.y, radius: 65, intensity: 0.96 });
    });

    // Extensive Hemorrhages across 4 quadrants
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dist = radius * (0.3 + Math.random() * 0.45);
      const hx = cx + Math.cos(angle) * dist;
      const hy = cy + Math.sin(angle) * dist;
      ctx.fillStyle = '#2f0503';
      ctx.beginPath();
      ctx.ellipse(hx, hy, 5 + Math.random() * 5, 3 + Math.random() * 4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      if (i % 3 === 0) {
        hotspots.push({ x: hx, y: hy, radius: 60, intensity: 0.9 });
      }
    }
  } else if (stage === 4) {
    // Proliferative DR: Neovascularization (tangle of fragile abnormal vessels), Preretinal / Vitreous Hemorrhage
    // Neovascularization at Disc (NVD) & elsewhere (NVE)
    ctx.strokeStyle = '#6b0502';
    ctx.lineWidth = 1.6;
    for (let j = 0; j < 12; j++) {
      ctx.beginPath();
      ctx.moveTo(discX + (Math.random() - 0.5) * 20, discY + (Math.random() - 0.5) * 20);
      ctx.bezierCurveTo(
        discX - 30 + Math.random() * 40,
        discY - 40 + Math.random() * 50,
        discX - 40 + Math.random() * 60,
        discY + 30 + Math.random() * 40,
        discX - 50 + Math.random() * 80,
        discY - 20 + Math.random() * 60
      );
      ctx.stroke();
    }
    hotspots.push({ x: discX - 25, y: discY - 10, radius: 90, intensity: 1.0 });

    // Large Preretinal Hemorrhage boat-shaped / D-shaped
    const phX = maculaX + 20;
    const phY = maculaY + 40;
    ctx.fillStyle = '#220302';
    ctx.beginPath();
    ctx.arc(phX, phY, 35, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    hotspots.push({ x: phX, y: phY + 15, radius: 85, intensity: 1.0 });

    // Extensive hard exudates and hemorrhages
    for (let k = 0; k < 12; k++) {
      ctx.fillStyle = '#fff6b0';
      ctx.beginPath();
      ctx.arc(cx + (Math.random() - 0.5) * radius * 0.9, cy + (Math.random() - 0.5) * radius * 0.9, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 9. If image is marked blurry for quality check demo, apply canvas blur
  if (isBlurry) {
    ctx.filter = 'blur(6px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
  }

  ctx.restore();

  // Subtle circular border vignette
  ctx.strokeStyle = '#1a1a24';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    hotspots,
  };
}

/**
 * Renders a Grad-CAM Heatmap overlay onto a canvas
 */
export function renderGradCAMHeatmap(
  canvas: HTMLCanvasElement,
  baseImage: HTMLImageElement | HTMLCanvasElement,
  hotspots: Hotspot[],
  colormap: 'jet' | 'turbo' | 'inferno' | 'viridis' = 'jet',
  opacity: number = 0.65,
  showContour: boolean = true
) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw base image
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(baseImage, 0, 0, width, height);

  if (opacity <= 0.01) return;

  // 2. Offscreen intensity map
  const heatCanvas = document.createElement('canvas');
  heatCanvas.width = width;
  heatCanvas.height = height;
  const hCtx = heatCanvas.getContext('2d');
  if (!hCtx) return;

  // Draw smooth radial gradients for each activation hotspot
  hotspots.forEach((spot) => {
    const rad = spot.radius || 60;
    const grad = hCtx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, rad);
    const alpha = Math.min(1, Math.max(0.1, spot.intensity));
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(0.4, `rgba(255, 255, 255, ${alpha * 0.7})`);
    grad.addColorStop(0.75, `rgba(255, 255, 255, ${alpha * 0.25})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    hCtx.fillStyle = grad;
    hCtx.beginPath();
    hCtx.arc(spot.x, spot.y, rad, 0, Math.PI * 2);
    hCtx.fill();
  });

  // 3. Convert gray intensity to colormap
  const hImgData = hCtx.getImageData(0, 0, width, height);
  const hData = hImgData.data;

  const outImgData = ctx.createImageData(width, height);
  const outData = outImgData.data;

  // Jet / Colormap mapping function
  for (let i = 0; i < hData.length; i += 4) {
    const intensity = hData[i + 3] / 255; // 0.0 to 1.0

    if (intensity > 0.05) {
      const [r, g, b] = getColormapRGB(intensity, colormap);
      outData[i] = r;
      outData[i + 1] = g;
      outData[i + 2] = b;
      outData[i + 3] = Math.floor(intensity * opacity * 255);
    } else {
      outData[i + 3] = 0;
    }
  }

  // 4. Draw heat overlay on top of base image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCanvas.getContext('2d')?.putImageData(outImgData, 0, 0);

  ctx.drawImage(tempCanvas, 0, 0);

  // 5. Draw optional clinical bounding contours around peak activation
  if (showContour) {
    hotspots.forEach((spot) => {
      if (spot.intensity > 0.6) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }
}

function getColormapRGB(t: number, map: 'jet' | 'turbo' | 'inferno' | 'viridis'): [number, number, number] {
  const clamp = (x: number) => Math.min(255, Math.max(0, Math.round(x)));

  if (map === 'jet') {
    // Classic medical Grad-CAM Jet (Blue -> Cyan -> Yellow -> Orange -> Red)
    let r = 0;
    let g = 0;
    let b = 0;

    if (t < 0.125) {
      b = 128 + t * 8 * 127;
    } else if (t < 0.375) {
      b = 255;
      g = (t - 0.125) * 4 * 255;
    } else if (t < 0.625) {
      b = (0.625 - t) * 4 * 255;
      g = 255;
      r = (t - 0.375) * 4 * 255;
    } else if (t < 0.875) {
      g = (0.875 - t) * 4 * 255;
      r = 255;
    } else {
      r = 255 - (t - 0.875) * 8 * 60;
    }
    return [clamp(r), clamp(g), clamp(b)];
  }

  if (map === 'turbo') {
    // Google Turbo colormap (Perceptually uniform)
    const r = 34.61 + t * (1172.33 + t * (-10791.3 + t * (33300.1 + t * (-38394.4 + t * 14825.0))));
    const g = 23.31 + t * (557.33 + t * (1225.33 + t * (-3574.96 + t * (1073.77 + t * 707.56))));
    const b = 27.2 + t * (3211.1 - t * (15327.97 - t * (27814.0 - t * (22569.18 - t * 6838.66))));
    return [clamp(r), clamp(g), clamp(b)];
  }

  if (map === 'inferno') {
    // Black -> Purple -> Orange -> Yellow
    const r = Math.sin(t * Math.PI * 0.9) * 255;
    const g = Math.pow(t, 2) * 230;
    const b = Math.sin((1 - t) * Math.PI * 0.6) * 180 + t * 40;
    return [clamp(r), clamp(g), clamp(b)];
  }

  // Default Viridis (Deep purple -> Teal -> Yellow)
  const r = 68 + t * 180;
  const g = 1 + Math.sin(t * Math.PI) * 210 + t * 40;
  const b = 84 + (1 - t) * 140;
  return [clamp(r), clamp(g), clamp(b)];
}
