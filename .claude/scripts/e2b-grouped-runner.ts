#!/usr/bin/env npx tsx
/**
 * E2B GROUPED JOURNEY RUNNER — Cloud Sandbox Orchestrator
 *
 * Spins up ONE E2B sandbox, builds the app once, starts the server,
 * then runs journey groups sequentially. Each group gets its own
 * browser context and auth session.
 *
 * Usage:
 *   npx tsx .claude/scripts/e2b-grouped-runner.ts --dir apps/web/journeys           # run all groups
 *   npx tsx .claude/scripts/e2b-grouped-runner.ts --dir apps/web/journeys --group 02-onboarding
 *   npx tsx .claude/scripts/e2b-grouped-runner.ts --dir apps/web/journeys --from 07 --to 12
 *   npx tsx .claude/scripts/e2b-grouped-runner.ts --dir apps/web/journeys --retry-failed
 *   npx tsx .claude/scripts/e2b-grouped-runner.ts --dir apps/web/journeys --timeout 300
 *   npx tsx .claude/scripts/e2b-grouped-runner.ts status
 *
 * Requires:
 *   E2B_API_KEY in ~/.claude/.env
 *   GITHUB_TOKEN in ~/.claude/.env (for private repos)
 *
 * Cost: ~$0.04-0.10 per full run (10-30 minutes sandbox time)
 *
 * Location: .claude/scripts/e2b-grouped-runner.ts
 */

import { Sandbox } from 'e2b';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join, basename, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { loadClaudeEnv } from './env-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Types ───────────────────────────────────────────────────────────────────

interface Config {
  repo: string;
  branch: string;
  dir: string;
  group?: string;
  from?: string;
  to?: string;
  timeout: number;
  sandboxTimeout: number;
  jsonOutput: boolean;
  retryFailed: boolean;
}

interface GroupFile {
  filename: string;
  group: string;
  name: string;
  requiresAuth: boolean;
  role?: string;
  pages: string[];
  journeys: any[];
  env?: Record<string, string>;
  baseUrl?: string;
  project?: string;
}

interface GroupResult {
  group: string;
  name: string;
  status: 'pass' | 'fail' | 'error' | 'skip';
  journeys_passed: number;
  journeys_failed: number;
  journeys_total: number;
  steps_passed: number;
  steps_total: number;
  duration_ms: number;
  error?: string;
  screenshots: string[];
}

interface RunResult {
  sandbox_id: string;
  status: 'pass' | 'fail' | 'error';
  groups: GroupResult[];
  summary: {
    groups_passed: number;
    groups_failed: number;
    groups_total: number;
    journeys_passed: number;
    journeys_failed: number;
    journeys_total: number;
    steps_passed: number;
    steps_total: number;
    pass_rate: string;
    duration_ms: number;
    cost_estimate: string;
  };
  setup_stages: { name: string; status: string; duration_ms: number; output?: string }[];
}

interface FailureRecord {
  timestamp: string;
  pass_rate: string;
  failed_groups: string[];
  failed_journeys: Record<string, string[]>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string, json: boolean) {
  if (!json) console.log(msg);
}

async function runCmd(
  sandbox: Sandbox,
  cmd: string,
  opts: { timeout?: number; cwd?: string } = {},
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const result = await sandbox.commands.run(cmd, {
      timeoutMs: (opts.timeout || 120) * 1000,
      cwd: opts.cwd,
    });
    return { stdout: result.stdout || '', stderr: result.stderr || '', exitCode: result.exitCode };
  } catch (err: any) {
    if (err.result) {
      return {
        exitCode: err.result.exitCode ?? 1,
        stdout: err.result.stdout ?? '',
        stderr: err.result.stderr ?? err.result.error ?? err.message,
      };
    }
    return { exitCode: 1, stdout: '', stderr: err.message || String(err) };
  }
}

function discoverGroups(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.json') && !f.startsWith('.'))
    .sort();
}

