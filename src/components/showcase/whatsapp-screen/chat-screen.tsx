import type { ReactNode } from "react";

/**
 * A WhatsApp chat drawn at iPhone point sizes, so every measurement here is the
 * real one: 393x852 is the iPhone 14/15/16 logical screen. Scale the whole
 * thing down to fit a device frame rather than re-guessing sizes at small px.
 */
export const SCREEN = { width: 393, height: 852 };

/*
 * Nothing in this file reads a theme token. It is a picture of somebody else's
 * app, so every colour is the literal WhatsApp value and the type is the iOS
 * system stack. Following the host site's ink would make it stop looking like
 * a screenshot, which is the only thing it is for.
 */

/** iOS system stack, so the type matches a real capture rather than DM Sans. */
const IOS_FONT =
  '-apple-system, "SF Pro Text", "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';

const INK = "#111b21"; // WhatsApp body text
const META = "#667781"; // timestamps, secondary lines
const CTA = "#0f9d63"; // template-card action green
const OUT_BUBBLE = "#d9fdd3"; // outgoing green
// Plain chat wallpaper, no doodle pattern. The dashboard's shell grey
// (--sidebar, oklch(0.968 0.003 265)) so the phone matches the product.
const WALLPAPER = "#f3f4f6";

/* ------------------------------------------------------------------ chrome */

/** iOS status bar: bold clock, signal, wifi, battery. */
function StatusBar({ time }: { time: string }) {
  return (
    <div className="relative flex h-[56px] shrink-0 items-center justify-between px-[36px] pt-[8px]">
      <span
        className="font-semibold text-[18px] tabular-nums"
        style={{ color: "#000" }}
      >
        {time}
      </span>
      <span className="flex items-center gap-[8px]">
        <svg width="21" height="14" viewBox="0 0 21 14" aria-hidden="true">
          <rect x="0" y="9.2" width="3.8" height="4.8" rx="1.2" fill="#000" />
          <rect x="5.7" y="6.4" width="3.8" height="7.6" rx="1.2" fill="#000" />
          <rect
            x="11.4"
            y="3.2"
            width="3.8"
            height="10.8"
            rx="1.2"
            fill="#000"
          />
          <rect x="17.1" y="0" width="3.8" height="14" rx="1.2" fill="#000" />
        </svg>
        <svg
          width="19"
          height="14"
          viewBox="0 0 19 14"
          fill="none"
          stroke="#000"
          strokeWidth="2.1"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M1.4 4.6a12.4 12.4 0 0 1 16.2 0" />
          <path d="M4.7 8.2a7.4 7.4 0 0 1 9.6 0" />
          <path d="M8 11.6a2.6 2.6 0 0 1 3 0" />
        </svg>
        <span className="flex items-center gap-[2px]">
          <span className="relative flex h-[15px] w-[29px] items-center rounded-[5px] border-[1.4px] border-black/35 px-[2px]">
            <span className="h-[9px] w-[17px] rounded-[2.5px] bg-black" />
          </span>
          <svg width="3" height="7" viewBox="0 0 3 7" aria-hidden="true">
            <path
              d="M0 0.8C2.2 1.6 2.8 5.4 0 6.2z"
              fill="#000"
              fillOpacity="0.35"
            />
          </svg>
        </span>
      </span>
    </div>
  );
}

