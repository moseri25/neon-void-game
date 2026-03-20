import { EventEmitter, type GameEvents } from './core/EventEmitter';
import { GameLoop } from './core/GameLoop';
import { World } from './ecs/World';
import { ComponentType } from './ecs/components';
import { MovementSystem } from './ecs/systems/MovementSystem';
import { CollisionSystem } from './ecs/systems/CollisionSystem';
import { CaptureSystem } from './ecs/systems/CaptureSystem';
import { NeonRenderer } from './renderer/WebGPURenderer';
import { ParticlePool } from './renderer/ParticlePool';
import { PhysicsEngine } from './physics/PhysicsEngine';
import { Polygon } from '@/domain/geometry/Polygon';
import { Vec2D } from '@/domain/geometry/Vector2D';
import { MatchAggregate } from '@/domain/match/MatchAggregate';
import type { LevelConfig } from '@/game/levels/levelSchemas';
import { lineSegmentIntersect } from '@/domain/geometry/WeilerAtherton';

export type InputAction = 'MOVE_UP' | 'MOVE_DOWN' | 'MOVE_LEFT' | 'MOVE_RIGHT' | 'START_TETHER' | 'RELEASE' | 'PAUSE' | 'SHOOT';

export type EngineState = 'idle' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';

export class NeonVoidEngine extends EventEmitter<GameEvents> {
  private world: World;
  private gameLoop: GameLoop;
  private renderer!: NeonRenderer;
  private particles: ParticlePool;
  private physics!: PhysicsEngine;
  private match!: MatchAggregate;
  private collisionSystem: CollisionSystem;
  private captureSystem: CaptureSystem;

  private state: EngineState = 'idle';
  private playerEntityId: number = 0;
  private enemyEntityIds: number[] = [];
  private inputState = { up: false, down: false, left: false, right: false, action: false, shoot: false };
  private currentLevel: number = 1;
  private tetherStartX: number = 0;
  private tetherStartY: number = 0;
  private screenShakeEnabled: boolean = true;
  private shakeIntensity: number = 0;
  private initialField?: Polygon;
  private graphicsQuality: 'low' | 'medium' | 'high' | 'ultra' = 'high';

  constructor() {
    super();
    this.world = new World();
    this.particles = new ParticlePool(10000);
    this.collisionSystem = new CollisionSystem(64);
    this.captureSystem = new CaptureSystem();

    this.world.addSystem(new MovementSystem());
    this.world.addSystem(this.collisionSystem);
    this.world.addSystem(this.captureSystem);

    this.gameLoop = new GameLoop({
      onFixedUpdate: (dt) => this.fixedUpdate(dt),
      onRender: (alpha) => this.render(alpha),
    });
  }

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.renderer = new NeonRenderer(canvas);
    this.renderer.setQuality(this.graphicsQuality);

    window.addEventListener('resize', () => this.renderer.resize());

