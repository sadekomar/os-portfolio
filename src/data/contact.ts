/* The profiles claimed in the JSON-LD `sameAs` block in layout.tsx, kept
   in one place so the footer, the index, and the structured data can't
   drift apart. No icons: nothing renders them since the footer went to
   text links. */

/* The address itself lives here for the same reason the profiles do: it is
   written into the letterhead, the footer, the index, the command palette
   and the JSON-LD, and five literals is five chances to change four of
   them. */
export const EMAIL = "sadekm.omar@gmail.com";
export const MAILTO = `mailto:${EMAIL}`;

export const contacts = [
  { name: "Github", url: "https://github.com/sadekomar" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/sadekomar/" },
  { name: "X", url: "https://x.com/omarsadekk" },
  { name: "TikTok", url: "https://tiktok.com/@omarsdek" },
];
