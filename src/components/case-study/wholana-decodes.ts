/* ── Frozen decodes ───────────────────────────────────────────────────────
   Three real rows out of Wholana's `decoded_video_fields` table, copied by
   hand into this repo so the demo on the case study has no backend, no key,
   and no way to fail in front of a reader.

   Everything here is verbatim. The metrics, the transcript word counts, the
   model ids and the prompt version are the provenance these particular rows
   actually carry: `beatSheet@2.4 + fields@1.0 + classify@1.0`, run on
   Gemini in May 2026. The pipeline has moved on since (the steps are now
   `beatSheet@2.5 + fields@2.6` on open-weight models, and the free-text
   labels below were later folded into a closed canonical vocabulary), so
   quoting today's models over yesterday's output would be the one dishonest
   move available here. The rows say when they were written and by what.

   Two things worth knowing about how the values read:

     Franco-Arabic  `spokenHook`, `sideHook`, `explicitCta` and `commentBait`
                    are quoted from the video verbatim, and Wholana stores
                    literal-text fields in Franco-Arabic, Arabic typed in
                    Latin characters, the way the audience actually writes
                    it. Every other field is English. That split is the
                    product's policy, not a rendering accident, and it is
                    most of what makes these look like real rows.

     Em dash        A `null` in the source is a field the model was asked
                    for and declined to fill, which is different from a
                    field that wasn't asked for. The UI renders those as an
                    em dash rather than hiding the row, because "no pain
                    avoidance in this video" is a finding.

   Chosen for spread rather than for flattery: Early / Mid / Late payoff,
   High / Low perceived stakes, Positive and Satirical tone, and three
   formats that share nothing: a home tour, a sketch montage, and a
   first-person narrative arc. */

export type Decode = {
  id: string;
  /* The TikTok as scraped, before anything is inferred from it. */
  source: {
    handle: string;
    creator: string;
    caption: string;
    postedAt: string;
    /* `playCount` in the schema. Pre-formatted: these are display strings
       in a fixture, and a formatter here would only be a second place for
       the numbers to disagree with the case study around them. */
    views: string;
    likes: string;
    comments: string;
    shares: string;
  };
  /* The ASR transcript the craft pass actually reads. The word count is
     load-bearing in the real pipeline: under 25 words the video is skipped
     rather than guessed at. */
  transcript: { language: string; source: string; words: number };
  logline: string;
  sentimentTone: "Positive" | "Negative" | "Neutral" | "Satirical";
  stopScroll: {
    hookArchetype: string;
    spokenHook: string;
    sideHook: string | null;
    specificityLevel: "Low" | "Medium" | "High";
    whyItStops: string;
  };
  retention: {
    narrativeStructure: string;
    payoffTiming: "Early" | "Mid" | "Late" | "None";
    reEngagementMechanic: string;
  };
  stakes: {
    viewerGain: string;
    painAvoidance: string | null;
    stakeType: string;
    perceivedStakes: "Low" | "Medium" | "High";
  };
  engagement: {
    explicitCta: string | null;
    commentBait: string | null;
    shareabilityDriver: string;
  };
  metadata: { primaryKeywords: string[]; classificationAnchor: string };
  beatSheet: string[];
};

/** Provenance shared by all three rows; they were decoded in the same run. */
export const PROVENANCE = {
  decodedAt: "19 May 2026",
  models: { beatSheet: "gemini-2.5-flash-lite", fields: "gemini-2.5-flash" },
  promptVersion: "beatSheet@2.4 + fields@1.0 + classify@1.0",
} as const;

