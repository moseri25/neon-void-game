'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberButton } from '../atoms/CyberButton';
import { NeonText } from '../atoms/NeonText';
import { useSettingsStore, type GraphicsQuality } from '@/stores/settingsStore';
import { useUIStore, type ColorblindMode } from '@/stores/uiStore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-orbitron uppercase tracking-wider text-cyan-plasma opacity-70 w-32 shrink-0">
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="flex-1 h-1 appearance-none bg-void-gray rounded-full outline-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-plasma
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_#00F0FF] [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <span className="text-xs font-inter text-cyan-plasma w-10 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-orbitron uppercase tracking-wider text-cyan-plasma opacity-70">
        {label}
      </span>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
          value ? 'bg-cyan-plasma/30 shadow-[0_0_10px_#00F0FF33]' : 'bg-void-gray'
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full"
          animate={{
            left: value ? 26 : 2,
            backgroundColor: value ? '#00F0FF' : '#1A1A2E',
            boxShadow: value ? '0 0 8px #00F0FF' : 'none',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function SelectRow<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-orbitron uppercase tracking-wider text-cyan-plasma opacity-70">
        {label}
      </span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-xs font-orbitron uppercase tracking-wider border transition-all cursor-pointer ${
              value === opt.value
                ? 'border-cyan-plasma text-cyan-plasma bg-cyan-plasma/10 shadow-[0_0_8px_#00F0FF33]'
                : 'border-void-gray text-void-gray hover:border-cyan-plasma/50 hover:text-cyan-plasma/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    masterVolume, sfxVolume, musicVolume,
    graphicsQuality, showFPS, screenShake,
    setMasterVolume, setSfxVolume, setMusicVolume,
    setGraphicsQuality, toggleFPS, toggleScreenShake,
  } = useSettingsStore();

  const { isMuted, colorblindMode, toggleMute, setColorblindMode } = useUIStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="settings-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg mx-4 p-6 bg-void-dark/95 border border-cyan-plasma/20 shadow-[0_0_30px_#00F0FF11] overflow-y-auto max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <NeonText variant="subtitle" color="cyan" as="h2">
                Settings
              </NeonText>
              <button
                onClick={onClose}
                className="text-cyan-plasma/50 hover:text-cyan-plasma transition-colors text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Audio Section */}
            <div className="mb-6">
              <h3 className="text-xs font-orbitron uppercase tracking-[0.3em] text-warning-amber mb-4 border-b border-warning-amber/20 pb-2">
                Audio
              </h3>
              <div className="space-y-4">
                <ToggleRow label="Mute All" value={isMuted} onChange={toggleMute} />
                <SliderRow label="Master" value={masterVolume} onChange={setMasterVolume} />
                <SliderRow label="SFX" value={sfxVolume} onChange={setSfxVolume} />
                <SliderRow label="Music" value={musicVolume} onChange={setMusicVolume} />
              </div>
            </div>

            {/* Graphics Section */}
            <div className="mb-6">
              <h3 className="text-xs font-orbitron uppercase tracking-[0.3em] text-warning-amber mb-4 border-b border-warning-amber/20 pb-2">
                Graphics
              </h3>
              <div className="space-y-4">
                <SelectRow<GraphicsQuality>
                  label="Quality"
                  value={graphicsQuality}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Med' },
                    { value: 'high', label: 'High' },
                    { value: 'ultra', label: 'Ultra' },
                  ]}
                  onChange={setGraphicsQuality}
                />
                <ToggleRow label="Show FPS" value={showFPS} onChange={toggleFPS} />
                <ToggleRow label="Screen Shake" value={screenShake} onChange={toggleScreenShake} />
              </div>
            </div>

            {/* Accessibility Section */}
            <div className="mb-6">
              <h3 className="text-xs font-orbitron uppercase tracking-[0.3em] text-warning-amber mb-4 border-b border-warning-amber/20 pb-2">
                Accessibility
              </h3>
              <div className="space-y-4">
                <SelectRow<ColorblindMode>
                  label="Color Mode"
                  value={colorblindMode}
                  options={[
                    { value: 'none', label: 'Normal' },
                    { value: 'deuteranopia', label: 'Deutan' },
                    { value: 'protanopia', label: 'Protan' },
                    { value: 'tritanopia', label: 'Tritan' },
                  ]}
                  onChange={setColorblindMode}
                />
              </div>
            </div>

            {/* Close button */}
            <div className="flex justify-center mt-6">
              <CyberButton label="Close" variant="primary" size="md" onClick={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
