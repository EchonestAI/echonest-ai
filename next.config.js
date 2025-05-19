// next.config.js
process.env.NEXT_DISABLE_ESLINT = '1';
process.env.TYPESCRIPT_SKIP_TRANSFORMATION = 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Any other configurations you need
};

module.exports = nextConfig;