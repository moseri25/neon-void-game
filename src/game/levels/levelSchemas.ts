export interface EnemySpawnConfig {
  type: 'bouncer' | 'chaser' | 'gravity_well' | 'boss';
  count: number;
  speed: number;
  spawnDelay: number;
}

export interface LevelMechanics {
  gravityWells: boolean;
  degradingPerimeter: boolean;
  degradeRate: number;
  tetherSpeedModifier: number;
  maxTetherLength: number;
}

export interface EnvironmentConfig {
  primaryHue: string;
  accentHue: string;
  gridDensity: number;
  particleDensity: number;
  ambientPulseSpeed: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  seed: number;
  bounds: { width: number; height: number };
  targetCapturePercent: number;
  timeLimit: number;
  enemies: EnemySpawnConfig[];
  mechanics: LevelMechanics;
  environment: EnvironmentConfig;
}

const baseMechanics: LevelMechanics = {
  gravityWells: false,
  degradingPerimeter: false,
  degradeRate: 0,
  tetherSpeedModifier: 1,
  maxTetherLength: 0,
};

const baseEnv: EnvironmentConfig = {
  primaryHue: '#00F0FF',
  accentHue: '#FF003C',
  gridDensity: 30,
  particleDensity: 1,
  ambientPulseSpeed: 1,
};

