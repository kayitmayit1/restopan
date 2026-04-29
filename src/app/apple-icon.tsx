import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(145deg, #e85d04 0%, #f48c06 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          gap: 0,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 86,
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "sans-serif",
            letterSpacing: "-4px",
          }}
        >
          R
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 27,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: "sans-serif",
            letterSpacing: "0.1em",
            marginTop: -8,
          }}
        >
          PAN
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
