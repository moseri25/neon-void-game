'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CyberButton } from '../atoms/CyberButton';

interface MainMenuProps {
  onStartGame: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
  onControls?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.5 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onLeaderboard, onSettings, onControls }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-void-black bg-grid-pattern scanline-overlay">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-16 text-center"
      >
        <h1 className="text-6xl md:text-8xl font-orbitron font-black tracking-wider chromatic-aberration text-cyan-plasma">
          NEON
        </h1>
        <h1 className="text-6xl md:text-8xl font-orbitron font-black tracking-wider chromatic-aberration text-magenta-overdrive -mt-2">
          VOID
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          className="text-sm font-inter text-cyan-plasma mt-4 tracking-[0.5em] uppercase"
        >
          Area Enclosure Architecture
        </motion.p>
      </motion.div>

      {/* Menu buttons */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 items-center"
      >
        <motion.div variants={itemVariants}>
          <CyberButton label="Start Game" variant="primary" size="lg" onClick={onStartGame} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <CyberButton label="Leaderboard" variant="primary" size="md" onClick={onLeaderboard} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <CyberButton label="Settings" variant="warning" size="md" onClick={onSettings} />
        </motion.div>
        {onControls && (
          <motion.div variants={itemVariants}>
            <CyberButton label="Controls" variant="primary" size="md" onClick={onControls} />
          </motion.div>
        )}
      </motion.div>

      {/* Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 text-xs font-inter text-cyan-plasma tracking-wider"
      >
        v{process.env.NEXT_PUBLIC_GAME_VERSION ?? '0.1.0'}
      </motion.div>
    </div>
  );
};
