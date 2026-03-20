'use client';

import { useEffect, useState } from 'react';
import { throttle } from 'lodash';
import { useGameEngine } from '@/providers/EngineProvider';

export function useEngineScore(): number {
  const engine = useGameEngine();
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!engine) return;

    const handleScoreUpdate = throttle((newScore: number) => {
      setScore(newScore);
    }, 66);

    engine.on('SCORE_UPDATED', handleScoreUpdate);

    return () => {
      engine.off('SCORE_UPDATED', handleScoreUpdate);
      handleScoreUpdate.cancel();
    };
  }, [engine]);

  return score;
}
