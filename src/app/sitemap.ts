import type { MetadataRoute } from "next";

const BASE_URL = "https://neyisek.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    "",
    "/menu",
    "/search",
    "/login",
    "/register",
    "/cart",
    "/favorites",
    "/orders",
    "/loyalty",
    "/profile",
  ];

  return staticPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/menu" ? 0.9 : 0.7,
  }));
}
