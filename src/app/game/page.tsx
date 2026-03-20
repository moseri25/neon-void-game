'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EngineProvider, useGameEngine } from '@/providers/EngineProvider';
import { GameCanvas } from '@/components/GameCanvas';
import { GameOverlay } from '@/ui/organisms/GameOverlay';
import { useGameState } from '@/hooks/useGameState';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { useGameStore } from '@/stores/gameStore';
import { LEVELS, generateDynamicLevelConfig } from '@/game/levels/levelSchemas';

function GameContent() {
  const router = useRouter();
  const engine = useGameEngine();
  const { gameState, score, lives, level, fps } = useGameState();
  const [capturePercent, setCapturePercent] = React.useState(0);
  const [shieldEnergy, setShieldEnergy] = React.useState(100);
  const [combo, setCombo] = React.useState(1);
  const showFps = useSettingsStore((s) => s.showFPS);
  const screenShake = useSettingsStore((s) => s.screenShake);
  const graphicsQuality = useSettingsStore((s) => s.graphicsQuality);
  const colorblindMode = useUIStore((s) => s.colorblindMode);
  const setFps = useGameStore((s) => s.setFps);

  // Sync settings to engine
  React.useEffect(() => {
    if (engine) {
      engine.setScreenShake(screenShake);
    }
  }, [engine, screenShake]);

  React.useEffect(() => {
    if (engine) {
      engine.setGraphicsQuality(graphicsQuality);
    }
  }, [engine, graphicsQuality]);

  // Listen to engine events for UI updates
  React.useEffect(() => {
    if (!engine) return;

    const gameStoreActions = useGameStore.getState();

    // Setup listeners
    engine.on('CAPTURE_UPDATED', setCapturePercent);
    engine.on('SHIELD_UPDATED', setShieldEnergy);
    engine.on('COMBO', (e) => setCombo(e.multiplier));
    engine.on('GAME_STATE_CHANGED', gameStoreActions.setGameState);
    engine.on('SCORE_UPDATED', gameStoreActions.updateScore);
    engine.on('LIVES_UPDATED', gameStoreActions.updateLives);

    return () => {
      engine.off('CAPTURE_UPDATED', setCapturePercent);
      engine.off('SHIELD_UPDATED', setShieldEnergy);
      engine.off('COMBO', (e) => setCombo(e.multiplier));
      engine.off('GAME_STATE_CHANGED', gameStoreActions.setGameState);
      engine.off('SCORE_UPDATED', gameStoreActions.updateScore);
      engine.off('LIVES_UPDATED', gameStoreActions.updateLives);
    };
  }, [engine]);

  // Sync colorblindness to DOM
  React.useEffect(() => {
    const root = document.documentElement;
    // Remove existing colorblind classes
    root.className = root.className
      .split(' ')
      .filter((c) => !c.startsWith('colorblind-'))
      .join(' ');

    if (colorblindMode !== 'none') {
      root.classList.add(`colorblind-${colorblindMode}`);
    }
  }, [colorblindMode]);

  // Update FPS status to useGameStore
  React.useEffect(() => {
    if (!engine) return;
    const interval = setInterval(() => {
      setFps(engine.getFps());
    }, 500);
    return () => clearInterval(interval);
  }, [engine, setFps]);

  const handleStartGame = useCallback(() => {
    const config = generateDynamicLevelConfig(1, window.innerWidth, window.innerHeight);
    useGameStore.getState().setLevel(1);
    engine?.startGame(config);
  }, [engine]);

  const handleResume = useCallback(() => {
    engine?.resumeGame();
  }, [engine]);

  const handleRestart = useCallback(() => {
    const config = generateDynamicLevelConfig(level || 1, window.innerWidth, window.innerHeight);
    engine?.startGame(config);
  }, [engine, level]);

  const handleQuit = useCallback(() => {
    engine?.stopGame();
    router.push('/');
  }, [engine, router]);

  const handleNextLevel = useCallback(() => {
    const nextLvl = (level || 1) + 1;
    useGameStore.getState().setLevel(nextLvl);
    const config = generateDynamicLevelConfig(nextLvl, window.innerWidth, window.innerHeight);
    engine?.startGame(config);
  }, [engine, level]);

  // Auto-start game on mount
  React.useEffect(() => {
    if (engine && gameState === 'menu') {
      const timer = setTimeout(handleStartGame, 500);
      return () => clearTimeout(timer);
    }
  }, [engine, gameState, handleStartGame]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-void-black">
      <GameCanvas />
      <GameOverlay
        gameState={gameState === 'menu' ? 'playing' : gameState as 'playing' | 'paused' | 'gameOver' | 'levelComplete'}
        score={score}
        lives={lives}
        level={level}
        capturePercent={capturePercent}
        shieldEnergy={shieldEnergy}
        combo={combo}
        fps={fps}
        showFps={showFps}
        onResume={handleResume}
        onRestart={handleRestart}
        onQuit={handleQuit}
        onNextLevel={handleNextLevel}
        onBack={handleQuit}
      />
    </div>
  );
}

export default function GamePage() {
  return (
    <EngineProvider>
      <GameContent />
    </EngineProvider>
  );
}
