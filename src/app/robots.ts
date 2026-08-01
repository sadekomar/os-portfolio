import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "DuckAssistBot", allow: "/" },
    ],
    /* No `host` line. It is a Yandex extension that Google and Bing both
       ignore, so its only real effect here was to be a fourth place the
       origin was asserted, free to fall out of step with the canonical
       tags and the sitemap without anything failing. The sitemap URL
       below already tells every crawler which host owns this file. */
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
