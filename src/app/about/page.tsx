import type { Metadata } from "next";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import { ProjectBooks } from "@/components/about/ProjectBooks";

import { CaseStudyScroller, type ScrollerImage } from "@/components/case-study/Scroller";

import me from "../../../public/me.png";
import museum from "../../../public/museum.png";
import skatePark from "../../../public/skate.png";
import sushi from "../../../public/sushi.png";

import bigShort from "./(images)/big-short.jpg";
import brol from "./(images)/brol.jpeg";
import cadavreExquis from "./(images)/cadavre-exquis.jpeg";
import dune from "./(images)/dune.jpg";
import euphories from "./(images)/euphories.jpeg";
import foundation from "./(images)/foundation.jpg";
import prideAndPrejudice from "./(images)/pride-and-prejudice.jpg";
import sapiens from "./(images)/sapiens.jpg";
import steveJobs from "./(images)/steve-jobs.jpg";

/* Without this the page inherited the root layout's title and description
   verbatim, which is a duplicate title in every crawler's report and a
   result that says nothing about what is actually here. The title is the
   page part only; the root's `template` appends "| Omar Sadek".

   `openGraph` replaces the parent's object rather than merging into it, so
   everything the card needs has to be restated here, except the image.

   The image is deliberately *not* declared: there is now an
   opengraph-image.tsx in this segment, and Next appends a file-convention
   image to whatever `openGraph.images` this object already carries. Listing
   /me.png here as well would ship two og:image tags, and every scraper
   takes the first, so the portrait would win and the designed card would
   ride along unseen. Owning the URL and declaring nothing is what makes the
   generated card the card. */
export const metadata: Metadata = {
  title: "About",
  description:
    "Omar Sadek was born in Cairo and started programming with CS50 in 2021. The photos, books, series, films and music behind the work: Sapiens, Dune, Angèle.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    url: "/about",
    title: "About Omar Sadek",
    description:
      "Born in Cairo, programming since CS50. The photos, books, series, films and music behind the work.",
    siteName: "Omar Sadek",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Omar Sadek",
    description:
      "Born in Cairo, programming since CS50. The photos, books, series, films and music behind the work.",
    creator: "@omarsadekk",
  },
};

/* The index's inline-link treatment, restated rather than imported: the one
   on app/page.tsx is a local helper there too, and lifting either of them
   into a shared component would mean exporting a `Prose` that only ever has
   two call sites and one of them passes `download`. */
function AboutLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-foreground decoration-foreground-ghost hover:decoration-foreground focus-visible:ring-ring/20 rounded-sm underline underline-offset-[3px] transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}

/* The 640px column, restated per block rather than wrapped around the whole
   page. It used to sit on <main>, which was simpler and is why the photos
   below could never be more than a row inside it. The case studies and
   /talks are both built this way already: a full-width main, and each piece
   of prose carrying its own column, so anything that wants to run into the
   margins can. */
function Column({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`max-w-measure-gutter mx-auto w-full px-6 ${className}`}>{children}</div>;
}

/* The photos, in the order they read: the museum's hall is the widest thing
   here and sets the height of the strip, so it goes first and every frame
   after it lines up against a shape the eye has already taken in. */
const photos: ScrollerImage[] = [
  {
    src: museum,
    alt: "The hieroglyph-carved entrance hall of the Grand Egyptian Museum in Giza, lit at night",
  },
  {
    src: skatePark,
    alt: "A floodlit concrete skate bowl at night, its wall painted with the graffiti “Roll With Soul”",
  },
  { src: me, alt: "Omar Sadek standing in front of a blue mural at night" },
  { src: sushi, alt: "Platters of sushi, sashimi and maki rolls on a table" },
];

/* Books, posters and album sleeves arrive at three different aspect ratios,
   and laid out bare they read as a ragged pile: a 2:3 cover next to a 1:1
   sleeve has no shared edge for the eye to follow, and the rows below each
   other line up on nothing at all.

   The fix is the same one the rest of the site uses for grouping (see the
   "quiet tonal" note in globals.css): a recessed gray tile, no border and no
   shadow, with the artwork inset inside it. The tile is what makes a row
   regular: one ratio per row, so the covers in Books all match each other and
   the posters in Series & Films all match each other, whatever the actual
   images do. Print gets 2:3, records get 1:1, because a sleeve letterboxed
   into a portrait frame is a worse lie than two rows of different heights.
   The tile *is* the delimiter, which is why nothing here draws a line.

   Everything is a link out to the thing itself. A cover with no destination
   is just a picture of an opinion. */
