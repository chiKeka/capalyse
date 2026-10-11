import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/sme/", "/investor/", "/organization/", "/overview/"],
    },
    sitemap: "https://capalyse.com/sitemap.xml",
    host: "https://capalyse.com",
  };
}
