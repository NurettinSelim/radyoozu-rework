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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: nobody should frame this site (belt: CSP,
          // suspenders: XFO for legacy browsers without CSP support).
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/robots.txt", destination: "/api/robots" },
      { source: "/llms.txt", destination: "/api/llms" },
    ];
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
