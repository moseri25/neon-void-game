const STRIDE = 8; // x, y, vx, vy, life, r, g, b

export class ParticlePool {
  private readonly data: Float32Array;
  private readonly maxParticles: number;
  private head: number = 0;
  private activeCount: number = 0;

  constructor(maxParticles: number = 10000) {
    this.maxParticles = maxParticles;
    this.data = new Float32Array(maxParticles * STRIDE);
  }

  emit(x: number, y: number, vx: number, vy: number, r: number = 0, g: number = 0.94, b: number = 1): void {
    const offset = this.head * STRIDE;
    this.data[offset] = x;
    this.data[offset + 1] = y;
    this.data[offset + 2] = vx;
    this.data[offset + 3] = vy;
    this.data[offset + 4] = 1.0;
    this.data[offset + 5] = r;
    this.data[offset + 6] = g;
    this.data[offset + 7] = b;
    this.head = (this.head + 1) % this.maxParticles;
    if (this.activeCount < this.maxParticles) this.activeCount++;
  }

  burstAt(x: number, y: number, count: number, r: number = 0, g: number = 0.94, b: number = 1): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 50 + Math.random() * 150;
      this.emit(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        r, g, b
      );
    }
  }

  update(dt: number): void {
    for (let i = 0; i < this.maxParticles; i++) {
      const offset = i * STRIDE;
      const life = this.data[offset + 4]!;
      if (life <= 0) continue;

      this.data[offset] = this.data[offset]! + this.data[offset + 2]! * dt;
      this.data[offset + 1] = this.data[offset + 1]! + this.data[offset + 3]! * dt;
      this.data[offset + 2] = this.data[offset + 2]! * 0.98;
      this.data[offset + 3] = this.data[offset + 3]! * 0.98;
      this.data[offset + 4] = life - dt * 0.8;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.maxParticles; i++) {
      const offset = i * STRIDE;
      const life = this.data[offset + 4]!;
      if (life <= 0) continue;

      const x = this.data[offset]!;
      const y = this.data[offset + 1]!;
      const r = Math.round(this.data[offset + 5]! * 255);
      const g = Math.round(this.data[offset + 6]! * 255);
      const b = Math.round(this.data[offset + 7]! * 255);
      const alpha = Math.max(0, life);
      const size = 2 + life * 3;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = `rgb(${r},${g},${b})`;
      ctx.shadowBlur = 8;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  clear(): void {
    this.data.fill(0);
    this.head = 0;
    this.activeCount = 0;
  }
}
