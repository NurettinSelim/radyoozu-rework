import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.radio.co" },
      { protocol: "https", hostname: "public.radio.co" },
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

export default nextConfig;
