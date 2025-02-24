import { build } from "esbuild";
import { rmSync } from "fs";

const outdir = "./.local/express/dist";

// Remove the previous build directory
rmSync(outdir, { recursive: true, force: true });
console.log(`Removed previous build directory: ${outdir}`);

build({
  entryPoints: ["src/server/express/server.ts"],
  bundle: true,
  sourcemap: true,
  format: "cjs",
  platform: "node",
  target: "node20",
  external: [], // Add any modules here you don't want bundled
  outfile: `${outdir}/api.js`,
  tsconfig: "./tsconfig.json",
  minify: true, // Minify for a lean production bundle
})
  .then(() => {
    console.log("Build succeeded!");
  })
  .catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
  });
