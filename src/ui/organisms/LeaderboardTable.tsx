'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  level: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const rankColors: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="grid grid-cols-[60px_1fr_120px_80px] gap-2 px-4 py-2 text-xs font-orbitron uppercase tracking-wider text-cyan-plasma opacity-50 border-b border-cyan-plasma/20">
        <div>Rank</div>
        <div>Player</div>
        <div className="text-right">Score</div>
        <div className="text-right">Level</div>
      </div>

      {/* Entries */}
      <div className="space-y-1 mt-2">
        {entries.map((entry, i) => {
          const isTop3 = entry.rank <= 3;
          const color = rankColors[entry.rank] ?? '#00F0FF';

          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
              className="grid grid-cols-[60px_1fr_120px_80px] gap-2 px-4 py-3 rounded-sm transition-colors hover:bg-cyan-plasma/5 group"
              style={{
                borderLeft: isTop3 ? `2px solid ${color}` : '2px solid transparent',
                boxShadow: isTop3 ? `inset 0 0 20px ${color}11` : 'none',
              }}
            >
              <div
                className="font-orbitron font-bold"
                style={{
                  color,
                  textShadow: isTop3 ? `0 0 10px ${color}66` : 'none',
                }}
              >
                #{entry.rank}
              </div>
              <div className="font-inter text-cyan-plasma group-hover:text-white transition-colors truncate">
                {entry.username}
              </div>
              <div className="text-right font-orbitron font-semibold text-cyan-plasma">
                {entry.score.toLocaleString()}
              </div>
              <div className="text-right font-inter text-void-gray text-sm">
                Lv.{entry.level}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
