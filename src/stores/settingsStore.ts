import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

interface SettingsState {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  graphicsQuality: GraphicsQuality;
  showFPS: boolean;
  screenShake: boolean;
}

interface SettingsActions {
  setMasterVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setGraphicsQuality: (q: GraphicsQuality) => void;
  toggleFPS: () => void;
  toggleScreenShake: () => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      masterVolume: 0.8,
      sfxVolume: 0.7,
      musicVolume: 0.5,
      graphicsQuality: 'high',
      showFPS: false,
      screenShake: true,
      setMasterVolume: (masterVolume) => set({ masterVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
      toggleFPS: () => set((s) => ({ showFPS: !s.showFPS })),
      toggleScreenShake: () => set((s) => ({ screenShake: !s.screenShake })),
    }),
    { name: 'neon-void-settings' }
  )
);
