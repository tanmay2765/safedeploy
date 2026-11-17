
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination:
          "http://safedeploy-backend.safedeploy.svc.cluster.local:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
