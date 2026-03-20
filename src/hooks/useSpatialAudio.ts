'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface SpatialAudioHook {
  playSound: (soundId: string, x?: number, y?: number) => void;
  updateListenerPosition: (x: number, y: number) => void;
}

export function useSpatialAudio(): SpatialAudioHook {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMuted = useUIStore((s) => s.isMuted);
  const masterVolume = useSettingsStore((s) => s.masterVolume);
  const sfxVolume = useSettingsStore((s) => s.sfxVolume);
  const musicVolume = useSettingsStore((s) => s.musicVolume);

  useEffect(() => {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    const mGain = ctx.createGain();
    gain.connect(ctx.destination);
    mGain.connect(ctx.destination);
    
    audioCtxRef.current = ctx;
    gainRef.current = gain;
    musicGainRef.current = mGain;

    // Background Music Sequence (A2 Cyberpunk vibe)
    let noteIndex = 0;
    const notes = [110, 110, 130, 110, 146, 146, 165, 130]; // A2, A2, C3, A2, D3, D3, E3, C3
    
    const playTick = () => {
      const liveCtx = audioCtxRef.current;
      if (!liveCtx) return;
      if (liveCtx.state === 'suspended' || liveCtx.state === 'closed') return;

      const o = liveCtx.createOscillator();
      const g = liveCtx.createGain();
      o.connect(g);
      g.connect(musicGainRef.current!);
      
      o.frequency.value = notes[noteIndex % notes.length] ?? 110;
      o.type = 'triangle';
      
      g.gain.setValueAtTime(0.08, liveCtx.currentTime);
      g.gain.linearRampToValueAtTime(0, liveCtx.currentTime + 0.45);
      
      o.start(liveCtx.currentTime);
      o.stop(liveCtx.currentTime + 0.45);
      noteIndex++;
    };

    musicIntervalRef.current = setInterval(playTick, 250); // 120 BPM 1/8 notes

    // Interaction resume
    const resume = () => {
      console.log(`[Audio] Page interact. Current state: ${ctx.state}`);
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => console.log(`[Audio] Resumed to: ${ctx.state}`));
      }
    };
    window.addEventListener('click', resume);
    window.addEventListener('keydown', resume);

    return () => {
      if (musicIntervalRef.current) clearInterval(musicIntervalRef.current);
      window.removeEventListener('click', resume);
      window.removeEventListener('keydown', resume);
      ctx.close();
    };
  }, []);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = isMuted ? 0 : masterVolume * sfxVolume;
    }
    if (musicGainRef.current) {
      musicGainRef.current.gain.value = isMuted ? 0 : masterVolume * musicVolume;
      console.log(`[Audio] Update volumes -> Mute: ${isMuted}, Master: ${(masterVolume*100).toFixed(0)}%, Music: ${(musicVolume*100).toFixed(0)}%`);
    }
  }, [isMuted, masterVolume, sfxVolume, musicVolume]);

    const playSound = useCallback((soundId: string, x: number = 0, y: number = 0) => {
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;

    if (ctx.state === 'suspended') {
      console.warn('[Audio] Context is suspended. Interact with the page to play:', soundId);
      return;
    }
    if (ctx.state === 'closed') return;

    console.log(`[Audio] Playing SFX: ${soundId} | Volume: ${gain.gain.value.toFixed(2)}`);

    const oscillator = ctx.createOscillator();
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.positionX.value = x / 400;
    panner.positionY.value = y / 400;
    panner.positionZ.value = 0;

    const envGain = ctx.createGain();
    envGain.gain.setValueAtTime(0.3, ctx.currentTime);
    envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    const freqMap: Record<string, number> = {
      capture: 880,
      death: 220,
      combo: 1200,
      levelComplete: 660,
    };

    oscillator.frequency.value = freqMap[soundId] ?? 440;
    oscillator.type = soundId === 'death' ? 'sawtooth' : 'sine';

    oscillator.connect(panner);
    panner.connect(envGain);
    envGain.connect(gain);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  }, []);

  const updateListenerPosition = useCallback((x: number, y: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    ctx.listener.positionX.value = x / 400;
    ctx.listener.positionY.value = y / 400;
  }, []);

  return { playSound, updateListenerPosition };
}
