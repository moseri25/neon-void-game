import { ComponentType } from '../components';
import type { System } from '../World';
import { World } from '../World';

export interface CaptureEvent {
  playerId: number;
  tetherPoints: Float64Array;
  pointCount: number;
}

export class CaptureSystem implements System {
  readonly priority = 30;
  readonly name = 'CaptureSystem';

  private captureEvents: CaptureEvent[] = [];

  getCaptureEvents(): CaptureEvent[] {
    return this.captureEvents;
  }

  clearEvents(): void {
    this.captureEvents.length = 0;
  }

  update(world: World, _dt: number): void {
    this.captureEvents.length = 0;

    const players = world.query(ComponentType.POSITION, ComponentType.PLAYER, ComponentType.TETHER);

    for (const entityId of players) {
      const pos = world.getComponent(entityId, ComponentType.POSITION)!;
      const player = world.getComponent(entityId, ComponentType.PLAYER)!;
      const tether = world.getComponent(entityId, ComponentType.TETHER)!;

      if (player.isDrawingTether && tether.pointCount > 0) {
        const lastIdx = (tether.pointCount - 1) * 2;
        const lastX = tether.points[lastIdx]!;
        const lastY = tether.points[lastIdx + 1]!;
        const dx = pos.x - lastX;
        const dy = pos.y - lastY;

        if (dx * dx + dy * dy > 4) {
          if (tether.pointCount < tether.maxPoints) {
            tether.points[tether.pointCount * 2] = pos.x;
            tether.points[tether.pointCount * 2 + 1] = pos.y;
            tether.pointCount++;
          }
        }
      }

      if (!player.isDrawingTether && player.isOnPerimeter && tether.pointCount >= 3) {
        this.captureEvents.push({
          playerId: entityId,
          tetherPoints: tether.points.slice(0, tether.pointCount * 2),
          pointCount: tether.pointCount,
        });
        tether.pointCount = 0;
      }
    }
  }
}
