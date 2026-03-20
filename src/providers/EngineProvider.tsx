'use client';

import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import { NeonVoidEngine } from '@/engine/NeonVoidEngine';
import { useGameStore } from '@/stores/gameStore';
import { useSpatialAudio } from '@/hooks/useSpatialAudio';
import { throttle } from 'lodash';

const EngineContext = createContext<NeonVoidEngine | null>(null);

export function useGameEngine(): NeonVoidEngine | null {
  return useContext(EngineContext);
}

interface EngineProviderProps {
  children: React.ReactNode;
}

export const EngineProvider: React.FC<EngineProviderProps> = ({ children }) => {
  const { playSound } = useSpatialAudio();
  const engineRef = useRef<NeonVoidEngine | null>(null);
  const [engine, setEngine] = useState<NeonVoidEngine | null>(null);

  const bridgeToStore = useCallback((eng: NeonVoidEngine) => {
    const store = useGameStore.getState();

    const throttledScore = throttle((score: number) => {
      useGameStore.setState({ score });
    }, 66);

    const throttledCapture = throttle((percent: number) => {
      useGameStore.setState({ capturePercent: percent });
    }, 66);

    eng.on('SCORE_UPDATED', throttledScore);
    eng.on('CAPTURE_UPDATED', throttledCapture);
    eng.on('LIVES_UPDATED', (lives) => useGameStore.setState({ lives }));
    eng.on('COMBO', ({ multiplier }) => useGameStore.setState({ combo: multiplier }));
    
    // Audio Triggers
    eng.on('AREA_CAPTURED', () => playSound('capture'));
    eng.on('PLAYER_DEATH', () => playSound('death'));
    eng.on('COMBO', () => playSound('combo'));
    eng.on('LEVEL_COMPLETE', () => playSound('levelComplete'));

    eng.on('GAME_STATE_CHANGED', (state: any) => {
      const map: Record<string, typeof store.gameState> = {
        playing: 'playing',
        paused: 'paused',
        gameOver: 'gameOver',
        levelComplete: 'levelComplete',
        menu: 'menu',
      };
      useGameStore.setState({ gameState: map[state] ?? 'menu' });
    });

    return () => {
      throttledScore.cancel();
      throttledCapture.cancel();
      eng.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    const eng = new NeonVoidEngine();
    engineRef.current = eng;
    setEngine(eng);

    const cleanup = bridgeToStore(eng);

    return () => {
      cleanup();
      eng.destroy();
      engineRef.current = null;
    };
  }, [bridgeToStore]);

  return (
    <EngineContext.Provider value={engine}>
      {children}
    </EngineContext.Provider>
  );
};
