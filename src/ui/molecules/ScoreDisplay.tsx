'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, className = '' }) => {
  const [displayScore, setDisplayScore] = useState(score);
  const prevScore = useRef(score);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const start = prevScore.current;
    const end = score;
    const duration = 500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(start + (end - start) * eased));
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    prevScore.current = score;

    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  const increased = score > prevScore.current;

  return (
    <motion.div
      className={`font-orbitron font-bold text-cyan-plasma text-glow-cyan ${className}`}
      animate={increased ? { scale: [1, 1.15, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {displayScore.toLocaleString()}
    </motion.div>
  );
};
