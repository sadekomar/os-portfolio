import { allProjects, projectOrder, type ProjectKeys } from "@/app/work/[project]/projects";
import { contacts, EMAIL, MAILTO } from "@/data/contact";
import { menuPages } from "@/data/menuPages";
import type { Theme } from "@/lib/theme";

import {
  CHAT_BASE,
  chatPrompt,
  chatUrl,
  documentMarkdown,
  projectMarkdown,
  slugify,
  type ChatTarget,
} from "./markdown";

/* ── The action model ─────────────────────────────────────────────────────
   A palette is only worth the keystroke if what it offers changes with where
   you are. The list below is therefore built per route rather than filtered
   from one global array, and the *order of the groups is the ranking*,
   cmdk renders groups in the order it is given them, so "put this project's
   own actions above the global ones" is expressed by building that group
   first, not by scoring.

   Three shapes of route, three orderings:

     /work/[slug]  the study you are reading leads. Its own sections, its
                   live site, its link, its Markdown. Then the rest of the
                   work, then everything else.
     /            the index's job is to send you into a project, so Work
                   leads and its first row is the jump to the section.
     everything    pages first. On /about or /blog you are more likely to
     else         be navigating than acting on the page you're on.

   `run` returns nothing for anything that navigates or leaves the site (the
   palette closes and gets out of the way), and a `Confirm` for anything
   whose whole result is invisible. A clipboard write has no other evidence
   that it happened, so those keep the palette open long enough to show the
   mark. That distinction is the return type, not a flag, so it can't be set
   wrong. */

export type Confirm = { ok: boolean; message: string };

export type Action = {
  id: string;
  label: string;
  /** Right-hand text: a destination, a domain, the current value. */
  meta?: string;
  /** Words the filter should match that the label doesn't contain. */
  keywords?: string[];
  run: () => void | Confirm | Promise<void | Confirm>;
};

export type ActionGroup = { heading: string; actions: Action[] };

export type ActionContext = {
  pathname: string;
  /** Absolute URL of the page the palette was opened on. */
  href: string;
  navigate: (href: string) => void;
  /** Scroll to an element by id on the current page, honouring reduced motion. */
  jumpTo: (id: string) => void;
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const RESUME = "/resume.pdf";
const RESUME_SAVE_AS = "resume-omar-sadek.pdf";

/* ── Primitives ─────────────────────────────────────────────────────────── */

async function copy(text: string, message: string): Promise<Confirm> {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true, message };
  } catch {
    /* Clipboard writes are refused outright on an insecure origin and by
       Safari when the write lands outside the gesture that started it.
       Saying so beats a mark that claims a copy that didn't happen. */
    return { ok: false, message: "Couldn't copy, clipboard blocked" };
  }
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/* The résumé is fetched as a blob rather than linked, for the same reason
   DownloadResume.tsx does it: a bare `<a download>` hands off to the browser
   and never reports back, so there would be nothing to confirm. Here that
   matters more than it does on the button, since the palette closes on most
   actions, so an unconfirmed download would look like the palette simply
   swallowed the keystroke. */
async function downloadResume(): Promise<Confirm> {
  try {
    const response = await fetch(RESUME);
    if (!response.ok) throw new Error(String(response.status));

    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = RESUME_SAVE_AS;
    link.click();
    /* One frame before revoking: Safari reads the blob after click returns. */
    setTimeout(() => URL.revokeObjectURL(url), 0);

    return { ok: true, message: "Downloaded" };
  } catch {
    window.location.href = RESUME;
    return { ok: true, message: "Opening résumé" };
  }
}

/* ── Page content actions ─────────────────────────────────────────────────
   Shared by every route; only the labels differ, because "Copy this case
   study as Markdown" is a more useful sentence than "Copy page as Markdown"
   when you are standing on one. */
