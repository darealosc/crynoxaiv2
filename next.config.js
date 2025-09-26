/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Allow up to 10MB files
    },
  },
  // Fix the turbopack warning
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig