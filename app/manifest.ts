import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Feedy — Piano Pasti Settimanale",
    short_name: "Feedy",
    description: "Tracker del piano pasti settimanale",
    start_url: "/",
    display: "standalone",
    background_color: "#E8F0EC",
    theme_color: "#2D9F8F",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
