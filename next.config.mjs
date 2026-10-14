import path from "path";
export default {
  reactStrictMode: true,
  experimental: { serverComponentsExternalPackages: ["@electric-sql/pglite"] },
  webpack(config) { config.resolve.alias["@"] = path.resolve(process.cwd(), "src"); return config; },
};
