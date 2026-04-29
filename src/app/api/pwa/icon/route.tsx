import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const size = Math.min(Math.max(parseInt(searchParams.get("size") ?? "192"), 16), 512);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "linear-gradient(145deg, #e85d04 0%, #f48c06 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: Math.round(size * 0.22),
          boxShadow: "0 4px 24px rgba(232,93,4,0.35)",
        }}
      >
        {/* Fork + knife cross shape using text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: Math.round(size * 0.48),
              fontWeight: 900,
              lineHeight: 1,
              fontFamily: "sans-serif",
              letterSpacing: "-2px",
            }}
          >
            R
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: Math.round(size * 0.15),
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: "sans-serif",
              letterSpacing: "0.08em",
              marginTop: Math.round(size * -0.04),
            }}
          >
            PAN
          </div>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
