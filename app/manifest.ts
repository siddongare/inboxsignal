import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InboxSignal",
    short_name: "InboxSignal",
    description: "Cognitive Outbound Forensics & Conversion Diagnostic Engine",
    start_url: "/",
    display: "standalone",
    background_color: "#060709",
    theme_color: "#060709",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
