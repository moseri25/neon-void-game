import { Vec2D, type IVector2D } from '../geometry/Vector2D';

export interface PlayerState {
  readonly position: Vec2D;
  readonly velocity: Vec2D;
  readonly speed: number;
  readonly isOnPerimeter: boolean;
  readonly isDrawingTether: boolean;
  readonly tether: ReadonlyArray<Vec2D>;
  readonly lives: number;
  readonly invulnerableUntil: number;
}

export class Player implements PlayerState {
  public readonly position: Vec2D;
  public readonly velocity: Vec2D;
  public readonly speed: number;
  public readonly isOnPerimeter: boolean;
  public readonly isDrawingTether: boolean;
  public readonly tether: ReadonlyArray<Vec2D>;
  public readonly lives: number;
  public readonly invulnerableUntil: number;

  private constructor(state: PlayerState) {
    this.position = state.position;
    this.velocity = state.velocity;
    this.speed = state.speed;
    this.isOnPerimeter = state.isOnPerimeter;
    this.isDrawingTether = state.isDrawingTether;
    this.tether = state.tether;
    this.lives = state.lives;
    this.invulnerableUntil = state.invulnerableUntil;
  }

  static create(position: IVector2D, speed: number = 300, lives: number = 3): Player {
    return new Player({
      position: Vec2D.from(position.x, position.y),
      velocity: Vec2D.zero(),
      speed,
      isOnPerimeter: true,
      isDrawingTether: false,
      tether: [],
      lives,
      invulnerableUntil: 0,
    });
  }

  move(direction: IVector2D, deltaTime: number): Player {
    const dir = Vec2D.from(direction.x, direction.y).normalize();
    const vel = dir.multiply(this.speed);
    const newPos = this.position.add(vel.multiply(deltaTime));

    return new Player({
      ...this,
      position: newPos,
      velocity: vel,
    });
  }

  setPosition(position: IVector2D): Player {
    return new Player({
      ...this,
      position: Vec2D.from(position.x, position.y),
    });
  }

  setOnPerimeter(onPerimeter: boolean): Player {
    return new Player({
      ...this,
      isOnPerimeter: onPerimeter,
    });
  }

  startTether(): Player {
    if (!this.isOnPerimeter) return this;
    return new Player({
      ...this,
      isDrawingTether: true,
      isOnPerimeter: false,
      tether: [this.position.clone()],
    });
  }

  addTetherPoint(point: IVector2D): Player {
    if (!this.isDrawingTether) return this;
    const p = Vec2D.from(point.x, point.y);
    const lastPoint = this.tether[this.tether.length - 1];
    if (lastPoint && lastPoint.distanceSquaredTo(p) < 4) return this;
    return new Player({
      ...this,
      tether: [...this.tether, p],
    });
  }

  completeTether(): { player: Player; tetherPath: ReadonlyArray<Vec2D> } {
    const tetherPath = [...this.tether, this.position.clone()];
    const player = new Player({
      ...this,
      isDrawingTether: false,
      isOnPerimeter: true,
      tether: [],
    });
    return { player, tetherPath };
  }

  cancelTether(): Player {
    return new Player({
      ...this,
      isDrawingTether: false,
      isOnPerimeter: true,
      tether: [],
    });
  }

  die(): Player {
    return new Player({
      ...this,
      lives: this.lives - 1,
      isDrawingTether: false,
      tether: [],
      isOnPerimeter: true,
      invulnerableUntil: Date.now() + 2000,
    });
  }

  isInvulnerable(): boolean {
    return Date.now() < this.invulnerableUntil;
  }

  getTetherLength(): number {
    let length = 0;
    for (let i = 1; i < this.tether.length; i++) {
      length += this.tether[i]!.distanceTo(this.tether[i - 1]!);
    }
    if (this.tether.length > 0) {
      length += this.position.distanceTo(this.tether[this.tether.length - 1]!);
    }
    return length;
  }
}
