await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  serverExternalPackages: ["@resvg/resvg-js"],
};

export default config;