export const DECODES: Decode[] = [
  {
    id: "tourky-apartment-tour",
    source: {
      handle: "@tourkyandmenna",
      creator: "Tourky و Menna",
      caption: "اخيرا جوله في شقتنا بعد الفرش❤️🏠",
      postedAt: "7 May 2026",
      views: "9.3M",
      likes: "359.6K",
      comments: "5,906",
      shares: "13,300",
    },
    transcript: { language: "ara-SA", source: "automatic speech recognition", words: 482 },
    logline:
      "Tourky gives a tour of his newly furnished apartment, highlighting design choices and future plans for the unfinished garden area.",
    sentimentTone: "Positive",
    stopScroll: {
      hookArchetype: "headline-event",
      spokenHook: "w Akhiran farashna sha2etana el gedida",
      sideHook: "mokhi magenani besbabha",
      specificityLevel: "High",
      whyItStops:
        "It announces a significant personal milestone (new home) and directly invites the viewer in, leveraging curiosity about home transformation.",
    },
    retention: {
      narrativeStructure: "room-by-room-tour",
      payoffTiming: "Early",
      reEngagementMechanic:
        "The video explicitly acknowledges and responds to prior viewer input regarding garden design, fostering a sense of community and influence.",
    },
    stakes: {
      viewerGain:
        "Viewers gain home decor inspiration and share in the creators' joy and satisfaction of completing a major personal project.",
      painAvoidance:
        "The video offers practical solutions to common home design issues, such as ensuring privacy in a garden or protecting electronics from sun glare, helping viewers avoid similar frustrations.",
      stakeType: "personal achievement",
      perceivedStakes: "High",
    },
    engagement: {
      explicitCta: null,
      commentBait: "sam3et kalamko 3ala fekra han'affel shagar keda sona3y",
      shareabilityDriver: "home-inspiration",
    },
    metadata: {
      primaryKeywords: ["sha2etana", "farashna", "garden", "matbakh", "sala"],
      classificationAnchor:
        "The video immediately signals its topic by announcing the furnishing of their new apartment in the hook, 'w Akhiran farashna sha2etana el gedida' at [0.0s], and then proceeds with a detailed room-by-room tour.",
    },
    beatSheet: [
      "Tourky welcomes viewers to his newly furnished apartment.",
      "He explains the garden area is unfinished and mentally taxing.",
      "They decide to use artificial plants for privacy and to avoid insects in the garden.",
      "Tourky begins the tour, showing the living room and seating arrangement.",
      "He points out the TV placement to avoid direct sunlight.",
      "The dining area is shown, with a mention of its perfect fit.",
      "Tourky highlights decorative items like a frame, plant, mirror, and ottoman in the living room.",
      "He shows the entrance area, designed to be eye-catching.",
      "Tourky explains one of the three bathrooms was converted into storage due to excess belongings.",
      "He contrasts the new, smaller kitchen with his previous larger, open-plan one.",
      "The first guest bathroom is shown, with a focus on the decorative mirror.",
      "Tourky shares that the next room is their favorite, viewed often in their old apartment.",
      "He shows Mena's room, designated for her filming, which is still being set up.",
      "A surprise for Mena's room is teased.",
      "The next room, intended as a kids' or guest room, is shown.",
      "This room features a comfortable, simple design with a sofa bed.",
      "He mentions the sofa bed can be folded to create more space.",
      "Tourky showcases two new chandeliers Mena chose for this room.",
      "He expresses gratitude that the apartment is now furnished as planned.",
      "Tourky mentions the garden is the next project and he can't envision how to furnish it.",
    ],
  },
  {
    id: "omarelo-bank-sketch",
    source: {
      handle: "@omarelomostafa1",
      creator: "Omarelo mostafa",
      caption: "البنك : Core",
      postedAt: "11 April 2026",
      views: "11.2M",
      likes: "448.8K",
      comments: "3,163",
      shares: "50,900",
    },
    transcript: { language: "ara-SA", source: "automatic speech recognition", words: 201 },
    logline:
      "Omarelo encounters absurd situations at a bank, from exorbitant bills and accusations to job rejections and loan inquiries.",
    sentimentTone: "Satirical",
    stopScroll: {
      hookArchetype: "everyday-frustration-exaggeration",
      spokenHook: "b2olak ya ostaz 3ayez as7ab men el makana ele bara",
      sideHook: "mafish mashroubat",
      specificityLevel: "Low",
      whyItStops:
        "The hook sets up a common scenario of a bank interaction but then immediately introduces an absurd, unhelpful, or unexpected response, creating a curiosity gap about the unfolding comedic frustration.",
    },
    retention: {
      narrativeStructure: "sketch-comedy-montage",
      payoffTiming: "Mid",
      reEngagementMechanic:
        "The video uses quick scene cuts and new, absurd mini-scenarios (e.g., harassment accusation, blank check, food bank food) to continuously reset attention and deliver fresh comedic beats.",
    },
    stakes: {
      viewerGain:
        "The viewer gains a series of relatable laughs and a shared comedic experience around the frustrations and absurdities of everyday banking interactions.",
      painAvoidance: null,
      stakeType: "everyday-frustration",
      perceivedStakes: "Low",
    },
    engagement: {
      explicitCta: null,
      commentBait: "ida3 ya donia ida3 3ala elly ba3 w ma kamelshy",
      shareabilityDriver: "humor-tag-friend",
    },
    metadata: {
      primaryKeywords: ["makana", "shekat", "qard", "eda3"],
      classificationAnchor:
        "The topic is established immediately with the mention of 'makana' (ATM) in the hook at [2.7s] and reinforced throughout with multiple specific banking terms and scenarios.",
    },
    beatSheet: [
      "Omarelo tries to withdraw money from an external ATM.",
      "Omarelo asks for a hot drink but is told there are none.",
      "Omarelo is told his bill is $10,000,000.",
      "A woman asks for Omarelo's number to enter his turn, then accuses him of harassment and threatens to expose him.",
      "A mother tells her child to get a checkbook, but is directed to get an insurance booklet instead.",
      "Omarelo is asked to escort someone to the vault, who is apparently hoarding money.",
      "Omarelo sees many returned checks and notes they are from 'Atltico Madrid.'",
      "A customer receives a blank check from a bank employee.",
      "A bank employee laments receiving food from a food bank.",
      "Omarelo is told a job requires a presentable accountant, and he is called 'Hussein Al-Asmar.'",
      "Omarelo asks about a $1,000,000 loan, but jokes about 'years in prison' instead of repayment terms.",
      "Omarelo describes a situation at the beginning and end of the month.",
      "Someone arrives to 'tie a certificate' and deposit money.",
      "Omarelo humorously comments on people laughing in his face while he tries to make a deposit.",
    ],
  },
  {
    id: "menna-tv-interview",
    source: {
      handle: "@mennaehapp_",
      creator: "منه ايهاب",
      caption: "الجيش قالك اتصرف 😂💔",
      postedAt: "19 May 2026",
      views: "1.8M",
      likes: "94.1K",
      comments: "125",
      shares: "200",
    },
    transcript: { language: "ara-SA", source: "automatic speech recognition", words: 103 },
    logline:
      "Manah travels to Cairo for a TV interview, forgets her outfit, and improvises by altering a dress with her husband before returning home exhausted.",
    sentimentTone: "Positive",
    stopScroll: {
      hookArchetype: "curiosity-gap",
      spokenHook: "leh ro7t leqa2 televiziony be fostan",
      sideHook: "ta3alo 7'odko men bedayet el youm",
      specificityLevel: "Medium",
      whyItStops:
        "The hook immediately presents a question about an unconventional choice (wearing a dress to a TV interview), creating a curiosity gap.",
    },
    retention: {
      narrativeStructure: "narrative-arc",
      payoffTiming: "Late",
      reEngagementMechanic:
        "The video re-engages the viewer by revealing the central conflict: she forgot her outfit for a live TV show, leading to a dramatic improvisation.",
    },
    stakes: {
      viewerGain:
        "The viewer gains entertainment from a relatable, high-stakes behind-the-scenes story and a sense of shared triumph over unexpected challenges.",
      painAvoidance: null,
      stakeType: "face",
      perceivedStakes: "High",
    },
    engagement: {
      explicitCta: null,
      commentBait:
        "The specific improvisation of modifying her dress for a live TV interview (mo7amed yshily el korsag) and her feeling of 'saving the situation' could invite comments from people sharing similar experiences.",
      shareabilityDriver: "problem-overcome",
    },
    metadata: {
      primaryKeywords: ["leqa2", "televiziony", "fostan", "mohamed"],
      classificationAnchor:
        "The topic is immediately established in the hook by naming 'leqa2 televiziony' (TV interview) and 'fostan' (dress), reinforced by the detailed narrative of the event.",
    },
    beatSheet: [
      "Travels from Alexandria to Cairo for a TV interview.",
      "Forgets the outfit planned for the interview.",
      "On live TV, modifies a dress by removing the corsage.",
      'Feels she "saved the situation" and the outfit was appropriate.',
      "Considers this her best TV appearance because it was with her husband.",
      "Returns to Alexandria the same day, exhausted.",
    ],
  },
];

