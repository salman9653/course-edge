declare module 'next-pwa' {
  import type { NextConfig } from 'next';
  export default function withPWAInit(options: unknown): (nextConfig: NextConfig) => NextConfig;
}
