export type GameEvents = {
  SCORE_UPDATED: number;
  AREA_CAPTURED: { areaDelta: number; total: number; comboMultiplier: number };
  PLAYER_DEATH: { cause: string; position: { x: number; y: number }; livesRemaining: number };
  LEVEL_COMPLETE: { level: number; score: number; capturePercent: number };
  COMBO: { multiplier: number };
  GAME_OVER: { finalScore: number; levelsCompleted: number };
  ENGINE_READY: void;
  GAME_STATE_CHANGED: 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';
  LIVES_UPDATED: number;
  CAPTURE_UPDATED: number;
  SHIELD_UPDATED: number;
}

type EventHandler<T> = T extends void ? () => void : (data: T) => void;

export class EventEmitter<TEvents extends Record<string, any>> {
  private listeners = new Map<keyof TEvents, Set<EventHandler<any>>>();

  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as EventHandler<any>);
  }

  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler as EventHandler<any>);
    }
  }

  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K] extends void ? [] : [TEvents[K]]): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const handler of set) {
        (handler as (...a: any[]) => void)(...args);
      }
    }
  }

  once<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    const wrapper = ((...args: any[]) => {
      this.off(event, wrapper as EventHandler<TEvents[K]>);
      (handler as (...a: any[]) => void)(...args);
    }) as EventHandler<TEvents[K]>;
    this.on(event, wrapper);
  }

  removeAllListeners(event?: keyof TEvents): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
