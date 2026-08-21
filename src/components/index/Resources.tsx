import { Icon, iconGap } from "@/components/icon/Icon";
import { Reveal } from "@/components/ui/reveal";
import { resources } from "@/data/resources";

/* ── Resources ────────────────────────────────────────────────────────────
   Two rows, then the list feathers out into a "Show more". The mechanism,
   and the argument for a teaser rather than a closed disclosure, is in
   components/ui/reveal.tsx; this file is only the rows and the count.

   ── Why two ──────────────────────────────────────────────────────────────
   Enough to establish the kind of thing on the list rather than the fact
   that a list exists, and a third row half-showing under the fade says the
   rest without spending the page height on it. Four full rows made the
   teaser most of the section, which is a fold that has stopped folding.
   The first two are the most formative ones (see the ordering note in
   data/resources.ts), so the teaser is also the strongest part of it,
   which is the only honest way to truncate: show the top, not the first
   two alphabetically.

   A server component since the reveal moved out. Everything left here is a
   constant array rendered once, so the rows reach the reader as HTML and
   the only thing shipped to the browser is the disclosure. */

/* How many stay visible when collapsed. Named because it appears twice: the
   slice below and the count on the button have to agree, and two literals
   that must match are one edit away from disagreeing. */
const TEASER = 2;

export function Resources() {
  const hidden = resources.length - TEASER;

  return (
    <section id="resources" className="mb-14 scroll-mt-24">
      {/* No px-3, matching Section in app/page.tsx: the rows below sit in a
          -mx-3 wrapper that cancels their own padding, so a padded heading
          would sit 12px inboard of the list it labels. Same rung as that
          one too, for the same reason: see the note there. */}
      <h2 className="text-meta text-foreground-muted mb-2 font-medium">Resources</h2>
      <div className="-mx-3">
        <Reveal
          teaser={resources.slice(0, TEASER).map((item) => (
            <ResourceRow key={item.href} item={item} />
          ))}
          rest={resources.slice(TEASER).map((item) => (
            <ResourceRow key={item.href} item={item} />
          ))}
          more={`Show ${hidden} more`}
          tourId="resources-more"
        />
      </div>
    </section>
  );
}

/* Row idiom borrowed from components/index/Row.tsx: same padding, same bleed
   outside the text column, same hover. Not imported, because that component
   is title + description + meta + mark, and this one puts the source on the
   title's baseline with the reason underneath. Sharing it would mean adding
   a second layout mode to a component that currently has one. */
function ResourceRow({ item }: { item: (typeof resources)[number] }) {
  /* Press dip matched to Row.tsx, curve and property list included: these two
     rows sit in the same column at the same width, so anything short of an
     identical treatment would read as one list behaving two ways. 1% rather
     than the 3% a button gets, because the same percentage across the full
     width of the measure reads as the page flinching rather than as a control
     answering. Named properties, never `all`: `all` would also tween the focus
     ring, and a focus ring that fades in is late for the one reader who needs
     it. */
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group hover:bg-wash focus-visible:ring-ring/20 ease-out-quint block rounded-lg px-3 py-3 transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span
          className={`flex items-center ${iconGap("inline")} text-body text-foreground font-medium`}
        >
          {item.title}
          <Icon
            name="external"
            className="text-foreground-faint transition-transform duration-150 ease-out group-hover:translate-x-px group-hover:-translate-y-px"
          />
        </span>
        <span className="text-meta text-foreground-subtle shrink-0">{item.source}</span>
      </div>
      <p className="text-body-sm text-foreground-subtle mt-1">{item.why}</p>
    </a>
  );
}