export const LEVELS: LevelConfig[] = [
  // Phase 1: Tutorial (1-5)
  { id: 1, name: 'First Contact', seed: 1001, bounds: { width: 800, height: 600 }, targetCapturePercent: 0.8, timeLimit: 0, enemies: [{ type: 'bouncer', count: 1, speed: 80, spawnDelay: 0 }], mechanics: baseMechanics, environment: baseEnv },
  { id: 2, name: 'Learning Curve', seed: 1002, bounds: { width: 800, height: 600 }, targetCapturePercent: 0.8, timeLimit: 0, enemies: [{ type: 'bouncer', count: 2, speed: 90, spawnDelay: 0 }], mechanics: baseMechanics, environment: baseEnv },
  { id: 3, name: 'Quick Cuts', seed: 1003, bounds: { width: 850, height: 650 }, targetCapturePercent: 0.8, timeLimit: 0, enemies: [{ type: 'bouncer', count: 2, speed: 100, spawnDelay: 0 }], mechanics: baseMechanics, environment: baseEnv },
  { id: 4, name: 'Double Trouble', seed: 1004, bounds: { width: 850, height: 650 }, targetCapturePercent: 0.8, timeLimit: 0, enemies: [{ type: 'bouncer', count: 3, speed: 100, spawnDelay: 0 }], mechanics: baseMechanics, environment: baseEnv },
  { id: 5, name: 'Momentum', seed: 1005, bounds: { width: 900, height: 650 }, targetCapturePercent: 0.8, timeLimit: 120, enemies: [{ type: 'bouncer', count: 3, speed: 110, spawnDelay: 0 }], mechanics: baseMechanics, environment: baseEnv },

  // Phase 2: Chasers (6-10)
  { id: 6, name: 'Pursuit', seed: 2001, bounds: { width: 900, height: 700 }, targetCapturePercent: 0.8, timeLimit: 120, enemies: [{ type: 'bouncer', count: 2, speed: 110, spawnDelay: 0 }, { type: 'chaser', count: 1, speed: 60, spawnDelay: 5 }], mechanics: baseMechanics, environment: { ...baseEnv, ambientPulseSpeed: 1.2 } },
  { id: 7, name: 'Crossfire', seed: 2002, bounds: { width: 900, height: 700 }, targetCapturePercent: 0.8, timeLimit: 110, enemies: [{ type: 'bouncer', count: 3, speed: 120, spawnDelay: 0 }, { type: 'chaser', count: 1, speed: 65, spawnDelay: 3 }], mechanics: baseMechanics, environment: { ...baseEnv, ambientPulseSpeed: 1.3 } },
  { id: 8, name: 'Encircled', seed: 2003, bounds: { width: 950, height: 700 }, targetCapturePercent: 0.8, timeLimit: 100, enemies: [{ type: 'bouncer', count: 3, speed: 125, spawnDelay: 0 }, { type: 'chaser', count: 2, speed: 70, spawnDelay: 3 }], mechanics: baseMechanics, environment: { ...baseEnv, gridDensity: 25 } },
  { id: 9, name: 'Narrow Escape', seed: 2004, bounds: { width: 950, height: 750 }, targetCapturePercent: 0.8, timeLimit: 100, enemies: [{ type: 'bouncer', count: 4, speed: 130, spawnDelay: 0 }, { type: 'chaser', count: 2, speed: 75, spawnDelay: 2 }], mechanics: { ...baseMechanics, tetherSpeedModifier: 1.1 }, environment: { ...baseEnv, gridDensity: 25 } },
  { id: 10, name: 'Storm Front', seed: 2005, bounds: { width: 1000, height: 750 }, targetCapturePercent: 0.8, timeLimit: 90, enemies: [{ type: 'bouncer', count: 4, speed: 140, spawnDelay: 0 }, { type: 'chaser', count: 2, speed: 80, spawnDelay: 2 }], mechanics: { ...baseMechanics, tetherSpeedModifier: 1.15 }, environment: { ...baseEnv, accentHue: '#FFB800', gridDensity: 22 } },

  // Phase 3: Gravity Wells (11-15)
  { id: 11, name: 'Gravity Shift', seed: 3001, bounds: { width: 1000, height: 750 }, targetCapturePercent: 0.8, timeLimit: 90, enemies: [{ type: 'bouncer', count: 3, speed: 130, spawnDelay: 0 }, { type: 'chaser', count: 1, speed: 75, spawnDelay: 3 }, { type: 'gravity_well', count: 1, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true }, environment: { ...baseEnv, primaryHue: '#00CCDD', particleDensity: 1.3 } },
  { id: 12, name: 'Warped Space', seed: 3002, bounds: { width: 1000, height: 800 }, targetCapturePercent: 0.8, timeLimit: 85, enemies: [{ type: 'bouncer', count: 4, speed: 140, spawnDelay: 0 }, { type: 'chaser', count: 2, speed: 80, spawnDelay: 2 }, { type: 'gravity_well', count: 1, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true }, environment: { ...baseEnv, primaryHue: '#00CCDD', particleDensity: 1.5 } },
  { id: 13, name: 'Singularity', seed: 3003, bounds: { width: 1050, height: 800 }, targetCapturePercent: 0.8, timeLimit: 80, enemies: [{ type: 'bouncer', count: 4, speed: 145, spawnDelay: 0 }, { type: 'chaser', count: 2, speed: 85, spawnDelay: 2 }, { type: 'gravity_well', count: 2, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true, tetherSpeedModifier: 1.2 }, environment: { ...baseEnv, primaryHue: '#9966FF', particleDensity: 1.5 } },
  { id: 14, name: 'Event Horizon', seed: 3004, bounds: { width: 1050, height: 800 }, targetCapturePercent: 0.8, timeLimit: 75, enemies: [{ type: 'bouncer', count: 5, speed: 150, spawnDelay: 0 }, { type: 'chaser', count: 2, speed: 90, spawnDelay: 1 }, { type: 'gravity_well', count: 2, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true, tetherSpeedModifier: 1.2 }, environment: { ...baseEnv, primaryHue: '#9966FF', accentHue: '#FF6600', particleDensity: 2 } },
  { id: 15, name: 'Collapse', seed: 3005, bounds: { width: 1100, height: 850 }, targetCapturePercent: 0.8, timeLimit: 70, enemies: [{ type: 'bouncer', count: 5, speed: 155, spawnDelay: 0 }, { type: 'chaser', count: 3, speed: 90, spawnDelay: 1 }, { type: 'gravity_well', count: 2, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true, tetherSpeedModifier: 1.25 }, environment: { ...baseEnv, primaryHue: '#FF6600', accentHue: '#FF003C', particleDensity: 2 } },

  // Phase 4: Degrading perimeters (16-20)
  { id: 16, name: 'Erosion', seed: 4001, bounds: { width: 900, height: 700 }, targetCapturePercent: 0.8, timeLimit: 70, enemies: [{ type: 'bouncer', count: 4, speed: 150, spawnDelay: 0 }, { type: 'chaser', count: 2, speed: 85, spawnDelay: 2 }], mechanics: { ...baseMechanics, degradingPerimeter: true, degradeRate: 0.5 }, environment: { ...baseEnv, primaryHue: '#FFB800', accentHue: '#FF003C', gridDensity: 20, particleDensity: 2 } },
  { id: 17, name: 'Entropy', seed: 4002, bounds: { width: 900, height: 700 }, targetCapturePercent: 0.8, timeLimit: 65, enemies: [{ type: 'bouncer', count: 5, speed: 155, spawnDelay: 0 }, { type: 'chaser', count: 2, speed: 90, spawnDelay: 1 }, { type: 'gravity_well', count: 1, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true, degradingPerimeter: true, degradeRate: 0.7 }, environment: { ...baseEnv, primaryHue: '#FFB800', accentHue: '#FF003C', gridDensity: 18 } },
  { id: 18, name: 'Meltdown', seed: 4003, bounds: { width: 850, height: 650 }, targetCapturePercent: 0.8, timeLimit: 60, enemies: [{ type: 'bouncer', count: 5, speed: 160, spawnDelay: 0 }, { type: 'chaser', count: 3, speed: 95, spawnDelay: 1 }, { type: 'gravity_well', count: 1, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true, degradingPerimeter: true, degradeRate: 1.0, tetherSpeedModifier: 1.3 }, environment: { ...baseEnv, primaryHue: '#FF6600', gridDensity: 16 } },
  { id: 19, name: 'Critical Mass', seed: 4004, bounds: { width: 800, height: 600 }, targetCapturePercent: 0.8, timeLimit: 55, enemies: [{ type: 'bouncer', count: 6, speed: 170, spawnDelay: 0 }, { type: 'chaser', count: 3, speed: 100, spawnDelay: 1 }, { type: 'gravity_well', count: 2, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true, degradingPerimeter: true, degradeRate: 1.2, tetherSpeedModifier: 1.35 }, environment: { ...baseEnv, primaryHue: '#FF003C', gridDensity: 14 } },
  { id: 20, name: 'Supernova', seed: 4005, bounds: { width: 800, height: 600 }, targetCapturePercent: 0.8, timeLimit: 50, enemies: [{ type: 'bouncer', count: 6, speed: 180, spawnDelay: 0 }, { type: 'chaser', count: 3, speed: 105, spawnDelay: 0 }, { type: 'gravity_well', count: 2, speed: 0, spawnDelay: 0 }], mechanics: { ...baseMechanics, gravityWells: true, degradingPerimeter: true, degradeRate: 1.5, tetherSpeedModifier: 1.4 }, environment: { ...baseEnv, primaryHue: '#FF003C', accentHue: '#FFB800', gridDensity: 12, particleDensity: 3 } },

  // Phase 5: Extreme (21-25)
  { id: 21, name: 'Void Storm', seed: 5001, bounds: { width: 700, height: 550 }, targetCapturePercent: 0.8, timeLimit: 50, enemies: [{ type: 'bouncer', count: 7, speed: 185, spawnDelay: 0 }, { type: 'chaser', count: 3, speed: 110, spawnDelay: 0 }, { type: 'gravity_well', count: 2, speed: 0, spawnDelay: 0 }], mechanics: { gravityWells: true, degradingPerimeter: true, degradeRate: 1.5, tetherSpeedModifier: 1.5, maxTetherLength: 800 }, environment: { primaryHue: '#FF003C', accentHue: '#FFB800', gridDensity: 10, particleDensity: 3, ambientPulseSpeed: 2 } },
  { id: 22, name: 'Omega Run', seed: 5002, bounds: { width: 700, height: 500 }, targetCapturePercent: 0.8, timeLimit: 45, enemies: [{ type: 'bouncer', count: 8, speed: 190, spawnDelay: 0 }, { type: 'chaser', count: 4, speed: 115, spawnDelay: 0 }, { type: 'gravity_well', count: 2, speed: 0, spawnDelay: 0 }], mechanics: { gravityWells: true, degradingPerimeter: true, degradeRate: 2, tetherSpeedModifier: 1.5, maxTetherLength: 700 }, environment: { primaryHue: '#FF003C', accentHue: '#9900FF', gridDensity: 10, particleDensity: 3, ambientPulseSpeed: 2.5 } },
  { id: 23, name: 'Annihilation', seed: 5003, bounds: { width: 650, height: 500 }, targetCapturePercent: 0.8, timeLimit: 40, enemies: [{ type: 'bouncer', count: 8, speed: 200, spawnDelay: 0 }, { type: 'chaser', count: 4, speed: 120, spawnDelay: 0 }, { type: 'gravity_well', count: 3, speed: 0, spawnDelay: 0 }], mechanics: { gravityWells: true, degradingPerimeter: true, degradeRate: 2.5, tetherSpeedModifier: 1.6, maxTetherLength: 600 }, environment: { primaryHue: '#9900FF', accentHue: '#FF003C', gridDensity: 8, particleDensity: 4, ambientPulseSpeed: 3 } },
  { id: 24, name: 'Oblivion', seed: 5004, bounds: { width: 600, height: 450 }, targetCapturePercent: 0.8, timeLimit: 35, enemies: [{ type: 'bouncer', count: 9, speed: 210, spawnDelay: 0 }, { type: 'chaser', count: 5, speed: 125, spawnDelay: 0 }, { type: 'gravity_well', count: 3, speed: 0, spawnDelay: 0 }], mechanics: { gravityWells: true, degradingPerimeter: true, degradeRate: 3, tetherSpeedModifier: 1.7, maxTetherLength: 500 }, environment: { primaryHue: '#FFFFFF', accentHue: '#FF003C', gridDensity: 6, particleDensity: 5, ambientPulseSpeed: 3.5 } },
  { id: 25, name: 'The Final Void', seed: 5005, bounds: { width: 550, height: 400 }, targetCapturePercent: 0.85, timeLimit: 30, enemies: [{ type: 'bouncer', count: 10, speed: 220, spawnDelay: 0 }, { type: 'chaser', count: 5, speed: 130, spawnDelay: 0 }, { type: 'gravity_well', count: 3, speed: 0, spawnDelay: 0 }], mechanics: { gravityWells: true, degradingPerimeter: true, degradeRate: 3.5, tetherSpeedModifier: 1.8, maxTetherLength: 400 }, environment: { primaryHue: '#FFFFFF', accentHue: '#FF003C', gridDensity: 5, particleDensity: 5, ambientPulseSpeed: 4 } },
];

export function generateDynamicLevelConfig(level: number, width: number, height: number): LevelConfig {
  // Use a base seed that changes per level
  const seed = 1000 + level;
  
  // Calculate density scaling based on area ratio vs reference 800x600
  const areaRatio = (width * height) / (800 * 600);
  const densityScale = Math.max(1, Math.floor(areaRatio * 0.8)); // 80% weight to prevent overcrowding
  
  // Calculate difficulty scaling factors
  const speedScale = 1 + (level - 1) * 0.05; // 5% speed increase per level
  const countScale = Math.floor((level - 1) / 3); // 1 extra enemy every 3 levels
  
  // Base enemies always include 1 boss for Volfied rules
  const enemies: EnemySpawnConfig[] = [
    { 
      type: 'boss', 
      count: 1, 
      speed: Math.min(80 * speedScale, 180), // Cap boss speed so it's playable
      spawnDelay: 0 
    }
  ];

  // Add small spiders (bouncers)
  const bouncerCount = (1 + countScale) * densityScale;
  enemies.push({
    type: 'bouncer',
    count: bouncerCount,
    speed: 100 * speedScale,
    spawnDelay: 1
  });

  // Add chasers for level 3+
  if (level >= 3) {
    const chaserCount = Math.max(1, Math.floor(level / 3) * densityScale);
    enemies.push({
      type: 'chaser',
      count: chaserCount,
      speed: 70 * speedScale,
      spawnDelay: 2
    });
  }

  // Add gravity wells for level 10+
  if (level >= 10) {
    enemies.push({
      type: 'gravity_well',
      count: Math.min(Math.floor(level / 10), 3),
      speed: 0,
      spawnDelay: 0
    });
  }

  // Dynamic environment colors
  const hues = ['#00F0FF', '#FF003C', '#9966FF', '#FFB800', '#FF00FF'];
  const primaryHue = hues[level % hues.length] || '#00F0FF';
  const accentHue = hues[(level + 1) % hues.length] || '#FF003C';

  return {
    id: level,
    name: `Sector ${level}`,
    seed,
    bounds: { width: Math.max(width - 40, 600), height: Math.max(height - 120, 400) }, // Padding for HUD
    targetCapturePercent: Math.min(0.8 + (level - 1) * 0.005, 0.85), // Max 85%
    timeLimit: Math.max(120 - (level - 1) * 5, 45), // Minimum 45 seconds
    enemies,
    mechanics: {
      ...baseMechanics,
      gravityWells: level >= 10,
      degradingPerimeter: level >= 15,
      degradeRate: level >= 15 ? Math.min(0.5 + (level - 15) * 0.2, 3) : 0,
      tetherSpeedModifier: 1 + (level - 1) * 0.02,
    },
    environment: {
      ...baseEnv,
      primaryHue,
      accentHue,
      gridDensity: Math.max(30 - Math.floor(level / 2), 10),
      particleDensity: Math.min(1 + level * 0.1, 5),
      ambientPulseSpeed: 1 + level * 0.05,
    }
  };
}
