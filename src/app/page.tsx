'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainMenu } from '@/ui/organisms/MainMenu';
import { SettingsPanel } from '@/ui/organisms/SettingsPanel';
import { ControlsLegend } from '@/ui/organisms/ControlsLegend';

export default function HomePage() {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return (
    <>
      <MainMenu
        onStartGame={() => router.push('/game')}
        onLeaderboard={() => router.push('/leaderboard')}
        onSettings={() => setShowSettings(true)}
        onControls={() => setShowControls(true)}
      />
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <ControlsLegend
        isOpen={showControls}
        onClose={() => setShowControls(false)}
      />
    </>
  );
}