function contentActions(context: ActionContext, subject: string): Action[] {
  const markdown = () => pageMarkdown(context);

  return [
    {
      id: "copy-link",
      label: `Copy link to ${subject}`,
      meta: context.href.replace(/^https?:\/\//, ""),
      keywords: ["url", "share", "permalink"],
      run: () => copy(context.href, "Link copied"),
    },
    {
      id: "copy-markdown",
      label: `Copy ${subject} as Markdown`,
      keywords: ["md", "llm", "text", "plain"],
      run: () => {
        const text = markdown();
        if (!text) return { ok: false, message: "Nothing on this page to convert" };
        return copy(text, "Markdown copied");
      },
    },
    chatAction("chatgpt", "ChatGPT", context, markdown),
    chatAction("claude", "Claude", context, markdown),
  ];
}

/* `window.open` has to happen inside the gesture or the popup blocker eats
   it, which is why the Markdown is built synchronously and the window is
   opened before the clipboard write is awaited in the overflow branch. */
function chatAction(
  target: ChatTarget,
  name: string,
  context: ActionContext,
  markdown: () => string | undefined,
): Action {
  return {
    id: `open-in-${target}`,
    label: `Open in ${name}`,
    meta: "with this page",
    keywords: ["ai", "chat", "ask", "llm", "summarise", "summarize"],
    run: () => {
      const text = markdown();
      if (!text) {
        openExternal(CHAT_BASE[target]);
        return;
      }

      const prompt = chatPrompt(text, context.href);
      const url = chatUrl(target, prompt);

      if (url) {
        openExternal(url);
        return;
      }

      /* Too long to survive a query string. The honest options are to
         truncate, to refuse, or to move the payload to the clipboard and
         say so. Truncation is the one that produces a confidently wrong
         answer downstream, so it is the one not taken. */
      openExternal(CHAT_BASE[target]);
      return copy(prompt, `Too long for a link, copied instead. Paste it into ${name}`);
    },
  };
}

function pageMarkdown(context: ActionContext): string | undefined {
  const key = projectKey(context.pathname);
  return key ? projectMarkdown(key) : documentMarkdown(context.href);
}

export function projectKey(pathname: string): ProjectKeys | undefined {
  const match = /^\/work\/([^/]+)/.exec(pathname);
  const key = match?.[1];
  return key && key in allProjects ? (key as ProjectKeys) : undefined;
}

/* ── The always-present groups ──────────────────────────────────────────── */

function pageActions(context: ActionContext): Action[] {
  return [
    /* Work has no route of its own; the index's `#work` section is the
       list. Named here so "work" as a query lands on something. */
    {
      id: "page-work",
      label: "Work",
      meta: "/#work",
      keywords: ["projects", "case studies", "index"],
      run: () =>
        context.pathname === "/" ? context.jumpTo("work") : context.navigate("/#work"),
    },
    ...menuPages.map((page) => ({
      id: `page-${page.slug}`,
      label: page.name,
      meta: page.slug,
      run: () => context.navigate(page.slug),
    })),
  ];
}

function workActions(context: ActionContext, exclude?: ProjectKeys): Action[] {
  return projectOrder
    .filter((key) => key !== exclude)
    .map((key) => ({
      id: `work-${key}`,
      label: allProjects[key].title,
      meta: allProjects[key].role,
      keywords: [
        allProjects[key].period ?? "",
        ...allProjects[key].technologies.backend,
        ...allProjects[key].technologies.frontend,
      ].filter(Boolean),
      run: () => context.navigate(`/work/${key}`),
    }));
}

function themeActions(context: ActionContext): Action[] {
  const next = context.resolved === "dark" ? "light" : "dark";

  return [
    {
      id: "theme-toggle",
      label: `Switch to ${next} theme`,
      meta: context.theme === "system" ? "currently system" : `currently ${context.theme}`,
      keywords: ["dark", "light", "appearance", "mode", "colour", "color"],
      /* No Confirm: the entire page repaints, which is a louder
         confirmation than a 16px tick could ever be. Closing lets the
         visitor see it. */
      run: () => context.setTheme(next),
    },
    {
      id: "theme-system",
      label: "Match system theme",
      keywords: ["auto", "os", "appearance", "default"],
      run: () => context.setTheme("system"),
    },
  ];
}

function utilityActions(context: ActionContext): Action[] {
  return [
    {
      id: "copy-email",
      label: "Copy email",
      meta: EMAIL,
      keywords: ["contact", "mail", "reach", "hire"],
      run: () => copy(EMAIL, "Email copied"),
    },
    {
      id: "email",
      label: "Send an email",
      meta: EMAIL,
      keywords: ["contact", "mailto", "hire"],
      run: () => {
        window.location.href = MAILTO;
      },
    },
    {
      id: "resume",
      label: "Download résumé",
      meta: "PDF",
      keywords: ["cv", "resume"],
      run: downloadResume,
    },
    ...themeActions(context),
  ];
}

function elsewhereActions(): Action[] {
  return contacts.map((contact) => ({
    id: `contact-${contact.name}`,
    label: contact.name,
    meta: contact.url.replace(/^https?:\/\/(www\.)?/, ""),
    keywords: ["social", "profile", "elsewhere"],
    run: () => openExternal(contact.url),
  }));
}

/* ── The route-aware assembly ───────────────────────────────────────────── */

export function buildGroups(context: ActionContext): ActionGroup[] {
  const key = projectKey(context.pathname);

  if (key) {
    const project = allProjects[key];
    const index = projectOrder.indexOf(key);
    const previous = index > 0 ? projectOrder[index - 1] : undefined;
    const next = index < projectOrder.length - 1 ? projectOrder[index + 1] : undefined;

    /* Only titled sections carry an `id` on the page, so only titled
       sections can be jumped to. An untitled one is a figure block with
       prose under it and has nothing to name in a row. */
    const sections: Action[] = project.sections
      .filter((section) => section.title)
      .map((section) => ({
        id: `section-${slugify(section.title!)}`,
        label: section.title!,
        meta: "section",
        keywords: ["jump", "scroll", "heading"],
        run: () => context.jumpTo(slugify(section.title!)),
      }));

    return [
      {
        heading: project.title,
        actions: [
          ...sections,
          ...(project.link
            ? [
                {
                  id: "project-site",
                  label: `Open ${project.link}`,
                  meta: "live site",
                  keywords: ["website", "visit", "url", "demo"],
                  run: () => openExternal(`https://${project.link}`),
                },
              ]
            : []),
          ...contentActions(context, "this case study"),
          ...(previous
            ? [
                {
                  id: "project-previous",
                  label: `Previous: ${allProjects[previous].title}`,
                  keywords: ["back", "prev"],
                  run: () => context.navigate(`/work/${previous}`),
                },
              ]
            : []),
          ...(next
            ? [
                {
                  id: "project-next",
                  label: `Next: ${allProjects[next].title}`,
                  keywords: ["forward"],
                  run: () => context.navigate(`/work/${next}`),
                },
              ]
            : []),
        ],
      },
      { heading: "Work", actions: workActions(context, key) },
      { heading: "Pages", actions: pageActions(context) },
      { heading: "Actions", actions: utilityActions(context) },
      { heading: "Elsewhere", actions: elsewhereActions() },
    ];
  }

  const global: ActionGroup[] = [
    { heading: "Pages", actions: pageActions(context) },
    {
      heading: "Actions",
      actions: [...contentActions(context, "this page"), ...utilityActions(context)],
    },
    { heading: "Elsewhere", actions: elsewhereActions() },
  ];

  if (context.pathname === "/") {
    /* The index's whole purpose is the Work list, so the palette opens
       already pointing at it: first row jumps to the section, the rest go
       straight into a study. */
    return [
      {
        heading: "Work",
        actions: [
          {
            id: "jump-work",
            label: "Jump to Work",
            meta: "on this page",
            keywords: ["projects", "scroll", "section"],
            run: () => context.jumpTo("work"),
          },
          ...workActions(context),
        ],
      },
      ...global,
    ];
  }

  return [global[0], { heading: "Work", actions: workActions(context) }, ...global.slice(1)];
}
