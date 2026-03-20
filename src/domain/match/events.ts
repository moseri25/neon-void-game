import type { IVector2D } from '../geometry/Vector2D';

export type DomainEvent =
  | AreaCapturedEvent
  | PlayerDeathEvent
  | LevelCompleteEvent
  | ComboEvent
  | GameOverEvent;

export interface AreaCapturedEvent {
  readonly type: 'AREA_CAPTURED';
  readonly playerId: string;
  readonly areaDelta: number;
  readonly totalCapturePercent: number;
  readonly score: number;
  readonly comboMultiplier: number;
  readonly timestamp: number;
}

export interface PlayerDeathEvent {
  readonly type: 'PLAYER_DEATH';
  readonly playerId: string;
  readonly cause: 'enemy_collision' | 'tether_cut' | 'timeout' | 'self_intersection';
  readonly position: IVector2D;
  readonly livesRemaining: number;
  readonly timestamp: number;
}

export interface LevelCompleteEvent {
  readonly type: 'LEVEL_COMPLETE';
  readonly playerId: string;
  readonly levelId: number;
  readonly score: number;
  readonly timeMs: number;
  readonly capturePercentage: number;
  readonly timestamp: number;
}

export interface ComboEvent {
  readonly type: 'COMBO';
  readonly playerId: string;
  readonly comboMultiplier: number;
  readonly timestamp: number;
}

export interface GameOverEvent {
  readonly type: 'GAME_OVER';
  readonly playerId: string;
  readonly finalScore: number;
  readonly levelsCompleted: number;
  readonly timestamp: number;
}
