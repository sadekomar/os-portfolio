import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* The type scale, named to tailwind-merge.

   tailwind-merge decides what a `text-*` class means by looking it up in its
   own tables, and it only ships Tailwind's stock scale. It has never heard of
   `text-micro`, so it falls through to the guess of last resort and files it
   under text *colour*, which puts it in the same conflict group as
   `text-foreground`. Two classes in one group means the later one wins, so
   every `cn("text-micro ...", "text-foreground")` in this codebase was
   quietly shipping without a font size and inheriting 16px from the body.

   It is a silent failure in both directions: nothing warns, and the class is
   in the source and in the generated CSS, so the only symptom is type that
   is the wrong size. Naming the scale here is the fix, and it is the whole
   fix: `cn` is the single door every conditional class list goes through.

   Anything added to `--text-*` in globals.css belongs in this list too. */
const FONT_SIZES = [
  "display",
  "title",
  "headline",
  "lede",
  "body",
  "body-sm",
  "meta",
  "micro",
  "tooltip",
  "case",
  "case-caption",
  "case-heading",
  "case-title",
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: FONT_SIZES }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