function filterGroups(files: string[], config: Config): string[] {
  let filtered = [...files];

  if (config.retryFailed) {
    const failurePath = join(config.dir, '.last-failures.json');
    if (!existsSync(failurePath)) {
      console.log('  No .last-failures.json found — running all groups');
      return filtered;
    }
    try {
      const failures: FailureRecord = JSON.parse(readFileSync(failurePath, 'utf-8'));
      const failedSet = new Set(failures.failed_groups);
      filtered = filtered.filter(f => failedSet.has(f));
      console.log(`  Retrying ${filtered.length} previously failed groups (from ${failures.timestamp})`);
      if (filtered.length === 0) {
        console.log('  All groups passed last run!');
        return [];
      }
    } catch (e: any) {
      console.log(`  Failed to read .last-failures.json: ${e.message} — running all`);
      return filtered;
    }
    return filtered;
  }

  if (config.group) {
    filtered = filtered.filter(f => f.includes(config.group!));
    return filtered;
  }

  if (config.from) {
    const idx = filtered.findIndex(f => f.includes(config.from!));
    if (idx >= 0) filtered = filtered.slice(idx);
  }
  if (config.to) {
    const idx = filtered.findIndex(f => f.includes(config.to!));
    if (idx >= 0) filtered = filtered.slice(0, idx + 1);
  }

  return filtered;
}

function saveFailures(config: Config, groupResults: GroupResult[], passRate: string) {
  const failedGroups: string[] = [];
  const failedJourneys: Record<string, string[]> = {};

  for (const g of groupResults) {
    if (g.status !== 'pass') {
      failedGroups.push(`${g.group}.json`);
      failedJourneys[g.group] = [];
    }
  }

  // Try to enrich with per-journey failure details
  const resultsBase = join(process.cwd(), 'journey-results');
  try {
    const dirs = readdirSync(resultsBase).filter(d => d.startsWith('grouped-')).sort().reverse();
    if (dirs.length > 0) {
      const latestDir = join(resultsBase, dirs[0]);
      for (const group of failedGroups) {
        const groupName = group.replace('.json', '');
        const resultsFile = join(latestDir, groupName, 'results.json');
        if (existsSync(resultsFile)) {
          try {
            const r = JSON.parse(readFileSync(resultsFile, 'utf-8'));
            if (r.journeys) {
              failedJourneys[groupName] = r.journeys
                .filter((j: any) => j.status !== 'pass')
                .map((j: any) => j.name);
            }
          } catch { /* skip */ }
        }
      }
    }
  } catch { /* skip */ }

  const record: FailureRecord = {
    timestamp: new Date().toISOString(),
    pass_rate: passRate,
    failed_groups: failedGroups,
    failed_journeys: failedJourneys,
  };

  writeFileSync(join(config.dir, '.last-failures.json'), JSON.stringify(record, null, 2));
  console.log(`  Saved failure list (${failedGroups.length} groups)`);
}

function autoDetectRepo(): string | null {
  try {
    const remote = execSync('git remote get-url origin 2>/dev/null', { encoding: 'utf-8' }).trim();
    if (!remote) return null;
    return remote.startsWith('git@')
      ? remote.replace(/^git@([^:]+):/, 'https://$1/').replace(/\.git$/, '')
      : remote.replace(/\.git$/, '');
  } catch {
    return null;
  }
}

// ─── Status Check ────────────────────────────────────────────────────────────

