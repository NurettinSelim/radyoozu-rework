import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Dev-only: allow loopback-IP access (used for local Spotify/Google OAuth,
  // since Spotify rejects "localhost"). No effect on production.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.radio.co" },
      { protocol: "https", hostname: "public.radio.co" },
      { protocol: "https", hostname: "**.scdn.co" },
      { protocol: "https", hostname: "**.spotifycdn.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/haftal%C4%B1k-yay%C4%B1nlar",
        destination: "/yayinlar",
        permanent: true,
      },
      {
        source: "/haftalık-yayınlar",
        destination: "/yayinlar",
        permanent: true,
      },
      {
        source: "/bize-ula%C5%9F",
        destination: "/iletisim",
        permanent: true,
      },
      {
        source: "/bize-ulaş",
        destination: "/iletisim",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
