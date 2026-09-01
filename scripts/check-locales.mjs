import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** Fails the build if any language is still shipping English. */
const dir = path.join(process.cwd(), "src/lib/i18n/locales");
const stubs = readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && f !== "en.ts")
  .filter((f) => readFileSync(path.join(dir, f), "utf8").includes("UNTRANSLATED_PLACEHOLDER"))
  .map((f) => f.replace(/\.ts$/, ""));

if (stubs.length > 0) {
  console.error(`Untranslated locales still shipping English: ${stubs.join(", ")}`);
  process.exit(1);
}
console.log("All locales translated.");
