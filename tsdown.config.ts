import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  platform: "node",
  target: "es2020",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  publint: true,
});
