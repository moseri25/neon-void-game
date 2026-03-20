'use client';

import React from 'react';
import { motion } from 'framer-motion';

type TextVariant = 'title' | 'subtitle' | 'hud' | 'data';

interface NeonTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  flicker?: boolean;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

const variantConfig: Record<TextVariant, { font: string; size: string; weight: string }> = {
  title: { font: 'font-orbitron', size: 'text-4xl md:text-6xl', weight: 'font-bold' },
  subtitle: { font: 'font-orbitron', size: 'text-xl md:text-2xl', weight: 'font-semibold' },
  hud: { font: 'font-orbitron', size: 'text-lg', weight: 'font-medium' },
  data: { font: 'font-inter', size: 'text-sm', weight: 'font-normal' },
};

const colorMap: Record<string, string> = {
  cyan: 'text-glow-cyan',
  magenta: 'text-glow-magenta',
  amber: 'text-glow-amber',
};

export const NeonText: React.FC<NeonTextProps> = ({
  children,
  variant = 'hud',
  color = 'cyan',
  flicker = false,
  className = '',
  as = 'span',
}) => {
  const config = variantConfig[variant];
  const glowClass = colorMap[color] ?? '';

  const MotionComponent = motion.create(as);

  return (
    <MotionComponent
      className={`${config.font} ${config.size} ${config.weight} ${glowClass} ${flicker ? 'animate-flicker' : ''} ${className}`}
      style={{ color: color === 'cyan' ? '#00F0FF' : color === 'magenta' ? '#FF003C' : color === 'amber' ? '#FFB800' : color }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </MotionComponent>
  );
};
