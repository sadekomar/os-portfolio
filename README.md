# sadekomar.com

The source of my personal site. Next.js 16 (App Router), React 19, TypeScript,
Tailwind v4, and a component layer I wrote rather than installed.

**Live:** [sadekomar.com](https://sadekomar.com)

## Why this is public

The site argues that I care about how an interface behaves. That argument is worth
more if you can read the behaviour. `src/components/` is the point of this repo —
the rest is scaffolding around it.

## Worth reading

| Path | What's there |
|---|---|
| `src/components/tour/` | A small guided-tour engine — `TourEngine`, a `driver`, and the tour itself as a declarative `script.ts`, with a synthetic cursor. The most involved thing here. |
| `src/components/command/` | ⌘K palette on `cmdk`: routes, blog posts and actions in one index, with markdown parsed into results. |
| `src/components/og/` | Per-route Open Graph images via `next/og` `ImageResponse`. |
| `src/components/ui/` | The hand-built primitives — `animated-text`, `sliding-tabs`, `success-mark`, `lightbox`, `row-preview`. |
| `src/components/showcase/` | The interactive demos: `expandable-features`, `decode-flow`. |
| `src/components/contributions/` | GitHub contribution graph and a "last shipped" line, fetched server-side. |
| `src/app/llms.txt/route.ts` | A generated `llms.txt` — the site describes itself to models, including what isn't finished yet. |
| `scripts/generate-last-modified.mjs` | Last-modified dates come from `git log` at build time, not frontmatter that rots. |

Motion is [`motion`](https://motion.dev); haptics on supported devices via `web-haptics`.

## Running it

```bash
pnpm install
pnpm dev
```

`GITHUB_CONTRIBUTIONS_API_URL` is the only environment variable, and the
contribution graph degrades gracefully without it.

## License

Code is MIT. The writing, the brand marks and the case-study content are not —
please don't redeploy this as your own site.

See [`LICENSE`](./LICENSE) for the MIT text and [`NOTICE.md`](./NOTICE.md) for what it does and doesn't cover.
