interface RestoPanLogoProps {
  variant?: "full" | "icon" | "text";
  dark?: boolean;
  className?: string;
  iconSize?: number;
}

export function RestoPanLogo({
  variant = "full",
  dark = false,
  className = "",
  iconSize = 36,
}: RestoPanLogoProps) {
  const textColor = dark ? "#ffffff" : "#111827";
  const subColor = dark ? "rgba(255,255,255,0.45)" : "#9ca3af";
  const iconBg = dark ? "rgba(192,57,43,0.18)" : "#fef2f2";

  const Icon = (
    <span
      aria-hidden="true"
      style={{
        width: iconSize,
        height: iconSize,
        borderRadius: iconSize * 0.28,
        background: iconBg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={iconSize * 0.62}
        height={iconSize * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c0392b"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ChefHat path */}
        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
        <line x1="6" y1="17" x2="18" y2="17" />
        <line x1="6" y1="13" x2="18" y2="13" />
      </svg>
    </span>
  );

  if (variant === "icon") return <span className={className}>{Icon}</span>;

  if (variant === "text") {
    return (
      <span className={`inline-flex flex-col leading-none ${className}`}>
        <span style={{ color: textColor, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Resto<span style={{ color: "#c0392b" }}>Pan</span>
        </span>
      </span>
    );
  }

  const fontSize = iconSize * 0.52;
  const subFontSize = iconSize * 0.22;

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {Icon}
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 4 }}>
        <span
          style={{
            color: textColor,
            fontSize,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          Resto<span style={{ color: "#c0392b" }}>Pan</span>
        </span>
        <span
          style={{
            color: subColor,
            fontSize: subFontSize,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          Restoran Yönetimi
        </span>
      </span>
    </span>
  );
}
