'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonText } from '../atoms/NeonText';
import { GlowBar } from '../atoms/GlowBar';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
  capturePercent: number;
  shieldEnergy: number;
  combo: number;
  fps?: number;
  showFps?: boolean;
  onBack?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  lives,
  level,
  capturePercent,
  shieldEnergy,
  combo,
  fps,
  showFps = false,
  onBack,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 p-4">
      {/* Top bar */}
      <div className="flex justify-between items-start">
        {/* Lives & Back Button - top left */}
        <div className="flex gap-4 items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="pointer-events-auto px-3 py-1 bg-void-dark/80 border border-cyan-plasma/50 text-cyan-plasma hover:bg-cyan-plasma/20 hover:shadow-[0_0_10px_#00F0FF66] transition-all font-orbitron text-xs uppercase tracking-wider cursor-pointer rounded"
            >
              &larr; Back
            </button>
          )}
          <div className="flex gap-2 items-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
              key={i}
              initial={{ scale: 1 }}
              animate={{
                scale: i < lives ? 1 : 0,
                opacity: i < lives ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="w-4 h-4 rotate-45 border border-cyan-plasma"
              style={{
                backgroundColor: i < lives ? '#00F0FF' : 'transparent',
                boxShadow: i < lives ? '0 0 8px #00F0FF' : 'none',
              }}
            />
            ))}
          </div>
          
          {/* Shield Bar */}
          <div className="w-24 h-2 bg-void-dark border border-cyan-plasma/30 rounded overflow-hidden mt-1 ml-4 shadow-[0_0_5px_#00F0FF33] self-center">
            <motion.div
              className="h-full bg-cyan-plasma"
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, Math.min(100, shieldEnergy))}%` }}
              transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
            />
          </div>
        </div>        {/* Level - top center */}
        <NeonText variant="hud" color="cyan" className="text-xs tracking-[0.3em] uppercase opacity-70">
          Level {level}
        </NeonText>

        {/* Score - top right */}
        <div className="text-right">
          <div className="text-xs font-orbitron text-cyan-plasma opacity-50 uppercase tracking-wider">Score</div>
          <motion.div
            key={score}
            initial={{ scale: 1.2, color: '#FFFFFF' }}
            animate={{ scale: 1, color: '#00F0FF' }}
            className="text-2xl font-orbitron font-bold text-glow-cyan"
          >
            {score.toLocaleString()}
          </motion.div>
        </div>
      </div>

      {/* Combo - center */}
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            key={`combo-${combo}`}
            initial={{ scale: 2, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center"
          >
            <div className="text-4xl font-orbitron font-bold text-warning-amber text-glow-amber">
              x{combo}
            </div>
            <div className="text-xs font-orbitron text-warning-amber opacity-70 uppercase tracking-widest">
              Combo
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar - capture progress */}
      <div className="absolute bottom-4 left-4 right-4">
        <GlowBar
          value={capturePercent * 100}
          label="Area Captured"
          color="#00F0FF"
          height={6}
        />
      </div>

      {/* FPS counter */}
      {showFps && fps !== undefined && (
        <div className="absolute bottom-12 right-4 text-xs font-inter text-void-gray opacity-50">
          {fps} FPS
        </div>
      )}
    </div>
  );
};
