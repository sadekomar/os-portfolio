"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { SequencePager } from "@/components/sequence/Pager";
import { AnimatedText } from "@/components/ui/animated-text";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckIcon,
  ChevronDownIcon,
  ClaudeIcon,
  CopyIcon,
  CursorIcon,
  EllipsisIcon,
  GitHubIcon,
  GrokIcon,
  LinkIcon,
  LinkedInIcon,
  MarkdownIcon,
  OpenAIIcon,
  ShareIcon,
  V0Icon,
  XIcon,
} from "./toolbar-icons";

/* ── The page toolbar ─────────────────────────────────────────────────────
   Copy page, share, and the pager, in the top right of the content column.

   Everything here operates on the page's markdown rather than its DOM. That
   is what makes "copy" and "open in an assistant" the same feature rather
   than two: one document, served at a stable URL, handed either to the
   clipboard or to something that will fetch it. */

type Neighbour = { slug: string; title: string } | undefined;

type Props = {
  slug: string;
  title: string;
  /** The rendered markdown, passed in from the server so the copy is
      instant and does not depend on a fetch that can fail offline. */
  markdown: string;
  markdownUrl: string;
  githubUrl: string;
  prompt: string;
  prev: Neighbour;
  next: Neighbour;
};

export function PageToolbar({
  slug,
  title,
  markdown,
  markdownUrl,
  githubUrl,
  prompt,
  prev,
  next,
}: Props) {
  const copyMarkdown = useCopy(markdown);
  const copyLink = useCopy(`${origin()}/components/${slug}`);

  const openIn = [
    {
      label: "Open in v0",
      href: `https://v0.dev/chat/api/open?url=${encodeURIComponent(markdownUrl)}`,
      Icon: V0Icon,
    },
    {
      label: "Open in ChatGPT",
      href: `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
      Icon: OpenAIIcon,
    },
    {
      label: "Open in Claude",
      href: `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
      Icon: ClaudeIcon,
    },
    {
      label: "Open in Cursor",
      href: `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(prompt)}`,
      Icon: CursorIcon,
    },
    {
      label: "Open in Grok",
      href: `https://grok.com/?q=${encodeURIComponent(prompt)}`,
      Icon: GrokIcon,
    },
  ];

  const shareUrl = `${origin()}/components/${slug}`;
  const shareText = `${title}, a component from Omar Sadek's work`;

  return (
    <div className="flex items-center gap-1.5">
      {/* Split control: the label copies, the chevron opens the menu. Two
          buttons in one shell rather than one button that does both, so the
          common action never costs a menu. */}
      <div className="bg-surface-sunken flex items-center rounded-lg">
        <button
          type="button"
          onClick={copyMarkdown.run}
          aria-label={copyMarkdown.done ? "Copied" : "Copy page"}
          className="text-meta text-foreground-muted hover:text-foreground flex items-center gap-1.5 rounded-lg py-1.5 pr-2 pl-2.5 transition-colors"
        >
          {/* Copy scales down and blurs out, then the check scales up out of
              the same point (see `.t-icon-swap` in globals.css). Neither is
              ever unmounted: a glyph that mounts mid-move starts from
              whatever the browser painted first, which is how the swap turns
              into a blink. */}
          <span
            className="t-icon-swap"
            data-state={copyMarkdown.done ? "b" : "a"}
            aria-hidden="true"
          >
            <span className="t-icon" data-icon="a">
              <CopyIcon />
            </span>
            <span className="t-icon" data-icon="b">
              <CheckIcon />
            </span>
          </span>
          {/* The label goes below sm rather than wrapping: at 390 the row is
              a back link and five controls, and "Copy page" set over two
              lines makes the whole toolbar taller than the line it sits on.
              The glyph swapping to a check says the same thing.

              The slot is sized by the longer of the two labels, held open by
              an invisible copy of it, so "Copied" doesn't pull the button in
              and shove the pager left. The button is a click target that
              stays put under the pointer, which is worth more than the few
              pixels of trailing space the shorter label leaves. */}
          <span className="hidden justify-items-start whitespace-nowrap sm:grid">
            <span className="invisible col-start-1 row-start-1" aria-hidden="true">
              Copy page
            </span>
            <span className="col-start-1 row-start-1">
              <AnimatedText>{copyMarkdown.done ? "Copied" : "Copy page"}</AnimatedText>
            </span>
          </span>
        </button>
        <span aria-hidden="true" className="bg-foreground/10 h-4 w-px" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Page actions"
              className="text-foreground-faint hover:text-foreground rounded-lg px-1.5 py-1.5 transition-colors"
            >
              <ChevronDownIcon />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={markdownUrl} target="_blank" rel="noreferrer">
                <MarkdownIcon /> View as Markdown
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={githubUrl} target="_blank" rel="noreferrer">
                <GitHubIcon /> Open in GitHub
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {openIn.map(({ label, href, Icon }) => (
              <DropdownMenuItem key={label} asChild>
                <a href={href} target="_blank" rel="noreferrer">
                  <Icon /> {label}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton label="Share">
            <ShareIcon />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={copyLink.run}>
            {copyLink.done ? <CheckIcon /> : <LinkIcon />} {copyLink.done ? "Copied" : "Copy link"}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
            >
              <XIcon /> Share on X
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
            >
              <LinkedInIcon /> Share on LinkedIn
            </a>
          </DropdownMenuItem>
          {/* Only offered where the platform actually has a share sheet.
              Rendering it everywhere would put a row in the menu that does
              nothing on most desktops. */}
          <NativeShareItem title={title} text={shareText} url={shareUrl} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* The same pager the case studies and the posts carry: J/K, ←/→ and
          Escape out to the index, one tooltip that names the move and both
          its keys. `chip` because these two sit beside Copy page and Share,
          and a bare arrow in that row reads as unfinished. */}
      <SequencePager
        previous={prev}
        next={next}
        basePath="/components"
        indexPath="/components"
        labels={{ previous: "Previous component", next: "Next component" }}
        variant="chip"
      />
    </div>
  );
}

function ToolbarButton({
  label,
  children,
  ...props
}: { label: string } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      className="bg-surface-sunken text-foreground-muted hover:text-foreground rounded-lg p-2 transition-colors"
      {...props}
    >
      {children}
    </button>
  );
}

/* Whether the platform has a share sheet is external state that never
   changes, which is exactly what `useSyncExternalStore` is for: it reads
   `false` on the server and during hydration, then the real value, without
   a render pass that sets state on itself. `subscribe` returns a no-op
   teardown because there is no change to listen for. */
const subscribeNever = () => () => {};
const hasShareSheet = () => typeof navigator !== "undefined" && !!navigator.share;
const noShareSheetOnServer = () => false;

function NativeShareItem({ title, text, url }: { title: string; text: string; url: string }) {
  const supported = useSyncExternalStore(subscribeNever, hasShareSheet, noShareSheetOnServer);
  if (!supported) return null;

  return (
    <DropdownMenuItem
      onSelect={() => {
        void navigator.share({ title, text, url }).catch(() => {
          /* The user dismissed the sheet, which is not an error. */
        });
      }}
    >
      <EllipsisIcon /> Other app
    </DropdownMenuItem>
  );
}

/* `location.origin` in the browser, the deployed origin everywhere else, so
   a link copied from a preview deployment points at the preview rather than
   silently at production. */
function origin() {
  return typeof window === "undefined" ? "https://sadekomar.com" : window.location.origin;
}

function useCopy(value: string) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const run = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 1600);
    } catch {
      /* Denied, or an insecure context. The label stays as it was rather
         than claiming a copy that did not happen. */
    }
  }, [value]);

  return { done, run };
}
