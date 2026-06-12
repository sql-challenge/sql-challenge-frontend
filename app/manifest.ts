import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SQL CHALLENGE",
    short_name: "SQL Challenge",
    description: "Mistérios e desafios SQL — aprenda SQL resolvendo casos detectivescos",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a14",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
