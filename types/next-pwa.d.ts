declare module 'next-pwa' {
  import { NextConfig } from 'next';
  const withPWAInit: (config?: unknown) => (nextConfig: NextConfig) => NextConfig;
  export default withPWAInit;
}
