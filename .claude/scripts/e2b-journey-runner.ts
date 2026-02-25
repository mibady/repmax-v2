#!/usr/bin/env npx tsx
/**
 * E2B JOURNEY RUNNER — Standalone Playwright Executor
 *
 * Uploaded to E2B sandbox by e2b-grouped-runner.ts.
 * Reads journeys.json from cwd and executes each journey using Playwright.
 *
 * Auth logic ported from apps/web/e2e/utils/journey-runner.ts:
 * - Per-journey requiresAuth awareness
 * - Public route detection (no login for public pages)
 * - waitForNavigation (not waitForURL) after login
 * - Explicit login journey detection (skip auto-login if journey logs in itself)
 *
 * Outputs JSON to stdout for the orchestrator to parse.
 *
 * Location: .claude/scripts/e2b-journey-runner.ts
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

interface JourneyStep {
  action: string;
  url?: string;
  selector?: string;
  value?: string;
  text?: string;
  expect?: Record<string, any>;
}

interface Journey {
  name: string;
  priority: string;
  description?: string;
  requiresAuth?: boolean;
  steps: JourneyStep[];
}

interface JourneysConfig {
  project: string;
  baseUrl: string;
  requiresAuth: boolean;
  role: string;
  env: Record<string, string>;
  journeys: Journey[];
}

interface StepResult {
  action: string;
  target: string;
  status: 'pass' | 'fail';
  error?: string;
  screenshot?: string;
  duration_ms: number;
}

interface JourneyResult {
  name: string;
  priority: string;
  status: 'pass' | 'fail';
  steps: StepResult[];
  duration_ms: number;
  error?: string;
}

interface RunResult {
  project: string;
  base_url: string;
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    total_steps: number;
    steps_passed: number;
    pass_rate: string;
    duration_ms: number;
  };
  journeys: JourneyResult[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PUBLIC_ROUTES = new Set([
  '/', '/pricing', '/login', '/signup',
  '/auth/reset-password', '/privacy', '/terms', '/support', '/not-found',
]);

const PUBLIC_PREFIXES = [
  '/card/', '/athlete/', '/positions/', '/programs/', '/states/', '/zones/',
];

const BAD_TEXT = ['undefined', 'NaN', '[object Object]', 'Invalid Date', 'null', 'Error'];

const LOADING_SELECTORS = [
  '[aria-busy="true"]', '.loading', '.spinner',
  '[class*="animate-pulse"]', '[class*="Skeleton"]', '[class*="skeleton"]',
  '[role="progressbar"]',
].join(', ');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveTemplate(input: string | undefined, env: Record<string, string> = {}): string {
  if (!input) return '';
  return input.replace(/\{\{(\w+)\}\}/g, (_, key) => env[key] ?? process.env[key] ?? '');
}

function isPublicRoute(path: string): boolean {
  if (PUBLIC_ROUTES.has(path)) return true;
  return PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix));
}

function journeyTouchesProtectedRoute(journey: Journey): boolean {
  return journey.steps.some(
    s => s.action === 'navigate' && !!s.url && !isPublicRoute(s.url)
  );
}

function journeyHasExplicitLogin(journey: Journey): boolean {
  const goesToLogin = journey.steps.some(s => s.action === 'navigate' && s.url === '/login');
  if (!goesToLogin) return false;
  const fillsForm = journey.steps.some(s => {
    if (s.action === 'fill' && s.selector) {
      return s.selector.includes("input[type='email']") ||
             s.selector.includes('input[type="email"]') ||
             s.selector.includes("input[type='password']") ||
             s.selector.includes('input[type="password"]');
    }
    return false;
  });
  return fillsForm;
}

function shouldAutoLogin(config: JourneysConfig, journey: Journey): boolean {
  // Journey explicitly says no auth
  if (journey.requiresAuth === false) return false;

  // Determine if auth is needed
  const needsAuth = journey.requiresAuth === true
    ? true
    : Boolean(config.requiresAuth) || journeyTouchesProtectedRoute(journey);

  if (!needsAuth) return false;

  // Journey already has its own login steps
  if (journeyHasExplicitLogin(journey)) return false;

  // No credentials available
  if (!config.env?.TEST_EMAIL || !config.env?.TEST_PASSWORD) return false;

  return true;
}

// ─── Post-navigation stability ───────────────────────────────────────────────

async function waitForStability(page: Page): Promise<void> {
  for (let i = 0; i < 40; i++) {
    const stillLoading = await page.evaluate(() => {
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      if (skeletons.length > 2) return true;
      const main = document.querySelector('main') ?? document.body;
      const text = (main?.textContent ?? '').trim();
      if (!text) return true;
      if (text.length < 120 && /loading/i.test(text)) return true;
      return false;
    }).catch(() => false);
    if (!stillLoading) break;
    await page.waitForTimeout(500);
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────

async function performLogin(
  page: Page,
  baseUrl: string,
  email: string,
  password: string,
): Promise<boolean> {
  try {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForSelector("input[type='email'], input[type=\"email\"]", { timeout: 15000 });
    await page.fill("input[type='email'], input[type=\"email\"]", email);
    await page.fill("input[type='password'], input[type=\"password\"]", password);

    // Use waitForNavigation (works for any redirect target: /dashboard, /onboarding, etc.)
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {}),
      page.click("button[type='submit']"),
    ]);

    await waitForStability(page);

    // Verify we left /login
    const url = page.url();
    if (url.includes('/login')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ─── Step executor ───────────────────────────────────────────────────────────

async function executeStep(
  page: Page,
  step: JourneyStep,
  config: JourneysConfig,
  consoleErrors: string[],
  resultsDir: string,
  journeyName: string,
  stepIndex: number,
): Promise<StepResult> {
  const start = Date.now();
  const target = step.url || step.selector || step.value || step.text || '';

  try {
    switch (step.action) {
      case 'navigate': {
        if (!step.url) throw new Error('navigate step missing url');
        const resolved = resolveTemplate(step.url, config.env);
        const targetUrl = resolved.startsWith('http')
          ? resolved
          : `${config.baseUrl}${resolved}`;
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await waitForStability(page);
        break;
      }

      case 'wait': {
        const delay = parseInt(step.value ?? '1000', 10);
        await page.waitForTimeout(Number.isNaN(delay) ? 1000 : delay);
        break;
      }

      case 'set_viewport': {
        const [w, h] = (step.value ?? '1280x720').split('x').map(v => parseInt(v, 10));
        if (Number.isFinite(w) && Number.isFinite(h)) {
          await page.setViewportSize({ width: w, height: h });
        }
        break;
      }

      case 'assert_visible': {
        if (!step.selector) throw new Error('assert_visible requires selector');
        const sel = resolveTemplate(step.selector, config.env);
        const el = page.locator(sel).first();
        await el.waitFor({ state: 'visible', timeout: 15000 });
        break;
      }

      case 'click': {
        if (!step.selector) throw new Error('click requires selector');
        const sel = resolveTemplate(step.selector, config.env);
        await page.locator(sel).first().click({ timeout: 15000 });
        break;
      }

      case 'fill': {
        if (!step.selector) throw new Error('fill requires selector');
        const sel = resolveTemplate(step.selector, config.env);
        const value = resolveTemplate(step.value ?? '', config.env);
        const loc = page.locator(sel).first();
        await loc.waitFor({ timeout: 15000 });
        await loc.fill('');
        if (value) await loc.type(value, { delay: 10 });
        break;
      }

      case 'assert_text_present': {
        const text = resolveTemplate(step.value ?? step.text ?? '', config.env);
        if (!text) throw new Error('assert_text_present requires value or text');
        // Use case-insensitive match: CSS `uppercase`/`lowercase` transforms
        // change innerText but journey definitions use source-code casing
        await page.waitForFunction(
          (t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()),
          text,
          { timeout: 15000 },
        );
        break;
      }

      case 'assert_no_text': {
        const text = resolveTemplate(step.value ?? step.text ?? '', config.env);
        if (!text) throw new Error('assert_no_text requires value or text');
        const bodyText = await page.locator('body').innerText();
        if (bodyText.toLowerCase().includes(text.toLowerCase())) {
          throw new Error(`Found unwanted text: "${text}"`);
        }
        break;
      }

      case 'assert_url_contains': {
        const expected = resolveTemplate(step.value ?? step.text ?? '', config.env);
        if (!expected) throw new Error('assert_url_contains requires value');
        const currentUrl = page.url();
        if (!currentUrl.includes(expected)) {
          throw new Error(`URL "${currentUrl}" does not contain "${expected}"`);
        }
        break;
      }

      case 'assert_no_bad_text': {
        const scope = step.selector ? page.locator(step.selector) : page.locator('body');
        await scope.first().waitFor({ timeout: 10000 });
        const content = await scope.first().innerText();
        const blocklist = step.expect?.blocklist
          ? String(step.expect.blocklist).split(',').map(s => s.trim()).filter(Boolean)
          : BAD_TEXT;
        const hits = blocklist.filter(bad => content.includes(bad));
        if (hits.length > 0) {
          throw new Error(`Found bad text: ${hits.join(', ')}`);
        }
        break;
      }

      case 'assert_console_clean': {
        if (consoleErrors.length > 0) {
          throw new Error(`Console errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
        }
        break;
      }

      case 'assert_no_stuck_loading': {
        const timeout = parseInt(step.value ?? '10000', 10);
        try {
          await page.waitForFunction(
            (sel) => document.querySelectorAll(sel).length === 0,
            LOADING_SELECTORS,
            { timeout: Number.isNaN(timeout) ? 10000 : timeout },
          );
        } catch {
          const count = await page.locator(LOADING_SELECTORS).count();
          throw new Error(`${count} loading indicator(s) still visible after ${timeout}ms`);
        }
        break;
      }

      case 'screenshot': {
        const safeName = journeyName.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 60);
        const filename = `${safeName}-step-${stepIndex}.png`;
        const filepath = join(resultsDir, filename);
        await page.screenshot({ fullPage: true, path: filepath });
        return {
          action: step.action,
          target: filename,
          status: 'pass',
          duration_ms: Date.now() - start,
          screenshot: filepath,
        };
      }

      default:
        throw new Error(`Unknown action: ${step.action}`);
    }

    return { action: step.action, target, status: 'pass', duration_ms: Date.now() - start };
  } catch (err: any) {
    // Take failure screenshot
    let screenshotPath: string | undefined;
    try {
      const safeName = journeyName.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 60);
      const filename = `FAIL-${safeName}-step-${stepIndex}.png`;
      screenshotPath = join(resultsDir, filename);
      await page.screenshot({ fullPage: true, path: screenshotPath });
    } catch { /* ignore screenshot failure */ }

    return {
      action: step.action,
      target,
      status: 'fail',
      error: err.message || String(err),
      screenshot: screenshotPath,
      duration_ms: Date.now() - start,
    };
  }
}

