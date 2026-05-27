import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

/** Load `.env` then `.env.local` (same precedence as Next.js). */
export function loadProjectEnv(): void {
  const root = process.cwd();
  config({ path: resolve(root, ".env") });
  const localPath = resolve(root, ".env.local");
  if (existsSync(localPath)) {
    config({ path: localPath, override: true });
  }
}
