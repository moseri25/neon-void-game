'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlowBarProps {
  value: number;
  maxValue?: number;
  color?: string;
  label?: string;
  height?: number;
  className?: string;
}

export const GlowBar: React.FC<GlowBarProps> = ({
  value,
  maxValue = 100,
  color = '#00F0FF',
  label,
  height = 8,
  className = '',
}) => {
  const percent = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const isLow = percent < 20;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-orbitron uppercase tracking-wider opacity-70" style={{ color }}>
            {label}
          </span>
          <span className="text-xs font-inter" style={{ color }}>
            {Math.round(percent)}%
          </span>
        </div>
      )}
      <div
        className="relative w-full overflow-hidden rounded-sm"
        style={{
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${color}22`,
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}66, 0 0 20px ${color}33`,
          }}
          initial={{ width: 0 }}
          animate={{
            width: `${percent}%`,
            opacity: isLow ? [1, 0.5, 1] : 1,
          }}
          transition={
            isLow
              ? { width: { duration: 0.5 }, opacity: { repeat: Infinity, duration: 0.5 } }
              : { duration: 0.5, ease: 'easeOut' }
          }
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(90deg, ${color}00, ${color}33, ${color}00)`,
          }}
        />
      </div>
    </div>
  );
};