// ─── Non-critical console error filter ───────────────────────────────────────

function isNonCritical(message: string): boolean {
  const t = message.toLowerCase();
  if (t.includes('failed to load resource')) {
    if (t.includes('fonts.') || t.includes('favicon') || t.includes('.woff') ||
        t.includes('.ico') || t.includes('.png') || t.includes('.jpg') ||
        t.includes('.svg') || t.includes('cdn')) return true;
  }
  if (t.includes('net::err_') && !t.includes('localhost')) return true;
  if (t.includes('hydration') || t.includes('text content did not match')) return true;
  if (t.includes('was preloaded using link preload but not used')) return true;
  if (t.includes('stylesheet') && t.includes('load')) return true;
  return false;
}

// ─── Journey executor ────────────────────────────────────────────────────────

async function runJourney(
  browser: Browser,
  journey: Journey,
  config: JourneysConfig,
  savedCookies: any[],
  resultsDir: string,
): Promise<{ result: JourneyResult; cookies: any[] }> {
  const start = Date.now();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });

  const consoleErrors: string[] = [];
  let updatedCookies = savedCookies;

  try {
    // Inject saved cookies if this journey needs auth and has no explicit login
    const needsAutoLogin = shouldAutoLogin(config, journey);

    if (needsAutoLogin && savedCookies.length > 0) {
      await context.addCookies(savedCookies);
    } else if (needsAutoLogin && savedCookies.length === 0) {
      // No saved cookies — perform fresh login
      const loginPage = await context.newPage();
      const email = resolveTemplate(config.env.TEST_EMAIL, config.env);
      const password = resolveTemplate(config.env.TEST_PASSWORD, config.env);
      const ok = await performLogin(loginPage, config.baseUrl, email, password);
      if (ok) {
        updatedCookies = await context.cookies();
      }
      await loginPage.close();
    }

    const page = await context.newPage();

    // Console error tracking
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!isNonCritical(text)) consoleErrors.push(text);
      }
    });

    const stepResults: StepResult[] = [];
    let failed = false;

    for (let i = 0; i < journey.steps.length; i++) {
      const step = journey.steps[i];
      const stepResult = await executeStep(
        page, step, config, consoleErrors, resultsDir, journey.name, i
      );
      stepResults.push(stepResult);

      if (stepResult.status === 'fail') {
        failed = true;
        break; // Stop on first failure
      }
    }

    // Save cookies from successful login journeys
    if (!failed && journeyHasExplicitLogin(journey)) {
      updatedCookies = await context.cookies();
    }

    await page.close();

    return {
      result: {
        name: journey.name,
        priority: journey.priority,
        status: failed ? 'fail' : 'pass',
        steps: stepResults,
        duration_ms: Date.now() - start,
      },
      cookies: updatedCookies,
    };
  } catch (err: any) {
    return {
      result: {
        name: journey.name,
        priority: journey.priority,
        status: 'fail',
        steps: [],
        duration_ms: Date.now() - start,
        error: err.message || String(err),
      },
      cookies: updatedCookies,
    };
  } finally {
    await context.close();
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const start = Date.now();
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const journeyFilter = args.find(a => a.startsWith('--journey='))?.split('=')[1]
    || (args.includes('--journey') ? args[args.indexOf('--journey') + 1] : undefined);

  // Read journeys.json
  const configPath = join(process.cwd(), 'journeys.json');
  if (!existsSync(configPath)) {
    console.error('ERROR: journeys.json not found in cwd');
    process.exit(1);
  }

  const config: JourneysConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  const baseUrl = config.baseUrl || 'http://localhost:3000';
  config.baseUrl = baseUrl;

  // Filter journeys if requested
  let journeys = config.journeys;
  if (journeyFilter) {
    journeys = journeys.filter(j =>
      j.name.toLowerCase().includes(journeyFilter.toLowerCase())
    );
  }

  if (journeys.length === 0) {
    const result: RunResult = {
      project: config.project,
      base_url: baseUrl,
      timestamp: new Date().toISOString(),
      summary: {
        total: 0, passed: 0, failed: 0,
        total_steps: 0, steps_passed: 0,
        pass_rate: 'N/A', duration_ms: 0,
      },
      journeys: [],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // Results directory
  const resultsDir = join(process.cwd(), 'journey-results', new Date().toISOString().split('T')[0]);
  mkdirSync(resultsDir, { recursive: true });

  if (!jsonOutput) {
    console.log(`\n  E2B Journey Runner`);
    console.log(`  Project: ${config.project}`);
    console.log(`  Base URL: ${baseUrl}`);
    console.log(`  Auth: ${config.requiresAuth} (role: ${config.role})`);
    console.log(`  Journeys: ${journeys.length}\n`);
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox',
      '--disable-extensions', '--disable-background-networking',
      '--disable-default-apps', '--disable-sync', '--disable-translate',
      '--no-first-run', '--disable-setuid-sandbox',
    ],
  });

  const journeyResults: JourneyResult[] = [];
  let savedCookies: any[] = [];

  for (const journey of journeys) {
    if (!jsonOutput) {
      process.stdout.write(`  ${journey.name.padEnd(55)} `);
    }

    const { result, cookies } = await runJourney(
      browser, journey, config, savedCookies, resultsDir
    );
    savedCookies = cookies;
    journeyResults.push(result);

    if (!jsonOutput) {
      const icon = result.status === 'pass' ? 'PASS' : 'FAIL';
      const stepsMsg = `${result.steps.filter(s => s.status === 'pass').length}/${result.steps.length} steps`;
      console.log(`${icon}  ${stepsMsg}  (${result.duration_ms}ms)`);
      if (result.status === 'fail') {
        for (const s of result.steps) {
          if (s.status === 'fail') {
            console.log(`    FAIL: ${s.action} "${s.target}" — ${s.error}`);
          }
        }
      }
    }
  }

  await browser.close();

  // Build summary
  const totalSteps = journeyResults.reduce((s, j) => s + j.steps.length, 0);
  const stepsPassed = journeyResults.reduce(
    (s, j) => s + j.steps.filter(st => st.status === 'pass').length, 0
  );
  const passed = journeyResults.filter(j => j.status === 'pass').length;
  const failed = journeyResults.filter(j => j.status === 'fail').length;

  const runResult: RunResult = {
    project: config.project,
    base_url: baseUrl,
    timestamp: new Date().toISOString(),
    summary: {
      total: journeyResults.length,
      passed,
      failed,
      total_steps: totalSteps,
      steps_passed: stepsPassed,
      pass_rate: journeyResults.length > 0
        ? `${Math.round((passed / journeyResults.length) * 100)}%`
        : 'N/A',
      duration_ms: Date.now() - start,
    },
    journeys: journeyResults,
  };

  // Save results
  writeFileSync(join(resultsDir, 'results.json'), JSON.stringify(runResult, null, 2));

  if (!jsonOutput) {
    console.log(`\n  Results: ${passed}/${journeyResults.length} passed (${runResult.summary.pass_rate})`);
    console.log(`  Steps: ${stepsPassed}/${totalSteps}`);
    console.log(`  Duration: ${(runResult.summary.duration_ms / 1000).toFixed(1)}s`);
    console.log(`  Saved: ${resultsDir}/results.json\n`);
  }

  // Always output JSON for the orchestrator to parse
  if (jsonOutput) {
    console.log(JSON.stringify(runResult, null, 2));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
