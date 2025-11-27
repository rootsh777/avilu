import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    domains: [
      "es.investinbogota.org",
      "i0.wp.com/passporterapp.com",
      "probarranquilla.org",
      "elpilon.com.co",
      "static.avianca.com"
    ],
  },

};

export default nextConfig;
