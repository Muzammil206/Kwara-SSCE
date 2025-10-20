// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // For App Router support
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // Required for App Router
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hcrvqhnjrkxcmoflnnjj.supabase.co',
        port: '',
        pathname: '/v1/object/public/**',
        search: '',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
