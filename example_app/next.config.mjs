/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  transpilePackages: [
    '@web-base/base-ui',
    '@web-base/base-auth',
    '@web-base/base-api',
    '@web-base/base-cms',
    '@web-base/base-monitoring',
  ],
}

export default nextConfig
