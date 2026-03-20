import { create } from 'zustand';

export type GameStateType = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';

interface GameStoreState {
  gameState: GameStateType;
  score: number;
  lives: number;
  level: number;
  capturePercent: number;
  combo: number;
  fps: number;
}

interface GameStoreActions {
  setGameState: (state: GameStateType) => void;
  updateScore: (score: number) => void;
  updateLives: (lives: number) => void;
  updateCapture: (percent: number) => void;
  setCombo: (combo: number) => void;
  setLevel: (level: number) => void;
  setFps: (fps: number) => void;
  reset: () => void;
}

const initialState: GameStoreState = {
  gameState: 'menu',
  score: 0,
  lives: 3,
  level: 1,
  capturePercent: 0,
  combo: 0,
  fps: 0,
};

export const useGameStore = create<GameStoreState & GameStoreActions>((set) => ({
  ...initialState,
  setGameState: (gameState) => set({ gameState }),
  updateScore: (score) => set({ score }),
  updateLives: (lives) => set({ lives }),
  updateCapture: (capturePercent) => set({ capturePercent }),
  setCombo: (combo) => set({ combo }),
  setLevel: (level) => set({ level }),
  setFps: (fps) => set({ fps }),
  reset: () => set(initialState),
}));
