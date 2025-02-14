/** @type {import('next').NextConfig} */
const nextConfig = {
//   output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['xliweicrvrldeigdatup.supabase.co'],
    unoptimized: true
  },
};

module.exports = nextConfig;
