import { Fragment } from "react";

import Link from "next/link";

import type { Block } from "@/data/posts";

/* ── The post renderer ────────────────────────────────────────────────────
   A post is a list of blocks, not a string of HTML and not MDX. The reason
   is the same one that made projects.ts a data file: the content should not
   be able to invent a heading level, a colour, or a width that the rest of
   the site doesn't have. Four block types is the whole vocabulary, and
   anything a post can't say in them is a gap in the system rather than a
   licence to reach for a div.

   Inline formatting is three things (`code`, *emphasis*, and
   [label](href)) parsed by one regex below. Bold is deliberately not among
   them: a bold run inside a paragraph is almost always a sentence that
   should have been rewritten, and at this measure it reads as shouting. The
   emphasis is Inter's own italic, which does not collide with the serif
   italic that means "heading": different face, different size, and they
   never appear in the same element. */

/* One alternation, one pass, and the order inside it matters: `code` comes
   first so a backticked run containing an asterisk is consumed whole rather
   than being reopened as emphasis. The capturing group is what makes
   `split` return the delimiters alongside the text between them. */
const INLINE = /(`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

function inline(text: string) {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            /* 0.9em rather than a fixed px: a chip inside a 16px paragraph
               and one inside a 24px heading should both sit a notch under
               the type they interrupt, and only a relative size does that
               without a second class. */
            className="rounded-sm bg-surface-recessed px-1 py-0.5 font-mono text-[0.9em] text-foreground"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }

      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (link) {
        const [, label, href] = link;

        /* Internal hrefs stay internal. Routing a /work/… link through an
           <a target="_blank"> would drop the client navigation and open the
           site in a second tab. Same rule as talks/page.tsx. */
        if (href.startsWith("/") || href.startsWith("#")) {
          return (
            <Link key={i} href={href} className="case-link">
              {label}
            </Link>
          );
        }

        return (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="case-link">
            {label}
          </a>
        );
      }

      return <Fragment key={i}>{part}</Fragment>;
    });
}

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h":
            return (
              /* The same serif italic at 24/30 the case studies use for a
                 section title. It is the site's one non-Inter face and it
                 means exactly one thing: a level above the prose. */
              <h2
                key={i}
                className="mt-6 font-serif text-case-heading italic text-foreground first:mt-0"
              >
                {block.text}
              </h2>
            );

          case "p":
            return (
              <p key={i} className="text-case text-foreground-muted">
                {inline(block.text)}
              </p>
            );

          case "list":
            return (
              /* Markers are outside the measure and grey, so the column of
                 text keeps the same left edge as every paragraph around it
                 and the bullets read as punctuation rather than as content. */
              <ul key={i} className="flex list-outside list-disc flex-col gap-2 pl-5 text-case">
                {block.items.map((item, j) => (
                  <li key={j} className="text-foreground-muted marker:text-foreground-ghost">
                    {inline(item)}
                  </li>
                ))}
              </ul>
            );

          case "code":
            return (
              <figure key={i} className="flex flex-col gap-2">
                {/* Recessed, not raised: a code block is a quotation from
                    somewhere else in the system, which is the de-emphasised
                    state the recess exists for. No border, no traffic
                    lights, no filename chrome. The caption below says what
                    it is, in words. */}
                <pre className="overflow-x-auto rounded-lg bg-surface-recessed p-4 font-mono text-[0.8125rem] leading-[1.7] text-foreground-muted">
                  <code>{block.code}</code>
                </pre>
                {block.caption && (
                  <figcaption className="text-case-caption text-foreground-faint">
                    {inline(block.caption)}
                  </figcaption>
                )}
              </figure>
            );
        }
      })}
    </>
  );
}
