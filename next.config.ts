import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig:NextConfig = {
  // webpack: (config, { isServer }) => {
  //   // Handle WASM files
  //   config.experiments = {
  //     ...config.experiments,
  //     asyncWebAssembly: true,
  //   };

  //   // Add rule for .wasm files
  //   config.module.rules.push({
  //     test: /\.wasm$/,
  //     type: "asset/resource",
  //   });

  //   return config;
  // },
};

module.exports = nextConfig;