import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { CommandPaletteProvider } from "@/components/command/CommandPaletteProvider";
import { MobileMenu } from "@/components/navbar/MobileMenu";
import { NavBar } from "@/components/navbar/Navbar";
import { PrintIdentity } from "@/components/print/PrintIdentity";
import { NavHistory } from "@/components/sequence/NavHistory";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TourProvider } from "@/components/tour/TourProvider";
import { EMAIL } from "@/data/contact";
import { siteUrl } from "@/lib/site";
import { THEME_COLOR, THEME_SCRIPT } from "@/lib/theme";
import { Footer } from "../components/footer/Footer";

/* One source for Inter, self-hosted by next/font. The rsms.me stylesheet
   that used to sit at the top of globals.css was a second, render-blocking
   copy of the same family.

   `opsz` is Inter's optical-size axis (14–32). With font-optical-sizing:auto
   in globals.css the face itself adapts as type scales: apertures open and
   spacing loosens at caption sizes, and tighten at display sizes. That is
   real optical compensation from the type designer, not a letter-spacing
   approximation bolted on afterwards.

   No `fallback` array here, and that is load-bearing: passing one
   *replaces* the metric-matched face rather than extending it. Left
   alone, adjustFontFallback emits

     @font-face { font-family: "Inter Fallback"; src: local(Arial);
                  ascent-override: 90.44%; descent-override: 22.52%;
                  line-gap-override: 0%; size-adjust: 107.12%; }

   which is local Arial stretched onto Inter's own metrics, so the pre-swap
   render occupies the same box and the swap costs no layout shift.
   Naming system fonts here would delete that and reintroduce the shift.
   The system stack is appended after this in tailwind.config.ts. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  axes: ["opsz"],
  display: "swap",
});

/* The case-study voice. Every heading on a work page is set in Newsreader
   italic at 24/30, and a serif italic is the only thing on those pages that
   isn't Inter, which is what makes a section title read as a title without
   needing size or weight to say so.

   Only the italic 400 is loaded, because only the italic 400 is used: the
   roman would be a second face shipped for nothing. */
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Omar Sadek | Product Engineer & Founder",
    template: "%s | Omar Sadek",
  },
  /* Every string in this file names only things a visitor can actually find
     on the site. It used to advertise Univyr in the description, the
     keywords, and the `worksFor` graph: a company with no row in Work, no
     case study, and no mention anywhere a human could reach. Telling a
     crawler about an entity the page can't corroborate is the one kind of
     metadata error that survives being wrong. */
  description:
    "Omar Sadek is a full-stack engineer at Instatus and the founder of Wholana. Status page infrastructure by day, research tools for short-form creators by night.",
  keywords: [
    "Omar Sadek",
    /* "Product Engineer" is the title every headline slot on the site now
       states; the two below it are search terms rather than claims. A
       recruiter arrives typing "full-stack software engineer" far more often
       than "product engineer", and a keyword costs nothing where no reader
       sees it, so the noun the site leads with and the noun it is findable
       under do not have to be the same string. */
    "Product Engineer",
    "Full-Stack Software Engineer",
    "Design Engineer",
    "Wholana",
    "Instatus",
    "Status pages",
    "TikTok creator analytics",
    "Next.js",
    "TypeScript",
    "Founder",
  ],
  authors: [{ name: "Omar Sadek", url: siteUrl }],
  creator: "Omar Sadek",
  /* No `alternates` here, deliberately. Metadata is shallowly merged from
     the root segment down, and a field a child doesn't set is inherited
     verbatim, so a canonical declared at this level is not "the canonical
     of the site", it is the canonical of every page that never overrode it.
     /about and /blog were both telling Google they were duplicates of the
     homepage. A relative "/" would not have helped: it is resolved against
     metadataBase at the end of the merge, not per-segment, so every page
     would still have landed on the origin. The canonical belongs on the
     page that owns the URL, which is where each one now lives. */
  openGraph: {
    type: "profile",
    url: siteUrl,
    title: "Omar Sadek | Product Engineer & Founder",
    description:
      "Full-stack engineer at Instatus, founder of Wholana. I build interfaces, the data models under them, and the distance between the two.",
    siteName: "Omar Sadek",
    /* No `images` here. app/opengraph-image.tsx now generates the homepage
       card, and Next *appends* a file-convention image to whatever this
       object already lists rather than replacing it, so naming /me.png as
       well emits two og:image tags, and every scraper takes the first.
       The portrait would win and the designed card would never be seen. */
  },
  twitter: {
    card: "summary_large_image",
    title: "Omar Sadek | Product Engineer & Founder",
    description:
      "Full-stack engineer at Instatus, founder of Wholana. I build interfaces, the data models under them, and the distance between the two.",
    creator: "@omarsadekk",
    /* Same reason as above: the generated card is appended. */
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

/* One tag, no `media` variants. A media-scoped pair would be right for the
   two thirds of visitors on `system` and permanently wrong for anyone who
   overrode it, and the browser picks by media rather than by document
   order, so there is no later tag that could correct it. A single tag that
   ThemeProvider keeps in sync is right for everyone one frame after
   hydration, and the thing being one frame late is the tint of a mobile
   address bar. */
export const viewport: Viewport = {
  themeColor: THEME_COLOR.light,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: "Omar Sadek",
  url: siteUrl,
  image: `${siteUrl}/me.png`,
  jobTitle: "Product Engineer",
  description:
    "Full-stack engineer at Instatus and founder of Wholana. Builds status page infrastructure, chat integrations, and research tools for short-form creators.",
  /* The bare address, not MAILTO. Schema.org's `email` is a Text property
     holding an address; the `mailto:` scheme belongs to the href that
     wraps one, and everything else on the site wants the href, which is
     why contact.ts exports both. Google happens to strip the prefix, but
     the stricter consumers of this graph do not, and they read the whole
     literal as the address. */
  email: EMAIL,
  /* The same fact the index states in prose, in the form a crawler can read
     it. `homeLocation` rather than `address`: this is where I am, not a
     postal address anyone should be writing to, and Person.address invites
     the street line that deliberately isn't published anywhere here. */
  homeLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
  },
  knowsAbout: [
    "Full-Stack Development",
    "Design Engineering",
    "Status Page Infrastructure",
    "Chat Integrations",
    "TikTok Creator Analytics",
    "Next.js",
    "TypeScript",
    "UX/UI Design",
  ],
  /* Two organisations, because two is how many there are. TikTok News
     Network is real but it is a project rather than an employer, and it
     already has a case study of its own. `worksFor` is not the place to
     restate the Work list. */
  worksFor: [
    {
      "@type": "Organization",
      name: "Instatus",
      url: "https://instatus.com",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#wholana`,
      name: "Wholana",
      description:
        "Research and ideation platform for short-form video creators. It ingests TikToks, decodes their structure, and turns real data into ideas.",
      url: "https://wholana.com",
    },
  ],
  /* These are the same four profiles as data/contact.ts, in the same order.
     This list carried a `linkedin.com/in/omarsadek` that belongs to someone
     else. A `sameAs` pointing at a stranger is not a broken link, it is an
     instruction to a crawler to merge two people into one entity. */
  sameAs: [
    "https://www.linkedin.com/in/sadekomar/",
    "https://x.com/omarsadekk",
    "https://github.com/sadekomar",
    "https://tiktok.com/@omarsdek",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: "Omar Sadek",
  description:
    "Portfolio and writing of Omar Sadek, full-stack engineer at Instatus and founder of Wholana.",
  publisher: { "@id": `${siteUrl}/#person` },
  inLanguage: "en",
};

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${siteUrl}/#profilepage`,
  url: siteUrl,
  mainEntity: { "@id": `${siteUrl}/#person` },
  about: { "@id": `${siteUrl}/#person` },
  isPartOf: { "@id": `${siteUrl}/#website` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* `suppressHydrationWarning` because the script below writes `class` on
       this element before React ever sees it, so the server's markup and
       the client's DOM legitimately disagree on exactly one attribute of
       exactly this node. The flag does not cascade; it silences the
       mismatch here and nowhere else, which is the reason it belongs on
       `<html>` rather than anywhere further down. */
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Before anything paints. See the note in lib/theme.ts for why
            this is a string in the head rather than an effect: a theme
            decided after hydration is a white flash for every dark-mode
            visitor, on every navigation that costs a document load. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/* Smoothing, kerning and feature settings now live on `html` in
          globals.css so there is a single source of truth for them. */}
      <body className={`${inter.variable} ${newsreader.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personJsonLd, websiteJsonLd, profilePageJsonLd]),
          }}
        />
        {/* Above the providers and outside them: it renders nothing, it
            subscribes to the pathname, and every route change has to reach
            it, including the ones onto the index, where no pager exists to
            do the recording itself. See NavHistory. */}
        <NavHistory />
        <ThemeProvider>
          {/* Inside ThemeProvider, because "Switch to dark theme" is one of
              the rows and it has to reach the same store the footer switch
              writes to rather than carrying a second copy of that logic.
              Wrapping the nav as well as the content, because the ⌘K hint
              lives in the nav and needs the same context.

              Mounted once, here, and nowhere else: a palette is a property
              of the document, not of a page, so a per-route mount would
              mean the chord going dead for a frame on every navigation. */}
          {/* Outside the palette, and mounted once here for the same reason
              the palette is: the tour crosses from the index into a case
              study and back, so the video, the clock and the cue cursor have
              to outlive the route. A per-page mount would restart the
              recording mid-sentence on the one navigation the tour makes
              itself. Outside rather than inside so a palette row can reach
              `useTour` and offer the tour as a plainly labelled command,
              which is the accessible counterpart to the O in the heading. */}
          <TourProvider>
            <CommandPaletteProvider>
              <NavBar />
              {/* The nav below `sm`, docked at the bottom of the viewport
                  rather than in the header. Rendered here and not inside
                  NavBar because it is fixed to the window: nesting it in a
                  sticky header would only make it inherit that header's
                  stacking context for nothing. See navbar/MobileMenu.tsx. */}
              <MobileMenu />
              <div className="flex min-h-[calc(100lvh-3.5rem)] flex-col justify-between md:min-h-[calc(100lvh-4rem)]">
                {/* `display: none` on screen, so it costs the layout above
                    nothing and never reaches the accessibility tree. See
                    components/print/PrintIdentity.tsx and the print layer at
                    the foot of globals.css. */}
                <PrintIdentity />
                {children}
                <Footer />
              </div>
            </CommandPaletteProvider>
          </TourProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
