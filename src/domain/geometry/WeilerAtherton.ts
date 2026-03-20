import { Vec2D } from './Vector2D';
import { Polygon } from './Polygon';

interface Intersection {
  point: Vec2D;
  subjectIndex: number;
  subjectT: number;
  clipIndex: number;
  clipT: number;
  entering: boolean;
}

export function lineSegmentIntersect(
  a1: Vec2D, a2: Vec2D, b1: Vec2D, b2: Vec2D
): { point: Vec2D; t: number; u: number } | null {
  const d1x = a2.x - a1.x;
  const d1y = a2.y - a1.y;
  const d2x = b2.x - b1.x;
  const d2y = b2.y - b1.y;
  const denom = d1x * d2y - d1y * d2x;

  if (Math.abs(denom) < 1e-10) return null;

  const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / denom;
  const u = ((b1.x - a1.x) * d1y - (b1.y - a1.y) * d1x) / denom;

  if (t > 1e-10 && t < 1 - 1e-10 && u > 1e-10 && u < 1 - 1e-10) {
    return {
      point: Vec2D.from(a1.x + t * d1x, a1.y + t * d1y),
      t,
      u,
    };
  }
  return null;
}

function isPointInsidePolygon(point: Vec2D, polygon: Polygon): boolean {
  return polygon.containsPoint(point);
}

export function clipPolygon(subject: Polygon, clip: Polygon): Polygon[] {
  const subjectVerts = [...subject.vertices];
  const clipVerts = [...clip.vertices];
  const sn = subjectVerts.length;
  const cn = clipVerts.length;

  const intersections: Intersection[] = [];

  for (let i = 0; i < sn; i++) {
    const s1 = subjectVerts[i]!;
    const s2 = subjectVerts[(i + 1) % sn]!;
    for (let j = 0; j < cn; j++) {
      const c1 = clipVerts[j]!;
      const c2 = clipVerts[(j + 1) % cn]!;
      const result = lineSegmentIntersect(s1, s2, c1, c2);
      if (result) {
        const entering = !isPointInsidePolygon(s1, clip);
        intersections.push({
          point: result.point,
          subjectIndex: i,
          subjectT: result.t,
          clipIndex: j,
          clipT: result.u,
          entering,
        });
      }
    }
  }

  if (intersections.length === 0) {
    if (isPointInsidePolygon(subjectVerts[0]!, clip)) {
      return [subject.clone()];
    }
    if (isPointInsidePolygon(clipVerts[0]!, subject)) {
      return [clip.clone()];
    }
    return [];
  }

  intersections.sort((a, b) => {
    if (a.subjectIndex !== b.subjectIndex) return a.subjectIndex - b.subjectIndex;
    return a.subjectT - b.subjectT;
  });

  const result: Polygon[] = [];
  const visited = new Set<number>();

  for (let idx = 0; idx < intersections.length; idx++) {
    if (!intersections[idx]!.entering || visited.has(idx)) continue;

    const polyVerts: Vec2D[] = [];
    let currentIdx = idx;
    let onSubject = true;
    let safety = 0;

    do {
      if (safety++ > 200) break;
      visited.add(currentIdx);
      const inter = intersections[currentIdx]!;
      polyVerts.push(inter.point);

      if (onSubject) {
        let si = (inter.subjectIndex + 1) % sn;
        let found = false;

        for (let step = 0; step < sn; step++) {
          let nextInter = -1;
          let bestT = Infinity;

          if (si === inter.subjectIndex) {
            for (let k = 0; k < intersections.length; k++) {
              if (intersections[k]!.subjectIndex === si && intersections[k]!.subjectT > inter.subjectT) {
                if (intersections[k]!.subjectT < bestT) {
                  bestT = intersections[k]!.subjectT;
                  nextInter = k;
                }
              }
            }
          } else {
            for (let k = 0; k < intersections.length; k++) {
              if (intersections[k]!.subjectIndex === si) {
                if (intersections[k]!.subjectT < bestT) {
                  bestT = intersections[k]!.subjectT;
                  nextInter = k;
                }
              }
            }
          }

          if (nextInter >= 0) {
            currentIdx = nextInter;
            onSubject = false;
            found = true;
            break;
          }

          polyVerts.push(subjectVerts[si]!);
          si = (si + 1) % sn;
        }

        if (!found) break;
      } else {
        let ci = (inter.clipIndex + 1) % cn;
        let found = false;

        for (let step = 0; step < cn; step++) {
          let nextInter = -1;
          let bestT = Infinity;

          if (ci === inter.clipIndex) {
            for (let k = 0; k < intersections.length; k++) {
              if (intersections[k]!.clipIndex === ci && intersections[k]!.clipT > inter.clipT) {
                if (intersections[k]!.clipT < bestT) {
                  bestT = intersections[k]!.clipT;
                  nextInter = k;
                }
              }
            }
          } else {
            for (let k = 0; k < intersections.length; k++) {
              if (intersections[k]!.clipIndex === ci) {
                if (intersections[k]!.clipT < bestT) {
                  bestT = intersections[k]!.clipT;
                  nextInter = k;
                }
              }
            }
          }

          if (nextInter >= 0) {
            currentIdx = nextInter;
            onSubject = true;
            found = true;
            break;
          }

          polyVerts.push(clipVerts[ci]!);
          ci = (ci + 1) % cn;
        }

        if (!found) break;
      }
    } while (currentIdx !== idx);

    if (polyVerts.length >= 3) {
      result.push(new Polygon(polyVerts));
    }
  }

  return result;
}

