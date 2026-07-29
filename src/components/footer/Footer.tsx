import Link from "next/link";

import { LocalTime } from "@/components/footer/LocalTime";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { contacts, MAILTO } from "@/data/contact";

/* A real footer, in the index's language rather than the old slab's: same
   640px column, same type scale (13px labels over 15px links, matching the
   "Work" / "Experience" section headings), and no background fill: a
   hairline does the separating so the page colour runs to the bottom.
   See docs/north-stars.md. */

const pages = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/#work" },
  { name: "Blog", href: "/blog" },
  { name: "Talks", href: "/talks" },
  { name: "About", href: "/about" },
  { name: "Résumé", href: "/resume.pdf", external: true },
];

/* "Contact", not "Elsewhere". The index already has an Elsewhere section
   and the two headings would land within 250px of each other. */
const contact = [
  ...contacts.map((contact) => ({ name: contact.name, href: contact.url, external: true })),
  { name: "Email", href: MAILTO, external: true },
];

export function Footer() {
  return (
    <footer className="max-w-measure-gutter text-body mx-auto w-full px-6 pb-12">
      {/* A 1px rule used to close off the page here. Quiet tonal marks the
          end of the content with space rather than a line. The footer's
          own smaller, grayer type is what signals the change in register. */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-20 sm:grid-cols-[1fr_auto_auto] sm:gap-x-16">
        {/* The identity block spans both columns on narrow screens so the
            two link lists can sit side by side underneath it. */}
        {/* Four facts, one per line, in the order a reader needs them: what I
            do, what I run, where that is, and, the only one they can't infer,
            what that means for reaching me right now. */}
        <div className="col-span-2 sm:col-span-1">
          <p className="text-body font-medium text-foreground">Omar Sadek</p>
          <div className="text-body-sm mt-1 grid gap-0.5 text-foreground-subtle">
            <p>
              Full-stack engineer{" "}
              <a
                href="https://instatus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground-faint focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none"
              >
                @Instatus
              </a>
            </p>
            <p>Founder @Wholana</p>
            <p>Cairo, Egypt</p>
            <p>
              <LocalTime />
            </p>
          </div>
        </div>

        <FooterList title="Pages" links={pages} />
        <FooterList title="Contact" links={contact} />
      </div>

      {/* The last line of the page, and now the only control on it. The two
          sit on one row rather than stacking: the copyright is the quietest
          thing here and the switch is the least-wanted, so between them they
          make one closing line instead of two trailing ones.

          `items-center` against a 13px baseline and a 24px pill. The switch
          is the taller object, so aligning on the text baseline would hang
          it below the line it closes. */}
      <div className="mt-12 flex items-center justify-between gap-6">
        <p className="text-meta text-foreground-faint tabular-nums">
          © {new Date().getFullYear()} Omar Sadek
        </p>
        <ThemeToggle />
      </div>
    </footer>
  );
}

function FooterList({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h2 className="text-meta mb-3 font-medium text-foreground-faint">{title}</h2>
      <ul className="text-body-sm grid gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLink({
  name,
  href,
  external = false,
}: {
  name: string;
  href: string;
  external?: boolean;
}) {
  /* Underline arrives on hover only: eight persistent rules stacked in two
     columns would out-weigh everything above them. */
  const className =
    "rounded-sm text-foreground-subtle underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

  if (external) {
    const isMail = href.startsWith("mailto:");

    return (
      <a
        href={href}
        target={isMail ? undefined : "_blank"}
        rel={isMail ? undefined : "noopener noreferrer"}
        className={className}
      >
        {name}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {name}
    </Link>
  );
}
