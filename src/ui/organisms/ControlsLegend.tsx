'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberButton } from '../atoms/CyberButton';

interface ControlsLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KeyBadgeProps {
  children: React.ReactNode;
  wide?: boolean;
}

const KeyBadge: React.FC<KeyBadgeProps> = ({ children, wide }) => (
  <span
    className={`inline-flex items-center justify-center h-8 ${
      wide ? 'px-3 min-w-[4rem]' : 'w-8'
    } border border-cyan-plasma/40 bg-cyan-plasma/5 text-cyan-plasma font-orbitron text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-[0_0_6px_#00F0FF22]`}
  >
    {children}
  </span>
);

interface ControlGroup {
  title: string;
  color: string;
  controls: { keys: string[]; description: string; wide?: boolean }[];
}

const controlGroups: ControlGroup[] = [
  {
    title: 'Movement',
    color: '#00F0FF',
    controls: [
      { keys: ['W', '↑'], description: 'Move Up' },
      { keys: ['S', '↓'], description: 'Move Down' },
      { keys: ['A', '←'], description: 'Move Left' },
      { keys: ['D', '→'], description: 'Move Right' },
    ],
  },
  {
    title: 'Actions',
    color: '#FFB800',
    controls: [
      { keys: ['Space'], description: 'Start Tether / Cut into the Void', wide: true },
      { keys: ['Esc'], description: 'Pause Game', wide: true },
    ],
  },
  {
    title: 'Touch / Mouse',
    color: '#FF003C',
    controls: [
      { keys: ['Swipe'], description: 'Move in swipe direction', wide: true },
      { keys: ['Dbl-Click'], description: 'Start Tether', wide: true },
    ],
  },
];

const howToPlay = [
  'Move along the perimeter of the void field.',
  'Press SPACE to leave the perimeter and draw a tether into the void.',
  'Return to the perimeter to capture the enclosed area.',
  'Avoid enemies — bouncers (red diamonds) bounce inside, chasers (amber hexagons) track you.',
  'Capture 80% of the area to complete the level.',
  'Chain captures quickly for combo multipliers!',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  exit: { opacity: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export const ControlsLegend: React.FC<ControlsLegendProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="controls-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-void-black/85 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl mx-4 p-6 bg-void-dark/95 border border-cyan-plasma/20 shadow-[0_0_30px_#00F0FF11] overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-orbitron font-bold text-cyan-plasma text-glow-cyan tracking-wider">
                Controls
              </h2>
              <button
                onClick={onClose}
                className="text-cyan-plasma/50 hover:text-cyan-plasma transition-colors text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Control Groups */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5 mb-6"
            >
              {controlGroups.map((group) => (
                <motion.div key={group.title} variants={itemVariants}>
                  <h3
                    className="text-xs font-orbitron uppercase tracking-[0.3em] mb-3 pb-1 border-b"
                    style={{ color: group.color, borderColor: `${group.color}33` }}
                  >
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.controls.map((ctrl, i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        className="flex items-center gap-3"
                      >
                        <div className="flex gap-1.5 shrink-0 w-28 justify-end">
                          {ctrl.keys.map((key, ki) => (
                            <React.Fragment key={ki}>
                              {ki > 0 && (
                                <span className="text-void-gray text-xs self-center">/</span>
                              )}
                              <KeyBadge wide={ctrl.wide}>{key}</KeyBadge>
                            </React.Fragment>
                          ))}
                        </div>
                        <span className="text-sm font-inter text-cyan-plasma/70">
                          {ctrl.description}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* How to Play */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 className="text-xs font-orbitron uppercase tracking-[0.3em] text-warning-amber mb-3 pb-1 border-b border-warning-amber/20">
                How to Play
              </h3>
              <ol className="space-y-2">
                {howToPlay.map((step, i) => (
                  <motion.li
                    key={i}
                    variants={itemVariants}
                    className="flex gap-3 text-sm font-inter text-cyan-plasma/70"
                  >
                    <span
                      className="shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-orbitron font-bold border rounded-full mt-0.5"
                      style={{
                        color: '#00F0FF',
                        borderColor: '#00F0FF44',
                        backgroundColor: '#00F0FF0A',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>

            {/* Close */}
            <div className="flex justify-center mt-6">
              <CyberButton label="Got It" variant="primary" size="md" onClick={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
