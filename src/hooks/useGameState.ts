'use client';

import { useGameStore } from '@/stores/gameStore';

export function useGameState() {
  const gameState = useGameStore((s) => s.gameState);
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const level = useGameStore((s) => s.level);
  const capturePercent = useGameStore((s) => s.capturePercent);
  const combo = useGameStore((s) => s.combo);
  const fps = useGameStore((s) => s.fps);

  const setGameState = useGameStore((s) => s.setGameState);
  const reset = useGameStore((s) => s.reset);

  return {
    gameState,
    score,
    lives,
    level,
    capturePercent,
    combo,
    fps,
    setGameState,
    reset,
  };
}
