"use client";

import type React from "react";
import { TextMorph } from "torph/react";

// Colocated with DecodeFlow rather than reaching for the site-wide
// components/ui/animated-text, so the showcase directory stays a single
// self-contained unit that can be copied out whole.
//
// The original landing-side twin of apps/app's animated-text, on the same
// duration and easing so an in-place text swap reads identically on both sides
// of the signup boundary. Shared characters slide to their new position while
// only the changed ones cross-fade.
// Children must be a plain string, torph segments and animates it.
// Reduced-motion is respected by torph itself.
interface AnimatedTextProps {
  children: string;
  className?: string;
  as?: React.ElementType;
}

export function AnimatedText({ children, className, as }: AnimatedTextProps) {
  return (
    <TextMorph
      duration={300}
      ease="cubic-bezier(0.23, 1, 0.32, 1)"
      className={className}
      as={as}
    >
      {children}
    </TextMorph>
  );
}
