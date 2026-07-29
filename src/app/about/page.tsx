import type { Metadata } from "next";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

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
      className="rounded-sm text-foreground underline decoration-foreground-ghost underline-offset-[3px] transition-colors duration-150 hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}

/* Grayscale at rest, colour on hover: the one piece of motion on this page.
   Kept on `filter` alone so nothing moves or reflows; the frames hold their
   size and only the image itself changes. */
function Photo({ src, alt, tall = false }: { src: StaticImageData; alt: string; tall?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      height={tall ? 278 : 133}
      className={`${tall ? "h-[278px]" : "h-[133px]"} w-auto flex-shrink-0 rounded-lg object-cover grayscale transition-[filter] duration-500 ease-out hover:grayscale-0`}
    />
  );
}

export default function About() {
  return (
    <>
      {/* Same column as the index, the case studies, the nav and the footer.
          The rows below scroll horizontally *inside* it rather than bleeding
          past it, since the page's right edge is the one thing that shouldn't
          move between pages. */}
      <main className="text-body max-w-measure-gutter mx-auto w-full px-6 pt-16 pb-24 md:pt-24">
        <div className="mb-10">
          {/* Was 30px/600, the heaviest type on the site, on its quietest
              page. Now matches the index h1: 24px at 500. */}
          <h1 className="text-headline mb-4 font-medium text-foreground">About Me</h1>

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
          <p className="max-w-measure text-body mb-4 text-foreground-muted">
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
          <p className="max-w-measure text-body mb-4 text-foreground-muted">
            I came at the work sideways: a degree in Electronics Engineering, finished in 2023, with
            CS50 somewhere in the middle of it in 2021, which is where I started actually building
            things rather than reading about them. The pull has never been a particular language or
            framework. It’s the stretch between not knowing how something works and having it
            running.
          </p>
          <p className="max-w-measure text-body mb-4 text-foreground-muted">
            I still work that way, which mostly means making the same thing twice: once to find out
            what it is, and again now that I know. This site is on its third pass. Most of what I{" "}
            <AboutLink href="/blog">write</AboutLink> is about the second one.
          </p>

          {/* The three things on the résumé the index has no row for, and
              shouldn’t: a two-month internship, a summer of teaching and a
              speaking club are not the same class of object as Instatus or
              Wholana, and giving them Experience rows would flatten that
              difference to make the list look longer.

              They belong on this page because they’re all the same kind of
              fact: what the work looked like before it looked like this.
              Prose rather than three more bullets, for the same reason the
              paragraphs above are prose. A bullet asserts; a sentence has to
              say what the thing was for.

              Each carries the detail that makes it checkable (the 15%, the
              thirty students, the three wins) and then the line about what it
              was actually worth, which is the part the résumé has no room
              for. */}
          <p className="max-w-measure text-body mb-4 text-foreground-muted">
            Some of it happened away from a keyboard. A summer at Orange Egypt in 2022, phasing
            legacy E1 links off cell sites in favour of VLAN networking and freeing about 15% of the
            bit rate, which is where I learned what infrastructure feels like when it is already
            carrying traffic and can’t be stopped to be fixed. A summer at ITI in 2023, teaching
            loops, conditionals and debugging to thirty-odd high schoolers, still the fastest way I
            know to find out whether I understand something. And Toastmasters Cairo, where I won
            Best Table Topics Speaker three times: two minutes on a subject you were handed ten
            seconds ago, which is a standup with none of the notes.
          </p>
        </div>

        {/* Rescued from the old index page, where it sat under a "See About"
            teaser. The index is text-only now (see docs/north-stars.md), but
            the photos themselves are worth keeping, and this is the page they
            were always describing. */}
        <div className="mb-10">
          <h2 className="text-headline mb-2 font-medium text-foreground">Photos</h2>
          {/* The line that ran under this collage on the old index. It reads
              as a caption here rather than a teaser, so it sits between the
              heading and the photos and drops to body-sm. */}
          <p className="max-w-measure text-body-sm mb-4 text-foreground-muted">
            When I’m not working, I’m at the gym 💪, trying out new coffeeshops ☕, or playing the
            violin 🎻.
          </p>
          <div className="flex gap-3 overflow-auto">
            <Photo
              src={museum}
              alt="The hieroglyph-carved entrance hall of the Grand Egyptian Museum in Giza, lit at night"
              tall
            />
            {/* 133 + 133 + 12px gap = the 278 of the two tall frames, so the
                stack's outer edges line up with its neighbours. */}
            <div className="flex flex-shrink-0 flex-col gap-3">
              <Photo src={me} alt="Omar Sadek standing in front of a blue mural at night" />
              <Photo src={sushi} alt="Platters of sushi, sashimi and maki rolls on a table" />
            </div>
            <Photo
              src={skatePark}
              alt="A floodlit concrete skate bowl at night, its wall painted with the graffiti “Roll With Soul”"
              tall
            />
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-headline mb-2 font-medium text-foreground">Books</h2>
          {/* Photos had a caption and the three rows under it did not, which
              left them as cover art with a heading: twelve images asserting
              taste and saying nothing about it. One line each, in the same
              13px-over-15px register the rest of the page uses. A cover is
              not an opinion; the sentence beside it is. */}
          <p className="max-w-measure text-body-sm mb-4 text-foreground-muted">
            Not a reading list, just the three I’ve gone back to. Sapiens for the argument that most of
            what feels permanent was invented by someone; Austen for the sentences; the Isaacson for
            how unpleasant taste can be up close.
          </p>
          <div className="flex gap-4 overflow-auto">
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg"
                src={sapiens}
                alt="Cover of Sapiens: A Brief History of Humankind by Yuval Noah Harari"
                height={200}
              />
              <h3 className="text-body-sm mt-2 font-medium text-foreground">Sapiens</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg"
                src={prideAndPrejudice}
                alt="Cover of Pride and Prejudice by Jane Austen"
                height={200}
              />
              <h3 className="text-body-sm mt-2 max-w-[100px] font-medium text-foreground">
                Pride And Prejudice
              </h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg"
                src={steveJobs}
                alt="Cover of the Steve Jobs biography by Walter Isaacson"
                height={200}
              />
              <h3 className="text-body-sm mt-2 font-medium text-foreground">Steve Jobs</h3>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-headline mb-2 font-medium text-foreground">Series & Films</h2>
          <p className="max-w-measure text-body-sm mb-4 text-foreground-muted">
            Two about systems too large for anyone inside them to see, and one about the handful of
            people who saw.
          </p>
          <div className="flex gap-4 overflow-auto">
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg"
                src={foundation}
                alt="Poster for the Apple TV+ series Foundation"
                height={200}
              />
              <h3 className="text-body-sm mt-2 font-medium text-foreground">Foundation</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg"
                src={dune}
                alt="Poster for Denis Villeneuve’s film Dune"
                height={200}
              />
              <h3 className="text-body-sm mt-2 font-medium text-foreground">Dune</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg"
                src={bigShort}
                alt="Poster for the film The Big Short"
                height={200}
              />
              <h3 className="text-body-sm mt-2 font-medium text-foreground">The Big Short</h3>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-headline mb-2 font-medium text-foreground">Music</h2>
          <p className="max-w-measure text-body-sm mb-4 text-foreground-muted">
            Mostly French, and mostly on while I work; lyrics I have to translate stay in the
            background instead of competing with whatever I’m reading.
          </p>
          <div className="flex gap-4 overflow-auto">
            <div className="flex-shrink-0">
              <Image
                className="h-[150px] rounded-lg"
                src={euphories}
                alt="Album cover of Euphories by Videoclub"
                height={150}
                width={150}
              />
              <h3 className="text-body-sm mt-2 font-medium text-foreground">Euphories</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[150px] rounded-lg"
                src={brol}
                alt="Album cover of Brol by Angèle"
                height={150}
                width={150}
              />
              <h3 className="text-body-sm mt-2 font-medium text-foreground">Brol</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[150px] rounded-lg"
                src={cadavreExquis}
                alt="Album cover of Cadavre exquis by Therapie Taxi"
                height={150}
                width={150}
              />
              <h3 className="text-body-sm mt-2 font-medium text-foreground">Cadavre exquis</h3>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
