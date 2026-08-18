"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ── Books that changed a specific project ────────────────────────────────
   These four used to live at the bottom of three case studies, under the
   heading "Books I read that were relevant to this project". That put a
   reading list in the retrospective slot — the place a reader looks for what
   you would do differently — and on the Loom page it sat directly after the
   post-mortem, so the last thing a two-year company said for itself was that
   its founder had read Clean Code.

   They are worth keeping and they belong here, next to the books read for
   their own sake. The distinction the page draws is the useful one: the row
   above is what I go back to, this is what changed a piece of work.

   Why a tooltip rather than the prose inline. Four paragraphs about four
   books, printed under a section that is already the page's third list, is
   longer than the section it sits in and reads as padding. The sentence is
   the interesting part but only for the reader who wants it, which is the
   one case a tooltip is actually the right control.

   The trigger is a real button, not a span with a tabIndex. Radix opens on
   focus as well as hover, so the note has to be reachable by keyboard, and a
   button is the only element that gets that for free. The dotted underline is
   the affordance — nothing else on this page has one, which is what makes it
   legible as "there is more here" rather than as a link.

   No hrefs. The covers above all link out to Goodreads, and I do not have
   verified Goodreads ids for these four; a guessed one is a broken link on a
   page whose entire argument is that it checked. Add them and these become
   links like the rest. */
type ProjectBook = {
  title: string;
  author: string;
  /* The project it changed, so the note has somewhere to land. */
  project: string;
  note: string;
};

const projectBooks: ProjectBook[] = [
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    project: "Loom Cairo",
    note: "Came in especially handy for structuring code and laying out everything when it came to OOP.",
  },
  {
    title: "Thoughts on Design",
    author: "Paul Rand",
    project: "Loom Cairo",
    note: "Rand on his own approach to design and how he tackles everything — the book that made me treat the storefront as a designed object rather than a rendered database.",
  },
  {
    title: "Thinking With Type",
    author: "Ellen Lupton",
    project: "Little Lads",
    note: "Instrumental in changing the way I perceive typography and its immense importance: modulation, line height, weight, x-height. Most of the type decisions on this site descend from it.",
  },
  {
    title: "Change by Design",
    author: "Tim Brown",
    project: "UNITAR",
    note: "Where the design thinking came from — the process that took the UNITAR research past the obvious culprits and landed it somewhere other than where it started.",
  },
];

export function ProjectBooks() {
  return (
    <TooltipProvider>
      <ul className="-mx-3">
        {projectBooks.map((book) => (
          <li key={book.title}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  /* The row treatment from the /blog index and the 404: same
                     -mx-3 bleed, same wash, same press dip. */
                  className="group ease-out-quint hover:bg-wash focus-visible:ring-ring/20 block w-full cursor-pointer rounded-lg px-3 py-2 text-left transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
                >
                  <span className="text-body text-foreground decoration-foreground-faint font-medium underline decoration-dotted underline-offset-4">
                    {book.title}
                  </span>
                  <span className="text-body-sm text-foreground-subtle ml-2">{book.author}</span>
                  <span className="text-body-sm text-foreground-faint ml-2">{book.project}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[18rem] text-left">{book.note}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </TooltipProvider>
  );
}
