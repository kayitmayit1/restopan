/**
 * Production site URL when env is missing. Local: set NEXT_PUBLIC_APP_URL in `.env.local`
 * (e.g. http://localhost:3000).
 */
const PRODUCTION_APP_URL = "https://restopan.com";

export function publicAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return PRODUCTION_APP_URL;
}
