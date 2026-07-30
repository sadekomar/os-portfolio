import { ChatScreen, SCREEN } from "./chat-screen";
import { MobileFrame, SCREEN_WIDTH } from "./mobile-frame";

/**
 * The chat is authored at iPhone point sizes, then scaled into the frame. One
 * ratio, applied once at the root, is what lets every measurement inside
 * ChatScreen stay the real iOS number instead of a guess at small px.
 */
const SCALE = SCREEN_WIDTH / SCREEN.width;

/**
 * A WhatsApp thread inside a white iPhone frame: link preview, template card
 * with a CTA row, voice note with a waveform, composer, home indicator.
 *
 * `showStatusBar` is off because the chat draws its own iOS status bar at
 * point sizes; the frame's is for screenshots that arrive without one.
 */
export function WhatsAppScreen() {
  return (
    <div className="flex justify-center">
      <MobileFrame showStatusBar={false}>
        {/* The outer box is the *scaled* size, so the frame lays out around
            the phone's real footprint. The inner box is the unscaled canvas;
            `transform` does not affect layout, so without this pair the frame
            would size itself to 393x852 and the chat would float inside it. */}
        <div
          style={{
            width: SCREEN_WIDTH,
            height: Math.round(SCREEN.height * SCALE),
          }}
        >
          <div
            style={{
              transform: `scale(${SCALE})`,
              transformOrigin: "top left",
            }}
          >
            <ChatScreen />
          </div>
        </div>
      </MobileFrame>
    </div>
  );
}
