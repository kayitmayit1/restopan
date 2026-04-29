import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sss", "/hakkimizda", "/iletisim", "/destek", "/gizlilik", "/kullanim-kosullari", "/kayit", "/kayit/pro", "/giris"],
        disallow: ["/dashboard/", "/api/", "/admin/", "/onboarding/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