async function checkStatus() {
  console.log('\n── E2B Grouped Journey Runner — Status ──\n');

  const e2bKey = process.env.E2B_API_KEY;
  console.log(`  E2B_API_KEY:       ${e2bKey ? `SET (${e2bKey.length} chars)` : 'NOT SET'}`);

  const ghToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  console.log(`  GITHUB_TOKEN:      ${ghToken ? 'SET' : 'NOT SET'}`);

  const runnerPath = join(__dirname, 'e2b-journey-runner.ts');
  console.log(`  journey-runner:    ${existsSync(runnerPath) ? 'FOUND' : 'MISSING'} (${runnerPath})`);

  const envLoaderPath = join(__dirname, 'env-loader.ts');
  console.log(`  env-loader:        ${existsSync(envLoaderPath) ? 'FOUND' : 'MISSING'}`);

  // Check journeys dir
  const journeysDirs = ['apps/web/journeys', 'journeys'];
  for (const d of journeysDirs) {
    if (existsSync(d)) {
      const groups = discoverGroups(d);
      console.log(`  ${d}/:    ${groups.length} groups`);
      let total = 0;
      for (const g of groups) {
        try {
          const data = JSON.parse(readFileSync(join(d, g), 'utf-8'));
          total += data.journeys?.length || 0;
          console.log(`    ${g.padEnd(35)} ${(data.journeys?.length || 0)} journeys  auth:${data.requiresAuth}  role:${data.role || 'none'}`);
        } catch {
          console.log(`    ${g.padEnd(35)} (parse error)`);
        }
      }
      console.log(`  Total journeys:    ${total}`);
    }
  }

  if (e2bKey) {
    try {
      console.log('\n  Provisioning test sandbox...');
      const sandbox = await Sandbox.create({ timeoutMs: 30000 });
      const result = await sandbox.commands.run('echo ok && node --version', { timeoutMs: 10000 });
      console.log(`  Sandbox:           WORKING (Node ${result.stdout?.trim().split('\n').pop()})`);
      await sandbox.kill();
    } catch (e: any) {
      console.log(`  Sandbox:           FAILED (${e.message})`);
    }
  }

  console.log('');
}

// ─── Main Runner ─────────────────────────────────────────────────────────────

