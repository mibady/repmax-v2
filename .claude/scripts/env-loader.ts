/**
 * ENV LOADER
 *
 * Loads ~/.claude/.env into process.env.
 * Used by quality-pipeline.ts and future scripts.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(process.env.HOME || '/home/info', '.claude', '.env');

export function loadClaudeEnv(): Record<string, string> {
  const loaded: Record<string, string> = {};

  if (!existsSync(ENV_PATH)) {
    return loaded;
  }

  const content = readFileSync(ENV_PATH, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^export\s+([A-Za-z_][A-Za-z0-9_]*)=["']?([^"'\n]*)["']?/);
    const matchNoExport = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=["']?([^"'\n]*)["']?/);
    const m = match || matchNoExport;

    if (m) {
      loaded[m[1]] = m[2];
      if (!process.env[m[1]]) {
        process.env[m[1]] = m[2];
      }
    }
  }

  return loaded;
}
