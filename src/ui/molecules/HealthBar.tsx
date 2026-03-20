'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HealthBarProps {
  lives: number;
  maxLives?: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ lives, maxLives = 3 }) => {
  return (
    <div className="flex gap-2 items-center">
      <AnimatePresence mode="popLayout">
        {Array.from({ length: maxLives }).map((_, i) => (
          i < lives ? (
            <motion.div
              key={`life-${i}`}
              layout
              initial={{ scale: 0, rotate: 45 }}
              animate={{
                scale: 1,
                rotate: 45,
                boxShadow: lives === 1
                  ? ['0 0 5px #FF003C', '0 0 15px #FF003C', '0 0 5px #FF003C']
                  : '0 0 8px #00F0FF',
              }}
              exit={{ scale: 0, rotate: 135, opacity: 0 }}
              transition={
                lives === 1
                  ? { scale: { type: 'spring' }, boxShadow: { repeat: Infinity, duration: 0.4 } }
                  : { type: 'spring', stiffness: 500, damping: 15 }
              }
              className="w-3 h-3 border"
              style={{
                backgroundColor: lives === 1 ? '#FF003C' : '#00F0FF',
                borderColor: lives === 1 ? '#FF003C' : '#00F0FF',
              }}
            />
          ) : null
        ))}
      </AnimatePresence>
    </div>
  );
};
