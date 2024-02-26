await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    serverComponentsExternalPackages: ['@resvg/resvg-js'],
  },
};

export default config;
