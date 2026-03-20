import { Vec2D, type IVector2D } from '../geometry/Vector2D';
import type { Polygon, Edge } from '../geometry/Polygon';

export enum EnemyType {
  BOUNCER = 'bouncer',
  CHASER = 'chaser',
  GRAVITY_WELL = 'gravity_well',
}

export interface EnemyState {
  readonly id: string;
  readonly type: EnemyType;
  readonly position: Vec2D;
  readonly velocity: Vec2D;
  readonly boundingRadius: number;
  readonly speed: number;
  readonly active: boolean;
  readonly spawnDelay: number;
}

export class Enemy implements EnemyState {
  public readonly id: string;
  public readonly type: EnemyType;
  public readonly position: Vec2D;
  public readonly velocity: Vec2D;
  public readonly boundingRadius: number;
  public readonly speed: number;
  public readonly active: boolean;
  public readonly spawnDelay: number;

  private constructor(state: EnemyState) {
    this.id = state.id;
    this.type = state.type;
    this.position = state.position;
    this.velocity = state.velocity;
    this.boundingRadius = state.boundingRadius;
    this.speed = state.speed;
    this.active = state.active;
    this.spawnDelay = state.spawnDelay;
  }

  static createBouncer(id: string, position: IVector2D, speed: number = 150, radius: number = 8): Enemy {
    const angle = Math.random() * Math.PI * 2;
    return new Enemy({
      id,
      type: EnemyType.BOUNCER,
      position: Vec2D.from(position.x, position.y),
      velocity: Vec2D.fromAngle(angle, speed),
      boundingRadius: radius,
      speed,
      active: true,
      spawnDelay: 0,
    });
  }

  static createChaser(id: string, position: IVector2D, speed: number = 100, radius: number = 10): Enemy {
    return new Enemy({
      id,
      type: EnemyType.CHASER,
      position: Vec2D.from(position.x, position.y),
      velocity: Vec2D.zero(),
      boundingRadius: radius,
      speed,
      active: true,
      spawnDelay: 0,
    });
  }

  static createGravityWell(id: string, position: IVector2D, radius: number = 60): Enemy {
    return new Enemy({
      id,
      type: EnemyType.GRAVITY_WELL,
      position: Vec2D.from(position.x, position.y),
      velocity: Vec2D.zero(),
      boundingRadius: radius,
      speed: 0,
      active: true,
      spawnDelay: 0,
    });
  }

  withSpawnDelay(delay: number): Enemy {
    return new Enemy({ ...this, spawnDelay: delay, active: false });
  }

  update(deltaTime: number, playerPosition: IVector2D, fieldEdges: ReadonlyArray<Edge>): Enemy {
    if (!this.active) {
      const remaining = this.spawnDelay - deltaTime;
      if (remaining > 0) {
        return new Enemy({ ...this, spawnDelay: remaining });
      }
      return new Enemy({ ...this, active: true, spawnDelay: 0 });
    }

    switch (this.type) {
      case EnemyType.BOUNCER:
        return this.updateBouncer(deltaTime, fieldEdges);
      case EnemyType.CHASER:
        return this.updateChaser(deltaTime, playerPosition);
      case EnemyType.GRAVITY_WELL:
        return this;
    }
  }

  private updateBouncer(dt: number, edges: ReadonlyArray<Edge>): Enemy {
    const newPos = this.position.add(this.velocity.multiply(dt));
    let newVel = this.velocity;

    for (const edge of edges) {
      const edgeVec = edge.end.subtract(edge.start);
      const normal = edgeVec.perpendicular().normalize();

      const toEdgeStart = newPos.subtract(edge.start);
      const dist = Math.abs(toEdgeStart.dot(normal));

      if (dist < this.boundingRadius) {
        const edgeLen = edgeVec.magnitude();
        const proj = toEdgeStart.dot(edgeVec.normalize());
        if (proj >= -this.boundingRadius && proj <= edgeLen + this.boundingRadius) {
          newVel = newVel.reflect(normal);
          const jitter = (Math.random() - 0.5) * 0.1;
          newVel = newVel.rotate(jitter);
          newVel = newVel.normalize().multiply(this.speed);
          break;
        }
      }
    }

    return new Enemy({
      ...this,
      position: this.position.add(newVel.multiply(dt)),
      velocity: newVel,
    });
  }

  private updateChaser(dt: number, playerPos: IVector2D): Enemy {
    const toPlayer = Vec2D.from(playerPos.x - this.position.x, playerPos.y - this.position.y);
    const dist = toPlayer.magnitude();
    if (dist < 1) return this;

    const dir = toPlayer.normalize();
    const vel = dir.multiply(this.speed);
    const newPos = this.position.add(vel.multiply(dt));

    return new Enemy({
      ...this,
      position: newPos,
      velocity: vel,
    });
  }

  getGravityForce(point: IVector2D, mass: number = 500): Vec2D {
    if (this.type !== EnemyType.GRAVITY_WELL) return Vec2D.zero();

    const dx = this.position.x - point.x;
    const dy = this.position.y - point.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist < 10) return Vec2D.zero();
    if (dist > this.boundingRadius) return Vec2D.zero();

    const forceMag = Math.min(mass / distSq, 50);
    return Vec2D.from(dx, dy).normalize().multiply(forceMag);
  }

  checkTetherCollision(tether: ReadonlyArray<IVector2D>): boolean {
    if (this.type === EnemyType.GRAVITY_WELL) return false;

    for (let i = 0; i < tether.length - 1; i++) {
      const dist = Vec2D.pointToSegmentDistance(this.position, tether[i]!, tether[i + 1]!);
      if (dist < this.boundingRadius) return true;
    }
    return false;
  }

  checkPointCollision(point: IVector2D, radius: number): boolean {
    if (this.type === EnemyType.GRAVITY_WELL) return false;
    return this.position.distanceSquaredTo(point) < (this.boundingRadius + radius) ** 2;
  }
}
