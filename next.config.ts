import type { NextConfig } from "next";

/* No `@next/bundle-analyzer` here, and that is the considered answer rather
   than an omission. It is a webpack plugin: it hooks `config.plugins` through
   `webpack()`, and this project builds with Turbopack, which is the Next 16
   default and what actually ships. Wiring it up would mean either a callback
   nothing calls, or forcing `next build --webpack` to read it, at which point
   the numbers describe a bundler the site is not built with. Two bundlers do
   not agree on chunk boundaries, and chunk boundaries are the whole question.

   `pnpm analyze` runs Turbopack's own analyzer instead (`next build
   --experimental-analyze`), which writes a browsable report and a per-module
   size table to .next/diagnostics/analyze. Same information, measured on the
   build that is actually deployed, and nothing to guard in this file because
   it is a build flag rather than a config branch. */

const nextConfig: NextConfig = {
  images: {
    /* YouTube poster frames for the facade embeds on /talks. Scoped to the
       thumbnail path rather than the whole host: `i.ytimg.com` is the only
       remote image origin this site trusts, and `/vi/**` is the only thing
       on it we ask for, so a wildcard pathname would widen the allowance
       past anything the code can actually request.

       Routed through the optimiser rather than dropped in as a plain <img>
       because a 1280×720 JPEG is the single largest asset on the page and
       AVIF takes real weight off it, and the poster is the whole point of not
       loading the player, so it is the one image that has to be cheap. */
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
};

export default nextConfig;