async function runGrouped(config: Config): Promise<RunResult> {
  const startTime = Date.now();
  const setupStages: RunResult['setup_stages'] = [];
  const groupResults: GroupResult[] = [];
  const resultsBaseDir = join(
    process.cwd(), 'journey-results',
    `grouped-${new Date().toISOString().split('T')[0]}`,
  );
  mkdirSync(resultsBaseDir, { recursive: true });

  const allFiles = discoverGroups(config.dir);
  if (allFiles.length === 0) {
    console.error(`ERROR: No .json files found in ${config.dir}`);
    process.exit(1);
  }

  const groupFiles = filterGroups(allFiles, config);
  log(`\n${'═'.repeat(60)}`, config.jsonOutput);
  log('  E2B GROUPED JOURNEY RUNNER', config.jsonOutput);
  log(`${'═'.repeat(60)}`, config.jsonOutput);
  log(`  Repo:     ${config.repo}`, config.jsonOutput);
  log(`  Branch:   ${config.branch}`, config.jsonOutput);
  log(`  Groups:   ${groupFiles.length} of ${allFiles.length}`, config.jsonOutput);
  log(`  Timeout:  ${config.timeout}s per group`, config.jsonOutput);
  log(`${'═'.repeat(60)}\n`, config.jsonOutput);

  let totalJourneys = 0;
  for (const file of groupFiles) {
    try {
      const data = JSON.parse(readFileSync(join(config.dir, file), 'utf-8'));
      totalJourneys += data.journeys?.length || 0;
    } catch { /* skip */ }
  }
  log(`  Total journeys: ${totalJourneys}\n`, config.jsonOutput);

  let sandbox: Sandbox | null = null;

  try {
    // ── Stage 1: Provision ──
    log('  [SETUP] Provisioning sandbox...', config.jsonOutput);
    const provisionStart = Date.now();
    sandbox = await Sandbox.create({ timeoutMs: config.sandboxTimeout * 1000 });
    setupStages.push({ name: 'provision', status: 'pass', duration_ms: Date.now() - provisionStart, output: sandbox.sandboxId });
    log(`  [SETUP] Sandbox: ${sandbox.sandboxId} (${Date.now() - provisionStart}ms)`, config.jsonOutput);

    // ── Stage 2: Swap ──
    log('  [SETUP] Adding 4GB swap...', config.jsonOutput);
    const swapStart = Date.now();
    await runCmd(sandbox, 'sudo dd if=/dev/zero of=/swapfile bs=1M count=4096 2>/dev/null && sudo chmod 600 /swapfile && sudo mkswap /swapfile 2>/dev/null && sudo swapon /swapfile 2>/dev/null', { timeout: 180 });
    setupStages.push({ name: 'swap', status: 'pass', duration_ms: Date.now() - swapStart });

    // ── Stage 3: Node upgrade ──
    log('  [SETUP] Upgrading Node.js...', config.jsonOutput);
    const nodeStart = Date.now();
    await runCmd(sandbox, 'npm install -g n 2>&1 && n 20.20.0 2>&1', { timeout: 60 });
    const nodeCheck = await runCmd(sandbox, 'node --version');
    setupStages.push({ name: 'node-upgrade', status: 'pass', duration_ms: Date.now() - nodeStart, output: nodeCheck.stdout.trim() });
    log(`  [SETUP] Node ${nodeCheck.stdout.trim()} (${Date.now() - nodeStart}ms)`, config.jsonOutput);

    // ── Stage 4: Clone ──
    log('  [SETUP] Cloning repo...', config.jsonOutput);
    const cloneStart = Date.now();
    const ghToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '';
    const repoUrl = ghToken ? config.repo.replace('https://', `https://${ghToken}@`) : config.repo;
    const cloneResult = await runCmd(sandbox, `git clone --depth 1 --branch ${config.branch} ${repoUrl} /home/user/app`, { timeout: 60 });
    if (cloneResult.exitCode !== 0) {
      throw new Error(`Clone failed: ${cloneResult.stderr || cloneResult.stdout}`);
    }
    setupStages.push({ name: 'clone', status: 'pass', duration_ms: Date.now() - cloneStart });
    log(`  [SETUP] Cloned (${Date.now() - cloneStart}ms)`, config.jsonOutput);

    // ── Stage 5: npm install (from monorepo root) ──
    log('  [SETUP] Installing dependencies...', config.jsonOutput);
    const installStart = Date.now();
    const installResult = await runCmd(sandbox, 'cd /home/user/app && npm install --ignore-scripts --no-audit --no-fund --legacy-peer-deps 2>&1', { timeout: 300 });
    if (installResult.exitCode !== 0) {
      throw new Error(`npm install failed: ${(installResult.stderr || installResult.stdout).substring(0, 500)}`);
    }
    setupStages.push({ name: 'install', status: 'pass', duration_ms: Date.now() - installStart });
    log(`  [SETUP] Dependencies installed (${Date.now() - installStart}ms)`, config.jsonOutput);

    // ── Stage 6: Playwright (install in web app dir) ──
    log('  [SETUP] Installing Playwright + Chromium...', config.jsonOutput);
    const pwStart = Date.now();
    await runCmd(sandbox, 'cd /home/user/app && npm install -D playwright @playwright/test 2>&1', { timeout: 60 });
    await runCmd(sandbox, 'cd /home/user/app && npx playwright install chromium --with-deps 2>&1', { timeout: 120 });
    setupStages.push({ name: 'playwright', status: 'pass', duration_ms: Date.now() - pwStart });
    log(`  [SETUP] Playwright ready (${Date.now() - pwStart}ms)`, config.jsonOutput);

    // ── Stage 7: Upload runner scripts (to apps/web/) ──
    log('  [SETUP] Uploading runner scripts...', config.jsonOutput);
    const scriptsDir = __dirname;
    const runnerContent = readFileSync(join(scriptsDir, 'e2b-journey-runner.ts'), 'utf-8');
    await sandbox.files.write('/home/user/app/apps/web/journey-runner.ts', runnerContent);
    setupStages.push({ name: 'upload-scripts', status: 'pass', duration_ms: 0 });

    // ── Stage 8: Upload .env.local (to apps/web/ where Next.js reads it) ──
    // Try apps/web/.env.local first, then root .env.local as fallback
    const envPaths = [
      join(process.cwd(), 'apps', 'web', '.env.local'),
      join(process.cwd(), '.env.local'),
    ];
    let envUploaded = false;
    for (const envPath of envPaths) {
      if (existsSync(envPath)) {
        await sandbox.files.write('/home/user/app/apps/web/.env.local', readFileSync(envPath, 'utf-8'));
        log(`  [SETUP] Uploaded .env.local (from ${envPath})`, config.jsonOutput);
        envUploaded = true;
        break;
      }
    }
    if (!envUploaded) {
      log('  [SETUP] WARNING: No .env.local — server may fail', config.jsonOutput);
    }

    // ── Stage 9: Build (from apps/web/) ──
    log('  [SETUP] Building production bundle...', config.jsonOutput);
    const buildStart = Date.now();
    const buildResult = await runCmd(
      sandbox,
      "cd /home/user/app/apps/web && NODE_OPTIONS='--max-old-space-size=1536' npx next build 2>&1",
      { timeout: 600 },
    );
    if (buildResult.exitCode !== 0) {
      const buildErr = (buildResult.stderr || buildResult.stdout).substring(0, 1000);
      setupStages.push({ name: 'build', status: 'fail', duration_ms: Date.now() - buildStart, output: buildErr });
      throw new Error(`next build failed: ${buildErr.substring(0, 500)}`);
    }
    setupStages.push({ name: 'build', status: 'pass', duration_ms: Date.now() - buildStart });
    log(`  [SETUP] Build complete (${((Date.now() - buildStart) / 1000).toFixed(0)}s)`, config.jsonOutput);

    // ── Stage 10: Start server (from apps/web/) ──
    log('  [SETUP] Starting production server...', config.jsonOutput);
    const serverStart = Date.now();
    await runCmd(sandbox, "cd /home/user/app/apps/web && NODE_OPTIONS='--max-old-space-size=128' npx next start > /tmp/server.log 2>&1 &", { timeout: 10 });

    let serverReady = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const check = await runCmd(sandbox, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 000", { timeout: 10 });
      const status = parseInt(check.stdout.trim());
      if (status > 0 && status < 500) { serverReady = true; break; }
    }
    if (!serverReady) {
      const serverLog = await runCmd(sandbox, 'tail -50 /tmp/server.log 2>/dev/null');
      throw new Error(`Server failed to start: ${serverLog.stdout.substring(0, 500)}`);
    }
    setupStages.push({ name: 'server', status: 'pass', duration_ms: Date.now() - serverStart });
    log(`  [SETUP] Server ready (${((Date.now() - serverStart) / 1000).toFixed(0)}s)`, config.jsonOutput);

    const setupDuration = Date.now() - startTime;
    log(`\n  [SETUP] Total setup: ${(setupDuration / 1000).toFixed(0)}s`, config.jsonOutput);
    log(`\n${'─'.repeat(60)}`, config.jsonOutput);
    log(`  RUNNING ${groupFiles.length} GROUPS`, config.jsonOutput);
    log(`${'─'.repeat(60)}\n`, config.jsonOutput);

    // ── Run Groups ──
    for (let i = 0; i < groupFiles.length; i++) {
      const file = groupFiles[i];
      const groupStart = Date.now();
      const groupName = file.replace('.json', '');
      const groupResultsDir = join(resultsBaseDir, groupName);
      mkdirSync(groupResultsDir, { recursive: true });

      log(`  [${i + 1}/${groupFiles.length}] ${groupName}...`, config.jsonOutput);

      try {
        const groupData: GroupFile = JSON.parse(readFileSync(join(config.dir, file), 'utf-8'));

        // Convert group format → journeys.json with FULL metadata
        // This is the key fix: pass requiresAuth, role, and env through
        const journeysJson = {
          project: groupData.project || 'repmax-v2',
          baseUrl: groupData.baseUrl || 'http://localhost:3000',
          requiresAuth: groupData.requiresAuth,
          role: groupData.role || 'visitor',
          env: groupData.env || {},
          journeys: groupData.journeys,
        };

        await sandbox.files.write('/home/user/app/apps/web/journeys.json', JSON.stringify(journeysJson, null, 2));

        // Scale timeout: base + 30s per journey
        const groupTimeout = Math.max(config.timeout, 90 + groupData.journeys.length * 30);
        const journeyResult = await runCmd(
          sandbox,
          "cd /home/user/app/apps/web && NODE_OPTIONS='--max-old-space-size=256' npx tsx journey-runner.ts --json",
          { timeout: groupTimeout },
        );

        // Parse results
        let parsed: any = null;
        try {
          parsed = JSON.parse(journeyResult.stdout);
        } catch {
          const jsonStart = journeyResult.stdout.indexOf('{');
          if (jsonStart >= 0) {
            try { parsed = JSON.parse(journeyResult.stdout.substring(jsonStart)); } catch { /* give up */ }
          }
        }

        // Download screenshots
        const screenshots: string[] = [];
        try {
          const pngFiles = await runCmd(sandbox, 'ls /home/user/app/apps/web/journey-results/*/*.png 2>/dev/null || echo NONE', { timeout: 10 });
          if (!pngFiles.stdout.includes('NONE')) {
            for (const pngFile of pngFiles.stdout.trim().split('\n').slice(0, 30)) {
              try {
                const content = await sandbox.files.read(pngFile);
                const name = pngFile.split('/').pop() || 'screenshot.png';
                const localPath = join(groupResultsDir, name);
                writeFileSync(localPath, content);
                screenshots.push(localPath);
              } catch { /* skip */ }
            }
          }
        } catch { /* ignore */ }

        // Download JSON results
        try {
          const jsonFiles = await runCmd(sandbox, 'ls /home/user/app/apps/web/journey-results/*/*.json 2>/dev/null || echo NONE', { timeout: 10 });
          if (!jsonFiles.stdout.includes('NONE')) {
            for (const jf of jsonFiles.stdout.trim().split('\n')) {
              try {
                const content = await sandbox.files.read(jf);
                writeFileSync(join(groupResultsDir, 'results.json'), content);
              } catch { /* skip */ }
            }
          }
        } catch { /* ignore */ }

        // Clean up for next group
        await runCmd(sandbox, 'rm -rf /home/user/app/apps/web/journey-results/* && pkill -f chromium 2>/dev/null; true', { timeout: 10 });

        const result: GroupResult = {
          group: groupName,
          name: groupData.name || groupName,
          status: journeyResult.exitCode === 0 ? 'pass' : 'fail',
          journeys_passed: parsed?.summary?.passed || 0,
          journeys_failed: parsed?.summary?.failed || 0,
          journeys_total: parsed?.summary?.total || groupData.journeys.length,
          steps_passed: parsed?.summary?.steps_passed || 0,
          steps_total: parsed?.summary?.total_steps || 0,
          duration_ms: Date.now() - groupStart,
          screenshots,
        };

        groupResults.push(result);

        const icon = result.status === 'pass' ? 'PASS' : 'FAIL';
        const rate = result.journeys_total > 0 ? `${result.journeys_passed}/${result.journeys_total}` : '?';
        log(`           ${icon}  ${rate} journeys  (${(result.duration_ms / 1000).toFixed(1)}s)`, config.jsonOutput);

        // OOM check
        if (!journeyResult.stdout.trim() && journeyResult.exitCode !== 0) {
          const dmesg = await runCmd(sandbox, "dmesg | grep -i 'oom\\|killed' | tail -3", { timeout: 5 });
          if (dmesg.stdout.trim()) {
            log(`           OOM: ${dmesg.stdout.trim()}`, config.jsonOutput);
          }
          const mem = await runCmd(sandbox, 'free -m', { timeout: 5 });
          log(`           Memory: ${mem.stdout.trim().split('\n')[1] || 'unknown'}`, config.jsonOutput);
        }

      } catch (err: any) {
        groupResults.push({
          group: groupName,
          name: groupName,
          status: 'error',
          journeys_passed: 0,
          journeys_failed: 0,
          journeys_total: 0,
          steps_passed: 0,
          steps_total: 0,
          duration_ms: Date.now() - groupStart,
          error: err.message,
          screenshots: [],
        });
        log(`           ERROR  ${err.message}`, config.jsonOutput);
      }
    }

    // ── Summary ──
    const totalMs = Date.now() - startTime;
    const costEstimate = `$${(totalMs / 1000 / 3600 * 0.16).toFixed(4)}`;

    const summary = {
      groups_passed: groupResults.filter(g => g.status === 'pass').length,
      groups_failed: groupResults.filter(g => g.status !== 'pass').length,
      groups_total: groupResults.length,
      journeys_passed: groupResults.reduce((s, g) => s + g.journeys_passed, 0),
      journeys_failed: groupResults.reduce((s, g) => s + g.journeys_failed, 0),
      journeys_total: groupResults.reduce((s, g) => s + g.journeys_total, 0),
      steps_passed: groupResults.reduce((s, g) => s + g.steps_passed, 0),
      steps_total: groupResults.reduce((s, g) => s + g.steps_total, 0),
      pass_rate: '0%',
      duration_ms: totalMs,
      cost_estimate: costEstimate,
    };
    summary.pass_rate = summary.journeys_total > 0
      ? `${Math.round((summary.journeys_passed / summary.journeys_total) * 100)}%`
      : 'N/A';

    const fullResults: RunResult = {
      sandbox_id: sandbox.sandboxId,
      status: summary.groups_failed === 0 ? 'pass' : 'fail',
      groups: groupResults,
      summary,
      setup_stages: setupStages,
    };
    writeFileSync(join(resultsBaseDir, 'full-results.json'), JSON.stringify(fullResults, null, 2));

    // Save failures for --retry-failed
    if (summary.groups_failed > 0) {
      saveFailures(config, groupResults, summary.pass_rate);
    } else {
      const failurePath = join(config.dir, '.last-failures.json');
      if (existsSync(failurePath)) {
        try { unlinkSync(failurePath); } catch { /* ignore */ }
        log('  All groups passed — removed .last-failures.json', config.jsonOutput);
      }
    }

    if (!config.jsonOutput) {
      console.log(`\n${'═'.repeat(60)}`);
      console.log('  RESULTS');
      console.log(`${'═'.repeat(60)}`);
      console.log(`  Groups:     ${summary.groups_passed} passed, ${summary.groups_failed} failed (${summary.groups_total} total)`);
      console.log(`  Journeys:   ${summary.journeys_passed} passed, ${summary.journeys_failed} failed (${summary.journeys_total} total)`);
      console.log(`  Steps:      ${summary.steps_passed}/${summary.steps_total}`);
      console.log(`  Pass Rate:  ${summary.pass_rate}`);
      console.log(`  Duration:   ${(totalMs / 1000).toFixed(1)}s (${(totalMs / 60000).toFixed(1)}min)`);
      console.log(`  Cost:       ~${costEstimate}`);
      console.log(`  Results:    ${resultsBaseDir}`);
      if (summary.groups_failed > 0) {
        console.log(`\n  TIP: Re-run failed groups with --retry-failed`);
      }

      console.log('\n  Group Results:');
      console.log(`  ${'Group'.padEnd(35)} ${'Status'.padEnd(8)} ${'Journeys'.padEnd(12)} ${'Time'.padEnd(8)}`);
      console.log(`  ${'─'.repeat(63)}`);
      for (const g of groupResults) {
        const icon = g.status === 'pass' ? 'PASS' : g.status === 'fail' ? 'FAIL' : 'ERR ';
        const rate = `${g.journeys_passed}/${g.journeys_total}`;
        const time = `${(g.duration_ms / 1000).toFixed(1)}s`;
        console.log(`  ${g.group.padEnd(35)} ${icon.padEnd(8)} ${rate.padEnd(12)} ${time.padEnd(8)}`);
      }

      console.log('\n  Setup Stages:');
      for (const s of setupStages) {
        console.log(`    ${s.status === 'pass' ? 'PASS' : 'FAIL'}  ${s.name.padEnd(16)} ${(s.duration_ms / 1000).toFixed(1)}s${s.output ? ` — ${s.output.substring(0, 60)}` : ''}`);
      }
      console.log('');
    } else {
      console.log(JSON.stringify(fullResults, null, 2));
    }

    return fullResults;

  } catch (error: any) {
    const totalMs = Date.now() - startTime;
    const result: RunResult = {
      sandbox_id: sandbox?.sandboxId || 'none',
      status: 'error',
      groups: groupResults,
      summary: {
        groups_passed: 0, groups_failed: 0, groups_total: 0,
        journeys_passed: 0, journeys_failed: 0, journeys_total: 0,
        steps_passed: 0, steps_total: 0,
        pass_rate: '0%', duration_ms: totalMs,
        cost_estimate: `$${(totalMs / 1000 / 3600 * 0.16).toFixed(4)}`,
      },
      setup_stages: setupStages,
    };

    if (!config.jsonOutput) {
      console.error(`\nFATAL: ${error.message}`);
      console.log('\nSetup stages:');
      for (const s of setupStages) {
        console.log(`  ${s.status === 'pass' ? 'PASS' : 'FAIL'}  ${s.name}: ${s.output || ''}`);
      }
    } else {
      console.log(JSON.stringify(result, null, 2));
    }

    return result;
  } finally {
    if (sandbox) {
      try {
        await sandbox.kill();
        log('  Sandbox killed', config.jsonOutput);
      } catch { /* ignore */ }
    }
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function getArg(args: string[], flag: string): string | undefined {
  const eqArg = args.find(a => a.startsWith(`${flag}=`));
  if (eqArg) return eqArg.split('=').slice(1).join('=');
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return undefined;
}

async function main() {
  loadClaudeEnv();
  const args = process.argv.slice(2);

  if (args.includes('status') || args.includes('--status')) {
    await checkStatus();
    return;
  }

  if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
    console.log(`
E2B Grouped Journey Runner

Runs journey tests GROUP BY GROUP in one E2B sandbox.
Builds once, starts server once, iterates groups sequentially.

Usage:
  npx tsx e2b-grouped-runner.ts --dir apps/web/journeys                    Run all groups
  npx tsx e2b-grouped-runner.ts --dir apps/web/journeys --retry-failed     Retry failed only
  npx tsx e2b-grouped-runner.ts --dir apps/web/journeys --group 03-athlete Single group
  npx tsx e2b-grouped-runner.ts --dir apps/web/journeys --from 07 --to 12  Range of groups
  npx tsx e2b-grouped-runner.ts --dir apps/web/journeys --timeout 300      Per-group timeout (s)
  npx tsx e2b-grouped-runner.ts --dir apps/web/journeys --json             JSON output
  npx tsx e2b-grouped-runner.ts status                                     Check readiness

Cost: ~$0.04-0.10 per full run
Results: journey-results/grouped-YYYY-MM-DD/
    `);
    return;
  }

  if (!process.env.E2B_API_KEY) {
    console.error('ERROR: E2B_API_KEY not set. Add it to ~/.claude/.env');
    process.exit(1);
  }

  const dir = getArg(args, '--dir') || 'apps/web/journeys';
  if (!existsSync(dir)) {
    console.error(`ERROR: Directory '${dir}' not found`);
    process.exit(1);
  }

  let repo = getArg(args, '--repo');
  if (!repo) {
    repo = autoDetectRepo() || undefined;
    if (!repo) {
      console.error('ERROR: --repo required (or run from a git repo)');
      process.exit(1);
    }
    console.log(`  Auto-detected repo: ${repo}`);
  }

  const config: Config = {
    repo,
    branch: getArg(args, '--branch') || 'main',
    dir,
    group: getArg(args, '--group'),
    from: getArg(args, '--from'),
    to: getArg(args, '--to'),
    timeout: parseInt(getArg(args, '--timeout') || '300'),
    sandboxTimeout: parseInt(getArg(args, '--sandbox-timeout') || '3600'),
    jsonOutput: args.includes('--json'),
    retryFailed: args.includes('--retry-failed'),
  };

  const result = await runGrouped(config);
  process.exit(result.status === 'pass' ? 0 : 1);
}

main().catch(error => {
  console.error(`\nFatal: ${error.message}`);
  process.exit(1);
});
