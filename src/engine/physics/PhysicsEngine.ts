import { Vec2D } from '@/domain/geometry/Vector2D';
import { Polygon } from '@/domain/geometry/Polygon';

export class PhysicsEngine {
  private fieldPolygon: Polygon;

  constructor(field: Polygon) {
    this.fieldPolygon = field;
  }

  setField(field: Polygon): void {
    this.fieldPolygon = field;
  }

  getField(): Polygon {
    return this.fieldPolygon;
  }

  constrainToPerimeter(x: number, y: number): { x: number; y: number; edgeIndex: number } {
    const result = this.fieldPolygon.closestPointOnEdge(Vec2D.from(x, y));
    return { x: result.point.x, y: result.point.y, edgeIndex: result.edgeIndex };
  }

  moveAlongPerimeter(x: number, y: number, dirX: number, dirY: number, speed: number, dt: number): { x: number; y: number } {
    const edges = this.fieldPolygon.getEdges();
    const closest = this.fieldPolygon.closestPointOnEdge(Vec2D.from(x, y));
    const edge = edges[closest.edgeIndex]!;

    const edgeDir = Vec2D.from(edge.end.x - edge.start.x, edge.end.y - edge.start.y).normalize();
    const inputDir = Vec2D.from(dirX, dirY);
    const dot = inputDir.dot(edgeDir);

    const moveDir = dot >= 0 ? edgeDir : edgeDir.negate();
    const newT = closest.t + (dot >= 0 ? 1 : -1) * speed * dt / edge.start.distanceTo(edge.end);

    if (newT >= 0 && newT <= 1) {
      return {
        x: edge.start.x + (edge.end.x - edge.start.x) * newT,
        y: edge.start.y + (edge.end.y - edge.start.y) * newT,
      };
    }

    const nextEdgeIdx = newT > 1
      ? (closest.edgeIndex + 1) % edges.length
      : (closest.edgeIndex - 1 + edges.length) % edges.length;
    const nextEdge = edges[nextEdgeIdx]!;

    const overflow = newT > 1 ? newT - 1 : -newT;
    const nextT = newT > 1 ? overflow : 1 - overflow;

    return {
      x: nextEdge.start.x + (nextEdge.end.x - nextEdge.start.x) * Math.max(0, Math.min(1, nextT)),
      y: nextEdge.start.y + (nextEdge.end.y - nextEdge.start.y) * Math.max(0, Math.min(1, nextT)),
    };
  }

  reflectOffEdges(x: number, y: number, vx: number, vy: number, radius: number): { x: number; y: number; vx: number; vy: number } {
    const edges = this.fieldPolygon.getEdges();

    for (const edge of edges) {
      const edgeVec = Vec2D.from(edge.end.x - edge.start.x, edge.end.y - edge.start.y);
      const normal = edgeVec.perpendicular().normalize();

      const toPoint = Vec2D.from(x - edge.start.x, y - edge.start.y);
      const dist = toPoint.dot(normal);

      if (Math.abs(dist) < radius) {
        const proj = toPoint.dot(edgeVec.normalize());
        const edgeLen = edgeVec.magnitude();
        if (proj >= -radius && proj <= edgeLen + radius) {
          const vel = Vec2D.from(vx, vy);
          const reflected = vel.reflect(normal);
          const pushOut = normal.multiply(radius - dist);
          return {
            x: x + pushOut.x,
            y: y + pushOut.y,
            vx: reflected.x,
            vy: reflected.y,
          };
        }
      }
    }

    return { x, y, vx, vy };
  }

  isPointInField(x: number, y: number): boolean {
    return this.fieldPolygon.containsPoint(Vec2D.from(x, y));
  }

  isPointOnPerimeter(x: number, y: number, threshold: number = 3): boolean {
    const closest = this.fieldPolygon.closestPointOnEdge(Vec2D.from(x, y));
    return closest.point.distanceTo(Vec2D.from(x, y)) < threshold;
  }

  applyGravityWell(
    px: number, py: number, wellX: number, wellY: number,
    wellRadius: number, mass: number = 500
  ): { fx: number; fy: number } {
    const dx = wellX - px;
    const dy = wellY - py;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist < 10 || dist > wellRadius) return { fx: 0, fy: 0 };

    const force = Math.min(mass / distSq, 50);
    const nx = dx / dist;
    const ny = dy / dist;

    return { fx: nx * force, fy: ny * force };
  }
}
