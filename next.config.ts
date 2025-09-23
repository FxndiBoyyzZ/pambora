
import type {NextConfig} from 'next';

const securityHeaders = [
  // Prevents clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Prevents XSS attacks by stopping pages from loading when they detect injected scripts.
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Prevents the browser from interpreting files as something other than what they are declared as.
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Controls how much referrer information (sent via the Referer header) should be included with requests.
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];


const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
   async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
            ...securityHeaders,
            {
                key: 'Cache-Control',
                value: 'no-store, max-age=0',
            },
        ],
      },
    ];
  },
};

export default nextConfig;
