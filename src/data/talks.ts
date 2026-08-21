/* Source of truth for /talks. The page and the sitemap both read it, so a
   talk can't be added to one and forgotten in the other.

   Ordered by hand, strongest first, and not by date. A speaking list is
   read top-down and abandoned partway, so the entry with the best recording
   and the most to say goes first regardless of when it happened. The array
   order *is* the page order; there is no sort anywhere downstream, so
   moving an entry here is the whole edit.

   ── Filling in `video` ───────────────────────────────────────────────────
   `youtubeId` is the 11-character id in the watch URL, and nothing else:

     https://www.youtube.com/watch?v=n8Qt1fxmd90   →   "n8Qt1fxmd90"
     https://youtu.be/n8Qt1fxmd90?t=540            →   … plus start: 540

   `width` and `height` are the *source* resolution of the upload, not the
   size you want it rendered at, and they are not decoration. The page reads
   them for two decisions it cannot make without them:

     aspect ratio  The frame is set to the source's own ratio, not to the
                   nearest familiar one. A TNN segment is 9:16 because it was
                   shot for a phone, and the Dell demo day is 2.22:1 because
                   the room was filmed ultrawide; snapping either to 16:9
                   bakes in black bars that the frame then has to display.

     upscale cap   The frame is never rendered wider than the source. A
                   848×480 upload stretched across the 1036px track is a
                   soft, obviously-enlarged image sitting next to crisp
                   screenshots, and no amount of poster-quality work fixes
                   it. The pixels were never there.

   Read them straight off the file rather than guessing:

     yt-dlp --skip-download --print "%(width)sx%(height)s" <url>

   `poster` is which thumbnail YouTube actually generated, and it has to be
   recorded rather than inferred. The obvious rule, "maxresdefault exists
   when the source was at least 1280 on its long edge", is wrong, and this
   list contains its counterexample: the Creative Industry Summit clip is a
   576×1024 Short and still has a 1280×720 maxres, because Shorts get one
   regardless. Guessing low wastes the good thumbnail; guessing high spends a
   round trip on a 404 and prints a red console error on every page load.
   Both are avoidable by asking once, here, with curl:

     curl -o /dev/null -sw "%{http_code}\n" \
       https://i.ytimg.com/vi/<id>/maxresdefault.jpg

   200 → "maxresdefault". 404 → "sddefault", which every video has.

   A talk with no `video` still renders, as its heading, meta and
   description, with the external link if it has one. That's deliberate: an
   entry is allowed to exist before its recording does, and the page should
   not be blocked on an upload. Add the video later and the embed appears.

   If a recording only exists on LinkedIn or on an organiser's site, the
   move is to upload your own copy to YouTube (unlisted is fine, unlisted
   videos embed exactly like public ones) and put that id here. LinkedIn
   has no embeddable player, so the alternative is a link-out, which is a
   worse version of the same page. */

export type Talk = {
  /* Anchor target, so a single talk can be linked to directly. */
  slug: string;
  /* The talk itself, not the event. If the session had no title, describe
     what it actually was. "Panel: <subject>" beats reusing the event name
     as a title and saying nothing. */
  title: string;
  /* Where it happened. Reads as the credential; the title reads as the work. */
  event: string;
  /* What you did there. Speaking, hosting and moderating are different jobs
     and the page should not let a reader assume the more flattering one. */
  role: "Speaker" | "Host" | "Moderator" | "Panellist" | "Pitch";
  /* Free text rather than a Date: some of these are known to the month and
     inventing a day to satisfy a type is how a portfolio ends up asserting
     something it can't defend. */
  date: string;
  location?: string;
  video?: {
    youtubeId: string;
    /* Source resolution. See the note above; the page needs both. */
    width: number;
    height: number;
    /* Which thumbnail YouTube generated. Probed, not inferred; see above. */
    poster: "maxresdefault" | "sddefault";
    /* Seconds in, for a venue stream where the segment starts partway. */
    start?: number;
  };
  /* One or two paragraphs. Same voice as the case studies: what the session
     was actually about and what you were doing in it, not "had the pleasure
     of joining". */
  description: string[];
  link?: { label: string; href: string };
};

