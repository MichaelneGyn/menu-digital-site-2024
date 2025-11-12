/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  
  async headers() {
    return [
      // 🔒 Headers de Segurança Globais
      {
        source: '/:path*',
        headers: [
          // Previne clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Previne MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // XSS Protection (legacy, mas ainda útil)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions Policy
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // 🛡️ Content-Security-Policy (PROTEÇÃO MÁXIMA CONTRA XSS!)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com https://googletagmanager.com https://google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob: https://*.supabase.co https://*.googleapis.com https://*.googleusercontent.com https://*.ytimg.com https://*.youtube.com https://www.google-analytics.com https://www.googletagmanager.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://vercel.live wss://*.supabase.co https://viacep.com.br https://nominatim.openstreetmap.org https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://region1.google-analytics.com",
              "frame-src 'self' https://vercel.live https://www.youtube.com https://youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; ')
          },
        ],
      },
      // CORS para APIs
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://menu-digital-site-2024-8773d37d6064-git-main-michaeldouglasqueiroz.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          // Rate limiting hint
          { key: 'X-RateLimit-Limit', value: '60' },
        ],
      },
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://menu-digital-site-2024-8773d37d6064-git-main-michaeldouglasqueiroz.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

module.exports = nextConfig;
