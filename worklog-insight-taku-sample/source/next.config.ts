import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const basePath = process.env.GITHUB_PAGES_BASE_PATH ?? '/worklog-insight-taku-sample';

const nextConfig: NextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  basePath: isGitHubPages ? basePath : undefined,
  assetPrefix: isGitHubPages ? basePath : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
