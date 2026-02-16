import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/restaurant-panel/", "/courier/", "/api/", "/checkout"],
      },
    ],
    sitemap: "https://neyisek.com/sitemap.xml",
  };
}
