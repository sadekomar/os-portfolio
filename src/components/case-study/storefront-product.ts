import type { StaticImageData } from "next/image";

import savi from "@/components/case-study/storefront/loom-product-savi.jpg";
import magnolia from "@/components/case-study/storefront/loom-product-magnolia.jpg";
import zala from "@/components/case-study/storefront/loom-product-zala.jpg";
import liri from "@/components/case-study/storefront/loom-product-liri.jpg";

/* One real item off the Univyr storefront, checked into this repo rather than
   fetched. Same argument the Wholana decoder makes in wholana-decodes.ts: a
   demo on a portfolio has no useful failure state, because the reader doesn't
   retry, they conclude the product never worked.

   Name, price and photograph order are the product page's own, copied out of
   apps/storefront/src/app/products/[id]/page.tsx. The photographs are the
   shipped JPEGs at 1200x1500, resized from the 3306x4132 originals: the
   gallery renders in a 340px column, so the full-size captures were about
   sixteen times the pixels anything on this page can show.

   The alt text is the one thing written here rather than lifted. The
   storefront's was `Product image 3`, which is what a gallery can get away
   with when the reader is looking at it; on a case study the images are also
   the evidence, and evidence has to survive being read aloud. */

export type StorefrontImage = { src: StaticImageData; alt: string };

export const PRODUCT: {
  name: string;
  price: string;
  images: StorefrontImage[];
} = {
  name: "savi",
  price: "LE 1,800.00",
  images: [
    {
      src: savi,
      alt: "A black leather belt coiled into a loop against a bone-white backdrop, its brushed silver rectangular buckle resting at the bottom left",
    },
    {
      src: magnolia,
      alt: "A dark brown leather belt coiled and shot head-on, NAGSKIN embossed along the strap above an antiqued silver oval buckle",
    },
    {
      src: zala,
      alt: "A dark brown belt with a heavier grain, its silver buckle set with two blackened panels of floral filigree either side of the pin",
    },
    {
      src: liri,
      alt: "A dark brown belt with a rectangular antique-brass plate buckle, the plate's face textured in mottled gold",
    },
  ],
};
