import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#05050A',
        'cyan-plasma': '#00F0FF',
        'magenta-overdrive': '#FF003C',
        'warning-amber': '#FFB800',
        'void-gray': '#1A1A2E',
        'void-dark': '#0A0A1A',
        'cyan-dim': '#007A82',
        'magenta-dim': '#80001E',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'grid-scroll': 'grid-scroll 20s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'border-trace': 'border-trace 2s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        'grid-scroll': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'border-trace': {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0%' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00F0FF, 0 0 40px #00F0FF33',
        'neon-magenta': '0 0 10px #FF003C, 0 0 40px #FF003C33',
        'neon-amber': '0 0 10px #FFB800, 0 0 40px #FFB80033',
      },
    },
  },
  plugins: [],
};

export default config;
