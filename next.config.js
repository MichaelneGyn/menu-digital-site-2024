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
        hostname: '*.amazonaws.com', // AWS S3
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Supabase Storage
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Dev local
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
              "default-src 'self'", // Padrão: apenas origem própria
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com", // Scripts: próprio + inline (Next.js precisa)
              "style-src 'self' 'unsafe-inline'", // Estilos: próprio + inline (Tailwind precisa)
              "img-src 'self' data: https: blob:", // Imagens: qualquer HTTPS + data URLs + blobs
              "font-src 'self' data:", // Fontes: próprio + data URLs
              "connect-src 'self' https://*.supabase.co https://vercel.live wss://*.supabase.co", // APIs: próprio + Supabase + Vercel
              "frame-src 'self' https://vercel.live", // iFrames: próprio + Vercel (analytics)
              "object-src 'none'", // Sem plugins (Flash, etc) - SEGURANÇA
              "base-uri 'self'", // Previne injeção de <base> tag
              "form-action 'self'", // Forms só podem submeter para próprio domínio
              "upgrade-insecure-requests", // Force HTTPS
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
