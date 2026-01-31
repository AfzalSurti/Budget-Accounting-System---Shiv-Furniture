import { cp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const src = path.resolve("src", "generated", "prisma");
const dest = path.resolve("dist", "generated", "prisma");

if (!existsSync(src)) {
  console.error(`Prisma generated client not found at ${src}`);
  process.exit(1);
}

await rm(dest, { recursive: true, force: true });
await cp(src, dest, { recursive: true });
