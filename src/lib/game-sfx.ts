let audioContext: AudioContext | null = null;

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function getAudioContext(): AudioContext | null {
  if (audioContext?.state === "closed") audioContext = null;
  if (audioContext) return audioContext;

  const currentWindow = window as AudioWindow;
  const AudioContextConstructor =
    currentWindow.AudioContext ?? currentWindow.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  audioContext = new AudioContextConstructor();
  return audioContext;
}

function scheduleTone(
  context: AudioContext,
  type: OscillatorType,
  startFrequency: number,
  endFrequency: number,
  durationSeconds: number,
  peakGain: number,
  startOffsetSeconds: number,
): void {
  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const t0 = context.currentTime + startOffsetSeconds;
    const attackEndsAt = t0 + Math.min(0.005, durationSeconds / 2);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, t0);
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequency,
      t0 + durationSeconds,
    );
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(peakGain, attackEndsAt);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + durationSeconds);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(t0);
    oscillator.stop(t0 + durationSeconds);
  } catch {
    // Sound feedback is optional and must never interrupt gameplay.
  }
}

function tone(
  type: OscillatorType,
  startFrequency: number,
  endFrequency: number,
  durationSeconds: number,
  peakGain: number,
  startOffsetSeconds = 0,
): void {
  try {
    const context = getAudioContext();
    if (!context) return;

    if (context.state !== "running") {
      void context
        .resume()
        .then(() =>
          scheduleTone(
            context,
            type,
            startFrequency,
            endFrequency,
            durationSeconds,
            peakGain,
            startOffsetSeconds,
          ),
        )
        .catch(() => undefined);
      return;
    }

    scheduleTone(
      context,
      type,
      startFrequency,
      endFrequency,
      durationSeconds,
      peakGain,
      startOffsetSeconds,
    );
  } catch {
    // Sound feedback is optional and must never interrupt gameplay.
  }
}

export function playWhack(combo: number): void {
  const startFrequency = 660 * (1 + 0.06 * Math.min(combo, 8));
  tone("triangle", startFrequency, 220, 0.12, 0.4);
}

export function playMiss(): void {
  tone("sine", 150, 110, 0.08, 0.18);
}

export function playCountdownBlip(): void {
  tone("sine", 440, 440, 0.09, 0.22);
}

export function playGo(): void {
  tone("sine", 880, 880, 0.18, 0.3);
}

export function playTimeTick(): void {
  tone("sine", 330, 330, 0.05, 0.12);
}

export function playRoundEnd(newBest: boolean): void {
  if (newBest) {
    tone("triangle", 523.25, 523.25, 0.12, 0.26);
    tone("triangle", 659.25, 659.25, 0.12, 0.26, 0.12);
    tone("triangle", 783.99, 783.99, 0.12, 0.26, 0.24);
    return;
  }

  tone("triangle", 523.25, 523.25, 0.15, 0.26);
  tone("triangle", 392, 392, 0.15, 0.26, 0.16);
}
