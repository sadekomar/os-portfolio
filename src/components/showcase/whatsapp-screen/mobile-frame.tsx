import type { ReactNode } from "react";

/** Cellular bars, left to right, short to tall. */
function SignalIcon() {
  return (
    <svg
      width="17"
      height="11"
      viewBox="0 0 17 11"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="0" y="7.5" width="3" height="3.5" rx="1" opacity="0.35" />
      <rect x="4.6" y="5.2" width="3" height="5.8" rx="1" opacity="0.35" />
      <rect x="9.2" y="2.6" width="3" height="8.4" rx="1" />
      <rect x="13.8" y="0" width="3" height="11" rx="1" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg
      width="15"
      height="11"
      viewBox="0 0 15 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M1 3.6a9.4 9.4 0 0 1 13 0" />
      <path d="M3.6 6.3a5.8 5.8 0 0 1 7.8 0" />
      <path d="M6.2 8.9a2.2 2.2 0 0 1 2.6 0" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true">
      <rect
        x="0.6"
        y="0.6"
        width="21"
        height="10.8"
        rx="3.2"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.1"
      />
      <path
        d="M23 4.2a2.4 2.4 0 0 1 0 3.6z"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <rect
        x="2.2"
        y="2.2"
        width="17.8"
        height="7.6"
        rx="2"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Width of the screen inside the frame: 272 outer, less the 1px border and the
 * 7px bezel on each side. Content authored at iPhone point sizes scales by
 * SCREEN_WIDTH / 393 to land here.
 */
export const SCREEN_WIDTH = 256;

type MobileFrameProps = {
  /** What fills the screen. A screenshot <Image> sits flush against the edges. */
  children?: ReactNode;
  /** Status-bar clock. The Apple mock time by default. */
  time?: string;
  /** Hide the status bar when the screenshot already carries its own. */
  showStatusBar?: boolean;
  /**
   * Cut the device off at the bottom: sides run straight down, no bottom curve
   * or border, and the cut dissolves into the page. Off means a whole device.
   */
  cropped?: boolean;
  /** Visible device height above the cut. */
  cropHeight?: number;
  className?: string;
};

/**
 * A white iPhone-ish frame to hold a product screenshot: soft halo ring around
 * a thin bezel, real status bar, screenshot flush inside the rounded screen.
 */
export function MobileFrame({
  children,
  time = "9:41",
  showStatusBar = true,
  cropped = false,
  cropHeight = 340,
  className = "",
}: MobileFrameProps) {
  return (
    <div className={`relative w-[272px] max-w-full ${className}`}>
      {/* The halo: a second, softer ring floating just outside the device. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-[7px] -left-[7px] -right-[7px] border border-black/[0.045] bg-white/40 ${
          cropped
            ? "bottom-0 rounded-t-[50px] border-b-0"
            : "-bottom-[7px] rounded-[50px]"
        }`}
        style={cropped ? { maskImage: FADE, WebkitMaskImage: FADE } : undefined}
      />

      <div
        className={`relative overflow-hidden border border-black/[0.07] bg-white p-[7px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-24px_rgba(0,0,0,0.22)] ${
          cropped ? "rounded-t-[44px] border-b-0" : "rounded-[44px]"
        }`}
        style={
          cropped
            ? { height: cropHeight, maskImage: FADE, WebkitMaskImage: FADE }
            : undefined
        }
      >
        <div
          className={`relative h-full overflow-hidden bg-white ${
            cropped ? "rounded-t-[37px]" : "rounded-[37px]"
          }`}
        >
          {showStatusBar && (
            /* Literal ink rather than `text-foreground`. The device is always
               white, so its status bar must not invert with the host page. */
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[22px] pt-[15px]"
              style={{ color: "#1a1a1a" }}
            >
              <span className="font-semibold text-[13px] tabular-nums leading-none tracking-[-0.01em]">
                {time}
              </span>
              <span className="flex items-center gap-[5px]">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
              </span>
            </div>
          )}
          <div className={showStatusBar ? "h-full pt-[44px]" : "h-full"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The cut dissolves rather than ending on a hard edge. */
const FADE =
  "linear-gradient(to bottom, #000 0%, #000 66%, rgba(0,0,0,0.4) 87%, transparent 100%)";
