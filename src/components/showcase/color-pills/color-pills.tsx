"use client";

import { useCallback, useState } from "react";

import { COLOR_FACETS } from "./colors";
import "./color-pills.css";

/* The colour facet row from the Univyr marketplace search page: a horizontally
   scrolling, snapping strip of pills, single-select, with an "All" pill that
   clears the selection.

   Single-select rather than multi-select is deliberate. Colour is the one
   facet shoppers use as a browse mode rather than a narrowing filter: they
   want to see the black things, then the green things, not the intersection.
   Tapping the pill that is already on turns it off, so the row never traps you
   in a state you have to find the reset for.

   URL state, and why this copy does not have it
   --------------------------------------------
   The source drove this off the query string. It read `?colors=` with
   `useSearchParams` and wrote back with `window.history.pushState`, using
   pushState rather than a router push so the pill lit up immediately and the
   server component re-rendered the grid without a navigation. It also reset
   `?page=1` on every change, because a colour that has three pages of results
   will not have a page four.

   This showcase copy holds the same value in `useState` instead. It must not
   write to the page URL: it is one component among many on a portfolio page,
   and a facet row that rewrites the address bar would fight the page it is
   embedded in. The visible behaviour is identical, only the storage moved.
   There is no page reset here because there is no pager to reset. */

export function ColorPills() {
  const [selected, setSelected] = useState<string | null>(null);

  const toggleColor = useCallback((color: string) => {
    /* Selecting the active colour clears it, which is what makes the row feel
       like a set of toggles rather than a radio group you cannot escape. */
    setSelected((current) => (current === color ? null : color));
  }, []);

  const selectAllColors = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    /* `text-body-sm` on the wrapper, which the pills' `font-size: inherit`
       then picks up. In the product that inherit reached the app's body size;
       embedded in a docs page there was nothing above it declaring one, so it
       resolved to the user agent's 16px with `letter-spacing: normal` and the
       row came out a step larger and visibly looser than the 17px paragraph
       directly above it. 15px is the rung this site sets embedded controls at,
       and it carries the -0.007em the rest of the page is tracked to. */
    <div
      className="color-pills-wrapper text-body-sm"
      role="group"
      aria-label="Filter by colour"
    >
      <button
        type="button"
        className={`color-pills-pill ${selected ? "" : "color-pills-pill-selected"}`}
        aria-pressed={selected === null}
        onClick={selectAllColors}
      >
        All
      </button>

      {COLOR_FACETS.map((color) => (
        <button
          key={color.name}
          type="button"
          className={`color-pills-pill ${
            color.name === selected ? "color-pills-pill-selected" : ""
          }`}
          aria-pressed={color.name === selected}
          onClick={() => toggleColor(color.name)}
        >
          {color.name} <span className="color-pills-count">({color.count})</span>
        </button>
      ))}
    </div>
  );
}
