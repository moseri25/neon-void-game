import { Vec2D } from '@/domain/geometry/Vector2D';
import type { Edge } from '@/domain/geometry/Polygon';

export enum BehaviorType {
  BOUNCE = 'bounce',
  CHASE = 'chase',
  GRAVITY = 'gravity',
}

export function bounceStrategy(
  position: Vec2D,
  velocity: Vec2D,
  edges: ReadonlyArray<Edge>,
  radius: number,
  randomness: number = 0.1
): { position: Vec2D; velocity: Vec2D } {
  let newVel = velocity;

  for (const edge of edges) {
    const edgeVec = edge.end.subtract(edge.start);
    const normal = edgeVec.perpendicular().normalize();
    const toPoint = position.subtract(edge.start);
    const dist = Math.abs(toPoint.dot(normal));

    if (dist < radius) {
      const edgeLen = edgeVec.magnitude();
      const proj = toPoint.dot(edgeVec.normalize());

      if (proj >= -radius && proj <= edgeLen + radius) {
        newVel = newVel.reflect(normal);

        // Add randomness to reflection
        const jitter = (Math.random() - 0.5) * randomness * 2;
        newVel = newVel.rotate(jitter);
        newVel = newVel.normalize().multiply(velocity.magnitude());
        break;
      }
    }
  }

  return { position, velocity: newVel };
}

export function chaseStrategy(
  position: Vec2D,
  playerPosition: Vec2D,
  speed: number,
  dt: number,
  perimeterOnly: boolean = false,
  perimeter?: ReadonlyArray<Vec2D>
): { position: Vec2D; velocity: Vec2D } {
  if (perimeterOnly && perimeter && perimeter.length > 0) {
    // Move along perimeter toward player
    let bestDist = Infinity;
    let bestIdx = 0;
    for (let i = 0; i < perimeter.length; i++) {
      const d = perimeter[i]!.distanceSquaredTo(playerPosition);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    let currentIdx = 0;
    let currentDist = Infinity;
    for (let i = 0; i < perimeter.length; i++) {
      const d = perimeter[i]!.distanceSquaredTo(position);
      if (d < currentDist) {
        currentDist = d;
        currentIdx = i;
      }
    }

    const nextIdx = currentIdx < bestIdx
      ? (currentIdx + 1) % perimeter.length
      : (currentIdx - 1 + perimeter.length) % perimeter.length;

    const target = perimeter[nextIdx]!;
    const dir = target.subtract(position).normalize();
    const vel = dir.multiply(speed);
    const newPos = position.add(vel.multiply(dt));

    return { position: newPos, velocity: vel };
  }

  // Direct chase
  const dir = playerPosition.subtract(position);
  const dist = dir.magnitude();
  if (dist < 1) return { position, velocity: Vec2D.zero() };

  const vel = dir.normalize().multiply(speed);
  const newPos = position.add(vel.multiply(dt));
  return { position: newPos, velocity: vel };
}

export function gravityWellForce(
  wellPosition: Vec2D,
  targetPosition: Vec2D,
  wellRadius: number,
  mass: number = 500
): Vec2D {
  const diff = wellPosition.subtract(targetPosition);
  const dist = diff.magnitude();

  if (dist < 10 || dist > wellRadius) return Vec2D.zero();

  const forceMag = Math.min(mass / (dist * dist), 50);
  return diff.normalize().multiply(forceMag);
}

export function applyGravityToTether(
  tetherPoints: Vec2D[],
  wells: Array<{ position: Vec2D; radius: number; mass: number }>,
  dt: number
): Vec2D[] {
  return tetherPoints.map(point => {
    let totalForce = Vec2D.zero();
    for (const well of wells) {
      const force = gravityWellForce(well.position, point, well.radius, well.mass);
      totalForce = totalForce.add(force);
    }
    return point.add(totalForce.multiply(dt));
  });
}
