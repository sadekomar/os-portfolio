/* One hand-edited sentence about what I'm actually doing right now.
   Edit `text`, then edit `updated` in the same commit. The second is not
   decoration, it is the expiry.

   This is deliberately not an integration. A Spotify or Last.fm embed would
   be live in the technical sense and say nothing: "he had music on" is not
   a fact about a person. A sentence someone sat down and wrote is a
   stronger signal of an awake site than a widget polling an API, and it
   costs no key, no dependency and no loading state.

   The honesty cost of hand-editing is staleness, so it is handled the same
   way a failed fetch is: `NOW_MAX_AGE_DAYS` past `updated` the line stops
   rendering. A "currently" that is four months old is a worse lie than an
   API that is down, because nothing about it looks broken. Better the page
   goes quiet than that it keeps insisting on an old Tuesday. */

export const now = {
  updated: "2026-07-29",
  /* "Lately", not "Currently" or "Right now". The intro's second paragraph
     already opens with "Right now that's Instatus", and two lines claiming
     the present tense within 200px of each other cancel each other out. */
  text: "Lately: the second pass of Wholana’s Decoder, a TikTok News Network script most nights, and the Bach double, slowly, up to tempo.",
};

/* Roughly a season. Long enough that this isn't a chore, short enough that
   the sentence is still true when a stranger reads it. */
export const NOW_MAX_AGE_DAYS = 75;
