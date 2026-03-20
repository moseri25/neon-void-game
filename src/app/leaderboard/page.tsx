'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LeaderboardTable, type LeaderboardEntry } from '@/ui/organisms/LeaderboardTable';
import { CyberButton } from '@/ui/atoms/CyberButton';
import { NeonText } from '@/ui/atoms/NeonText';

const MOCK_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, username: 'QUANTUM_CUTTER', score: 2847500, level: 23 },
  { rank: 2, username: 'VOID_WALKER', score: 2156000, level: 21 },
  { rank: 3, username: 'NEON_BLADE', score: 1892300, level: 19 },
  { rank: 4, username: 'PIXEL_STORM', score: 1654800, level: 18 },
  { rank: 5, username: 'CYBER_EDGE', score: 1423100, level: 17 },
  { rank: 6, username: 'GRID_MASTER', score: 1287400, level: 16 },
  { rank: 7, username: 'WAVE_RUNNER', score: 1098600, level: 15 },
  { rank: 8, username: 'FLUX_RIDER', score: 987200, level: 14 },
  { rank: 9, username: 'DATA_SLASH', score: 876500, level: 13 },
  { rank: 10, username: 'ZERO_POINT', score: 765800, level: 12 },
];

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-void-black bg-grid-pattern p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <NeonText variant="title" color="cyan" as="h1">
            Leaderboard
          </NeonText>
          <CyberButton label="Back" variant="warning" size="sm" onClick={() => router.push('/')} />
        </div>
        <LeaderboardTable entries={MOCK_ENTRIES} />
      </div>
    </div>
  );
}
