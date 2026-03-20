export interface GameLoopCallbacks {
  onFixedUpdate: (dt: number) => void;
  onRender: (alpha: number) => void;
  onLateUpdate?: () => void;
}

const FIXED_TIMESTEP = 1 / 60;
const MAX_FRAME_SKIP = 5;
const FPS_SAMPLE_SIZE = 60;

export class GameLoop {
  private accumulator: number = 0;
  private lastTime: number = 0;
  private running: boolean = false;
  private paused: boolean = false;
  private rafId: number = 0;
  private callbacks: GameLoopCallbacks;

  private fpsSamples: number[] = [];
  private fpsIndex: number = 0;
  private _fps: number = 0;
  private _frameTime: number = 0;

  constructor(callbacks: GameLoopCallbacks) {
    this.callbacks = callbacks;
    this.fpsSamples = new Array(FPS_SAMPLE_SIZE).fill(0);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop(this.lastTime);
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    if (!this.running) return;
    this.paused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
  }

  get fps(): number {
    return this._fps;
  }

  get frameTime(): number {
    return this._frameTime;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  private loop = (currentTime: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);

    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this._frameTime = dt * 1000;

    this.fpsSamples[this.fpsIndex] = dt > 0 ? 1 / dt : 0;
    this.fpsIndex = (this.fpsIndex + 1) % FPS_SAMPLE_SIZE;
    this._fps = Math.round(
      this.fpsSamples.reduce((a, b) => a + b, 0) / FPS_SAMPLE_SIZE
    );

    if (this.paused) return;

    this.accumulator += Math.min(dt, MAX_FRAME_SKIP * FIXED_TIMESTEP);

    let steps = 0;
    while (this.accumulator >= FIXED_TIMESTEP && steps < MAX_FRAME_SKIP) {
      this.callbacks.onFixedUpdate(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
      steps++;
    }

    const alpha = this.accumulator / FIXED_TIMESTEP;
    this.callbacks.onRender(alpha);

    this.callbacks.onLateUpdate?.();
  };
}
