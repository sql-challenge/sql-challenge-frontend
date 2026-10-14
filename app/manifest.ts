import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SQL CHALLENGE",
    short_name: "SQL Challenge",
    description: "Mistérios e desafios SQL — aprenda SQL resolvendo casos detectivescos",
    start_url: "/",
    display: "standalone",
    background_color: "#07070d",
    theme_color: "#00e5ff",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
