'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'danger' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CyberButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, { border: string; text: string; glow: string; hoverShadow: string }> = {
  primary: {
    border: 'border-cyan-plasma',
    text: 'text-cyan-plasma',
    glow: 'rgba(0, 240, 255, 0.8)',
    hoverShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
  },
  danger: {
    border: 'border-magenta-overdrive',
    text: 'text-magenta-overdrive',
    glow: 'rgba(255, 0, 60, 0.8)',
    hoverShadow: '0 0 20px rgba(255, 0, 60, 0.4)',
  },
  warning: {
    border: 'border-warning-amber',
    text: 'text-warning-amber',
    glow: 'rgba(255, 184, 0, 0.8)',
    hoverShadow: '0 0 20px rgba(255, 184, 0, 0.4)',
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const CyberButton: React.FC<CyberButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const v = variantStyles[variant];

  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        textShadow: `0px 0px 12px ${v.glow}`,
        boxShadow: v.hoverShadow,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={`
        relative bg-void-black border ${v.border} ${v.text}
        uppercase tracking-widest font-orbitron font-semibold
        overflow-hidden group focus:outline-none focus:ring-2
        focus:ring-current cursor-pointer select-none
        ${sizeStyles[size]}
      `}
      {...props}
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none bg-current" />
      <span className="relative z-10">{label}</span>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5" y="0.5"
          width="calc(100% - 1px)" height="calc(100% - 1px)"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="100%"
          className="opacity-0 group-hover:opacity-50 group-hover:animate-border-trace"
        />
      </svg>
    </motion.button>
  );
};
