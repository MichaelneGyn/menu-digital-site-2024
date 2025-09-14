/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true,
    domains: [
      'menu-digital-uploads.s3.us-west-2.amazonaws.com',
      'ludfeemuwrxjhiqcjywx.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      }
    ]
  },
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  // Configurações específicas para Vercel
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Otimizações para produção
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    
    // Otimizações para produção
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': '@prisma/client',
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
