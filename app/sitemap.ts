import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sql-challenge.atcfalcons.org";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/mystery`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/ranking`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/conquistas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/auth/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