/* ── The pipeline ─────────────────────────────────────────────────────────
   The five steps these rows went through, in the order they ran, with the
   thing each one actually produced. Named after the real steps rather than
   invented for the demo: `ingest` and `subtitles` are the two halves of the
   ingest boundary, and `beatSheet` / `fields` / `classify` are the three
   model calls the prompt version above is composed from.

   The durations are the demo's, not the pipeline's. A real craft pass
   takes tens of seconds, and a case study that made a reader wait that long
   to see the payoff would be a worse demonstration of the same fact. They
   are tuned so the sequence reads as five distinct pieces of work rather
   than a progress bar: the two model calls that do the thinking are the two
   long ones, and the whole run lands in about two seconds. */
export type Step = {
  key: string;
  label: string;
  /* What this step emits, filled in from the selected decode at runtime,
     so the trace reports that video's numbers rather than a generic line. */
  detail: (decode: Decode) => string;
  ms: number;
};

export const STEPS: Step[] = [
  {
    key: "ingest",
    label: "Ingest",
    detail: (d) => `${d.source.handle} · ${d.source.views} views`,
    ms: 300,
  },
  {
    key: "subtitles",
    label: "Subtitles",
    detail: (d) => `${d.transcript.language} · ${d.transcript.words} words`,
    ms: 260,
  },
  {
    key: "beatSheet",
    label: "Beat sheet",
    detail: (d) => `${d.beatSheet.length} beats · ${PROVENANCE.models.beatSheet}`,
    ms: 620,
  },
  {
    key: "fields",
    label: "Field extraction",
    detail: () => `17 fields · ${PROVENANCE.models.fields}`,
    ms: 660,
  },
  {
    key: "classify",
    label: "Classify",
    detail: (d) => `${d.stopScroll.hookArchetype} · ${d.retention.narrativeStructure}`,
    ms: 300,
  },
];
