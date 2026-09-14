import { ScanLine, Shirt, Sparkles } from "lucide-react";
import Logo from "../Logo";

const BUBBLES = ["one", "two", "three", "four", "five", "six"];

const SplashScreen = ({ isLeaving = false }) => (
  <div
    aria-atomic="true"
    aria-label="ClothSync is getting everything ready"
    aria-live="polite"
    className={`clothsync-splash ${isLeaving ? "clothsync-splash--leaving" : ""}`}
    role="status"
  >
    <div aria-hidden="true" className="clothsync-splash__mesh" />
    <div
      aria-hidden="true"
      className="clothsync-splash__glow clothsync-splash__glow--one"
    />
    <div
      aria-hidden="true"
      className="clothsync-splash__glow clothsync-splash__glow--two"
    />

    <div aria-hidden="true" className="clothsync-splash__bubbles">
      {BUBBLES.map((bubble) => (
        <span
          className={`clothsync-splash__bubble clothsync-splash__bubble--${bubble}`}
          key={bubble}
        />
      ))}
    </div>

    <div className="clothsync-splash__content">
      <div className="mb-4 flex justify-center">
        <Logo className="h-20 sm:h-24 md:h-28 w-auto max-w-75 drop-shadow-[0_12px_32px_rgba(20,184,166,0.35)] select-none" />
      </div>

      <div aria-hidden="true" className="clothsync-splash__visual">
        <span className="clothsync-splash__orbit clothsync-splash__orbit--outer">
          <Sparkles size={17} strokeWidth={2.2} />
        </span>
        <span className="clothsync-splash__orbit clothsync-splash__orbit--inner">
          <ScanLine size={17} strokeWidth={2.2} />
        </span>

        <div className="clothsync-splash__mark-shell">
          <span className="clothsync-splash__scan" />
          <Shirt
            className="clothsync-splash__shirt"
            size={58}
            strokeWidth={1.7}
          />
          <span className="clothsync-splash__rfid-wave clothsync-splash__rfid-wave--one" />
          <span className="clothsync-splash__rfid-wave clothsync-splash__rfid-wave--two" />
          <span className="clothsync-splash__rfid-dot" />
        </div>
      </div>

      <div className="clothsync-splash__brand">
        <span className="clothsync-splash__eyebrow">
          Smart laundry, perfectly synced
        </span>
        <p className="clothsync-splash__message">
          Connecting every garment to a cleaner workflow
        </p>
      </div>

      <div aria-hidden="true" className="clothsync-splash__progress">
        <span className="clothsync-splash__progress-bar" />
      </div>
      <span className="sr-only">Loading ClothSync</span>
    </div>
  </div>
);

export default SplashScreen;
