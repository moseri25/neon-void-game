export interface DDAState {
  readonly difficultyScalar: number;
  readonly enemySpeedMultiplier: number;
  readonly enemySpawnRateMultiplier: number;
  readonly comboWindowExtension: number;
  readonly hueShift: number;
  readonly eventLog: ReadonlyArray<DDAEvent>;
}

export interface DDAEvent {
  readonly timestamp: number;
  readonly previousScalar: number;
  readonly newScalar: number;
  readonly reason: string;
}

interface Telemetry {
  perimeterTimeMs: number;
  voidTimeMs: number;
  captureAreas: number[];
  nearMissCount: number;
  deathCount: number;
  captureCount: number;
  elapsedMs: number;
}

const MIN_SCALAR = 0.5;
const MAX_SCALAR = 1.5;
const ADJUST_INTERVAL_MS = 10000;

export class DDAEngine {
  private scalar: number = 1.0;
  private telemetry: Telemetry = {
    perimeterTimeMs: 0,
    voidTimeMs: 0,
    captureAreas: [],
    nearMissCount: 0,
    deathCount: 0,
    captureCount: 0,
    elapsedMs: 0,
  };
  private eventLog: DDAEvent[] = [];
  private lastAdjustTime: number = 0;

  recordPerimeterTime(ms: number): void {
    this.telemetry.perimeterTimeMs += ms;
  }

  recordVoidTime(ms: number): void {
    this.telemetry.voidTimeMs += ms;
  }

  recordCapture(areaPercent: number): void {
    this.telemetry.captureAreas.push(areaPercent);
    this.telemetry.captureCount++;
  }

  recordNearMiss(): void {
    this.telemetry.nearMissCount++;
  }

  recordDeath(): void {
    this.telemetry.deathCount++;
  }

  update(dt: number): void {
    this.telemetry.elapsedMs += dt * 1000;

    if (this.telemetry.elapsedMs - this.lastAdjustTime >= ADJUST_INTERVAL_MS) {
      this.adjustDifficulty();
      this.lastAdjustTime = this.telemetry.elapsedMs;
    }
  }

  private adjustDifficulty(): void {
    const prev = this.scalar;
    let adjustment = 0;
    const elapsed = this.telemetry.elapsedMs / 1000;

    // Death rate
    const deathRate = elapsed > 0 ? (this.telemetry.deathCount / elapsed) * 60 : 0;
    if (deathRate > 3) adjustment -= 0.1;
    else if (deathRate > 1.5) adjustment -= 0.05;
    else if (deathRate < 0.3 && elapsed > 30) adjustment += 0.05;

    // Capture rate
    const captureRate = elapsed > 0 ? (this.telemetry.captureCount / elapsed) * 60 : 0;
    if (captureRate > 6) adjustment += 0.05;
    else if (captureRate < 1 && elapsed > 20) adjustment -= 0.05;

    // Average capture size
    const avgCapture = this.telemetry.captureAreas.length > 0
      ? this.telemetry.captureAreas.reduce((a, b) => a + b, 0) / this.telemetry.captureAreas.length
      : 0;
    if (avgCapture > 0.15) adjustment += 0.03;
    else if (avgCapture < 0.03) adjustment -= 0.03;

    // Perimeter time ratio (high = playing safe = too easy)
    const totalTime = this.telemetry.perimeterTimeMs + this.telemetry.voidTimeMs;
    if (totalTime > 0) {
      const perimeterRatio = this.telemetry.perimeterTimeMs / totalTime;
      if (perimeterRatio > 0.85) adjustment += 0.03;
      else if (perimeterRatio < 0.4) adjustment -= 0.03;
    }

    if (Math.abs(adjustment) > 0.001) {
      this.scalar = Math.max(MIN_SCALAR, Math.min(MAX_SCALAR, this.scalar + adjustment));

      const reason = adjustment > 0 ? 'Player performing well' : 'Player struggling';
      this.eventLog.push({
        timestamp: this.telemetry.elapsedMs,
        previousScalar: prev,
        newScalar: this.scalar,
        reason,
      });
    }
  }

  getState(): DDAState {
    return {
      difficultyScalar: this.scalar,
      enemySpeedMultiplier: 0.7 + this.scalar * 0.6,
      enemySpawnRateMultiplier: 0.8 + this.scalar * 0.4,
      comboWindowExtension: this.scalar < 0.8 ? 500 : 0,
      hueShift: (this.scalar - 1.0) / 0.5,
      eventLog: this.eventLog,
    };
  }

  reset(): void {
    this.scalar = 1.0;
    this.telemetry = {
      perimeterTimeMs: 0,
      voidTimeMs: 0,
      captureAreas: [],
      nearMissCount: 0,
      deathCount: 0,
      captureCount: 0,
      elapsedMs: 0,
    };
    this.eventLog = [];
    this.lastAdjustTime = 0;
  }
}
