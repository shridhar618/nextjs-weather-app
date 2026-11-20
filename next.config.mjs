import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this folder. Without it, Next.js picks up a stray
  // package-lock.json in a parent directory and warns about multiple lockfiles.
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
