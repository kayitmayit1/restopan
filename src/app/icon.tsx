import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(145deg, #e85d04 0%, #f48c06 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          gap: 0,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 15,
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "sans-serif",
            letterSpacing: "-1px",
          }}
        >
          R
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 5,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: "sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          PAN
        </div>
      </div>
    ),
    { width: 32, height: 32 }
  );
}
