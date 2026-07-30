/* Brand and UI glyphs, drawn here rather than pulled from an icon package.
   Eight of these are third-party wordmarks that no icon set carries as a
   matched pair, and the alternative was two dependencies to get one row of
   a menu. All are 16px on a 16 grid, single path where possible, and
   inherit `currentColor` so the menu's own highlight state drives them. */

type Props = React.SVGProps<SVGSVGElement>;

const base = { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": true } as const;

export function CopyIcon(props: Props) {
  return (
    <svg {...base} fill="none" {...props}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon(props: Props) {
  return (
    <svg {...base} fill="none" {...props}>
      <path
        d="M3.5 8.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon(props: Props) {
  return (
    <svg {...base} fill="none" {...props}>
      <path
        d="M4.5 6.5L8 10l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShareIcon(props: Props) {
  return (
    <svg {...base} fill="none" {...props}>
      <path
        d="M8 10.5V2.5m0 0L5.5 5M8 2.5L10.5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 9v3A1.5 1.5 0 0 0 5 13.5h6a1.5 1.5 0 0 0 1.5-1.5V9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* The pager's two arrows used to be drawn here, at 1.4 on a 16 grid. They
   were a second drawing of `sibling` in the glyph registry, which is the one
   that carries the site's stroke curve and gets mirrored rather than
   redrawn, and the pager uses that now. See sequence/Pager.tsx. */

export function LinkIcon(props: Props) {
  return (
    <svg {...base} fill="none" {...props}>
      <path
        d="M6.5 9.5a2.5 2.5 0 0 0 3.6.1l2-2a2.5 2.5 0 0 0-3.5-3.6l-1 1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M9.5 6.5a2.5 2.5 0 0 0-3.6-.1l-2 2a2.5 2.5 0 0 0 3.5 3.6l1-1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EllipsisIcon(props: Props) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <circle cx="3.5" cy="8" r="1.15" />
      <circle cx="8" cy="8" r="1.15" />
      <circle cx="12.5" cy="8" r="1.15" />
    </svg>
  );
}

export function MarkdownIcon(props: Props) {
  return (
    <svg {...base} fill="none" {...props}>
      <rect x="1" y="3.5" width="14" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M3.5 10.5V5.8l2 2.2 2-2.2v4.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.75 5.8v4.7m0 0L9.3 9M10.75 10.5L12.2 9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GitHubIcon(props: Props) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M8 .8a7.2 7.2 0 0 0-2.28 14.03c.36.07.49-.16.49-.35v-1.2c-2 .43-2.43-.97-2.43-.97-.33-.83-.8-1.06-.8-1.06-.65-.45.05-.44.05-.44.72.05 1.1.74 1.1.74.64 1.1 1.68.78 2.09.6.06-.47.25-.79.45-.97-1.6-.18-3.28-.8-3.28-3.56 0-.79.28-1.43.74-1.93-.07-.18-.32-.91.07-1.9 0 0 .6-.2 1.98.73a6.9 6.9 0 0 1 3.6 0c1.38-.93 1.98-.73 1.98-.73.4.99.15 1.72.07 1.9.46.5.74 1.14.74 1.93 0 2.77-1.69 3.38-3.3 3.56.26.22.49.66.49 1.33v1.97c0 .19.13.42.5.35A7.2 7.2 0 0 0 8 .8Z" />
    </svg>
  );
}

export function V0Icon(props: Props) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M1 4.2h2.05L5 10.1l1.95-5.9H9L6.1 12H3.9L1 4.2Z" />
      <path d="M12.1 3.9c1.6 0 2.9 1.35 2.9 3.05v2.1c0 1.7-1.3 3.05-2.9 3.05S9.2 10.75 9.2 9.05v-2.1c0-1.7 1.3-3.05 2.9-3.05Zm0 1.7c-.6 0-1.05.55-1.05 1.35v2.1c0 .8.45 1.35 1.05 1.35s1.05-.55 1.05-1.35v-2.1c0-.8-.45-1.35-1.05-1.35Z" />
    </svg>
  );
}

export function OpenAIIcon(props: Props) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.15" {...props}>
      <path d="M8 2.2 11.7 4.3v4.2L8 10.6 4.3 8.5V4.3L8 2.2Z" strokeLinejoin="round" opacity=".9" />
      <path d="M8 5.4v5.2m0 0-2.6 1.5M8 10.6l2.6 1.5" strokeLinecap="round" opacity=".9" />
      <circle cx="8" cy="8" r="6.4" opacity=".55" />
    </svg>
  );
}

export function ClaudeIcon(props: Props) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M8 1.3c.26 0 .47.2.48.46l.16 3.06 1.9-2.28a.48.48 0 0 1 .77.56L9.72 5.62l2.75-1.16a.48.48 0 0 1 .4.87l-2.78 1.4 3.05.35a.48.48 0 0 1-.05.96l-3.06-.16 2.28 1.9a.48.48 0 0 1-.56.77l-2.52-1.59 1.16 2.75a.48.48 0 0 1-.87.4l-1.4-2.78-.35 3.05a.48.48 0 0 1-.96-.05l.16-3.06-1.9 2.28a.48.48 0 0 1-.77-.56l1.59-2.52-2.75 1.16a.48.48 0 0 1-.4-.87l2.78-1.4-3.05-.35a.48.48 0 0 1 .05-.96l3.06.16-2.28-1.9a.48.48 0 0 1 .56-.77l2.52 1.59-1.16-2.75a.48.48 0 0 1 .87-.4l1.4 2.78.35-3.05A.48.48 0 0 1 8 1.3Z" />
    </svg>
  );
}

export function CursorIcon(props: Props) {
  return (
    <svg {...base} fill="none" {...props}>
      <path
        d="M8 1.6 14 5v6l-6 3.4L2 11V5l6-3.4Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M8 8 14 5M8 8v6.4M8 8 2 5" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
    </svg>
  );
}

export function GrokIcon(props: Props) {
  return (
    <svg {...base} fill="none" {...props}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
      <path d="M11.4 4.6 4.6 11.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function XIcon(props: Props) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M9.44 6.96 14.4 1.3h-1.18L8.92 6.22 5.48 1.3H1.5l5.2 7.44-5.2 5.96h1.18l4.55-5.2 3.63 5.2h3.98L9.44 6.96Zm-1.61 1.84-.53-.74-4.19-5.87h1.8l3.39 4.74.53.74 4.4 6.16h-1.8L7.83 8.8Z" />
    </svg>
  );
}

export function LinkedInIcon(props: Props) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M13.6 1H2.4A1.4 1.4 0 0 0 1 2.4v11.2A1.4 1.4 0 0 0 2.4 15h11.2a1.4 1.4 0 0 0 1.4-1.4V2.4A1.4 1.4 0 0 0 13.6 1ZM5.2 12.8H3.3V6.4h1.9v6.4Zm-.95-7.3a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Zm8.55 7.3h-1.9V9.5c0-.85-.3-1.4-1.05-1.4-.57 0-.91.39-1.06.76-.05.13-.07.32-.07.5v3.44H6.83s.02-5.58 0-6.4h1.89v.9c.25-.38.7-.94 1.72-.94 1.25 0 2.19.82 2.19 2.58v3.86Z" />
    </svg>
  );
}
