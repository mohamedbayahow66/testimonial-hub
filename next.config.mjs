/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for Auth.js
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;