type MediaItem = {
  src: StaticImageData;
  alt: string;
  title: string;
  meta: string;
  href: string;
};

function MediaRow({ items, ratio }: { items: MediaItem[]; ratio: "poster" | "sleeve" }) {
  const frame = ratio === "poster" ? "aspect-[2/3]" : "aspect-square";

  return (
    /* py-1 so the hover tile has somewhere to sit without the overflow
       container clipping it, and -mx-1/px-1 so the row's first tile still
       lines up with the column edge. */
    <div className="reveal reveal-row -mx-1 flex gap-3 overflow-auto px-1 py-1">
      {items.map((item) => (
        /* Two things move on press, and they move at different speeds on
           purpose: the whole card takes the 3% dip that says the click
           landed, at 150ms, because feedback is only feedback if it happens
           inside the same moment as the finger. The cover's zoom underneath
           it runs at 400ms, because that one is texture rather than an
           answer to anything. */
        <a
          key={item.title}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="group focus-visible:ring-ring/20 ease-out-quint w-[152px] flex-shrink-0 rounded-lg transition-transform duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.97]"
        >
          <div
            className={`bg-surface-sunken group-hover:bg-surface-recessed ease-out-quint ${frame} w-full rounded-lg p-2 transition-colors duration-200`}
          >
            {/* The clipping wrapper is what lets the cover grow inside the
                frame instead of over it: the gray keeps its 8px on all four
                sides while the artwork moves under it, which is the whole
                illusion. Scaled 4%, which is about the smallest step that
                still reads as movement at 136px wide. */}
            <div className="h-full w-full overflow-hidden rounded-sm">
              {/* object-cover, not contain: these images are all *nearly* 2:3
                  or 1:1 and never exactly, and contained they each sat at a
                  slightly different size with a different sliver of gray
                  showing, which is the ragged edge the frame was meant to fix.
                  Filling crops a few pixels off the long side and every image
                  in the row ends up the same block. */}
              <Image
                src={item.src}
                alt={item.alt}
                className="ease-out-quint h-full w-full object-cover transition-transform duration-[400ms] motion-safe:group-hover:scale-[1.04]"
              />
            </div>
          </div>
          <h3 className="text-body-sm text-foreground mt-2 font-medium">{item.title}</h3>
          <p className="text-body-sm text-foreground-muted">{item.meta}</p>
        </a>
      ))}
    </div>
  );
}

const books: MediaItem[] = [
  {
    src: sapiens,
    alt: "Cover of Sapiens: A Brief History of Humankind by Yuval Noah Harari",
    title: "Sapiens",
    meta: "Yuval Noah Harari",
    href: "https://www.goodreads.com/book/show/23692271-sapiens",
  },
  {
    src: prideAndPrejudice,
    alt: "Cover of Pride and Prejudice by Jane Austen",
    title: "Pride and Prejudice",
    meta: "Jane Austen",
    href: "https://www.goodreads.com/book/show/1885.Pride_and_Prejudice",
  },
  {
    src: steveJobs,
    alt: "Cover of the Steve Jobs biography by Walter Isaacson",
    title: "Steve Jobs",
    meta: "Walter Isaacson",
    href: "https://www.goodreads.com/book/show/11084145-steve-jobs",
  },
];

const screen: MediaItem[] = [
  {
    src: foundation,
    alt: "Poster for the Apple TV+ series Foundation",
    title: "Foundation",
    meta: "Apple TV+, 2021",
    href: "https://www.imdb.com/title/tt0804484/",
  },
  {
    src: dune,
    alt: "Poster for Denis Villeneuve’s film Dune",
    title: "Dune",
    meta: "Villeneuve, 2021",
    href: "https://www.imdb.com/title/tt1160419/",
  },
  {
    src: bigShort,
    alt: "Poster for the film The Big Short",
    title: "The Big Short",
    meta: "Adam McKay, 2015",
    href: "https://www.imdb.com/title/tt1596363/",
  },
];

