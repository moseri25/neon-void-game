export interface IVector2D {
  readonly x: number;
  readonly y: number;
}

export class Vec2D implements IVector2D {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static zero(): Vec2D {
    return new Vec2D(0, 0);
  }

  static from(x: number, y: number): Vec2D {
    return new Vec2D(x, y);
  }

  static fromAngle(angle: number, magnitude: number = 1): Vec2D {
    return new Vec2D(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  add(other: IVector2D): Vec2D {
    return new Vec2D(this.x + other.x, this.y + other.y);
  }

  subtract(other: IVector2D): Vec2D {
    return new Vec2D(this.x - other.x, this.y - other.y);
  }

  multiply(scalar: number): Vec2D {
    return new Vec2D(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vec2D {
    if (scalar === 0) return Vec2D.zero();
    return new Vec2D(this.x / scalar, this.y / scalar);
  }

  dot(other: IVector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  cross(other: IVector2D): number {
    return this.x * other.y - this.y * other.x;
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vec2D {
    const mag = this.magnitude();
    if (mag === 0) return Vec2D.zero();
    return this.divide(mag);
  }

  distanceTo(other: IVector2D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  distanceSquaredTo(other: IVector2D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }

  angleTo(other: IVector2D): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  rotate(angle: number): Vec2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  lerp(other: IVector2D, t: number): Vec2D {
    return new Vec2D(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t
    );
  }

  perpendicular(): Vec2D {
    return new Vec2D(-this.y, this.x);
  }

  reflect(normal: IVector2D): Vec2D {
    const d = this.dot(normal) * 2;
    return new Vec2D(this.x - d * normal.x, this.y - d * normal.y);
  }

  negate(): Vec2D {
    return new Vec2D(-this.x, -this.y);
  }

  equals(other: IVector2D, epsilon: number = 1e-10): boolean {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
  }

  clone(): Vec2D {
    return new Vec2D(this.x, this.y);
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  static lineSegmentIntersection(
    p1: IVector2D, p2: IVector2D,
    p3: IVector2D, p4: IVector2D
  ): Vec2D | null {
    const d1x = p2.x - p1.x;
    const d1y = p2.y - p1.y;
    const d2x = p4.x - p3.x;
    const d2y = p4.y - p3.y;
    const denom = d1x * d2y - d1y * d2x;

    if (Math.abs(denom) < 1e-10) return null;

    const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom;
    const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return new Vec2D(p1.x + t * d1x, p1.y + t * d1y);
    }
    return null;
  }

  static pointToSegmentDistance(
    point: IVector2D,
    segStart: IVector2D,
    segEnd: IVector2D
  ): number {
    const dx = segEnd.x - segStart.x;
    const dy = segEnd.y - segStart.y;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) {
      const px = point.x - segStart.x;
      const py = point.y - segStart.y;
      return Math.sqrt(px * px + py * py);
    }

    let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projX = segStart.x + t * dx;
    const projY = segStart.y + t * dy;
    const distX = point.x - projX;
    const distY = point.y - projY;
    return Math.sqrt(distX * distX + distY * distY);
  }
}