export function subtractPolygon(field: Polygon, capture: Polygon): Polygon {
  const fieldArea = field.area();
  const clipped = clipPolygon(field, capture);
  const capturedArea = clipped.reduce((sum, p) => sum + p.area(), 0);

  if (capturedArea < 1e-6) return field;

  const captureCenter = capture.centroid();
  const fieldVerts = [...field.vertices];
  const remaining: Vec2D[] = [];

  for (const v of fieldVerts) {
    if (!capture.containsPoint(v)) {
      remaining.push(v);
    }
  }

  const intersections: Vec2D[] = [];
  const fieldEdges = field.getEdges();
  const captureEdges = capture.getEdges();

  for (const fe of fieldEdges) {
    for (const ce of captureEdges) {
      const result = lineSegmentIntersect(
        fe.start as Vec2D, fe.end as Vec2D,
        ce.start as Vec2D, ce.end as Vec2D
      );
      if (result) {
        intersections.push(result.point);
      }
    }
  }

  const allPoints = [...remaining, ...intersections];

  if (allPoints.length < 3) return field;

  const center = allPoints.reduce(
    (acc, p) => Vec2D.from(acc.x + p.x, acc.y + p.y),
    Vec2D.zero()
  ).divide(allPoints.length);

  allPoints.sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x);
    const angleB = Math.atan2(b.y - center.y, b.x - center.x);
    return angleA - angleB;
  });

  return new Polygon(allPoints);
}

function projectPointOnSegment(p: Vec2D, v1: Vec2D, v2: Vec2D): { point: Vec2D, t: number, distSq: number } {
  const l2 = (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2;
  if (l2 === 0) return { point: v1, t: 0, distSq: (p.x - v1.x) ** 2 + (p.y - v1.y) ** 2 };
  let t = ((p.x - v1.x) * (v2.x - v1.x) + (p.y - v1.y) * (v2.y - v1.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projection = Vec2D.from(v1.x + t * (v2.x - v1.x), v1.y + t * (v2.y - v1.y));
  return { point: projection, t, distSq: (p.x - projection.x) ** 2 + (p.y - projection.y) ** 2 };
}

function findPointOnPolygon(point: Vec2D, polygon: Polygon): { edgeIdx: number, t: number, point: Vec2D } {
  let bestEdge = -1;
  let bestT = 0;
  let bestDistSq = Infinity;
  let bestProj = point;

  const verts = polygon.vertices;
  const len = verts.length;

  for (let i = 0; i < len; i++) {
    const v1 = verts[i]!;
    const v2 = verts[(i + 1) % len]!;
    const proj = projectPointOnSegment(point, v1, v2);
    if (proj.distSq < bestDistSq) {
      bestDistSq = proj.distSq;
      bestEdge = i;
      bestT = proj.t;
      bestProj = proj.point;
    }
  }

  return { edgeIdx: bestEdge, t: bestT, point: bestProj };
}

export function splitPolygon(field: Polygon, tetherPath: ReadonlyArray<Vec2D>): Polygon[] {
  if (tetherPath.length < 2) return [field];

  const startPoint = tetherPath[0]!;
  const endPoint = tetherPath[tetherPath.length - 1]!;

  const startMeta = findPointOnPolygon(startPoint, field);
  const endMeta = findPointOnPolygon(endPoint, field);

  // Path needs to be precise relative to edges
  const precisionPath = [...tetherPath];
  precisionPath[0] = startMeta.point;
  precisionPath[precisionPath.length - 1] = endMeta.point;

  const verts = field.vertices;
  const len = verts.length;

  // Define a helper to get perimeter vertices forward from edge1 to edge2
  const getPerimeterForward = (e1: number, t1: number, e2: number, t2: number): Vec2D[] => {
    const res: Vec2D[] = [];
    if (e1 === e2) {
      if (t1 <= t2) return res; // No vertices between them going forward on the same edge
      let c = (e1 + 1) % len;
      do {
        res.push(verts[c]!);
        c = (c + 1) % len;
      } while (c !== (e2 + 1) % len);
    } else {
      let c = (e1 + 1) % len;
      while (c !== (e2 + 1) % len) {
        res.push(verts[c]!);
        c = (c + 1) % len;
      }
    }
    return res;
  };

  // Poly 1: Path T (startMeta to endMeta), then forward perimeter from endMeta to startMeta
  const poly1Verts: Vec2D[] = [];
  for (let i = 0; i < precisionPath.length; i++) {
    poly1Verts.push(precisionPath[i]!);
  }
  const perim1 = getPerimeterForward(endMeta.edgeIdx, endMeta.t, startMeta.edgeIdx, startMeta.t);
  for (const v of perim1) poly1Verts.push(v);

  // Poly 2: Path reverse T (endMeta to startMeta), then forward perimeter from startMeta to endMeta
  const poly2Verts: Vec2D[] = [];
  for (let i = precisionPath.length - 1; i >= 0; i--) {
    poly2Verts.push(precisionPath[i]!);
  }
  const perim2 = getPerimeterForward(startMeta.edgeIdx, startMeta.t, endMeta.edgeIdx, endMeta.t);
  for (const v of perim2) poly2Verts.push(v);

  // Attempt to build valid polygons
  const result: Polygon[] = [];
  try {
    if (poly1Verts.length >= 3) result.push(new Polygon(poly1Verts));
    if (poly2Verts.length >= 3) result.push(new Polygon(poly2Verts));
  } catch (e) {
    console.error('Failed to resolve split polygons:', e);
    return [field];
  }

  return result;
}
