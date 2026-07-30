"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { cn } from "@/lib/utils";

import type { SourceFile } from "./source";

/* ── Preview and code, over one surface ───────────────────────────────────
   The pattern every component registry uses, built to the house rules: no
   borders and no shadows, so the panel is separated from the page by a step
   along the lightness scale and nothing else. Sunken holds the tab row,
   raised holds the component, which is the same nesting a case-study figure
   uses.

   The preview stays mounted when the Code tab is showing, hidden with the
   `hidden` attribute rather than unmounted. Unmounting looks equivalent and
   is not: half of these components run an intro animation once on mount, so
   tabbing to the source and back would replay an animation the reader has
   already seen, which reads as a glitch rather than a demo. The source
   panel is the reverse, plain text with nothing to preserve, so it is only
   mounted while it is being read.

   `min-height` on the stage rather than a fixed height: these range from a
   90px signature pad to a full dashboard, and a fixed frame would either
   crop the tall ones or strand the short ones in a field of white. */

type Props = {
  preview: ReactNode;
  files: SourceFile[];
  /** Painted behind the component instead of the raised surface. For the
      pieces that carry their own field and would otherwise sit on white
      with no edge to them. */
  stage?: "raised" | "sunken";
};

export function ComponentShell({ preview, files, stage = "raised" }: Props) {
  const [tab, setTab] = useState(0);
  const [file, setFile] = useState(0);

  return (
    /* `data-tour` so the guided tour can scroll the preview into view without
       counting elements on the page around it. Static rather than a prop:
       every component page has exactly one of these, and the tour only ever
       needs the one on whichever page it is standing on. */
    <div data-tour="component-preview" className="bg-surface-sunken rounded-xl p-1.5">
      <div className="flex items-center justify-between px-2 pt-1 pb-2">
        <SlidingTabs tabs={["Preview", "Code"]} value={tab} onChange={setTab} />
        {tab === 1 && files.length > 1 && (
          <div className="flex gap-1">
            {files.map((f, i) => (
              <button
                key={f.name}
                type="button"
                onClick={() => setFile(i)}
                className={cn(
                  "text-micro rounded-md px-2 py-1 font-mono transition-colors",
                  i === file
                    ? "bg-surface-raised text-foreground"
                    : "text-foreground-faint hover:text-foreground",
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        hidden={tab !== 0}
        /* No base font-size or letter-spacing here, deliberately. Two of these
           components are drawn to metrics of their own (the WhatsApp thread is
           authored in real iOS points, the brand dial carries its source app's
           scale) and both rely on inheriting `normal` tracking, so a rung set
           on the stage would push a fractional letter-spacing into every one
           of their sizes and quietly change the thing they exist to show. A
           component that means to inherit its type says so at its own root
           instead; see color-pills. */
        className={cn(
          "grid min-h-[22rem] place-items-center overflow-hidden rounded-lg p-6",
          stage === "raised" ? "bg-surface-raised" : "bg-surface",
        )}
      >
        {/* Full width so a component that wants the whole stage can have it,
            while anything narrower still centres inside it. */}
        <div className="w-full">{preview}</div>
      </div>

      {tab === 1 && <CodePanel file={files[file]} />}
    </div>
  );
}

function CodePanel({ file }: { file: SourceFile }) {
  return (
    <div className="bg-surface-raised relative rounded-lg">
      <CopyButton code={file.code} />
      {/* `tabular-nums` off, `tab-size` 2: the sources are written with two
          space indents and a browser's default of 8 turns a nested JSX tree
          into a horizontal scroll for no reason. */}
      <pre className="text-meta max-h-[36rem] overflow-auto p-5 font-mono leading-relaxed [tab-size:2]">
        <code>{file.code}</code>
      </pre>
    </div>
  );
}

/* Icon to check, never a labelled pill and never a loading state: the write
   is synchronous as far as the reader is concerned, and a spinner on a
   clipboard call is theatre. A failed write says so instead of lying. */
function CopyButton({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const copy = useCallback(async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(code);
      ok = true;
    } catch {
      /* Denied permission, or an insecure context. Nothing to recover. */
    }
    setState(ok ? "done" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  }, [code]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={state === "failed" ? "Copy failed" : "Copy source"}
      className="text-foreground-faint hover:text-foreground absolute top-3 right-3 rounded-md p-1.5 transition-colors"
    >
      {state === "done" ? <CheckGlyph /> : <CopyGlyph />}
      {state === "failed" && <span className="text-micro ml-1.5">Copy failed</span>}
    </button>
  );
}

function CopyGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M10 5V3.5A1.5 1.5 0 0 0 8.5 2h-5A1.5 1.5 0 0 0 2 3.5v5A1.5 1.5 0 0 0 3.5 10H5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M3 8l3.2 3.2L12 4.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
