import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the parent folder made Next infer the wrong workspace
  // root — the same confusion that put a dependency outside the app and broke
  // two production builds. Pinning it keeps builds deterministic.
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  async headers() {
    return [
      {
        // The 757KB WebGL bundle in /public was served with
        // `max-age=0, must-revalidate`, so every visit revalidated the largest
        // asset on the site. Its contents are stable, so it can be immutable.
        source: "/vendor/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
