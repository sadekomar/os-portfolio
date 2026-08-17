import type { Metadata } from "next";

import Link from "next/link";

import { Icon, iconGap } from "@/components/icon/Icon";
import { YouTube } from "@/components/ui/youtube";
import { talks } from "@/data/talks";

export const metadata: Metadata = {
  title: "Talks",
  description:
    "Talks, panels and pitches by Omar Sadek: moderating at the Creative Industry Summit, speaking with E7kky, and pitching Loom Cairo at AUC Venture Lab.",
  alternates: { canonical: "/talks" },
  /* Declared, not inherited. The root's openGraph object is copied whole
     into any page that doesn't set its own, so /talks was unfurling as the
     homepage. `noindex` below doesn't cover this: robots directives govern
     crawlers, and the thing that actually renders this card is a link
     pasted into a DM, which reads the tags and ignores the directive. The
     card has to be right before the page is indexable.

     No `images`: opengraph-image.tsx in this segment supplies it, and a URL
     listed here would be emitted first and win. */
  openGraph: {
    type: "website",
    url: "/talks",
    /* Suffixed for the same reason as /blog; see the note there. */
    title: "Talks | Omar Sadek",
    description:
      "Talks, panels and pitches: moderating at the Creative Industry Summit, speaking with E7kky, and pitching Loom Cairo at AUC Venture Lab.",
    siteName: "Omar Sadek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talks | Omar Sadek",
    description:
      "Talks, panels and pitches: moderating at the Creative Industry Summit, speaking with E7kky, and pitching Loom Cairo at AUC Venture Lab.",
    creator: "@omarsadekk",
  },
  /* This carried `robots: { index: false, follow: true }` for as long as
     data/talks.ts had a literal "TODO" string inside a description array, on
     the reasoning that the worst thing a search result can lead with is the
     word TODO. That placeholder is gone — the Summit panel now names its four
     panellists, sourced to a panellist's own recap — so the directive goes
     with it and the sitemap entry comes back.

     The stated reason had also gone stale, which is worth recording as a
     caution about comments that outlive their subject: it claimed "two of the
     three entries still carry a placeholder date, and one a placeholder
     title". There are four entries, every date is real, and three of the four
     are corroborated outside this repo — a deck's own traction slide, a recap
     post plus a weekday check, and a panellist's account. The noindex rested
     on one description line, not on the dates or the titles. */
};

/* Talks are artifacts, the same class of thing as the case studies: a real
   session, in a real room, with a recording that either exists or doesn't.
   So this page borrows the case study's geometry rather than the index's,
   the video bleeds past the prose column to the same 1036px the scroller
   tracks use, and the words sit back in the 640px measure underneath it.

   The video goes *above* the description, not below. On a page about
   speaking, the recording is the evidence and the paragraph is the caption;
   putting the prose first would make the reader take the talk on trust
   before being shown it.

   An entry without a recording still renders: heading, meta, prose, link.
   The page is a speaking history that happens to embed video where video
   exists, not a video gallery that a talk has to earn its way into. */
export default function Talks() {
  return (
    <main className="text-body pt-16 pb-24 md:pt-24">
      {/* The header is in the column; only the videos below reach past it. */}
      <div className="max-w-measure-gutter mx-auto w-full px-6">
        <h1 className="text-headline mb-4 font-medium text-foreground">Talks</h1>
        <p className="max-w-measure text-body text-foreground-muted">
          Rooms I’ve stood in: a live show I hosted, a panel I moderated, an investor pitch, and a
          demo day. Recordings where they exist.
        </p>
      </div>

      {/* space-y rather than a margin on each item: the gap between two talks
          belongs to the list, and an item shouldn't carry trailing space it
          doesn't need when it's the last one. */}
      <div className="mt-14 space-y-16">
        {talks.map((talk, i) => (
          /* Only the first entry's poster is preloaded, and it's indexed off
             the list rather than hardcoded to a slug so reordering `talks`
             can't leave the flag on an embed that is now halfway down the
             page. */
          <TalkEntry key={talk.slug} talk={talk} priority={i === 0} />
        ))}
      </div>
    </main>
  );
}

function TalkEntry({ talk, priority }: { talk: (typeof talks)[number]; priority?: boolean }) {
  /* The meta line, assembled from what's actually known. A talk missing its
     location shouldn't leave a dangling separator, and one missing its date
     shouldn't render an empty slot; the row is as long as the facts are. */
  const meta = [talk.role, talk.event, talk.location, talk.date].filter(Boolean).join(" · ");

  return (
    <article id={talk.slug} className="scroll-mt-24">
      {talk.video && (
        /* The single-image scroller's frame: 12px of air on every side, and
           the embed centred inside it. Reaching for CaseStudyFigure instead
           isn't an option, since it takes StaticImageData and would have to grow a
           video branch to be used here.

           No max-width at this level, which is the one departure from the
           scroller: how wide a video may run is a property of the video's own
           resolution rather than of the page, so YouTube caps and centres
           itself. A screenshot committed to the repo has no equivalent
           constraint, which is why the scroller can hardcode 1036. */
        <div className="mb-6 w-full p-3">
          <YouTube
            {...talk.video}
            id={talk.video.youtubeId}
            title={`${talk.title}, ${talk.event}`}
            priority={priority}
          />
        </div>
      )}

      <div className="max-w-measure-gutter mx-auto w-full px-6">
        <h2 className="text-lede mb-1 font-medium text-foreground">{talk.title}</h2>
        {/* 13px muted, the same meta step the case-study headers use. */}
        <p className="text-meta mb-4 text-foreground-faint">{meta}</p>

        {talk.description.map((paragraph, i) => (
          <p key={i} className="max-w-measure text-body-sm mb-3 text-foreground-muted">
            {paragraph}
          </p>
        ))}

        {talk.link && <TalkLink {...talk.link} />}
      </div>
    </article>
  );
}

/* Internal links stay internal. A /work/… href routed through an <a> with
   target="_blank" would drop the client-side navigation and open the site in
   a second tab, which is the wrong behaviour for a pointer at another page
   of the same portfolio. */
function TalkLink({ label, href }: { label: string; href: string }) {
  const external = !href.startsWith("/");
  const className = `${iconGap("inline")} text-body-sm inline-flex items-center rounded-sm text-foreground-subtle underline decoration-foreground-ghost underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground-subtle focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <Icon name="external" className="text-foreground-faint" />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
