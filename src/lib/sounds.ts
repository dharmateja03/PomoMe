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
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + 1.5);
  });
}

function playChime(ctx: AudioContext, volume: number) {
  const frequencies = [880, 1108.73, 1318.51, 1760]; // A5, C#6, E6, A6

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
    gain.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + i * 0.15 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 1);
  });
}

function playGong(ctx: AudioContext, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 2);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Add harmonics
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(300, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 2);
  gain2.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 3);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 2);
}

function playDigital(ctx: AudioContext, volume: number) {
  const beeps = [
    { freq: 1000, start: 0, duration: 0.1 },
    { freq: 1000, start: 0.15, duration: 0.1 },
    { freq: 1500, start: 0.3, duration: 0.2 },
  ];

  beeps.forEach(beep => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(beep.freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime + beep.start);
    gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + beep.start + 0.01);
    gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime + beep.start + beep.duration - 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + beep.start + beep.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + beep.start);
    osc.stop(ctx.currentTime + beep.start + beep.duration);
  });
}
