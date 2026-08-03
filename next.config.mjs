/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The trainer keeps its own client-side router (react-router) inside a single
  // catch-all route, so most pages are client components. Server code lives only
  // in the API routes that proxy Claude.
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
