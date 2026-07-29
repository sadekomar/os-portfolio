import type { NextConfig } from "next";

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
