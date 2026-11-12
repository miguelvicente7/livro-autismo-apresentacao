import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: ["192.168.3.31", "localhost", "127.0.0.1"],
};

export default nextConfig;