/** Back chevron with unread count, avatar, name and the business subtitle. */
function ChatHeader() {
  return (
    <div className="flex shrink-0 items-center gap-[10px] px-[14px] pb-[12px]">
      <svg
        width="12"
        height="21"
        viewBox="0 0 12 21"
        fill="none"
        stroke="#000"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.5 1.5 1.8 10.5l8.7 9" />
      </svg>
      <span className="-ml-[2px] text-[17px]" style={{ color: "#000" }}>
        9
      </span>
      <span className="ml-[6px] flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#ddd6fe]">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="6.4" r="3.6" fill="#6b5ce7" />
          <path
            d="M2.8 18c0-3.9 3.2-6.4 7.2-6.4s7.2 2.5 7.2 6.4z"
            fill="#6b5ce7"
          />
        </svg>
      </span>
      <span className="leading-[1.15]">
        <span
          className="block font-semibold text-[17px]"
          style={{ color: INK }}
        >
          Wholana
        </span>
        <span className="block text-[13px]" style={{ color: META }}>
          Business account
        </span>
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- messages */

function DatePill({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-[6px]">
      <span
        className="rounded-[8px] bg-white/85 px-[12px] py-[5px] font-semibold text-[12.5px] shadow-[0_1px_0.5px_rgba(0,0,0,0.08)]"
        style={{ color: INK }}
      >
        {label}
      </span>
    </div>
  );
}

/** The little flare at the bottom corner of the newest bubble in a group. */
function Tail({ side }: { side: "left" | "right" }) {
  const fill = side === "right" ? OUT_BUBBLE : "#fff";
  return (
    <svg
      width="9"
      height="14"
      viewBox="0 0 9 14"
      aria-hidden="true"
      className={`absolute bottom-0 ${side === "right" ? "-right-[8px]" : "-left-[8px] scale-x-[-1]"}`}
    >
      <path d="M0 0v14c1.6-3.4 5-5.4 9-6.2C4.6 6.6 1.4 3.8 0 0z" fill={fill} />
    </svg>
  );
}

/** Delivered ticks. Grey until the account reads it, blue after. */
function Ticks({ read = false }: { read?: boolean }) {
  return (
    <svg
      width="17"
      height="11"
      viewBox="0 0 17 11"
      fill="none"
      stroke={read ? "#53bdeb" : "#54656f"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 6.2 3.9 9 9.6 2" />
      <path d="M7.2 6.2 10.1 9 15.8 2" />
    </svg>
  );
}

function MetaRow({
  time,
  ticks,
  className = "",
}: {
  time: string;
  ticks?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex shrink-0 items-center gap-[4px] ${className}`}>
      <span className="text-[11.5px] tabular-nums" style={{ color: META }}>
        {time}
      </span>
      {ticks && <Ticks />}
    </span>
  );
}

/** A plain white message from the bot, optionally with a template CTA row. */
function IncomingCard({
  children,
  time,
  cta,
  tail = false,
}: {
  children: ReactNode;
  time: string;
  cta?: string;
  tail?: boolean;
}) {
  return (
    <div className="relative w-[290px] rounded-[10px] bg-white shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]">
      {tail && <Tail side="left" />}
      <div className="flex items-end gap-[10px] px-[11px] py-[7px]">
        <p className="flex-1 text-[17px] leading-[22px]" style={{ color: INK }}>
          {children}
        </p>
        <MetaRow time={time} className="pb-[2px]" />
      </div>
      {cta && (
        <div className="flex items-center justify-center gap-[8px] border-black/[0.08] border-t py-[11px]">
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            stroke={CTA}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="1.5" y="1.5" width="18" height="18" rx="3.5" />
            <path d="M7.4 13.6 13.6 7.4M8.6 7.4h5v5" />
          </svg>
          <span className="text-[17px]" style={{ color: CTA }}>
            {cta}
          </span>
        </div>
      )}
    </div>
  );
}

/** A shared TikTok link: poster, title, domain row, then the meta line. */
function LinkPreviewBubble({ time }: { time: string }) {
  return (
    <div className="flex items-center justify-end gap-[14px]">
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-black/[0.13]">
        <svg
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="#fff"
          aria-hidden="true"
        >
          <path d="M10.2 3.4v3.1C5.6 6.9 2.8 9.6 2 15.6c2.2-3.4 5-4.4 8.2-4.4v3.1L17 8.9z" />
        </svg>
      </span>

      <div
        className="relative w-[249px] rounded-[10px] p-[3px]"
        style={{ backgroundColor: OUT_BUBBLE }}
      >
        <Tail side="right" />

        {/* Poster. Swap for the real video still when there is one. */}
        <div className="relative h-[168px] w-full overflow-hidden rounded-[8px] bg-[linear-gradient(160deg,#4a4f57_0%,#2b2f36_48%,#1b1e23_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.16),transparent_62%)]" />
          <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-black/35">
            <svg
              width="22"
              height="24"
              viewBox="0 0 22 24"
              fill="#fff"
              aria-hidden="true"
            >
              <path d="M2 1.6 20 12 2 22.4z" />
            </svg>
          </span>
        </div>

        <div className="px-[8px] pt-[7px] pb-[5px]">
          <p className="font-semibold text-[15px]" style={{ color: INK }}>
            TikTok · Julien Cohen
          </p>
          <div className="mt-[5px] flex items-center gap-[7px]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              stroke={META}
              strokeWidth="1.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6.2 8.8a3 3 0 0 0 4.3 0l2-2a3 3 0 0 0-4.3-4.3l-1 1" />
              <path d="M8.8 6.2a3 3 0 0 0-4.3 0l-2 2a3 3 0 0 0 4.3 4.3l1-1" />
            </svg>
            <span className="flex-1 text-[15px]" style={{ color: META }}>
              vt.tiktok.com
            </span>
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-black">
              <svg
                width="12"
                height="13"
                viewBox="0 0 12 13"
                fill="#fff"
                aria-hidden="true"
              >
                <path d="M7.1 0h1.8c.2 1.4 1 2.3 2.4 2.4v1.8c-.9 0-1.7-.3-2.4-.8v4.3a4 4 0 1 1-4-4c.2 0 .4 0 .6.1v1.9a2.1 2.1 0 1 0 1.6 2V0z" />
              </svg>
            </span>
          </div>
          <div className="mt-[3px] flex justify-end">
            <MetaRow time={time} ticks />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Sent voice note: sender avatar with mic badge, play control, waveform. */
function VoiceNoteBubble({ time }: { time: string }) {
  const bars = [
    7, 13, 20, 26, 30, 23, 17, 27, 31, 25, 19, 13, 22, 28, 31, 26, 20, 14, 10,
    18, 25, 30, 23, 16, 11, 20, 27, 22, 15, 9, 6, 4,
  ];
  return (
    <div className="flex justify-end">
      <div
        className="relative flex w-[288px] items-center gap-[10px] rounded-[10px] py-[10px] pr-[12px] pl-[9px]"
        style={{ backgroundColor: OUT_BUBBLE }}
      >
        <Tail side="right" />

        <span className="relative h-[54px] w-[54px] shrink-0">
          <span className="block h-full w-full rounded-full bg-[linear-gradient(150deg,#c9b9a6_0%,#8d7a66_100%)]" />
          <span className="-right-[1px] absolute bottom-0 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#efe7de]">
            <svg
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="#54656f"
              aria-hidden="true"
            >
              <rect x="3.2" y="0" width="3.6" height="7" rx="1.8" />
              <path d="M0.8 5.2a.7.7 0 0 1 1.4 0 2.8 2.8 0 0 0 5.6 0 .7.7 0 0 1 1.4 0 4.2 4.2 0 0 1-3.5 4.1V12H4.3V9.3A4.2 4.2 0 0 1 .8 5.2z" />
            </svg>
          </span>
        </span>

        <svg
          width="15"
          height="18"
          viewBox="0 0 15 18"
          fill="#3b4a54"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M1 0.8 14 9 1 17.2z" />
        </svg>

        <span className="flex-1">
          <span className="flex h-[34px] items-center gap-[2.4px]">
            <span className="mr-[4px] h-[11px] w-[11px] shrink-0 rounded-full bg-[#111b21]" />
            {bars.map((height, i) => (
              <span
                // Height plus index, because the waveform repeats values. It
                // is static and decorative, so the index is safe here.
                key={`${height}-${i}`}
                className="w-[3px] shrink-0 rounded-full bg-[#93a5ad]"
                style={{ height }}
              />
            ))}
          </span>
          <span className="mt-[2px] flex items-center justify-between">
            <span
              className="text-[11.5px] tabular-nums"
              style={{ color: META }}
            >
              0:07
            </span>
            <MetaRow time={time} ticks />
          </span>
        </span>
      </div>
    </div>
  );
}

/** Plus, input pill with sticker button, camera, mic, and the home indicator. */
function Composer() {
  return (
    <div className="shrink-0">
      <div className="flex items-center gap-[13px] px-[16px] pt-[8px] pb-[6px]">
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          stroke="#111b21"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M13 3.5v19M3.5 13h19" />
        </svg>

        <span className="flex h-[45px] flex-1 items-center justify-end rounded-[23px] border border-black/[0.12] bg-white pr-[11px]">
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            stroke="#111b21"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M14.4 1.6H6.2a4.6 4.6 0 0 0-4.6 4.6v10.6a4.6 4.6 0 0 0 4.6 4.6h4.1l11.1-11.1V6.2a4.6 4.6 0 0 0-4.6-4.6z" />
            <path d="M10.3 21.4v-6.5a4.6 4.6 0 0 1 4.6-4.6h6.5" />
          </svg>
        </span>

        <svg
          width="27"
          height="24"
          viewBox="0 0 27 24"
          fill="none"
          stroke="#111b21"
          strokeWidth="1.7"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M1 7.4h6.3L9.6 4h7.8l2.3 3.4H26V22H1z" />
          <circle cx="13.5" cy="14.4" r="4.6" />
        </svg>

        <svg
          width="18"
          height="25"
          viewBox="0 0 18 25"
          fill="none"
          stroke="#111b21"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <rect x="5.4" y="1" width="7.2" height="13" rx="3.6" />
          <path d="M1 11.4a8 8 0 0 0 16 0M9 19.4V24" />
        </svg>
      </div>

      <div className="flex justify-center pt-[6px] pb-[9px]">
        <span className="h-[5px] w-[140px] rounded-full bg-black" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ screen */

// Named `ChatScreen` here, not `WhatsAppScreen`: the slug's primary export is
// the framed composition in whatsapp-screen.tsx, and this is the unframed
// 393x852 canvas it scales down.
export function ChatScreen() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        width: SCREEN.width,
        height: SCREEN.height,
        fontFamily: IOS_FONT,
        backgroundColor: WALLPAPER,
      }}
    >
      <div className="relative z-10 shrink-0" style={{ background: WALLPAPER }}>
        <StatusBar time="18:12" />
        <ChatHeader />
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Bottom-aligned, so the thread reads as scrolled to the newest. */}
        <div className="relative flex h-full flex-col justify-start gap-[8px] px-[16px] pt-[4px]">
          <DatePill label="Saturday" />

          <LinkPreviewBubble time="12:31" />

          <IncomingCard time="12:32" cta="Open swipe file" tail>
            {"Saved it to your “Inbox” swipe file ✅"}
          </IncomingCard>

          <VoiceNoteBubble time="12:34" />

          <IncomingCard time="12:34" cta="Open script" tail>
            {
              "Saved your voice note ✅ turned it into a draft script: “Later on I want to make a video”."
            }
          </IncomingCard>
        </div>
      </div>

      <Composer />
    </div>
  );
}
