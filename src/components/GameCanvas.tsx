'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useGameEngine } from '@/providers/EngineProvider';
import type { InputAction } from '@/engine/NeonVoidEngine';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useGameEngine();

  useEffect(() => {
    if (!engine || !canvasRef.current) return;
    engine.initialize(canvasRef.current);
  }, [engine]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!engine) return;
    const map: Record<string, InputAction> = {
      ArrowUp: 'MOVE_UP',
      ArrowDown: 'MOVE_DOWN',
      ArrowLeft: 'MOVE_LEFT',
      ArrowRight: 'MOVE_RIGHT',
      KeyW: 'MOVE_UP',
      KeyS: 'MOVE_DOWN',
      KeyA: 'MOVE_LEFT',
      KeyD: 'MOVE_RIGHT',
      Space: 'START_TETHER',
      Escape: 'PAUSE',
      KeyZ: 'SHOOT',
    };
    const action = map[e.code];
    if (action) {
      e.preventDefault();
      engine.handleInput(action, true);
    }
  }, [engine]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!engine) return;
    const map: Record<string, InputAction> = {
      ArrowUp: 'MOVE_UP',
      ArrowDown: 'MOVE_DOWN',
      ArrowLeft: 'MOVE_LEFT',
      ArrowRight: 'MOVE_RIGHT',
      KeyW: 'MOVE_UP',
      KeyS: 'MOVE_DOWN',
      KeyA: 'MOVE_LEFT',
      KeyD: 'MOVE_RIGHT',
      KeyZ: 'SHOOT',
    };
    const action = map[e.code];
    if (action) {
      engine.handleInput(action, false);
    }
  }, [engine]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Touch/swipe support
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!engine || !touchStart.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const threshold = 10;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        engine.handleInput(dx > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT', true);
        engine.handleInput(dx > 0 ? 'MOVE_LEFT' : 'MOVE_RIGHT', false);
      } else {
        engine.handleInput(dy > 0 ? 'MOVE_DOWN' : 'MOVE_UP', true);
        engine.handleInput(dy > 0 ? 'MOVE_UP' : 'MOVE_DOWN', false);
      }
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [engine]);

  const handleTouchEnd = useCallback(() => {
    if (!engine) return;
    engine.handleInput('MOVE_UP', false);
    engine.handleInput('MOVE_DOWN', false);
    engine.handleInput('MOVE_LEFT', false);
    engine.handleInput('MOVE_RIGHT', false);
    touchStart.current = null;
  }, [engine]);

  const handleDoubleTap = useCallback(() => {
    engine?.handleInput('START_TETHER', true);
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block bg-void-black cursor-crosshair"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
      tabIndex={0}
    />
  );
};
