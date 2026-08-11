let audioContext: AudioContext | null = null;

function tone(
  type: OscillatorType,
  startFrequency: number,
  endFrequency: number,
  durationSeconds: number,
  peakGain: number,
  startOffsetSeconds = 0,
): void {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const t0 = audioContext.currentTime + startOffsetSeconds;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, t0);
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequency,
      t0 + durationSeconds,
    );
    gain.gain.setValueAtTime(peakGain, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + durationSeconds);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(t0);
    oscillator.stop(t0 + durationSeconds);
  } catch {
    // Sound feedback is optional and must never interrupt gameplay.
  }
}

export function playWhack(combo: number): void {
  const startFrequency = 660 * (1 + 0.06 * Math.min(combo, 8));
  tone("triangle", startFrequency, 220, 0.12, 0.2);
}

export function playMiss(): void {
  tone("sine", 150, 110, 0.08, 0.07);
}

export function playCountdownBlip(): void {
  tone("sine", 440, 440, 0.09, 0.12);
}

export function playGo(): void {
  tone("sine", 880, 880, 0.18, 0.15);
}

export function playTimeTick(): void {
  tone("sine", 330, 330, 0.05, 0.06);
}

export function playRoundEnd(newBest: boolean): void {
  if (newBest) {
    tone("triangle", 523.25, 523.25, 0.12, 0.15);
    tone("triangle", 659.25, 659.25, 0.12, 0.15, 0.12);
    tone("triangle", 783.99, 783.99, 0.12, 0.15, 0.24);
    return;
  }

  tone("triangle", 523.25, 523.25, 0.15, 0.15);
  tone("triangle", 392, 392, 0.15, 0.15, 0.16);
}
