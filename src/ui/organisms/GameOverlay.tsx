'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HUD } from '../molecules/HUD';
import { CyberButton } from '../atoms/CyberButton';
import { NeonText } from '../atoms/NeonText';

export type GameState = 'playing' | 'paused' | 'gameOver' | 'levelComplete';

interface GameOverlayProps {
  gameState: GameState;
  score: number;
  lives: number;
  level: number;
  capturePercent: number;
  shieldEnergy: number;
  combo: number;
  fps?: number;
  showFps?: boolean;
  onResume?: () => void;
  onRestart?: () => void;
  onQuit?: () => void;
  onNextLevel?: () => void;
  onBack?: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  gameState,
  score,
  lives,
  level,
  capturePercent,
  shieldEnergy,
  combo,
  fps,
  showFps,
  onResume,
  onRestart,
  onQuit,
  onNextLevel,
  onBack,
}) => {
  return (
    <>
      {/* HUD - always visible during play */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <HUD
          score={score}
          lives={lives}
          level={level}
          capturePercent={capturePercent}
          shieldEnergy={shieldEnergy}
          combo={combo}
          fps={fps}
          showFps={showFps}
          onBack={onBack}
        />
      )}

      <AnimatePresence mode="wait">
        {/* Pause overlay */}
        {gameState === 'paused' && (
          <motion.div
            key="pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center glass"
          >
            <NeonText variant="title" color="cyan" className="mb-8">
              PAUSED
            </NeonText>
            <div className="flex flex-col gap-4">
              <CyberButton label="Resume" variant="primary" onClick={onResume} />
              <CyberButton label="Restart" variant="warning" onClick={onRestart} />
              <CyberButton label="Quit" variant="danger" onClick={onQuit} />
            </div>
          </motion.div>
        )}

        {/* Game Over overlay */}
        {gameState === 'gameOver' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center glass"
          >
            <motion.div
              initial={{ scale: 0.5, y: -30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <NeonText variant="title" color="magenta" className="mb-4">
                GAME OVER
              </NeonText>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <div className="text-sm font-orbitron text-cyan-plasma opacity-60 uppercase tracking-wider mb-2">
                Final Score
              </div>
              <div className="text-5xl font-orbitron font-bold text-cyan-plasma text-glow-cyan">
                {score.toLocaleString()}
              </div>
              <div className="text-sm font-inter text-void-gray mt-2">
                Level {level} | {Math.round(capturePercent * 100)}% captured
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              <CyberButton label="Play Again" variant="primary" size="lg" onClick={onRestart} />
              <CyberButton label="Main Menu" variant="warning" onClick={onQuit} />
            </motion.div>
          </motion.div>
        )}

        {/* Level Complete overlay */}
        {gameState === 'levelComplete' && (
          <motion.div
            key="levelcomplete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center glass"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            >
              <NeonText variant="title" color="amber" className="mb-4">
                LEVEL CLEAR
              </NeonText>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-8"
            >
              <div className="text-3xl font-orbitron font-bold text-cyan-plasma text-glow-cyan">
                {score.toLocaleString()}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <CyberButton label="Next Level" variant="primary" size="lg" onClick={onNextLevel} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
