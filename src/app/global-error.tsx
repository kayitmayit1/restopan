"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fff9f7", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: 80, fontWeight: 800, color: "#fca5a5", lineHeight: 1, margin: 0 }}>500</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Kritik Hata</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>Beklenmedik bir hata oluştu. Lütfen sayfayı yenileyin.</p>
          <button
            onClick={reset}
            style={{ marginTop: 24, background: "#e85d04", color: "#fff", border: "none", borderRadius: 12, padding: "10px 28px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
