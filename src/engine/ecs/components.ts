export enum ComponentType {
  POSITION = 'position',
  VELOCITY = 'velocity',
  RENDER = 'render',
  PLAYER = 'player',
  ENEMY = 'enemy',
  TETHER = 'tether',
  COLLIDER = 'collider',
  PARTICLE_EMITTER = 'particleEmitter',
  POWERUP = 'powerup',
  PROJECTILE = 'projectile',
}

export interface PositionComponent {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

export interface VelocityComponent {
  vx: number;
  vy: number;
}

export interface RenderComponent {
  color: string;
  radius: number;
  glow: boolean;
  glowColor: string;
  glowIntensity: number;
  shape: 'circle' | 'diamond' | 'hexagon' | 'ring';
  visible: boolean;
}

export interface PlayerComponent {
  speed: number;
  isOnPerimeter: boolean;
  isDrawingTether: boolean;
  lives: number;
  score: number;
  shieldEnergy: number; // 0 to 100
  invulnerableUntil: number;
  dirX: number;
  dirY: number;
  weaponAmmo: number; // For shooting powerup
}

export interface EnemyComponent {
  type: 'bouncer' | 'chaser' | 'gravity_well' | 'boss';
  behaviorState: string;
  detectionRadius: number;
  mass: number;
}

export interface TetherComponent {
  points: Float64Array;
  pointCount: number;
  maxPoints: number;
}

export interface ColliderComponent {
  radius: number;
  layer: number;
  mask: number;
}

export interface ParticleEmitterComponent {
  poolId: string;
  emitRate: number;
  lifetime: number;
  timer: number;
}

export interface PowerupComponent {
  type: 'weapon'; /* more can be added later */
  value: number; // Example: ammo amount
}

export interface ProjectileComponent {
  damage: number;
  fromPlayer: boolean;
  lifetime: number; // frames or ms before disappearing
  timer: number;
}

export type ComponentData = {
  [ComponentType.POSITION]: PositionComponent;
  [ComponentType.VELOCITY]: VelocityComponent;
  [ComponentType.RENDER]: RenderComponent;
  [ComponentType.PLAYER]: PlayerComponent;
  [ComponentType.ENEMY]: EnemyComponent;
  [ComponentType.TETHER]: TetherComponent;
  [ComponentType.COLLIDER]: ColliderComponent;
  [ComponentType.PARTICLE_EMITTER]: ParticleEmitterComponent;
  [ComponentType.POWERUP]: PowerupComponent;
  [ComponentType.PROJECTILE]: ProjectileComponent;
};
