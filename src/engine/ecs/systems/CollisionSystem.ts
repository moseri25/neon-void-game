import { ComponentType } from '../components';
import type { System } from '../World';
import { World } from '../World';
import { SpatialHashGrid } from '../../physics/SpatialHashGrid';

export interface CollisionEvent {
  entityA: number;
  entityB: number;
  type: 'player_enemy' | 'enemy_tether' | 'player_powerup' | 'projectile_enemy';
}

export class CollisionSystem implements System {
  readonly priority = 20;
  readonly name = 'CollisionSystem';

  private spatialGrid: SpatialHashGrid;
  private collisionEvents: CollisionEvent[] = [];

  constructor(cellSize: number = 64) {
    this.spatialGrid = new SpatialHashGrid(cellSize);
  }

  getCollisionEvents(): CollisionEvent[] {
    return this.collisionEvents;
  }

  clearEvents(): void {
    this.collisionEvents.length = 0;
  }

  update(world: World, _dt: number): void {
    this.collisionEvents.length = 0;
    this.spatialGrid.clear();

    const collidables = world.query(ComponentType.POSITION, ComponentType.COLLIDER);

    for (const entityId of collidables) {
      const pos = world.getComponent(entityId, ComponentType.POSITION)!;
      const col = world.getComponent(entityId, ComponentType.COLLIDER)!;
      this.spatialGrid.insert(entityId, pos.x, pos.y, col.radius);
    }

    const players = world.query(ComponentType.POSITION, ComponentType.PLAYER, ComponentType.COLLIDER);
    const enemies = world.query(ComponentType.POSITION, ComponentType.ENEMY, ComponentType.COLLIDER);
    const powerups = world.query(ComponentType.POSITION, ComponentType.POWERUP, ComponentType.COLLIDER);
    const projectiles = world.query(ComponentType.POSITION, ComponentType.PROJECTILE, ComponentType.COLLIDER);

    for (const projId of projectiles) {
      const pPos = world.getComponent(projId, ComponentType.POSITION)!;
      const pCol = world.getComponent(projId, ComponentType.COLLIDER)!;

      const nearby = this.spatialGrid.getNearby(pPos.x, pPos.y, pCol.radius + 64);
      for (const nearId of nearby) {
        if (!enemies.includes(nearId)) continue;

        const ePos = world.getComponent(nearId, ComponentType.POSITION)!;
        const eCol = world.getComponent(nearId, ComponentType.COLLIDER)!;
        const enemy = world.getComponent(nearId, ComponentType.ENEMY);

        if (enemy?.type === 'gravity_well') continue;

        const dx = pPos.x - ePos.x;
        const dy = pPos.y - ePos.y;
        if (dx * dx + dy * dy < (pCol.radius + eCol.radius) ** 2) {
          this.collisionEvents.push({ entityA: projId, entityB: nearId, type: 'projectile_enemy' });
        }
      }
    }

    for (const playerId of players) {
      const pPos = world.getComponent(playerId, ComponentType.POSITION)!;
      const pCol = world.getComponent(playerId, ComponentType.COLLIDER)!;
      const pPlayer = world.getComponent(playerId, ComponentType.PLAYER)!;

      if (pPlayer.invulnerableUntil > Date.now()) continue;

      const nearby = this.spatialGrid.getNearby(pPos.x, pPos.y, pCol.radius + 64);

      for (const nearId of nearby) {
        if (nearId === playerId) continue;
        if (!enemies.includes(nearId)) continue;

        const ePos = world.getComponent(nearId, ComponentType.POSITION)!;
        const eCol = world.getComponent(nearId, ComponentType.COLLIDER)!;
        const enemy = world.getComponent(nearId, ComponentType.ENEMY);

        if (enemy?.type === 'gravity_well') continue;

        const dx = pPos.x - ePos.x;
        const dy = pPos.y - ePos.y;
        const distSq = dx * dx + dy * dy;
        const minDist = pCol.radius + eCol.radius;

        if (distSq < minDist * minDist) {
          if (pPlayer.isDrawingTether || pPlayer.shieldEnergy <= 0) {
            this.collisionEvents.push({
              entityA: playerId,
              entityB: nearId,
              type: 'player_enemy',
            });
          }
        }
      }

      for (const powerupId of powerups) {
        const puPos = world.getComponent(powerupId, ComponentType.POSITION)!;
        const puCol = world.getComponent(powerupId, ComponentType.COLLIDER)!;
        const dx = pPos.x - puPos.x;
        const dy = pPos.y - puPos.y;
        if (dx * dx + dy * dy < (pCol.radius + puCol.radius) ** 2) {
          this.collisionEvents.push({ entityA: playerId, entityB: powerupId, type: 'player_powerup' });
        }
      }

      if (pPlayer.isDrawingTether) {
        const tether = world.getComponent(playerId, ComponentType.TETHER);
        if (tether && tether.pointCount > 1) {
          for (const enemyId of enemies) {
            const ePos = world.getComponent(enemyId, ComponentType.POSITION)!;
            const eCol = world.getComponent(enemyId, ComponentType.COLLIDER)!;
            const enemy = world.getComponent(enemyId, ComponentType.ENEMY);

            if (enemy?.type === 'gravity_well') continue;

            for (let i = 0; i < tether.pointCount - 1; i++) {
              const ax = tether.points[i * 2]!;
              const ay = tether.points[i * 2 + 1]!;
              const bx = tether.points[(i + 1) * 2]!;
              const by = tether.points[(i + 1) * 2 + 1]!;

              const dist = pointToSegmentDistSq(ePos.x, ePos.y, ax, ay, bx, by);
              if (dist < eCol.radius * eCol.radius) {
                this.collisionEvents.push({
                  entityA: playerId,
                  entityB: enemyId,
                  type: 'enemy_tether',
                });
                break;
              }
            }
          }
        }
      }
    }
  }
}

function pointToSegmentDistSq(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ex = px - ax;
    const ey = py - ay;
    return ex * ex + ey * ey;
  }
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  const distX = px - projX;
  const distY = py - projY;
  return distX * distX + distY * distY;
}
