import type { NextConfig } from "next";
import path from "path";

const basePath = "/livro-autismo";

const nextConfig: NextConfig = {
  basePath,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: ["192.168.3.31", "localhost", "127.0.0.1"],
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