const music: MediaItem[] = [
  {
    src: euphories,
    alt: "Album cover of Euphories by Videoclub",
    title: "Euphories",
    meta: "Videoclub",
    href: "https://open.spotify.com/album/1WfIjwnJ0aHiWCSkeSSeuV",
  },
  {
    src: brol,
    alt: "Album cover of Brol by Angèle",
    title: "Brol",
    meta: "Angèle",
    href: "https://open.spotify.com/album/6KSvWFf4g4PrIldtchJsTC",
  },
  {
    src: cadavreExquis,
    alt: "Album cover of Cadavre exquis by Therapie Taxi",
    title: "Cadavre exquis",
    meta: "Therapie Taxi",
    href: "https://open.spotify.com/album/4h6rdmYI9Tbjyi4hnhWkQb",
  },
];

export default function About() {
  return (
    <>
      {/* Full width, with the column moved down onto each block. The prose
          still lands in the same 640px as the index, the nav and the footer;
          what changed is that the photo strip below is no longer trapped
          inside it. That was a deliberate rule here once, on the grounds that
          the page's right edge shouldn't move between pages, and the strip is
          the deliberate exception: it is the same component the case studies
          open with, and its whole argument is being wider than the text. The
          media rows under it still scroll inside the column. */}
      <main className="text-body w-full pt-16 pb-24 md:pt-24">
        <Column className="mb-10">
          {/* Was 30px/600, the heaviest type on the site, on its quietest
              page. Now matches the index h1: 24px at 500. */}
          <h1 className="text-headline text-foreground mb-4 font-medium">About Me</h1>

          {/* These paragraphs were set at 500 with a 1.5 line-height and
              -0.02em tracking: body copy at medium weight reads as
              permanently emphasised, and display tracking at body size
              closes up the counters. Now 400 on the standard body step.

              The copy has been rewritten too, and for the same class of
              reason. "My journey with technology began" and "I love working
              on stuff and figuring out how to do things" are the prose
              equivalent of a skill bar: they occupy the space where a
              specific claim would go and assert enthusiasm instead, which
              every portfolio asserts and none of them evidence. The facts
              underneath are unchanged (the dates, the city, the degree,
              CS50) but each one now sits next to the thing it actually
              meant. See docs/north-stars.md on "Passionate about…". */}
          <p className="max-w-measure text-body text-foreground-muted mb-4">
            I was born on the 20th of April, 2000 in{" "}
            {/* No vertical padding: py-1 on an inline span inflates that
                one line's box, so the first line sat further from the
                second than the rest of the paragraph. The 1.7 line-height
                already leaves room for the highlight to read. */}
            <span className="bg-surface-sunken rounded-sm px-1.5">Cairo, Egypt.</span> When I was
            nine I found YouTube, and with it the fact that everything on a screen had been made by
            somebody. That was the hook, less the technology than the idea that all of it is
            someone’s decision.
          </p>
          <p className="max-w-measure text-body text-foreground-muted mb-4">
            I came at the work sideways: a BSc in Electronics &amp; Communications Engineering from
            Misr International University, 2018 to 2023, with CS50 somewhere in the middle of it in
            2021, which is where I started actually building things rather than reading about them. The pull has never been a particular language or
            framework. It’s the stretch between not knowing how something works and having it
            running.
          </p>
          <p className="max-w-measure text-body text-foreground-muted mb-4">
            I still work that way, which mostly means making the same thing twice: once to find out
            what it is, and again now that I know. This site is on its third pass. Most of what I{" "}
            <AboutLink href="/blog">write</AboutLink> is about the second one.
          </p>

          {/* This paragraph used to carry the Orange Egypt summer and the ITI
              teaching summer alongside the Toastmasters line. Both of those
              are jobs, and jobs are the one thing this page shouldn’t be
              arguing: the Experience rows and the case studies say what the
              work was, in more detail and with the evidence attached, and a
              second telling here could only ever be a shorter, vaguer version
              of a page one click away.

              Toastmasters stays because it isn’t work. It’s the same kind of
              fact as the photos and the books below: something about how I
              think, offered without a claim about output. */}
          <p className="max-w-measure text-body text-foreground-muted mb-4">
            Somewhere in there I picked up Toastmasters Cairo, and won Best Table Topics Speaker
            three times: two minutes on a subject you were handed ten seconds ago. It is the closest
            thing I know to thinking out loud on purpose.
          </p>
        </Column>

        {/* Rescued from the old index page, where it sat under a "See About"
            teaser. The index is text-only now (see docs/north-stars.md), but
            the photos themselves are worth keeping, and this is the page they
            were always describing. */}
        <section className="mb-10">
          <Column>
            <h2 className="text-headline text-foreground mb-2 font-medium">Photos</h2>
            {/* The line that ran under this collage on the old index. It reads
                as a caption here rather than a teaser, so it sits between the
                heading and the photos and drops to body-sm.

                mb-1 rather than the mb-4 the other captions carry: the strip
                brings its own 12px of inset, and 4 + 12 is the 16 every other
                caption sits on. The gap is the same, it is just paid for by
                two elements now.

                The emoji are gone. They were doing the work the sentence
                should do, and three of them in one line of 13px copy is the
                only place on the site where the type stops being type. */}
            <p className="max-w-measure text-body-sm text-foreground-muted mb-1">
              When I’m not working, I’m at the gym, trying out new coffeeshops, or playing the
              violin.
            </p>
          </Column>
          {/* The case studies' track, unchanged: full bleed, height equalised
              across mixed aspects, native snap, arrows for a mouse and a
              lightbox on click. The old hand-built collage was doing a worse
              version of the first two of those, with the frames' heights
              hardcoded to 278 and 133 so that a stack of two would add up to
              one tall one, which held only for those four photos at those
              proportions.

              What is lost in the move is the grayscale-until-hover treatment.
              It belonged to a static collage; on a strip you can click into,
              desaturating the photo you are being invited to open is an odd
              thing to do, and the lightbox owns the image element now. */}
          {/* `reveal-fade`, not `reveal`: the travelling variant animates
              `translate`, which would make this wrapper the containing block
              for the lightbox's fixed clone and leave a clicked photo opening
              at its own size. See the note in globals.css. */}
          <div className="reveal-fade">
            <CaseStudyScroller images={photos} maxTileHeight={480} />
          </div>
        </section>

        <Column className="mb-10">
          <h2 className="text-headline text-foreground mb-2 font-medium">Books</h2>
          {/* Photos had a caption and the three rows under it did not, which
              left them as cover art with a heading: twelve images asserting
              taste and saying nothing about it. One line each, in the same
              13px-over-15px register the rest of the page uses. A cover is
              not an opinion; the sentence beside it is. */}
          <p className="max-w-measure text-body-sm text-foreground-muted mb-4">
            Not a reading list, just the three I’ve gone back to. Sapiens for the argument that most
            of what feels permanent was invented by someone; Austen for the sentences; the Isaacson
            for how unpleasant taste can be up close.
          </p>
          <MediaRow items={books} ratio="poster" />

          {/* The four that came off the case studies. Kept separate from the
              row above rather than folded into it, because the line above says
              "not a reading list" and means it: those three are re-reads, these
              four each changed one piece of work. The note is on a tooltip so
              the distinction costs a reader who does not care nothing at all. */}
          <h3 className="text-body text-foreground mt-8 mb-2 font-medium">
            And four that changed a project
          </h3>
          <p className="max-w-measure text-body-sm text-foreground-muted mb-2">
            These used to sit at the bottom of the case studies they belong to. Hover or focus one
            for what it actually changed.
          </p>
          <ProjectBooks />
        </Column>

        <Column className="mb-10">
          <h2 className="text-headline text-foreground mb-2 font-medium">Series & Films</h2>
          <p className="max-w-measure text-body-sm text-foreground-muted mb-4">
            Two about systems too large for anyone inside them to see, and one about the handful of
            people who saw.
          </p>
          <MediaRow items={screen} ratio="poster" />
        </Column>

        <Column className="mb-10">
          <h2 className="text-headline text-foreground mb-2 font-medium">Music</h2>
          <p className="max-w-measure text-body-sm text-foreground-muted mb-4">
            Mostly French, and mostly on while I work; lyrics I have to translate stay in the
            background instead of competing with whatever I’m reading.
          </p>
          <MediaRow items={music} ratio="sleeve" />
        </Column>
      </main>
    </>
  );
}
