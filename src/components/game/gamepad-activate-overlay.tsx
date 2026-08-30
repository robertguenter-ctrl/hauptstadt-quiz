"use client";

interface GamepadActivateOverlayProps {
  visible: boolean;
  onActivate: () => void;
}

export function GamepadActivateOverlay({ visible, onActivate }: GamepadActivateOverlayProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onActivate}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 text-center"
    >
      <div className="max-w-xl rounded-2xl border border-amber-400/40 bg-slate-900 p-10">
        <h2 className="text-3xl font-bold text-amber-300">Schritt 1: Seite aktivieren</h2>
        <p className="mt-4 text-lg text-white/80">Hier klicken — danach einen Knopf am Controller drücken.</p>
        <p className="mt-6 text-sm text-white/50">Klicken zum Fortfahren</p>
      </div>
    </button>
  );
}

interface WaitingForGamepadBannerProps {
  visible: boolean;
}

export function WaitingForGamepadBanner({ visible }: WaitingForGamepadBannerProps) {
  if (!visible) return null;

  return (
    <div className="mb-6 animate-pulse rounded-xl border-2 border-amber-400 bg-amber-400/10 p-6 text-center">
      <p className="text-2xl font-bold text-amber-300">Schritt 2: Jetzt einen Controller-Knopf drücken!</p>
      <p className="mt-2 text-white/70">Home, A, B, L, R — irgendeinen Knopf</p>
    </div>
  );
}

interface GamepadTroubleshootingProps {
  isSafari: boolean;
  isChrome: boolean;
}

export function GamepadTroubleshooting({ isSafari, isChrome }: GamepadTroubleshootingProps) {
  return (
    <div className="mt-8 rounded-xl border border-white/20 bg-white/5 p-6 text-left">
      <h3 className="text-lg font-semibold text-amber-300">Mac + Nintendo Pro Controller</h3>

      {isSafari && (
        <p className="mt-3 rounded-lg bg-red-500/20 p-3 text-red-300">
          Du nutzt Safari — Controller funktionieren dort oft nicht. Bitte <strong>Chrome</strong>{" "}
          verwenden.
        </p>
      )}

      {isChrome && (
        <p className="mt-3 text-green-400">Chrome erkannt — gut.</p>
      )}

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-white/80">
        <li>
          Am <strong>Mac</strong> funktioniert der Nintendo Pro Controller im Browser oft nur per{" "}
          <strong>USB-Kabel</strong>, nicht per Bluetooth — zum Entwickeln reicht das.
        </li>
        <li>
          Am <strong>Android TV</strong> sollte Bluetooth normalerweise funktionieren (anderes
          System als macOS).
        </li>
        <li>Controller in Systemeinstellungen → Bluetooth verbunden?</li>
        <li>
          In Chrome öffnen:{" "}
          <code className="rounded bg-black/40 px-1">chrome://gamepad-internals</code> — erscheint
          der Controller dort nach Knopfdruck?
        </li>
        <li>
          <strong>Steam schließen</strong> (blockiert Controller oft am Mac)
        </li>
        <li>
          Alternativ per <strong>USB-Kabel</strong> verbinden statt Bluetooth
        </li>
        <li>
          Extern testen:{" "}
          <a
            href="https://hardwaretester.com/gamepad"
            target="_blank"
            rel="noreferrer"
            className="text-amber-300 underline"
          >
            hardwaretester.com/gamepad
          </a>
        </li>
      </ol>
    </div>
  );
}
