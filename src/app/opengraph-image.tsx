import { ImageResponse } from "next/og";

// Social-media preview card (og:image / twitter:image). Recreates the site
// hero — the couple's names and date on the cream double-framed invitation —
// at the 1200×630 size platforms expect. Rendered by Satori, so styles are
// inline and fixed-size (no Tailwind, no clamp()).

export const runtime = "nodejs";
export const alt = "Marlan & Tramaine — 26 & 27 November 2026, Cape Town";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fetch a Google font as a TTF buffer for Satori. The css2 endpoint serves
// TTF when the request has no browser User-Agent (as with fetch here).
async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(
    text,
  )}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!src) throw new Error(`Failed to load font: ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

export default async function OpengraphImage() {
  const eyebrow = "Together with their families";
  const names = "Marlan & Tramaine";
  const invite =
    "joyfully request the pleasure of your company to share in their wedding celebrations";
  const dateLabel = "26 & 27 NOVEMBER 2026";
  const place = "Cape Town, South Africa";

  const [parisienne, cormorant, cormorantItalic, cinzel] = await Promise.all([
    loadGoogleFont("Parisienne", names),
    loadGoogleFont("Cormorant+Garamond:wght@600", `${invite} ${place}`),
    loadGoogleFont("Cormorant+Garamond:ital@1", eyebrow),
    loadGoogleFont("Cinzel:wght@500", dateLabel),
  ]);

  const rule = (dir: "left" | "right") => (
    <div
      style={{
        width: 90,
        height: 1,
        background:
          dir === "left"
            ? "linear-gradient(90deg,transparent,#b08a36)"
            : "linear-gradient(90deg,#b08a36,transparent)",
      }}
    />
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4ecda",
          padding: 40,
        }}
      >
        {/* Outer gold frame */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(176,138,54,.55)",
            padding: 6,
            background:
              "radial-gradient(120% 80% at 50% 0%, #faf4e6 0%, #f1e7d1 100%)",
          }}
        >
          {/* Inner gold frame */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
              height: "100%",
              border: "1px solid rgba(176,138,54,.4)",
              padding: "40px 60px",
            }}
          >
            <div
              style={{
                fontFamily: "Cormorant",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 28,
                color: "#6a5016",
              }}
            >
              {eyebrow}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "Parisienne",
                color: "#8a5f10",
                lineHeight: 1.02,
                margin: "8px 0 4px",
              }}
            >
              <div style={{ fontSize: 96 }}>Marlan</div>
              <div style={{ fontSize: 46, color: "#b08a36", margin: "-8px 0" }}>
                &amp;
              </div>
              <div style={{ fontSize: 96 }}>Tramaine</div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "Cormorant",
                fontWeight: 600,
                fontSize: 26,
                color: "#46370f",
                lineHeight: 1.5,
                marginTop: 10,
              }}
            >
              <span>joyfully request the pleasure of your company</span>
              <span>to share in their wedding celebrations</span>
            </div>

            {/* Diamond divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "26px 0",
              }}
            >
              {rule("left")}
              <div
                style={{
                  width: 9,
                  height: 9,
                  background: "#b08a36",
                  transform: "rotate(45deg)",
                }}
              />
              {rule("right")}
            </div>

            <div
              style={{
                fontFamily: "Cinzel",
                fontWeight: 500,
                fontSize: 20,
                letterSpacing: 5,
                color: "#7c5c14",
              }}
            >
              {dateLabel}
            </div>
            <div
              style={{
                fontFamily: "Cormorant",
                fontWeight: 600,
                fontSize: 22,
                color: "#856312",
                marginTop: 4,
              }}
            >
              {place}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Parisienne", data: parisienne, weight: 400, style: "normal" },
        { name: "Cormorant", data: cormorant, weight: 600, style: "normal" },
        {
          name: "Cormorant",
          data: cormorantItalic,
          weight: 400,
          style: "italic",
        },
        { name: "Cinzel", data: cinzel, weight: 500, style: "normal" },
      ],
    },
  );
}
