import { Vec2D } from '@/domain/geometry/Vector2D';
import type { Edge } from '@/domain/geometry/Polygon';
import { bounceStrategy, chaseStrategy, gravityWellForce } from './behaviors';

export interface EnemyAIState {
  id: string;
  type: 'bouncer' | 'chaser' | 'gravity_well';
  position: Vec2D;
  velocity: Vec2D;
  speed: number;
  radius: number;
  active: boolean;
  spawnDelay: number;
  pattern: 'default' | 'figure8' | 'reverse_chaser';
}

export class EnemyAIController {
  private enemies: EnemyAIState[] = [];
  private difficultyScalar: number = 1.0;

  setEnemies(enemies: EnemyAIState[]): void {
    this.enemies = enemies;
  }

  setDifficultyScalar(scalar: number): void {
    this.difficultyScalar = scalar;
  }

  update(
    playerPosition: Vec2D,
    tetherPoints: Vec2D[],
    fieldEdges: ReadonlyArray<Edge>,
    dt: number
  ): EnemyAIState[] {
    return this.enemies.map(enemy => {
      // Handle spawn delay
      if (!enemy.active) {
        const remaining = enemy.spawnDelay - dt;
        if (remaining > 0) {
          return { ...enemy, spawnDelay: remaining };
        }
        return { ...enemy, active: true, spawnDelay: 0 };
      }

      const adjustedSpeed = enemy.speed * (0.7 + this.difficultyScalar * 0.6);

      switch (enemy.type) {
        case 'bouncer':
          return this.updateBouncer(enemy, fieldEdges, adjustedSpeed, dt);
        case 'chaser':
          return this.updateChaser(enemy, playerPosition, adjustedSpeed, dt);
        case 'gravity_well':
          return enemy; // Static
      }
    });
  }

  private updateBouncer(
    enemy: EnemyAIState,
    edges: ReadonlyArray<Edge>,
    speed: number,
    dt: number
  ): EnemyAIState {
    let vel = enemy.velocity;

    // Figure-8 pattern variation
    if (enemy.pattern === 'figure8') {
      const time = Date.now() * 0.001;
      const perpForce = vel.perpendicular().normalize().multiply(Math.sin(time * 2) * 20);
      vel = vel.add(perpForce.multiply(dt)).normalize().multiply(speed);
    }

    const result = bounceStrategy(enemy.position, vel, edges, enemy.radius);
    const newVel = result.velocity.normalize().multiply(speed);
    const newPos = enemy.position.add(newVel.multiply(dt));

    return { ...enemy, position: newPos, velocity: newVel };
  }

  private updateChaser(
    enemy: EnemyAIState,
    playerPosition: Vec2D,
    speed: number,
    dt: number
  ): EnemyAIState {
    let target = playerPosition;

    // Reverse chaser moves away when close
    if (enemy.pattern === 'reverse_chaser') {
      const dist = enemy.position.distanceTo(playerPosition);
      if (dist < 100) {
        target = enemy.position.add(enemy.position.subtract(playerPosition));
      }
    }

    const result = chaseStrategy(enemy.position, target, speed, dt);
    return { ...enemy, position: result.position, velocity: result.velocity };
  }

  getGravityForces(point: Vec2D): Vec2D {
    let total = Vec2D.zero();
    for (const enemy of this.enemies) {
      if (enemy.type === 'gravity_well' && enemy.active) {
        const force = gravityWellForce(enemy.position, point, enemy.radius, 500);
        total = total.add(force);
      }
    }
    return total;
  }

  checkTetherCollisions(tetherPoints: Vec2D[]): string[] {
    const hitEnemies: string[] = [];
    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.type === 'gravity_well') continue;

      for (let i = 0; i < tetherPoints.length - 1; i++) {
        const dist = Vec2D.pointToSegmentDistance(
          enemy.position,
          tetherPoints[i]!,
          tetherPoints[i + 1]!
        );
        if (dist < enemy.radius) {
          hitEnemies.push(enemy.id);
          break;
        }
      }
    }
    return hitEnemies;
  }

  checkPlayerCollision(playerPosition: Vec2D, playerRadius: number): string | null {
    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.type === 'gravity_well') continue;
      if (enemy.position.distanceTo(playerPosition) < enemy.radius + playerRadius) {
        return enemy.id;
      }
    }
    return null;
  }
}
