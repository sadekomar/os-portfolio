import { type ScrollerImage, CaseStudyScroller } from "@/components/case-study/Scroller";

/* One figure shape, not two. The page used to distinguish a "full" hero from
   a "carousel" strip; on a scroller-led page that distinction disappears,
   because a single image is just a track that doesn't overflow: same bleed,
   same 12px inset, same caption underneath, and the arrows measure their way
   out of existence on their own. */
export type Figure = {
  images: ScrollerImage[];
  caption?: string;
};

export function CaseStudyFigure({ figure }: { figure: Figure }) {
  return (
    <figure className="w-full">
      <CaseStudyScroller images={figure.images} />

      {figure.caption && (
        /* Centred, in the prose column, and at the same 13px as the meta in
           the header. A caption is a label for the thing above it, not a
           short paragraph. It sits directly under the track: the 12px the
           track already carries as padding is the whole gap. */
        <figcaption className="mx-auto w-full max-w-measure-gutter px-6 text-center text-case-caption text-foreground-muted">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}