    this.emit('ENGINE_READY');
  }

  setScreenShake(enabled: boolean): void {
    this.screenShakeEnabled = enabled;
  }

  setGraphicsQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    this.graphicsQuality = quality;
    if (this.renderer) {
      this.renderer.setQuality(quality);
    }
  }

  startGame(levelConfig?: LevelConfig): void {
    this.world.clear();
    this.particles.clear();
    this.enemyEntityIds = [];

    const width = levelConfig?.bounds.width ?? 800;
    const height = levelConfig?.bounds.height ?? 600;
    this.currentLevel = levelConfig?.id ?? 1;

    const field = Polygon.rectangle(-width / 2, -height / 2, width, height);
    this.initialField = field;
    this.physics = new PhysicsEngine(field);
    this.match = new MatchAggregate(field, 'player1', this.currentLevel);

    this.playerEntityId = this.world.createEntity();
    const startPos = this.physics.constrainToPerimeter(0, height / 2);

    this.world.addComponent(this.playerEntityId, ComponentType.POSITION, {
      x: startPos.x, y: startPos.y, prevX: startPos.x, prevY: startPos.y,
    });
    this.world.addComponent(this.playerEntityId, ComponentType.VELOCITY, { vx: 0, vy: 0 });
    this.world.addComponent(this.playerEntityId, ComponentType.PLAYER, {
      speed: 250, isOnPerimeter: true, isDrawingTether: false,
      lives: 3, score: 0, shieldEnergy: 100, invulnerableUntil: 0, dirX: 0, dirY: 0, weaponAmmo: 0,
    });
    this.world.addComponent(this.playerEntityId, ComponentType.RENDER, {
      color: '#00F0FF', radius: 8, glow: true, glowColor: '#00F0FF',
      glowIntensity: 20, shape: 'circle', visible: true,
    });
    this.world.addComponent(this.playerEntityId, ComponentType.COLLIDER, {
      radius: 8, layer: 1, mask: 2,
    });
    this.world.addComponent(this.playerEntityId, ComponentType.TETHER, {
      points: new Float64Array(2000),
      pointCount: 0,
      maxPoints: 1000,
    });

    const enemies: import('../game/levels/levelSchemas').EnemySpawnConfig[] = levelConfig?.enemies ? [...levelConfig.enemies] : [
      { type: 'bouncer', count: 2, speed: 120, spawnDelay: 0 },
    ];

    const hasBoss = enemies.some(e => e.type === 'boss');
    if (!hasBoss) {
      enemies.push({ type: 'boss', count: 1, speed: 60, spawnDelay: 0 });
    }

    for (const spawn of enemies) {
      for (let i = 0; i < spawn.count; i++) {
        const enemyId = this.world.createEntity();
        const ex = (Math.random() - 0.5) * width * 0.6;
        const ey = (Math.random() - 0.5) * height * 0.6;

        this.world.addComponent(enemyId, ComponentType.POSITION, {
          x: ex, y: ey, prevX: ex, prevY: ey,
        });

        const angle = Math.random() * Math.PI * 2;
        this.world.addComponent(enemyId, ComponentType.VELOCITY, {
          vx: Math.cos(angle) * spawn.speed,
          vy: Math.sin(angle) * spawn.speed,
        });

        const colors: Record<string, string> = {
          bouncer: '#FF003C',
          chaser: '#FFB800',
          gravity_well: '#FF003C',
          boss: '#FF00FF',
        };
        const shapes: Record<string, 'diamond' | 'hexagon' | 'ring' | 'star'> = {
          bouncer: 'diamond',
          chaser: 'hexagon',
          gravity_well: 'ring',
          boss: 'star',
        };

        this.world.addComponent(enemyId, ComponentType.RENDER, {
          color: colors[spawn.type] ?? '#FF003C',
          radius: spawn.type === 'gravity_well' ? 40 : (spawn.type === 'boss' ? 16 : 8),
          glow: true,
          glowColor: colors[spawn.type] ?? '#FF003C',
          glowIntensity: spawn.type === 'boss' ? 25 : 15,
          shape: shapes[spawn.type] as any ?? 'diamond',
          visible: true,
        });
        this.world.addComponent(enemyId, ComponentType.ENEMY, {
          type: spawn.type,
          behaviorState: 'active',
          detectionRadius: spawn.type === 'chaser' ? 200 : 0,
          mass: spawn.type === 'gravity_well' ? 500 : 0,
        });
        this.world.addComponent(enemyId, ComponentType.COLLIDER, {
          radius: spawn.type === 'gravity_well' ? 40 : 8,
          layer: 2,
          mask: 1,
        });

        this.enemyEntityIds.push(enemyId);
      }
    }

    // Spawn 1 Diamond Powerup in the field
    const powerupId = this.world.createEntity();
    this.world.addComponent(powerupId, ComponentType.POSITION, {
        x: (Math.random() - 0.5) * width * 0.5, y: (Math.random() - 0.5) * height * 0.5, prevX: 0, prevY: 0
    });
    this.world.addComponent(powerupId, ComponentType.RENDER, {
        color: '#FFFFFF', radius: 10, glow: true, glowColor: '#00F0FF',
        glowIntensity: 25, shape: 'diamond', visible: true
    });
    this.world.addComponent(powerupId, ComponentType.COLLIDER, {
        radius: 10, layer: 3, mask: 1
    });
    this.world.addComponent(powerupId, ComponentType.POWERUP, {
        type: 'weapon', value: 10
    });

    this.renderer.setCamera(0, 0, 1);
    this.state = 'playing';
    this.emit('GAME_STATE_CHANGED', 'playing');
    this.emit('LIVES_UPDATED', 3);
    this.emit('SCORE_UPDATED', 0);
    this.emit('CAPTURE_UPDATED', 0);
    this.emit('SHIELD_UPDATED', 100);
    this.gameLoop.start();
  }

  private fixedUpdate(dt: number): void {
    if (this.state !== 'playing') return;

    const player = this.world.getComponent(this.playerEntityId, ComponentType.PLAYER);
    const pos = this.world.getComponent(this.playerEntityId, ComponentType.POSITION);
    if (!player || !pos) return;

    let dirX = 0, dirY = 0;
    if (this.inputState.up) dirY -= 1;
    if (this.inputState.down) dirY += 1;
    if (this.inputState.left) dirX -= 1;
    if (this.inputState.right) dirX += 1;

    const mag = Math.sqrt(dirX * dirX + dirY * dirY);
    if (mag > 0) {
      dirX /= mag;
      dirY /= mag;
    }

    if (player.isOnPerimeter && !player.isDrawingTether) {
      player.shieldEnergy = Math.max(0, player.shieldEnergy - dt * 5); // Deplete shield
      this.emit('SHIELD_UPDATED', player.shieldEnergy);
      if (dirX !== 0 || dirY !== 0) {
        const newPos = this.physics.moveAlongPerimeter(
          pos.x, pos.y, dirX, dirY, player.speed, dt
        );
        pos.prevX = pos.x;
        pos.prevY = pos.y;
        pos.x = newPos.x;
        pos.y = newPos.y;
      }
    } else if (player.isDrawingTether) {
      player.shieldEnergy = 100; // Refill shield during capture line
      this.emit('SHIELD_UPDATED', player.shieldEnergy);
      pos.prevX = pos.x;
      pos.prevY = pos.y;
      const nextX = pos.x + dirX * player.speed * dt;
      const nextY = pos.y + dirY * player.speed * dt;

      if (this.physics.isPointInField(nextX, pos.y) || this.physics.isPointOnPerimeter(nextX, pos.y, 0.5)) {
        pos.x = nextX;
      }
      if (this.physics.isPointInField(pos.x, nextY) || this.physics.isPointOnPerimeter(pos.x, nextY, 0.5)) {
        pos.y = nextY;
      }

      const distFromStart = Math.sqrt(
        (pos.x - this.tetherStartX) ** 2 + (pos.y - this.tetherStartY) ** 2
      );

      // Self intersection check
      const tether = this.world.getComponent(this.playerEntityId, ComponentType.TETHER);
      if (tether && tether.pointCount >= 3) {
        const headStart = Vec2D.from(tether.points[(tether.pointCount - 1) * 2]!, tether.points[(tether.pointCount - 1) * 2 + 1]!);
        const headEnd = Vec2D.from(pos.x, pos.y);
        for (let i = 0; i < tether.pointCount - 2; i++) {
          const segStart = Vec2D.from(tether.points[i * 2]!, tether.points[i * 2 + 1]!);
          const segEnd = Vec2D.from(tether.points[(i + 1) * 2]!, tether.points[(i + 1) * 2 + 1]!);
          if (lineSegmentIntersect(headStart, headEnd, segStart, segEnd)) {
            this.triggerPlayerDeath('self_intersection');
            return;
          }
        }
      }

      if (distFromStart > 20 && this.physics.isPointOnPerimeter(pos.x, pos.y, 5)) {
        const constrained = this.physics.constrainToPerimeter(pos.x, pos.y);
        pos.x = constrained.x;
        pos.y = constrained.y;
        player.isOnPerimeter = true;
        player.isDrawingTether = false;

        const tether = this.world.getComponent(this.playerEntityId, ComponentType.TETHER);
        if (tether && tether.pointCount >= 2) {
          const tetherVerts: Vec2D[] = [];
          for (let i = 0; i < tether.pointCount; i++) {
            tetherVerts.push(Vec2D.from(tether.points[i * 2]!, tether.points[i * 2 + 1]!));
          }
          tetherVerts.push(Vec2D.from(pos.x, pos.y));

          let bossPos: Vec2D | undefined;
          for (const enemyId of this.enemyEntityIds) {
            const enemy = this.world.getComponent(enemyId, ComponentType.ENEMY)!;
            if (enemy.type === 'boss') {
              const ePos = this.world.getComponent(enemyId, ComponentType.POSITION)!;
              bossPos = Vec2D.from(ePos.x, ePos.y);
              break;
            }
          }

          const result = this.match.processCapture(tetherVerts, bossPos);
          const newField = result.newField;

          // Trap minor enemies in the discarded polygon area
          let enemiesDestroyed = 0;
          for (let i = this.enemyEntityIds.length - 1; i >= 0; i--) {
            const enemyId = this.enemyEntityIds[i]!;
            const enemy = this.world.getComponent(enemyId, ComponentType.ENEMY)!;
            if (enemy.type !== 'boss') {
              const ePos = this.world.getComponent(enemyId, ComponentType.POSITION)!;
              if (!newField.containsPoint(Vec2D.from(ePos.x, ePos.y))) {
                this.world.destroyEntity(enemyId);
                this.enemyEntityIds.splice(i, 1);
                enemiesDestroyed++;
              }
            }
          }

          for (const event of result.events) {
            switch (event.type) {
              case 'AREA_CAPTURED':
                this.emit('AREA_CAPTURED', {
                  areaDelta: event.areaDelta,
                  total: event.totalCapturePercent,
                  comboMultiplier: event.comboMultiplier,
                });
                
                // Add minor extra score per trapped enemy
                if (enemiesDestroyed > 0) {
                  const playerComp = this.world.getComponent(this.playerEntityId, ComponentType.PLAYER)!;
                  playerComp.score += enemiesDestroyed * 500 * event.comboMultiplier;
                }

                this.emit('SCORE_UPDATED', this.match.getScore() + (enemiesDestroyed > 0 ? enemiesDestroyed * 500 * event.comboMultiplier : 0));
                this.emit('CAPTURE_UPDATED', event.totalCapturePercent);
                this.physics.setField(result.newField);
                this.particles.burstAt(pos.x, pos.y, 30, 0, 0.94, 1);
                break;
              case 'COMBO':
                this.emit('COMBO', { multiplier: event.comboMultiplier });
                break;
              case 'LEVEL_COMPLETE':
                this.state = 'levelComplete';
                this.emit('LEVEL_COMPLETE', {
                  level: this.currentLevel,
                  score: this.match.getScore(),
                  capturePercent: event.capturePercentage,
                });
                this.emit('GAME_STATE_CHANGED', 'levelComplete');
                break;
            }
          }

          tether.pointCount = 0;
        }
      }
    }

    for (const enemyId of this.enemyEntityIds) {
      const ePos = this.world.getComponent(enemyId, ComponentType.POSITION);
      const eVel = this.world.getComponent(enemyId, ComponentType.VELOCITY);
      const enemy = this.world.getComponent(enemyId, ComponentType.ENEMY);
      if (!ePos || !eVel || !enemy) continue;

      if (enemy.type === 'bouncer') {
        const result = this.physics.reflectOffEdges(ePos.x, ePos.y, eVel.vx, eVel.vy, 8);
        ePos.x = result.x;
        ePos.y = result.y;
        eVel.vx = result.vx;
        eVel.vy = result.vy;
      } else if (enemy.type === 'chaser') {
        const toPlayer = { x: pos.x - ePos.x, y: pos.y - ePos.y };
        const dist = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.y * toPlayer.y);
        if (dist > 1) {
          eVel.vx = (toPlayer.x / dist) * 80;
          eVel.vy = (toPlayer.y / dist) * 80;
        }
      } else if (enemy.type === 'boss') {
        const result = this.physics.reflectOffEdges(ePos.x, ePos.y, eVel.vx, eVel.vy, 16);
        ePos.x = result.x;
        ePos.y = result.y;
        eVel.vx = result.vx;
        eVel.vy = result.vy;
      }
    }

    this.world.update(dt);

    const collisions = this.collisionSystem.getCollisionEvents();
    for (const collision of collisions) {
      if (collision.type === 'player_enemy' || collision.type === 'enemy_tether') {
        if (player.invulnerableUntil > Date.now()) continue;
        this.triggerPlayerDeath('enemy_collision');
        break;
      }
      if (collision.type === 'player_powerup') {
        const powerup = this.world.getComponent(collision.entityB, ComponentType.POWERUP);
        if (powerup && powerup.type === 'weapon') {
          player.weaponAmmo += powerup.value;
          this.world.destroyEntity(collision.entityB);
        }
      }
      if (collision.type === 'projectile_enemy') {
        this.world.destroyEntity(collision.entityA); // Destroy bullet
        
        const enemy = this.world.getComponent(collision.entityB, ComponentType.ENEMY);
        if (enemy && enemy.type === 'boss') {
           // Boss killed = level complete
           this.state = 'levelComplete';
           this.emit('SCORE_UPDATED', player.score + 5000);
           this.emit('LEVEL_COMPLETE', {
             level: this.currentLevel,
             score: player.score,
             capturePercent: 100, // force complete
           });
           this.emit('GAME_STATE_CHANGED', 'levelComplete');
        }
        
        this.world.destroyEntity(collision.entityB); // Destroy enemy
        
        const removeIndex = this.enemyEntityIds.indexOf(collision.entityB);
        if (removeIndex !== -1) this.enemyEntityIds.splice(removeIndex, 1);
        
        const ePos = this.world.getComponent(collision.entityB, ComponentType.POSITION);
        if (ePos) this.particles.burstAt(ePos.x, ePos.y, 15, 0, 1, 0);
      }
    }
    this.collisionSystem.clearEvents();

    // Remove dead projectiles
    const projectiles = this.world.query(ComponentType.PROJECTILE);
    for (const projId of projectiles) {
      const proj = this.world.getComponent(projId, ComponentType.PROJECTILE)!;
      proj.timer += dt;
      if (proj.timer >= proj.lifetime) {
        this.world.destroyEntity(projId);
      }
    }

    this.particles.update(dt);
  }

  private triggerPlayerDeath(cause: 'enemy_collision' | 'tether_cut' | 'timeout' | 'self_intersection'): void {
    const player = this.world.getComponent(this.playerEntityId, ComponentType.PLAYER);
    const pos = this.world.getComponent(this.playerEntityId, ComponentType.POSITION);
    if (!player || !pos) return;

    const result = this.match.processPlayerDeath(cause, Vec2D.from(pos.x, pos.y));
    const state = this.match.getState();
    player.lives = state.lives;
    player.invulnerableUntil = Date.now() + 2000;
    player.isDrawingTether = false;
    player.isOnPerimeter = true;

    const tether = this.world.getComponent(this.playerEntityId, ComponentType.TETHER);
    if (tether) tether.pointCount = 0;

    if (this.screenShakeEnabled) {
      this.renderer.shake(15);
    }
    this.particles.burstAt(pos.x, pos.y, 50, 1, 0, 0.23);
    this.emit('PLAYER_DEATH', {
      cause,
      position: { x: pos.x, y: pos.y },
      livesRemaining: state.lives,
    });
    this.emit('LIVES_UPDATED', state.lives);

    for (const event of result.events) {
      if (event.type === 'GAME_OVER') {
        this.state = 'gameOver';
        this.emit('GAME_OVER', {
          finalScore: event.finalScore,
          levelsCompleted: event.levelsCompleted,
        });
        this.emit('GAME_STATE_CHANGED', 'gameOver');
      }
    }
  }

  private render(_alpha: number): void {
    const field = this.physics?.getField();
    if (!field) return;

    this.renderer.begin();

    // 1. Draw the active Playing Field Grid & Perimeter
    this.renderer.drawGrid(field, 30, 'rgba(0, 240, 255, 0.06)');
    this.renderer.drawPolygon(
      field,
      'rgba(10, 10, 26, 0.9)', // dark void background
      '#00F0FF',
      '#00F0FF'
    );

    // 2. Draw Captured Areas as Filled Solid blocks
    if (this.match) {
      for (const poly of this.match.getState().capturedPolygons) {
        this.renderer.drawPolygon(
          poly,
          'rgba(0, 200, 255, 0.15)', // light filled captured zone
          'rgba(0,0,0,0)' // transparent stroke removes lines between merged blocks
        );
      }
    }

    // 3. Draw the Original Bounding Box border OVER the background
    if (this.initialField) {
      this.renderer.drawPolygon(
        this.initialField,
        'rgba(0,0,0,0)',
        '#00F0FF33',
        '#00F0FF'
      );
    }

    for (const enemyId of this.enemyEntityIds) {
      const ePos = this.world.getComponent(enemyId, ComponentType.POSITION);
      const eRender = this.world.getComponent(enemyId, ComponentType.RENDER);
      const enemy = this.world.getComponent(enemyId, ComponentType.ENEMY);
      const eVel = this.world.getComponent(enemyId, ComponentType.VELOCITY);
      if (!ePos || !eRender) continue;

      if (enemy?.type === 'gravity_well') {
        this.renderer.drawGravityWell(ePos.x, ePos.y, eRender.radius);
      } else {
        const vx = eVel?.vx ?? 0;
        const vy = eVel?.vy ?? 0;
        const angle = (vx !== 0 || vy !== 0) ? Math.atan2(vy, vx) + Math.PI / 2 : 0;
        const type = enemy?.type === 'boss' ? 'boss' : 'minor';
        this.renderer.drawEnemySVG(ePos.x, ePos.y, eRender.radius, type, angle);
      }
    }

    // Render powerups and projectiles
    const drawables = this.world.query(ComponentType.RENDER, ComponentType.POSITION);
    for (const ent of drawables) {
       // Skip enemies and player since they are drawn explicitly above
       if (ent === this.playerEntityId || this.enemyEntityIds.includes(ent)) continue;
       const ren = this.world.getComponent(ent, ComponentType.RENDER)!;
       const p = this.world.getComponent(ent, ComponentType.POSITION)!;
       if (ren.visible) {
           if (ren.shape === 'diamond') this.renderer.drawDiamond(p.x, p.y, ren.radius, ren.color);
           else if (ren.shape === 'circle') this.renderer.drawCircle(p.x, p.y, ren.radius, ren.color, ren.glow, ren.glowColor);
       }
    }

    const pos = this.world.getComponent(this.playerEntityId, ComponentType.POSITION);
    const player = this.world.getComponent(this.playerEntityId, ComponentType.PLAYER);
    const tether = this.world.getComponent(this.playerEntityId, ComponentType.TETHER);

    if (pos) {
      if (tether && player?.isDrawingTether && tether.pointCount > 0) {
        this.renderer.drawTether(tether.points, tether.pointCount, pos.x, pos.y);
      }

      const blink = player?.invulnerableUntil && player.invulnerableUntil > Date.now()
        ? Math.sin(Date.now() * 0.02) > 0
        : true;

      if (blink) {
        this.renderer.drawCircle(pos.x, pos.y, 8, '#00F0FF', true, '#00F0FF');
      }
    }

    this.particles.render(this.renderer.getContext());

    this.renderer.end();
  }

  handleInput(action: InputAction, pressed: boolean = true): void {
    switch (action) {
      case 'MOVE_UP': this.inputState.up = pressed; break;
      case 'MOVE_DOWN': this.inputState.down = pressed; break;
      case 'MOVE_LEFT': this.inputState.left = pressed; break;
      case 'MOVE_RIGHT': this.inputState.right = pressed; break;
      case 'START_TETHER':
        if (pressed && this.state === 'playing') {
          const player = this.world.getComponent(this.playerEntityId, ComponentType.PLAYER);
          const pos = this.world.getComponent(this.playerEntityId, ComponentType.POSITION);
          const tether = this.world.getComponent(this.playerEntityId, ComponentType.TETHER);
          if (player?.isOnPerimeter && pos && tether) {
            player.isDrawingTether = true;
            player.isOnPerimeter = false;
            tether.pointCount = 1;
            tether.points[0] = pos.x;
            tether.points[1] = pos.y;
            this.tetherStartX = pos.x;
            this.tetherStartY = pos.y;
          }
        }
        break;
      case 'SHOOT':
        if (pressed && !this.inputState.shoot && this.state === 'playing') {
           this.inputState.shoot = true;
           this.firePlayerWeapon();
        } else if (!pressed) {
           this.inputState.shoot = false;
        }
        break;
      case 'PAUSE':
        if (this.state === 'playing') this.pauseGame();
        else if (this.state === 'paused') this.resumeGame();
        break;
    }
  }

  private firePlayerWeapon(): void {
    const player = this.world.getComponent(this.playerEntityId, ComponentType.PLAYER);
    const pos = this.world.getComponent(this.playerEntityId, ComponentType.POSITION);
    if (!player || !pos || player.weaponAmmo <= 0) return;

    player.weaponAmmo -= 1;
    
    // Shoot straight towards the center (or if on perimeter, shoot inwards)
    // Actually, straight UP or inward? Let's shoot inward from perimeter.
    let vx = 0; let vy = 0;
    if (this.initialField) {
        const bounds = this.initialField.getBounds();
        // roughly inward
        if (pos.x >= bounds.max.x - 5) vx = -400;
        else if (pos.x <= bounds.min.x + 5) vx = 400;
        else if (pos.y >= bounds.max.y - 5) vy = -400;
        else if (pos.y <= bounds.min.y + 5) vy = 400;
        else {
            // If in field drawing tether, shoot up
            vy = -400;
        }
    }

    if (vx === 0 && vy === 0) vy = -400;

    const bulletId = this.world.createEntity();
    this.world.addComponent(bulletId, ComponentType.POSITION, { x: pos.x, y: pos.y, prevX: pos.x, prevY: pos.y });
    this.world.addComponent(bulletId, ComponentType.VELOCITY, { vx, vy });
    this.world.addComponent(bulletId, ComponentType.RENDER, { 
        color: '#FFFFFF', radius: 4, glow: true, glowColor: '#00F0FF', 
        glowIntensity: 10, shape: 'circle', visible: true 
    });
    this.world.addComponent(bulletId, ComponentType.PROJECTILE, { damage: 1, fromPlayer: true, lifetime: 2, timer: 0 });
    this.world.addComponent(bulletId, ComponentType.COLLIDER, { radius: 4, layer: 1, mask: 2 });
  }

  pauseGame(): void {
    this.state = 'paused';
    this.gameLoop.pause();
    this.emit('GAME_STATE_CHANGED', 'paused');
  }

  resumeGame(): void {
    this.state = 'playing';
    this.gameLoop.resume();
    this.emit('GAME_STATE_CHANGED', 'playing');
  }

  stopGame(): void {
    this.state = 'idle';
    this.gameLoop.stop();
    this.world.clear();
    this.emit('GAME_STATE_CHANGED', 'menu');
  }

  getState(): EngineState {
    return this.state;
  }

  getFps(): number {
    return this.gameLoop.fps;
  }

  destroy(): void {
    this.gameLoop.stop();
    this.world.clear();
    this.particles.clear();
    this.removeAllListeners();
  }
}