export const talks: Talk[] = [
  {
    slug: "loom-cairo-auc-venture-lab",
    title: "Loom Cairo investor pitch",
    event: "AUC Venture Lab",
    role: "Pitch",
    /* Corroborated by the deck itself, which is the reason to trust the
       numbers quoted below: the traction slide reads "MAU increase, June over
       May" and "Launch, full version, June 2025", so the figures are days old
       on the day they were shown rather than a quarter stale. */
    date: "22 June 2025",
    location: "Cairo, Egypt",
    /* The one entry here with no maxres: an 848×480 upload, below the bar
       YouTube generates it at, and not a Short. */
    video: { youtubeId: "n8Qt1fxmd90", width: 848, height: 480, poster: "sddefault" },
    description: [
      "The investor pitch for Loom Cairo, on stage at AUC Venture Lab. The argument: Egyptian local fashion is a $4bn market that you cannot actually shop, because finding one t-shirt means opening twenty brand sites, and every aggregator that tried to fix it shipped stale inventory, too few brands, or no curation.",
      "Loom’s answer was technical rather than editorial: an algorithm that ingests and labels product data off any local brand site, which is what let it carry 21,000 items against the next competitor’s 16,000 while still holding the brands with real equity. The traction slide at the time: 4,700 active users, 76% returning, 180% month-over-month MAU growth, 3.5-minute average retention against a market average of two. The ask was $150K for 10%.",
    ],
    link: { label: "Loom Cairo case study", href: "/work/loom-cairo" },
  },
  {
    slug: "dell-summer-academy-gnosis",
    /* Named for what was presented rather than for the event, same as the
       Loom entry. "Dell Summer Academy Demo Day" is the video's filename;
       Gnosis is the thing that was actually argued for. */
    title: "Gnosis demo day presentation",
    event: "Dell Summer Academy",
    role: "Speaker",
    /* The oldest entry by three years, and the one that most earns its place:
       it is the only thing on the site that shows the 2022 internship as work
       rather than as a date range in the Experience list.

       Corroborated to the day by my own recap of the program, posted the week
       after: "Last Thursday, I finished the Dell Technologies Summer Academy
       Program", and the pitches were the final day of it. 8 September 2022 was
       a Thursday. Cited because this is the entry whose date looks least
       defensible (four years back, no organiser page still up) and it is in
       fact the best-evidenced one here. */
    date: "8 September 2022",
    location: "Cairo, Egypt",
    /* 1920×864, a 2.22:1 ultrawide, and the reason the embed sizes itself
       off the source ratio rather than snapping to 16:9. The ratio is not an
       accident of the venue: the clip was cut for that same recap post ("here's
       a clip from my pitch") and re-uploaded here, which is the LinkedIn-only
       path the note at the top of this file prescribes. Worked example, if
       anyone needs one. */
    video: { youtubeId: "WWikoFQjsp0", width: 1920, height: 864, poster: "maxresdefault" },
    description: [
      "The closing presentation of Dell’s Summer Academy, for a team project called Gnosis, after the Greek for knowledge through observation. The pitch starts from Ebbinghaus: high-school students forget something like 95% of what they were taught, so the resources spent teaching them are mostly spent twice. In Egypt that sits on top of a second split, where the education that works is priced out of reach and the education people can afford doesn’t.",
      /* "Ran design thinking at it" is the program's own first module, not a
         method named in hindsight to make the pivot sound deliberate: the
         recap has the Academy opening on it, before any of the technical
         courses. Worth pinning down, because a portfolio claiming a process
         produced a result is exactly the claim a reader should discount by
         default. */
      "The part worth keeping is that the team ran design thinking at it and landed somewhere other than where they started. The obvious culprits (disengaged students, disengaged teachers, underfunding) didn’t survive contact with the research. What was left was pedagogy: the discipline of how information is conveyed, which most teachers are never taught and many can’t name. Gnosis was the response, built around a lecture engine that walks an educator through designing a lecture against pedagogical principles rather than leaving them to reinvent it.",
    ],
    /* The recap post cited above, as Dell Egypt’s GM shared it. Worth the
       link for the same reason the date note cites it: this is the entry
       with the least surviving organiser evidence, and a first-party
       account from the person running Dell in the country is better
       corroboration than anything else still online.

       Tracking parameters stripped off the share URL. `utm_*` and `rcm`
       carry who sent it and from where, which is LinkedIn’s business and
       not something to hand every reader of this page. */
    link: {
      label: "Recap, shared by Dell Egypt’s GM",
      href: "https://www.linkedin.com/posts/magued-mahmoud-039277_last-thursday-i-finished-the-dell-technologies-activity-6974303886694080512-7APP",
    },
  },
  {
    slug: "creative-industry-summit",
    /* Title taken off the stage backdrop in the clip rather than off the
       upload, which is called "Building In The Data Desert". That's the cut
       of it, not the name of the session. */
    title: "The MENA Data Desert",
    event: "Creative Industry Summit",
    role: "Moderator",
    date: "8 June 2026",
    location: "Cairo, Egypt",
    video: { youtubeId: "uAv6y67whGs", width: 576, height: 1024, poster: "maxresdefault" },
    description: [
      "A panel on building brands in a region that doesn’t hand you the numbers: no reliable market data, no benchmarks worth trusting, and decisions that have to get made anyway. I moderated.",
      /* The roster is not in the clip: 31 seconds of an outdoor stage
         establishes that the session happened, not who was on it. It comes
         from Samar Abdelaal's own LinkedIn recap of the summit, which names
         all four panellists with their titles and names me as moderator, so
         every title below is a panellist's first-party account rather than
         something reconstructed off the video. Titles are as she gave them;
         hers she didn't state, so she gets her company and not a guess. */
      "On it: Sherif El Madany, Marketing Director at Mountain View; Rokaya El Maraashly, Managing Director at TAC Universe; Ahmed ElBatt, Strategy & Planning Director at Peace Cake; and Samar Abdelaal of Awe Research, the summit’s research partner. A client-side marketer, an agency MD, a strategy director and a researcher: four different places to be standing when the numbers aren’t there, which is the only reason a panel on this beats one person saying it.",
      "Where I steered it: off the complaint and onto the method. The easy version of this session is forty minutes of agreeing that MENA data is bad. The useful version is what each of them actually does on a Monday without it: what you can infer, what you have to go and measure yourself, and which decisions you make anyway rather than waiting for a number that is never arriving. Insight as the thing that reduces uncertainty enough to move, not as the line item you fund once there's budget spare.",
    ],
    /* The speaker page rather than the summit's front door: it is the page
       that carries the session and my name on it, and the homepage rotates
       to whichever edition is next, so a reader following it a year from now
       would land on a programme this panel is not in. */
    link: {
      label: "Creative Industry Summit",
      href: "https://creativeindmena.com/speaker/omar-sadek/",
    },
  },
  {
    slug: "tnn-live-e7kky",
    title: "TNN Live",
    event: "E7kky",
    role: "Host",
    date: "1 May 2026",
    location: "Cairo, Egypt",
    video: { youtubeId: "tZ6m2oIo8po", width: 1080, height: 1920, poster: "maxresdefault" },
    description: [
      "TNN’s first live event, hosted by E7kky: an outdoor stage, an audience, and the creators people scroll past on their For You page standing in front of them. I hosted it.",
      "The recording is TNN’s own coverage of the night, cut in the show’s nightly format (correspondent lower-thirds, headline slugs, the ticker) so it doubles as a demonstration of the thing the event was celebrating. Segments run through Amina Ayoub on founder honesty, Aseel Bahjat’s 981K-view normal day, and Mazoonit, a game built to push women’s participation in investing to 50%.",
    ],
    link: { label: "TikTok News Network", href: "https://tiktoknewsnetwork.com" },
  },
];
