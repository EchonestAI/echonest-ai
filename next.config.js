/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Also ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  // Copy any other config you had in your next.config.ts file here
};

module.exports = nextConfig;