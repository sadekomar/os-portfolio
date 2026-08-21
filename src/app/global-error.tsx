"use client";

import { Inter } from "next/font/google";

import "./globals.css";

/* ── Root error boundary ──────────────────────────────────────────────────
   The one that catches a throw in the root layout itself, which is the case
   error.tsx cannot cover: if the layout is what failed, there is no layout
   left to render a friendly page inside. So this file replaces the document
   and has to bring its own `<html>` and `<body>`.

   That means everything the layout normally supplies is absent here and each
   piece has to be reconsidered rather than copied:

     globals.css   imported, or this renders as unstyled black-on-white
     Inter         re-declared; the layout's instance is not in scope
     Newsreader    dropped. It sets display type this page has none of
     theme script  dropped, deliberately (see below)
     nav, footer   dropped. Both are the layout that just failed

   No theme script. It is an inline blocking script that reads localStorage to
   set the class before first paint, and running the site's own machinery
   inside the handler for the site's machinery having thrown is how a broken
   page becomes a blank one. `color-scheme: light dark` in globals.css means
   the browser still honours the OS preference for the background and the
   form controls, so a reader in dark mode does not get flashed. They may get
   the light palette where they expected the dark one. That is an acceptable
   thing to be wrong about on the page that exists because something else
   was.

   A full reload rather than a `reset()`: if the root layout threw,
   re-rendering the same tree in place is the least likely thing to work. */
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export default function GlobalError() {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <main className="max-w-measure-gutter text-body mx-auto w-full px-6 pt-16 pb-24 md:pt-24">
          <h1 className="text-headline text-foreground mb-4 font-medium">This page broke</h1>
          <p className="max-w-measure text-body text-foreground-muted mb-8">
            Something failed before the page could be assembled. Reloading usually clears it.
          </p>
          {/* A plain anchor, not next/link, and the lint rule is wrong about
              this one case. Link navigates through the client router, which
              lives inside the tree that just threw, and its whole advantage
              is not reloading the document, when reloading the document is
              precisely the recovery being offered. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="ease-out-quint hover:bg-wash focus-visible:ring-ring/20 text-body text-foreground -mx-3 inline-block rounded-lg px-3 py-3 font-medium transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
          >
            Reload the home page
          </a>
        </main>
      </body>
    </html>
  );
}
