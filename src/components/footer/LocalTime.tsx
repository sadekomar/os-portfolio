"use client";

import { useEffect, useState } from "react";

import { AnimatedText } from "@/components/ui/animated-text";

/* My clock, and the things a reader actually wants from it.

   The time alone ("4:12 PM") asks the reader to do timezone arithmetic
   before they know whether they've caught me at my desk or at 3am. So the
   line has always carried a second clause answering that. All of it can only
   be computed in the browser; the server has no idea what zone the reader is
   in.

   ── Why the clause is operable ───────────────────────────────────────────
   There turned out to be three answers to "so what?", not one, and they are
   not equally useful to everybody:

     the offset    5h ahead of you     matters if you're scheduling
     the date      Wed, 30 Jul there   matters if you're across the dateline
     the read      probably asleep     matters if you're about to send

   Printing all three is a four-clause sentence in 13px grey text at the very
   bottom of the page, which is where information goes to not be read. Making
   the reader choose is worse. So the clause holds one at a time and cycles
   on press, and the default is the offset, which is the one that was there
   before and the one most people want.

   The morph is what makes this defensible rather than a novelty: the clauses
   are wildly different lengths, and swapping the text outright would jump
   the width of a line sitting directly under three static ones. Torph tweens
   it, so the line grows into its new reading. Same component and the same
   curve as the résumé button's label, for the same reason.

   ── Discoverability ──────────────────────────────────────────────────────
   It is styled as the footer's own links are styled: subtle grey, an
   underline that arrives on hover, foreground on hover. Nothing here signals
   "control" through chrome, because nothing in this footer does; it signals
   it by looking exactly like the other operable text six pixels away.

   ── Failure ──────────────────────────────────────────────────────────────
   None available. It reads a clock. Before mount it renders a plain span
   holding the line's width with an em space, so the footer doesn't reflow
   when the real value arrives, and so there is no hydration mismatch from
   HTML the server had no way to get right. */

const TIME_ZONE = "Africa/Cairo";

/* The waking window in Cairo local time, half-open: awake at 08:00, asleep
   at 01:00. Hedged in the copy ("probably") because this is a routine, not a
   status: nothing here is reading a presence API, and a line that implied it
   was would be the one dishonest thing on the page. Tune these two numbers
   and nothing else moves. */
const WAKES_AT = 8;
const SLEEPS_AT = 1;

type Fields = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/* The zone's wall-clock fields, read off the formatter rather than derived
   from a UTC offset, so Egypt's on-again/off-again DST is never wrong here. */
function zoneFields(date: Date, timeZone: string): Fields {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    // `hour12: false` renders midnight as 24 in some ICU versions.
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

function zoneOffsetMinutes(fields: Fields, date: Date) {
  const asUTC = Date.UTC(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second,
  );

  return Math.round((asUTC - date.getTime()) / 60000);
}

function formatDifference(minutes: number) {
  if (minutes === 0) {
    return "same time as you";
  }

  const direction = minutes > 0 ? "ahead of you" : "behind you";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const remainder = absolute % 60;

  /* Half-hour and 45-minute zones exist (Kolkata, Kathmandu, Adelaide), so
     the minutes can't be dropped. */
  const span =
    remainder === 0 ? `${hours}h` : hours === 0 ? `${remainder}m` : `${hours}h ${remainder}m`;

  return `${span} ${direction}`;
}

/* The window wraps midnight, so this is a union rather than a range. */
function isAwake(hour: number) {
  return hour >= WAKES_AT || hour < SLEEPS_AT;
}

type Snapshot = { time: string; readings: string[] };

function read(now: Date): Snapshot {
  const fields = zoneFields(now, TIME_ZONE);

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(now);

  const difference = zoneOffsetMinutes(fields, now) - -now.getTimezoneOffset();

  /* The date is only a reading when it is news. Most readers are on the same
     calendar day as Cairo, and "Wed, 29 Jul there" on the day they are also
     having is a dead press: the cycle would spend a third of itself telling
     them something they can see on their own clock. So the list is two long
     or three long depending on whether there is a third thing to say. */
  const sameDay =
    fields.year === now.getFullYear() &&
    fields.month === now.getMonth() + 1 &&
    fields.day === now.getDate();

  const date = new Intl.DateTimeFormat(undefined, {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(now);

  return {
    time,
    readings: [
      formatDifference(difference),
      ...(sameDay ? [] : [`${date} there`]),
      isAwake(fields.hour) ? "probably awake" : "probably asleep",
    ],
  };
}

export function LocalTime() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const update = () => setSnapshot(read(new Date()));

    update();

    /* Ticks on the minute boundary rather than every 60s from mount, so the
       displayed minute changes when the reader's clock does. The reading
       beside it is recomputed on the same tick, which is how the line moves
       from "probably awake" to "probably asleep" without a reload. */
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(
      () => {
        update();
        interval = setInterval(update, 60_000);
      },
      (60 - new Date().getSeconds()) * 1000,
    );

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  /* An em space, not an empty string: this is one of four lines in a stack,
     and a span with no content collapses its row to zero height and shifts
     the three above it at the moment the real value lands. */
  if (!snapshot) {
    return (
      <span className="tabular-nums" suppressHydrationWarning>
        {" "}
      </span>
    );
  }

  /* Taken modulo at read time rather than clamped on press. The list can
     shorten underneath a held index when midnight in Cairo catches up with
     the reader's date, and this is the version of that with no bookkeeping. */
  const reading = snapshot.readings[index % snapshot.readings.length];

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {snapshot.time},{" "}
      <button
        type="button"
        onClick={() => setIndex((current) => current + 1)}
        /* The accessible name is read off text that is mid-morph on press,
           so the change is announced once it settles instead of per frame.
           The same treatment the résumé button gets. */
        aria-live="polite"
        className="decoration-transparent hover:text-foreground hover:decoration-foreground-faint focus-visible:ring-ring/20 rounded-sm underline underline-offset-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
      >
        <AnimatedText>{reading}</AnimatedText>
      </button>
    </span>
  );
}
