import { ComponentType } from '../components';
import type { System } from '../World';
import { World } from '../World';

export class MovementSystem implements System {
  readonly priority = 10;
  readonly name = 'MovementSystem';

  update(world: World, dt: number): void {
    const entities = world.query(ComponentType.POSITION, ComponentType.VELOCITY);

    for (const entityId of entities) {
      const pos = world.getComponent(entityId, ComponentType.POSITION)!;
      const vel = world.getComponent(entityId, ComponentType.VELOCITY)!;

      pos.prevX = pos.x;
      pos.prevY = pos.y;
      pos.x += vel.vx * dt;
      pos.y += vel.vy * dt;
    }
  }
}
