import { create } from 'zustand';

export type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

interface UIStoreState {
  showSettings: boolean;
  showLeaderboard: boolean;
  isMuted: boolean;
  volume: number;
  colorblindMode: ColorblindMode;
}

interface UIStoreActions {
  toggleSettings: () => void;
  toggleLeaderboard: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setColorblindMode: (mode: ColorblindMode) => void;
}

export const useUIStore = create<UIStoreState & UIStoreActions>((set) => ({
  showSettings: false,
  showLeaderboard: false,
  isMuted: false,
  volume: 0.8,
  colorblindMode: 'none',
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  toggleLeaderboard: () => set((s) => ({ showLeaderboard: !s.showLeaderboard })),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setVolume: (volume) => set({ volume }),
  setColorblindMode: (colorblindMode) => set({ colorblindMode }),
}));
