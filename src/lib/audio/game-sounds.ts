let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

export function resumeAudio(): void {
  getAudioContext();
}

function playTone(frequency: number, durationSec: number, type: OscillatorType = "sine", volume = 0.25): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + durationSec);
}

/** Handy: erfolgreich gebuzzert */
export function playPhoneBuzzSuccess(): void {
  playTone(880, 0.09, "sine", 0.3);
  window.setTimeout(() => playTone(1175, 0.14, "sine", 0.28), 90);
}

/** TV: jemand hat gebuzzert */
export function playTvBuzzSound(): void {
  playTone(523, 0.07, "square", 0.2);
  window.setTimeout(() => playTone(784, 0.1, "square", 0.18), 70);
  window.setTimeout(() => playTone(988, 0.14, "square", 0.16), 150);
}

export function speakPlayerName(name: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(name);
  utterance.lang = "en-US";
  utterance.rate = 1.05;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((v) => v.lang.startsWith("en"));
  if (englishVoice) utterance.voice = englishVoice;
  window.speechSynthesis.speak(utterance);
}

export function vibrateBuzzSuccess(): void {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([60, 40, 100, 30, 160]);
  }
}

/** TV: richtige Antwort bestätigt */
export function playCorrectJingle(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    window.setTimeout(() => playTone(freq, 0.18, "sine", 0.22), i * 110);
  });
}
