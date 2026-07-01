// Twitter card image — identical to the OpenGraph card. Twitter does not
// automatically fall back to og:image when a site defines its own card tags,
// so we re-export the same generator here.
export const runtime = "nodejs";
export { alt, size, contentType } from "./opengraph-image";
export { default } from "./opengraph-image";
