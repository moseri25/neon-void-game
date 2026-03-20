export const COLORS = {
  voidBlack: '#05050A',
  cyanPlasma: '#00F0FF',
  magentaOverdrive: '#FF003C',
  warningAmber: '#FFB800',
  voidGray: '#1A1A2E',
  voidDark: '#0A0A1A',
  cyanDim: '#007A82',
  magentaDim: '#80001E',
  white: '#FFFFFF',
} as const;

export const FONTS = {
  primary: "'Orbitron', monospace",
  secondary: "'Inter', sans-serif",
} as const;

export const MOTION = {
  spring: { type: 'spring' as const, stiffness: 400, damping: 10 },
  springGentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  springBouncy: { type: 'spring' as const, stiffness: 600, damping: 8 },
  fadeIn: { duration: 0.3, ease: 'easeOut' as const },
  fadeOut: { duration: 0.2, ease: 'easeIn' as const },
  stagger: { staggerChildren: 0.1 },
} as const;

export const SHADOWS = {
  neonCyan: '0 0 10px #00F0FF, 0 0 40px #00F0FF33',
  neonMagenta: '0 0 10px #FF003C, 0 0 40px #FF003C33',
  neonAmber: '0 0 10px #FFB800, 0 0 40px #FFB80033',
  textCyan: '0 0 8px rgba(0, 240, 255, 0.6), 0 0 20px rgba(0, 240, 255, 0.3)',
  textMagenta: '0 0 8px rgba(255, 0, 60, 0.6), 0 0 20px rgba(255, 0, 60, 0.3)',
} as const;
