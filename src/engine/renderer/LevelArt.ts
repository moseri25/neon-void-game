/**
 * Procedural level art generator.
 * Each level gets a unique cyberpunk-themed hidden image that is
 * revealed as the player captures area from the void.
 */

type ArtGenerator = (ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) => void;

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Pattern 1: Neon City Skyline ──
const drawCitySkyline: ArtGenerator = (ctx, w, h, seed) => {
  const rng = mulberry32(seed);

  // Night sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#0a001a');
  skyGrad.addColorStop(0.4, '#1a0033');
  skyGrad.addColorStop(0.7, '#0d0d2b');
  skyGrad.addColorStop(1, '#050510');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 120; i++) {
    const sx = rng() * w;
    const sy = rng() * h * 0.5;
    const sr = rng() * 1.5 + 0.3;
    ctx.fillStyle = `rgba(255,255,255,${rng() * 0.6 + 0.2})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horizon glow
  const horizonY = h * 0.6;
  const horizonGrad = ctx.createRadialGradient(w / 2, horizonY, 0, w / 2, horizonY, w * 0.6);
  horizonGrad.addColorStop(0, 'rgba(255, 0, 100, 0.25)');
  horizonGrad.addColorStop(0.5, 'rgba(120, 0, 255, 0.1)');
  horizonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, 0, w, h);

  // Buildings
  const buildingCount = 15 + Math.floor(rng() * 10);
  for (let i = 0; i < buildingCount; i++) {
    const bx = rng() * w;
    const bw = 20 + rng() * 60;
    const bh = 80 + rng() * (h * 0.55);
    const by = h - bh;

    // Building body
    const bGrad = ctx.createLinearGradient(bx, by, bx, h);
    const hue = rng() > 0.5 ? 280 : 200;
    bGrad.addColorStop(0, `hsla(${hue}, 60%, 12%, 0.95)`);
    bGrad.addColorStop(1, `hsla(${hue}, 60%, 5%, 0.98)`);
    ctx.fillStyle = bGrad;
    ctx.fillRect(bx - bw / 2, by, bw, bh);

    // Windows
    const winRows = Math.floor(bh / 14);
    const winCols = Math.floor(bw / 12);
    for (let row = 1; row < winRows; row++) {
      for (let col = 0; col < winCols; col++) {
        if (rng() > 0.45) {
          const wx = bx - bw / 2 + 4 + col * 12;
          const wy = by + 6 + row * 14;
          const colors = ['#00F0FF', '#FF003C', '#FFB800', '#00FF88', '#FF00FF'];
          ctx.fillStyle = rng() > 0.3
            ? colors[Math.floor(rng() * colors.length)]! + '88'
            : 'rgba(255,200,50,0.15)';
          ctx.fillRect(wx, wy, 6, 8);
        }
      }
    }

    // Neon edge
    ctx.strokeStyle = rng() > 0.5 ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 0, 60, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - bw / 2, by, bw, bh);
  }

  // Ground reflection line
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, h - 2);
  ctx.lineTo(w, h - 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
};

// ── Pattern 2: Circuit Board ──
const drawCircuitBoard: ArtGenerator = (ctx, w, h, seed) => {
  const rng = mulberry32(seed);

  ctx.fillStyle = '#050a12';
  ctx.fillRect(0, 0, w, h);

  const traces = 60 + Math.floor(rng() * 40);
  const colors = ['#00F0FF', '#00FF88', '#FFB800', '#FF003C'];

  for (let i = 0; i < traces; i++) {
    let x = rng() * w;
    let y = rng() * h;
    const color = colors[Math.floor(rng() * colors.length)]!;
    const alpha = (rng() * 0.4 + 0.1).toFixed(2);
    const segments = 5 + Math.floor(rng() * 15);

    ctx.strokeStyle = color.slice(0, 7) + alpha.replace('0.', '');
    ctx.lineWidth = rng() > 0.7 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let s = 0; s < segments; s++) {
      const dir = Math.floor(rng() * 4);
      const len = 15 + rng() * 50;
      switch (dir) {
        case 0: x += len; break;
        case 1: x -= len; break;
        case 2: y += len; break;
        case 3: y -= len; break;
      }
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Nodes
    if (rng() > 0.5) {
      ctx.fillStyle = color + '44';
      ctx.beginPath();
      ctx.arc(x, y, 3 + rng() * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color + '66';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Chips
  for (let i = 0; i < 8; i++) {
    const cx = rng() * w;
    const cy = rng() * h;
    const cw = 30 + rng() * 40;
    const ch = 20 + rng() * 30;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);

    // Pins
    for (let p = 0; p < Math.floor(cw / 8); p++) {
      const px = cx - cw / 2 + 4 + p * 8;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(px, cy - ch / 2);
      ctx.lineTo(px, cy - ch / 2 - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px, cy + ch / 2);
      ctx.lineTo(px, cy + ch / 2 + 8);
      ctx.stroke();
    }
  }
};

// ── Pattern 3: Plasma Waves ──
const drawPlasmaWaves: ArtGenerator = (ctx, w, h, seed) => {
  const rng = mulberry32(seed);

  ctx.fillStyle = '#030008';
  ctx.fillRect(0, 0, w, h);

  const waveCount = 12 + Math.floor(rng() * 8);
  const palette = [
    ['#FF003C', '#FF006688'],
    ['#00F0FF', '#00F0FF88'],
    ['#FF00FF', '#FF00FF88'],
    ['#FFB800', '#FFB80088'],
    ['#00FF88', '#00FF8888'],
  ];

  for (let i = 0; i < waveCount; i++) {
    const [color, glow] = palette[Math.floor(rng() * palette.length)]!;
    const amplitude = 30 + rng() * 80;
    const frequency = 0.003 + rng() * 0.012;
    const baseY = rng() * h;
    const phase = rng() * Math.PI * 2;
    const thick = 1 + rng() * 3;

    ctx.strokeStyle = color!;
    ctx.lineWidth = thick;
    ctx.shadowColor = glow!;
    ctx.shadowBlur = 8 + rng() * 12;
    ctx.globalAlpha = 0.3 + rng() * 0.4;

    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = baseY + Math.sin(x * frequency + phase) * amplitude
        + Math.sin(x * frequency * 2.3 + phase * 1.7) * amplitude * 0.3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Orbs
  for (let i = 0; i < 20; i++) {
    const ox = rng() * w;
    const oy = rng() * h;
    const or = 5 + rng() * 25;
    const oColor = palette[Math.floor(rng() * palette.length)]![0]!;
    const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
    orbGrad.addColorStop(0, oColor + '33');
    orbGrad.addColorStop(1, oColor + '00');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(ox, oy, or, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ── Pattern 4: Geometric Mandala ──
const drawMandala: ArtGenerator = (ctx, w, h, seed) => {
  const rng = mulberry32(seed);

  ctx.fillStyle = '#06000f';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.45;
  const rings = 6 + Math.floor(rng() * 6);
  const colors = ['#00F0FF', '#FF003C', '#FF00FF', '#FFB800', '#00FF88'];

  for (let ring = 0; ring < rings; ring++) {
    const r = maxR * ((ring + 1) / rings);
    const segments = 6 + Math.floor(rng() * 12) * 2;
    const color = colors[ring % colors.length]!;
    const alpha = (0.15 + rng() * 0.35).toFixed(2);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1 + rng();
    ctx.globalAlpha = parseFloat(alpha);
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;

    // Polygon ring
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
      const wobble = 1 + Math.sin(angle * (3 + ring)) * 0.1 * rng();
      const px = cx + Math.cos(angle) * r * wobble;
      const py = cy + Math.sin(angle) * r * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Spokes
    if (rng() > 0.4) {
      const spokeCount = segments;
      for (let s = 0; s < spokeCount; s++) {
        const angle = (s / spokeCount) * Math.PI * 2;
        const innerR = r * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.stroke();
      }
    }

    // Dots at vertices
    ctx.fillStyle = color + '55';
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(px, py, 2 + rng() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
};

// ── Pattern 5: Digital Rain / Matrix ──
const drawDigitalRain: ArtGenerator = (ctx, w, h, seed) => {
  const rng = mulberry32(seed);

  ctx.fillStyle = '#000a00';
  ctx.fillRect(0, 0, w, h);

  const cols = Math.floor(w / 14);
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

  for (let col = 0; col < cols; col++) {
    const x = col * 14 + 2;
    const streamLen = 8 + Math.floor(rng() * 25);
    const startY = rng() * h;
    const speed = rng();

    for (let row = 0; row < streamLen; row++) {
      const y = startY + row * 16;
      if (y > h) break;

      const charIdx = Math.floor(rng() * chars.length);
      const brightness = 1 - row / streamLen;
      const isHead = row === 0;

      if (isHead) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00FF88';
        ctx.shadowBlur = 8;
      } else {
        const g = Math.floor(100 + brightness * 155);
        ctx.fillStyle = `rgba(0, ${g}, ${Math.floor(g * 0.4)}, ${(brightness * 0.8).toFixed(2)})`;
        ctx.shadowBlur = 0;
      }

      ctx.font = `${11 + (isHead ? 2 : 0)}px monospace`;
      ctx.fillText(chars[charIdx]!, x, y);
    }
  }

  ctx.shadowBlur = 0;

  // Highlight columns
  for (let i = 0; i < 5; i++) {
    const hx = rng() * w;
    const grad = ctx.createLinearGradient(hx, 0, hx, h);
    grad.addColorStop(0, 'rgba(0, 255, 136, 0)');
    grad.addColorStop(0.3 + rng() * 0.2, 'rgba(0, 255, 136, 0.06)');
    grad.addColorStop(1, 'rgba(0, 255, 136, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(hx - 8, 0, 16, h);
  }
};

// ── Pattern 6: Cosmic Nebula ──
const drawNebula: ArtGenerator = (ctx, w, h, seed) => {
  const rng = mulberry32(seed);

  ctx.fillStyle = '#020010';
  ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 200; i++) {
    const sx = rng() * w;
    const sy = rng() * h;
    const sr = rng() * 1.2 + 0.2;
    ctx.fillStyle = `rgba(255,255,255,${(rng() * 0.7 + 0.1).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nebula clouds
  const cloudCount = 8 + Math.floor(rng() * 6);
  const nebulaColors = [
    [255, 0, 100],
    [100, 0, 255],
    [0, 200, 255],
    [255, 100, 0],
    [0, 255, 150],
  ];

  for (let i = 0; i < cloudCount; i++) {
    const cx = rng() * w;
    const cy = rng() * h;
    const cr = 60 + rng() * 150;
    const [r, g, b] = nebulaColors[Math.floor(rng() * nebulaColors.length)]!;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${(0.12 + rng() * 0.15).toFixed(2)})`);
    grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${(0.04 + rng() * 0.06).toFixed(2)})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright stars (larger)
  for (let i = 0; i < 8; i++) {
    const sx = rng() * w;
    const sy = rng() * h;
    const sr = 2 + rng() * 3;
    const color = nebulaColors[Math.floor(rng() * nebulaColors.length)]!;

    ctx.shadowColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();

    // Cross flare
    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx - sr * 4, sy);
    ctx.lineTo(sx + sr * 4, sy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx, sy - sr * 4);
    ctx.lineTo(sx, sy + sr * 4);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
};

const GENERATORS: ArtGenerator[] = [
  drawCitySkyline,
  drawCircuitBoard,
  drawPlasmaWaves,
  drawMandala,
  drawDigitalRain,
  drawNebula,
];

/**
 * Generate a level art canvas (offscreen) for the given level number.
 * Returns an OffscreenCanvas (or regular canvas as fallback) with the art.
 */
export function generateLevelArt(
  level: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const generatorIndex = (level - 1) % GENERATORS.length;
  const generator = GENERATORS[generatorIndex]!;

  // Use level as seed for deterministic art
  generator(ctx, width, height, level * 7919);

  return canvas;
}

/**
 * Returns the name/theme of the art for a given level.
 */
export function getLevelArtName(level: number): string {
  const names = [
    'Neon City',
    'Circuit Board',
    'Plasma Waves',
    'Mandala',
    'Digital Rain',
    'Cosmic Nebula',
  ];
  return names[(level - 1) % names.length]!;
}
