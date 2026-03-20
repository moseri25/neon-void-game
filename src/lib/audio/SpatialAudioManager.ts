export class SpatialAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private currentMusic: AudioBufferSourceNode | null = null;

  async initialize(): Promise<void> {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();

    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  async loadSound(name: string, url: string): Promise<void> {
    if (!this.ctx) return;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }

  playEffect(name: string, x: number = 0, y: number = 0): void {
    if (!this.ctx || !this.sfxGain) return;

    const buffer = this.sounds.get(name);
    if (!buffer) {
      this.playSynthEffect(name, x, y);
      return;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.positionX.value = x / 400;
    panner.positionY.value = y / 400;
    panner.positionZ.value = 0;

    source.connect(panner);
    panner.connect(this.sfxGain);
    source.start();
  }

  private playSynthEffect(name: string, x: number, y: number): void {
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createPanner();

    panner.positionX.value = x / 400;
    panner.positionY.value = y / 400;

    const presets: Record<string, { freq: number; type: OscillatorType; dur: number }> = {
      capture: { freq: 880, type: 'sine', dur: 0.15 },
      death: { freq: 200, type: 'sawtooth', dur: 0.3 },
      combo: { freq: 1200, type: 'sine', dur: 0.1 },
      levelComplete: { freq: 660, type: 'triangle', dur: 0.5 },
      bounce: { freq: 440, type: 'square', dur: 0.05 },
    };

    const preset = presets[name] ?? { freq: 440, type: 'sine' as OscillatorType, dur: 0.1 };
    osc.frequency.value = preset.freq;
    osc.type = preset.type;

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + preset.dur);

    osc.connect(panner);
    panner.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + preset.dur);
  }

  playMusic(_name: string): void {
    // Placeholder for music playback
  }

  stopMusic(): void {
    this.currentMusic?.stop();
    this.currentMusic = null;
  }

  setMasterVolume(v: number): void {
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  setSfxVolume(v: number): void {
    if (this.sfxGain) this.sfxGain.gain.value = v;
  }

  setMusicVolume(v: number): void {
    if (this.musicGain) this.musicGain.gain.value = v;
  }

  mute(): void {
    if (this.masterGain) this.masterGain.gain.value = 0;
  }

  unmute(volume: number = 0.8): void {
    if (this.masterGain) this.masterGain.gain.value = volume;
  }

  destroy(): void {
    this.stopMusic();
    this.ctx?.close();
    this.sounds.clear();
  }
}
