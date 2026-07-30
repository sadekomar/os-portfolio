/* In the marketplace this array arrived as part of the search response's
   `metadata`, which is why the shape is `{ name, count }`: the counts are
   facet counts, the number of items that would survive the filter.

   The showcase copy has no network, so one representative response is frozen
   here. The counts are the real ones from a Univyr catalogue snapshot, kept
   uneven on purpose because a facet row where every count is round stops
   looking like data. */

export type ColorFacet = {
  name: string;
  count: number;
};

export const COLOR_FACETS: readonly ColorFacet[] = [
  { name: "black", count: 1482 },
  { name: "white", count: 1137 },
  { name: "blue", count: 604 },
  { name: "grey", count: 471 },
  { name: "beige", count: 338 },
  { name: "brown", count: 296 },
  { name: "green", count: 241 },
  { name: "pink", count: 187 },
  { name: "red", count: 153 },
  { name: "navy", count: 129 },
  { name: "cream", count: 96 },
  { name: "yellow", count: 74 },
  { name: "purple", count: 58 },
  { name: "orange", count: 41 },
  { name: "silver", count: 27 },
];
