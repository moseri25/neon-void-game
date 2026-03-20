import { ComponentType } from '../components';
import type { System } from '../World';
import { World } from '../World';

export class RenderSystem implements System {
  readonly priority = 100;
  readonly name = 'RenderSystem';

  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 0;
  private height: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private cameraScale: number = 1;
  private shakeX: number = 0;
  private shakeY: number = 0;
  private shakeIntensity: number = 0;
  private shakeDecay: number = 0.9;

  setContext(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  shake(intensity: number): void {
    this.shakeIntensity = intensity;
  }

  update(world: World, _dt: number): void {
    if (!this.ctx) return;
    const ctx = this.ctx;

    if (this.shakeIntensity > 0.5) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#05050A';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.translate(
      this.width / 2 + this.shakeX,
      this.height / 2 + this.shakeY
    );
    ctx.scale(this.cameraScale, this.cameraScale);
    ctx.translate(-this.cameraX, -this.cameraY);

    const renderables = world.query(ComponentType.POSITION, ComponentType.RENDER);

    const sorted = renderables
      .map(id => ({
        id,
        pos: world.getComponent(id, ComponentType.POSITION)!,
        render: world.getComponent(id, ComponentType.RENDER)!,
        isPlayer: world.hasComponent(id, ComponentType.PLAYER),
        isEnemy: world.hasComponent(id, ComponentType.ENEMY),
      }))
      .filter(e => e.render.visible);

    for (const entity of sorted) {
      const { pos, render, isPlayer } = entity;
      const x = pos.prevX + (pos.x - pos.prevX) * 0.5;
      const y = pos.prevY + (pos.y - pos.prevY) * 0.5;

      ctx.save();

      if (render.glow) {
        ctx.shadowColor = render.glowColor || render.color;
        ctx.shadowBlur = render.glowIntensity || 15;
      }

      ctx.fillStyle = render.color;
      ctx.strokeStyle = render.color;
      ctx.lineWidth = 2;

      switch (render.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(x, y, render.radius, 0, Math.PI * 2);
          ctx.fill();
          if (isPlayer) {
            ctx.strokeStyle = render.glowColor || '#00F0FF';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(x, y - render.radius);
          ctx.lineTo(x + render.radius, y);
          ctx.lineTo(x, y + render.radius);
          ctx.lineTo(x - render.radius, y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'hexagon':
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const hx = x + Math.cos(angle) * render.radius;
            const hy = y + Math.sin(angle) * render.radius;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'ring':
          ctx.beginPath();
          ctx.arc(x, y, render.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, render.radius * 0.6, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }

      if (isPlayer) {
        const tether = world.getComponent(entity.id, ComponentType.TETHER);
        const player = world.getComponent(entity.id, ComponentType.PLAYER);
        if (tether && player?.isDrawingTether && tether.pointCount > 0) {
          ctx.save();
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 10;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(tether.points[0]!, tether.points[1]!);
          for (let i = 1; i < tether.pointCount; i++) {
            ctx.lineTo(tether.points[i * 2]!, tether.points[i * 2 + 1]!);
          }
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
