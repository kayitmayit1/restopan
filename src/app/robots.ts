import { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/public-app-url";

const BASE = publicAppUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/sss",
          "/hakkimizda",
          "/iletisim",
          "/destek",
          "/gizlilik",
          "/kullanim-kosullari",
          "/mesafeli-satis-sozlesmesi",
          "/iade-politikasi",
          "/kayit",
          "/kayit/pro",
          "/giris",
        ],
        disallow: ["/dashboard/", "/api/", "/admin/", "/onboarding/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
