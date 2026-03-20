import { Vec2D, type IVector2D } from './Vector2D';

export interface Bounds {
  readonly min: Vec2D;
  readonly max: Vec2D;
}

export interface Edge {
  readonly start: Vec2D;
  readonly end: Vec2D;
}

export class Polygon {
  public readonly vertices: ReadonlyArray<Vec2D>;

  constructor(vertices: ReadonlyArray<IVector2D>) {
    this.vertices = vertices.map(v => v instanceof Vec2D ? v : Vec2D.from(v.x, v.y));
  }

  static rectangle(x: number, y: number, width: number, height: number): Polygon {
    return new Polygon([
      Vec2D.from(x, y),
      Vec2D.from(x + width, y),
      Vec2D.from(x + width, y + height),
      Vec2D.from(x, y + height),
    ]);
  }

  static fromVertices(vertices: ReadonlyArray<IVector2D>): Polygon {
    return new Polygon(vertices);
  }

  static regular(cx: number, cy: number, radius: number, sides: number): Polygon {
    const verts: Vec2D[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      verts.push(Vec2D.from(
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius
      ));
    }
    return new Polygon(verts);
  }

  area(): number {
    let a = 0;
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      a += this.vertices[i]!.x * this.vertices[j]!.y;
      a -= this.vertices[j]!.x * this.vertices[i]!.y;
    }
    return Math.abs(a) / 2;
  }

  signedArea(): number {
    let a = 0;
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      a += this.vertices[i]!.x * this.vertices[j]!.y;
      a -= this.vertices[j]!.x * this.vertices[i]!.y;
    }
    return a / 2;
  }

  centroid(): Vec2D {
    let cx = 0, cy = 0;
    const a = this.signedArea() * 6;
    if (Math.abs(a) < 1e-10) {
      const sum = this.vertices.reduce(
        (acc, v) => Vec2D.from(acc.x + v.x, acc.y + v.y),
        Vec2D.zero()
      );
      return sum.divide(this.vertices.length);
    }
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const vi = this.vertices[i]!;
      const vj = this.vertices[j]!;
      const f = vi.x * vj.y - vj.x * vi.y;
      cx += (vi.x + vj.x) * f;
      cy += (vi.y + vj.y) * f;
    }
    return Vec2D.from(cx / a, cy / a);
  }

  containsPoint(point: IVector2D): boolean {
    let inside = false;
    const n = this.vertices.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const vi = this.vertices[i]!;
      const vj = this.vertices[j]!;
      if (
        (vi.y > point.y) !== (vj.y > point.y) &&
        point.x < ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  getEdges(): ReadonlyArray<Edge> {
    const edges: Edge[] = [];
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      edges.push({
        start: this.vertices[i]!,
        end: this.vertices[(i + 1) % n]!,
      });
    }
    return edges;
  }

  getBounds(): Bounds {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const v of this.vertices) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.x > maxX) maxX = v.x;
      if (v.y > maxY) maxY = v.y;
    }
    return { min: Vec2D.from(minX, minY), max: Vec2D.from(maxX, maxY) };
  }

  perimeter(): number {
    let p = 0;
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      p += this.vertices[i]!.distanceTo(this.vertices[(i + 1) % n]!);
    }
    return p;
  }

  closestPointOnEdge(point: IVector2D): { point: Vec2D; edgeIndex: number; t: number } {
    let bestDist = Infinity;
    let bestPoint = this.vertices[0]!;
    let bestEdge = 0;
    let bestT = 0;

    const edges = this.getEdges();
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]!;
      const dx = edge.end.x - edge.start.x;
      const dy = edge.end.y - edge.start.y;
      const lenSq = dx * dx + dy * dy;
      let t = lenSq === 0
        ? 0
        : Math.max(0, Math.min(1,
            ((point.x - edge.start.x) * dx + (point.y - edge.start.y) * dy) / lenSq
          ));
      const proj = Vec2D.from(edge.start.x + t * dx, edge.start.y + t * dy);
      const dist = proj.distanceSquaredTo(point);
      if (dist < bestDist) {
        bestDist = dist;
        bestPoint = proj;
        bestEdge = i;
        bestT = t;
      }
    }
    return { point: bestPoint, edgeIndex: bestEdge, t: bestT };
  }

  translate(offset: IVector2D): Polygon {
    return new Polygon(this.vertices.map(v => v.add(offset)));
  }

  scale(factor: number, origin?: IVector2D): Polygon {
    const center = origin ?? this.centroid();
    return new Polygon(
      this.vertices.map(v => {
        const dx = v.x - center.x;
        const dy = v.y - center.y;
        return Vec2D.from(center.x + dx * factor, center.y + dy * factor);
      })
    );
  }

  isClockwise(): boolean {
    return this.signedArea() < 0;
  }

  ensureClockwise(): Polygon {
    return this.isClockwise() ? this : new Polygon([...this.vertices].reverse());
  }

  ensureCounterClockwise(): Polygon {
    return this.isClockwise() ? new Polygon([...this.vertices].reverse()) : this;
  }

  clone(): Polygon {
    return new Polygon(this.vertices.map(v => v.clone()));
  }
}
