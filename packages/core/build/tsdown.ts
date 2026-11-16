import { defineConfig } from "tsdown"

// Builds an adapter's public entrypoint, bundling the private core into its archive.
export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  exports: true,
  publint: true,
  attw: {
    profile: "esm-only",
  },
})
