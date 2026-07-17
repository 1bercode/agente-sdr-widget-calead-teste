/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@calead/ui"],
  async headers() {
    return [
      {
        // Allow the widget iframe route to be embedded on any site.
        source: "/widget",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *;" },
        ],
      },
    ];
  },
};

export default nextConfig;
