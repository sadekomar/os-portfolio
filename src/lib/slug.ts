/* The one slugifier. It stamps the `id` on every case-study `<section>`, and
   the command palette derives its section-jump targets from the same call,
   so a heading and the link that jumps to it can only ever agree. It lived in
   two places for exactly as long as those two features were built in
   parallel; the failure mode of letting them drift is silent, a jump that
   scrolls nowhere, which is why it is worth a module of its own. */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
