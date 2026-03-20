import { Vec2D } from '@/domain/geometry/Vector2D';
import { Polygon } from '@/domain/geometry/Polygon';
import type { LevelConfig } from './levelSchemas';

// Mulberry32 seeded PRNG
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SpawnPoint {
  position: Vec2D;
  type: 'bouncer' | 'chaser' | 'gravity_well' | 'boss';
  speed: number;
  delay: number;
}

export interface GeneratedLevel {
  field: Polygon;
  enemySpawns: SpawnPoint[];
  playerStart: Vec2D;
  perimeter: Vec2D[];
}

export function generateLevel(config: LevelConfig): GeneratedLevel {
  const rng = mulberry32(config.seed);
  const { width, height } = config.bounds;
  const hw = width / 2;
  const hh = height / 2;

  // Generate field polygon
  const field = generateFieldPolygon(hw, hh, config.id, rng);

  // Player starts at top center of perimeter
  const playerStart = Vec2D.from(0, -hh);

  // Generate enemy spawn points
  const enemySpawns: SpawnPoint[] = [];
  for (const spawn of config.enemies) {
    for (let i = 0; i < spawn.count; i++) {
      const margin = 50;
      let x: number, y: number;
      let attempts = 0;

      // Place enemies away from player start
      do {
        x = (rng() - 0.5) * (width - margin * 2);
        y = (rng() - 0.5) * (height - margin * 2);
        attempts++;
      } while (
        Vec2D.from(x, y).distanceTo(playerStart) < 150 &&
        attempts < 50
      );

      enemySpawns.push({
        position: Vec2D.from(x, y),
        type: spawn.type,
        speed: spawn.speed,
        delay: spawn.spawnDelay,
      });
    }
  }

  // Build perimeter path from polygon vertices
  const perimeter = [...field.vertices] as Vec2D[];

  return { field, enemySpawns, playerStart, perimeter };
}

function generateFieldPolygon(hw: number, hh: number, levelId: number, rng: () => number): Polygon {
  // Levels 1-5: Simple rectangles
  if (levelId <= 5) {
    return Polygon.rectangle(-hw, -hh, hw * 2, hh * 2);
  }

  // Levels 6-10: Slightly irregular (warped rectangle)
  if (levelId <= 10) {
    const warp = 30;
    return new Polygon([
      Vec2D.from(-hw + rng() * warp, -hh + rng() * warp),
      Vec2D.from(0, -hh - rng() * warp * 0.5),
      Vec2D.from(hw - rng() * warp, -hh + rng() * warp),
      Vec2D.from(hw + rng() * warp * 0.3, 0),
      Vec2D.from(hw - rng() * warp, hh - rng() * warp),
      Vec2D.from(0, hh + rng() * warp * 0.3),
      Vec2D.from(-hw + rng() * warp, hh - rng() * warp),
      Vec2D.from(-hw - rng() * warp * 0.3, 0),
    ]);
  }

  // Levels 11-20: More complex polygons
  if (levelId <= 20) {
    const sides = 6 + Math.floor(rng() * 4);
    const verts: Vec2D[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const radiusX = hw * (0.7 + rng() * 0.3);
      const radiusY = hh * (0.7 + rng() * 0.3);
      verts.push(Vec2D.from(
        Math.cos(angle) * radiusX,
        Math.sin(angle) * radiusY
      ));
    }
    return new Polygon(verts);
  }

  // Levels 21+: Compact, irregular shapes
  const sides = 8 + Math.floor(rng() * 6);
  const verts: Vec2D[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const radius = Math.min(hw, hh) * (0.5 + rng() * 0.5);
    verts.push(Vec2D.from(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    ));
  }
  return new Polygon(verts);
}
