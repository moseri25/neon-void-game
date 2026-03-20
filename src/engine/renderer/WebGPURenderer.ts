import type { Polygon } from '@/domain/geometry/Polygon';

export class NeonRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private cameraScale: number = 1;
  private shakeX: number = 0;
  private shakeY: number = 0;
  private shakeIntensity: number = 0;
  private time: number = 0;
  private quality: 'low' | 'medium' | 'high' | 'ultra' = 'high';
  private spiderSmall: HTMLImageElement | null = null;
  private spiderBoss: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.resize();
    this.loadAssets();
  }

  private loadAssets(): void {
    if (typeof window !== 'undefined') {
      this.spiderSmall = new Image();
      this.spiderSmall.src = '/spider-small.svg';
      this.spiderBoss = new Image();
      this.spiderBoss.src = '/spider-boss.svg';
    }
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setCamera(x: number, y: number, scale: number = 1): void {
    this.cameraX = x;
    this.cameraY = y;
    this.cameraScale = scale;
  }

  setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    this.quality = quality;
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - (this.width / 2 + this.shakeX)) / this.cameraScale + this.cameraX,
      y: (sy - (this.height / 2 + this.shakeY)) / this.cameraScale + this.cameraY
    };
  }

  private applyGlow(color: string, baseBlur: number = 15): void {
    if (this.quality === 'low') return;
    this.ctx.shadowColor = color;
    if (this.quality === 'ultra') this.ctx.shadowBlur = Math.round(baseBlur * 1.8);
    else if (this.quality === 'high') this.ctx.shadowBlur = baseBlur;
    else if (this.quality === 'medium') this.ctx.shadowBlur = Math.round(baseBlur * 0.4);
  }

  shake(intensity: number): void {
    this.shakeIntensity = intensity;
  }

  begin(): void {
    this.time += 0.016;

    if (this.shakeIntensity > 0.5) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= 0.9;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#05050A';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(
      this.width / 2 + this.shakeX,
      this.height / 2 + this.shakeY
    );
    this.ctx.scale(this.cameraScale, this.cameraScale);
    this.ctx.translate(-this.cameraX, -this.cameraY);
  }

  end(): void {
    this.ctx.restore();
  }

  drawPolygon(polygon: Polygon, fillColor: string, strokeColor: string, glowColor?: string): void {
    const verts = polygon.vertices;
    if (verts.length < 3) return;

    this.ctx.save();

    if (glowColor) {
      this.applyGlow(glowColor, 15);
    }

    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(verts[0]!.x, verts[0]!.y);
    for (let i = 1; i < verts.length; i++) {
      this.ctx.lineTo(verts[i]!.x, verts[i]!.y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawGrid(polygon: Polygon, cellSize: number = 30, color: string = 'rgba(0, 240, 255, 0.08)'): void {
    if (this.quality === 'low') return;
    const bounds = polygon.getBounds();
    const ctx = this.ctx;

    ctx.save();

    ctx.beginPath();
    const verts = polygon.vertices;
    ctx.moveTo(verts[0]!.x, verts[0]!.y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i]!.x, verts[i]!.y);
    }
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;

    const offset = (this.time * 10) % cellSize;

    for (let x = bounds.min.x - cellSize + offset; x <= bounds.max.x + cellSize; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, bounds.min.y);
      ctx.lineTo(x, bounds.max.y);
      ctx.stroke();
    }

    for (let y = bounds.min.y - cellSize + offset; y <= bounds.max.y + cellSize; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(bounds.min.x, y);
      ctx.lineTo(bounds.max.x, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCircle(x: number, y: number, radius: number, color: string, glow: boolean = false, glowColor?: string): void {
    this.ctx.save();
    if (glow) {
      this.applyGlow(glowColor || color, 15);
    }
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawTether(points: ArrayLike<number>, count: number, currentX: number, currentY: number, color: string = '#00F0FF'): void {
    if (count < 1) return;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.applyGlow(color, 12);
    this.ctx.setLineDash([8, 4]);
    this.ctx.lineDashOffset = -this.time * 50;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0]!, points[1]!);
    for (let i = 1; i < count; i++) {
      this.ctx.lineTo(points[i * 2]!, points[i * 2 + 1]!);
    }
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawText(text: string, x: number, y: number, font: string = '16px Orbitron', color: string = '#00F0FF', glow: boolean = true): void {
    this.ctx.save();
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    if (glow) {
      this.applyGlow(color, 12);
    }
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  drawDiamond(x: number, y: number, radius: number, color: string, glow: boolean = true): void {
    this.ctx.save();
    if (glow) {
      this.applyGlow(color, 12);
    }
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - radius);
    this.ctx.lineTo(x + radius, y);
    this.ctx.lineTo(x, y + radius);
    this.ctx.lineTo(x - radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawEnemySVG(x: number, y: number, radius: number, type: 'boss' | 'minor', angle: number = 0): void {
    const img = type === 'boss' ? this.spiderBoss : this.spiderSmall;
    if (img && img.complete && img.naturalWidth !== 0) {
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle);
      const size = radius * 2.5; // Slightly larger for legs overhang
      this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
      this.ctx.restore();
    } else {
      this.drawDiamond(x, y, radius, type === 'boss' ? '#FF00FF' : '#00FFFF');
    }
  }

  drawGravityWell(x: number, y: number, radius: number): void {
    this.ctx.save();
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 0, 60, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 60, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 0, 60, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(255, 0, 60, 0.4)';
    this.ctx.lineWidth = 1;
    for (let r = radius * 0.3; r < radius; r += radius * 0.2) {
      const pulse = Math.sin(this.time * 3 + r * 0.1) * 5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r + pulse, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawCapturedArea(polygon: Polygon): void {
    this.drawPolygon(
      polygon,
      'rgba(0, 240, 255, 0.05)',
      'rgba(0, 240, 255, 0.3)',
      '#00F0FF'
    );
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }
}
