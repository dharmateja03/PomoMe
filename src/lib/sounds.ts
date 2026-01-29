// Sound generator using Web Audio API - no external files needed

export type SoundType = 'bell' | 'chime' | 'gong' | 'digital';

export function playSound(type: SoundType, volume: number = 0.8): void {
  if (typeof window === 'undefined') return;

  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  switch (type) {
    case 'bell':
      playBell(audioContext, volume);
      break;
    case 'chime':
      playChime(audioContext, volume);
      break;
    case 'gong':
      playGong(audioContext, volume);
      break;
    case 'digital':
      playDigital(audioContext, volume);
      break;
  }
}

function playBell(ctx: AudioContext, volume: number) {
  // Play bell pattern 3 times for ~5-6 seconds total
  for (let repeat = 0; repeat < 3; repeat++) {
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    const startOffset = repeat * 1.8;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);

      gain.gain.setValueAtTime(0, ctx.currentTime + startOffset);
      gain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + startOffset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startOffset + i * 0.1);
      osc.stop(ctx.currentTime + startOffset + 1.5);
    });
  }
}

function playChime(ctx: AudioContext, volume: number) {
  // Play chime pattern 2 times for ~5-6 seconds total
  for (let repeat = 0; repeat < 2; repeat++) {
    const frequencies = [880, 1108.73, 1318.51, 1760]; // A5, C#6, E6, A6
    const startOffset = repeat * 2.5;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);

      gain.gain.setValueAtTime(0, ctx.currentTime + startOffset + i * 0.15);
      gain.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + startOffset + i * 0.15 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + i * 0.15 + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startOffset + i * 0.15);
      osc.stop(ctx.currentTime + startOffset + i * 0.15 + 1.5);
    });
  }
}

function playGong(ctx: AudioContext, volume: number) {
  // Play gong pattern 2 times for ~6 seconds total
  for (let repeat = 0; repeat < 2; repeat++) {
    const startOffset = repeat * 3;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime + startOffset);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + startOffset + 2);

    gain.gain.setValueAtTime(0, ctx.currentTime + startOffset);
    gain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + startOffset + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + 2.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Add harmonics
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(300, ctx.currentTime + startOffset);
    osc2.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + startOffset + 2);
    gain2.gain.setValueAtTime(volume * 0.2, ctx.currentTime + startOffset);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + 2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + 3);
    osc2.start(ctx.currentTime + startOffset);
    osc2.stop(ctx.currentTime + startOffset + 2);
  }
}

function playDigital(ctx: AudioContext, volume: number) {
  // Play digital beep pattern 4 times for ~5-6 seconds total
  for (let repeat = 0; repeat < 4; repeat++) {
    const startOffset = repeat * 1.4;
    const beeps = [
      { freq: 1000, start: 0, duration: 0.15 },
      { freq: 1000, start: 0.2, duration: 0.15 },
      { freq: 1500, start: 0.4, duration: 0.3 },
    ];

    beeps.forEach(beep => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(beep.freq, ctx.currentTime + startOffset);

      gain.gain.setValueAtTime(0, ctx.currentTime + startOffset + beep.start);
      gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + startOffset + beep.start + 0.01);
      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime + startOffset + beep.start + beep.duration - 0.01);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startOffset + beep.start + beep.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startOffset + beep.start);
      osc.stop(ctx.currentTime + startOffset + beep.start + beep.duration);
    });
  }
}
