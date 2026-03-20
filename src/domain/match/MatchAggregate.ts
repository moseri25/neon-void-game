import { Polygon } from '../geometry/Polygon';
import { Vec2D } from '../geometry/Vector2D';
import { splitPolygon, subtractPolygon } from '../geometry/WeilerAtherton';
import type { DomainEvent } from './events';

export interface MatchState {
  readonly field: Polygon;
  readonly capturedPercent: number;
  readonly score: number;
  readonly lives: number;
  readonly level: number;
  readonly comboMultiplier: number;
  readonly isComplete: boolean;
  readonly isGameOver: boolean;
  readonly capturedPolygons: Polygon[];
}

const COMBO_WINDOW_MS = 3000;
const BASE_CAPTURE_SCORE = 1000;
const COMPLETION_THRESHOLD = 0.80;

export class MatchAggregate {
  private field: Polygon;
  private readonly initialArea: number;
  private capturedArea: number = 0;
  private score: number = 0;
  private lives: number = 3;
  private level: number = 1;
  private comboMultiplier: number = 1;
  private lastCaptureTime: number = 0;
  private isComplete: boolean = false;
  private isGameOver: boolean = false;
  private readonly playerId: string;
  private readonly _capturedPolygons: Polygon[] = [];

  constructor(initialBounds: Polygon, playerId: string = 'player1', level: number = 1, lives: number = 3) {
    this.field = initialBounds;
    this.initialArea = initialBounds.area();
    this.playerId = playerId;
    this.level = level;
    this.lives = lives;
  }

  processCapture(tetherPath: ReadonlyArray<Vec2D>, bossPosition?: Vec2D): { newField: Polygon; areaDelta: number; events: DomainEvent[] } {
    const events: DomainEvent[] = [];
    const now = Date.now();

    if (tetherPath.length < 3) {
      return { newField: this.field, areaDelta: 0, events };
    }

    const polygons = splitPolygon(this.field, tetherPath);
    if (polygons.length < 2) {
      return { newField: this.field, areaDelta: 0, events };
    }

    let keptPoly = polygons[0]!;
    let discardedPoly = polygons[1]!;

    if (bossPosition) {
      if (polygons[1]!.containsPoint(bossPosition)) {
        keptPoly = polygons[1]!;
        discardedPoly = polygons[0]!;
      }
    } else {
      if (polygons[1]!.area() > polygons[0]!.area()) {
        keptPoly = polygons[1]!;
        discardedPoly = polygons[0]!;
      }
    }

    const captureArea = discardedPoly.area();
    const areaDelta = captureArea / this.initialArea;

    if (areaDelta < 0.001) {
      return { newField: this.field, areaDelta: 0, events };
    }

    this._capturedPolygons.push(discardedPoly);

    this.field = keptPoly;
    this.capturedArea += captureArea;

    if (now - this.lastCaptureTime < COMBO_WINDOW_MS) {
      this.comboMultiplier = Math.min(this.comboMultiplier + 1, 10);
      events.push({
        type: 'COMBO',
        playerId: this.playerId,
        comboMultiplier: this.comboMultiplier,
        timestamp: now,
      });
    } else {
      this.comboMultiplier = 1;
    }

    const captureScore = Math.round(BASE_CAPTURE_SCORE * areaDelta * 100 * this.comboMultiplier * (1 + this.level * 0.1));
    this.score += captureScore;
    this.lastCaptureTime = now;

    const totalPercent = this.capturedArea / this.initialArea;

    events.push({
      type: 'AREA_CAPTURED',
      playerId: this.playerId,
      areaDelta,
      totalCapturePercent: totalPercent,
      score: captureScore,
      comboMultiplier: this.comboMultiplier,
      timestamp: now,
    });

    if (totalPercent >= COMPLETION_THRESHOLD) {
      this.isComplete = true;
      events.push({
        type: 'LEVEL_COMPLETE',
        playerId: this.playerId,
        levelId: this.level,
        score: this.score,
        timeMs: now,
        capturePercentage: totalPercent,
        timestamp: now,
      });
    }

    return { newField: this.field, areaDelta, events };
  }

  processPlayerDeath(cause: 'enemy_collision' | 'tether_cut' | 'timeout' | 'self_intersection', position: Vec2D): { events: DomainEvent[] } {
    const events: DomainEvent[] = [];
    const now = Date.now();

    this.lives--;
    this.comboMultiplier = 1;

    events.push({
      type: 'PLAYER_DEATH',
      playerId: this.playerId,
      cause,
      position,
      livesRemaining: this.lives,
      timestamp: now,
    });

    if (this.lives <= 0) {
      this.isGameOver = true;
      events.push({
        type: 'GAME_OVER',
        playerId: this.playerId,
        finalScore: this.score,
        levelsCompleted: this.level - 1,
        timestamp: now,
      });
    }

    return { events };
  }

  getCapturePercentage(): number {
    return this.capturedArea / this.initialArea;
  }

  getScore(): number {
    return this.score;
  }

  getState(): MatchState {
    return {
      field: this.field,
      capturedPercent: this.capturedArea / this.initialArea,
      score: this.score,
      lives: this.lives,
      level: this.level,
      comboMultiplier: this.comboMultiplier,
      isComplete: this.isComplete,
      isGameOver: this.isGameOver,
      capturedPolygons: this._capturedPolygons,
    };
  }
}
