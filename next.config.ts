import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Files named page.dev.tsx (e.g. the Ceremonies pamphlet mockup under
  // src/app/pamphlet-ideas) are routes on the dev server only: a production
  // build doesn't recognise them, so they and the assets they import never ship.
  pageExtensions: isDev ? ["dev.tsx", "tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
