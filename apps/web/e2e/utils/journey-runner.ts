import { expect, Page, TestInfo } from '@playwright/test';

const BAD_TEXT_DEFAULT = ['undefined', 'NaN', '[object Object]', 'Invalid Date', 'null', 'Error'];
const LOADING_SELECTORS = '[aria-busy="true"], .loading, .spinner, [class*="animate-pulse"], [class*="Skeleton"], [class*="skeleton"], [role="progressbar"]';
const PUBLIC_ROUTES = new Set([
  '/',
  '/pricing',
  '/login',
  '/signup',
  '/auth/reset-password',
  '/privacy',
  '/terms',
  '/support',
  '/not-found',
]);
const PUBLIC_PREFIXES = ['/card/', '/athlete/', '/positions/', '/programs/', '/states/', '/zones/'];

export interface JourneyStep {
  action: string;
  url?: string;
  selector?: string;
  value?: string;
  text?: string;
  expect?: Record<string, string | number | boolean>;
}

export interface JourneyDefinition {
  name: string;
  priority: string;
  description?: string;
  steps: JourneyStep[];
  requiresAuth?: boolean;
}

export interface JourneyGroup {
  project: string;
  group: string;
  name: string;
  requiresAuth?: boolean;
  serial?: boolean;
  role?: string;
  baseUrl?: string;
  env?: Record<string, string>;
  journeys: JourneyDefinition[];
}

const escapeForRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9-_]+/g, '-');

const resolveTemplate = (input: string | undefined, env: Record<string, string> = {}): string => {
  if (!input) return '';
  return input.replace(/\{\{(\w+)\}\}/g, (_, key) => env[key] ?? process.env[key] ?? '');
};

const isPublicRoute = (path: string) => {
  if (PUBLIC_ROUTES.has(path)) return true;
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const journeyTouchesProtectedRoute = (journey: JourneyDefinition) =>
  journey.steps.some((step) => step.action === 'navigate' && !!step.url && !isPublicRoute(step.url));

const journeyHasExplicitLogin = (journey: JourneyDefinition) => {
  const navigatesToLogin = journey.steps.some((step) => step.action === 'navigate' && step.url === '/login');
  if (!navigatesToLogin) return false;
  const interactsWithLoginForm = journey.steps.some((step) => {
    if (step.action === 'fill' && step.selector) {
      return step.selector.includes("input[type='email']") || step.selector.includes("input[type='password']");
    }
    if (step.action === 'click' && step.selector) {
      return step.selector.includes("button[type='submit']");
    }
    return false;
  });
  return interactsWithLoginForm;
};

const shouldAutoLogin = (group: JourneyGroup, journey: JourneyDefinition) => {
  if (journey.requiresAuth === false) return false;
  const requiresAuth = journey.requiresAuth === true
    ? true
    : Boolean(group.requiresAuth) || journeyTouchesProtectedRoute(journey);
  if (!requiresAuth) return false;
  if (journeyHasExplicitLogin(journey)) return false;
  if (!group.env?.TEST_EMAIL || !group.env?.TEST_PASSWORD) return false;
  return true;
};

const waitForPostNavigationStability = async (page: Page) => {
  for (let i = 0; i < 40; i += 1) {
    const stillLoading = await page.evaluate(() => {
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      if (skeletons.length > 2) return true;
      const main = document.querySelector('main') ?? document.body;
      const text = (main?.textContent ?? '').trim();
      if (!text) return true;
      if (text.length < 120 && /loading/i.test(text)) return true;
      return false;
    });
    if (!stillLoading) break;
    await page.waitForTimeout(500);
  }
};

const performLogin = async (page: Page, baseUrl: string, email: string, password: string) => {
  const loginUrl = new URL('/login', baseUrl).toString();
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector("input[type='email']", { timeout: 15000 });
  await page.fill("input[type='email']", email);
  await page.fill("input[type='password']", password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {}),
    page.click("button[type='submit']"),
  ]);
  await waitForPostNavigationStability(page);
};

const isNonCriticalConsoleError = (message: string) => {
  const text = message.toLowerCase();
  if (text.includes('failed to load resource')) {
    if (
      text.includes('fonts.googleapis') ||
      text.includes('fonts.gstatic') ||
      text.includes('favicon') ||
      text.includes('.woff') ||
      text.includes('.ico') ||
      text.includes('.png') ||
      text.includes('.jpg') ||
      text.includes('.svg') ||
      text.includes('cdn')
    ) {
      return true;
    }
  }
  if (text.includes('net::err_') && !text.includes('localhost')) return true;
  if (text.includes('hydration') || text.includes('text content did not match')) return true;
  if (text.includes('was preloaded using link preload but not used')) return true;
  if (text.includes('stylesheet') && text.includes('load')) return true;
  return false;
};

const attachScreenshot = async (page: Page, testInfo: TestInfo, journeyName: string, stepIndex: number) => {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(`${sanitize(journeyName)}-step-${stepIndex}`, {
    body: screenshot,
    contentType: 'image/png',
  });
};

const assertNoBadText = async (page: Page, selector: string | undefined, blocklist?: string) => {
  const scope = selector ? page.locator(selector) : page.locator('body');
  await scope.waitFor({ timeout: 10000 });
  const content = await scope.innerText();
  const forbidden = blocklist
    ? blocklist.split(',').map((item) => item.trim()).filter(Boolean)
    : BAD_TEXT_DEFAULT;
  const hits = forbidden.filter((bad) => content.includes(bad));
  if (hits.length > 0) {
    throw new Error(`Found forbidden text: ${hits.join(', ')}`);
  }
};

const assertNoStuckLoading = async (page: Page, timeout: number) => {
  try {
    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length === 0,
      LOADING_SELECTORS,
      { timeout },
    );
  } catch {
    const count = await page.locator(LOADING_SELECTORS).count();
    throw new Error(`${count} loading indicator(s) still visible after ${timeout}ms`);
  }
};

const getStepText = (step: JourneyStep) => step.value ?? step.text ?? '';

const getBaseUrl = (group: JourneyGroup) => process.env.PLAYWRIGHT_TEST_BASE_URL ?? group.baseUrl ?? 'http://localhost:3000';

const executeStep = async (
  page: Page,
  group: JourneyGroup,
  journey: JourneyDefinition,
  step: JourneyStep,
  stepIndex: number,
  consoleErrors: string[],
  testInfo: TestInfo,
) => {
  switch (step.action) {
    case 'navigate': {
      if (!step.url) throw new Error('navigate step missing url');
      const resolved = resolveTemplate(step.url, group.env);
      const targetUrl = resolved.startsWith('http') ? resolved : new URL(resolved, getBaseUrl(group)).toString();
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await waitForPostNavigationStability(page);
      break;
    }
    case 'wait': {
      const delay = parseInt(step.value ?? '1000', 10);
      await page.waitForTimeout(Number.isNaN(delay) ? 1000 : delay);
      break;
    }
    case 'set_viewport': {
      const [w, h] = (step.value ?? '1280x720').split('x').map((v) => parseInt(v, 10));
      if (Number.isFinite(w) && Number.isFinite(h)) {
        await page.setViewportSize({ width: w, height: h });
      }
      break;
    }
    case 'assert_visible': {
      if (!step.selector) throw new Error('assert_visible requires selector');
      const selector = resolveTemplate(step.selector, group.env);
      await expect(page.locator(selector).first()).toBeVisible({ timeout: 15000 });
      break;
    }
    case 'click': {
      if (!step.selector) throw new Error('click requires selector');
      const selector = resolveTemplate(step.selector, group.env);
      await page.locator(selector).first().click();
      break;
    }
    case 'fill': {
      if (!step.selector) throw new Error('fill requires selector');
      const selector = resolveTemplate(step.selector, group.env);
      const value = resolveTemplate(step.value ?? '', group.env);
      const locator = page.locator(selector).first();
      await locator.waitFor({ timeout: 15000 });
      await locator.fill('');
      if (value) {
        await locator.type(value, { delay: 10 });
      }
      break;
    }
    case 'assert_text_present': {
      const target = resolveTemplate(getStepText(step), group.env);
      await expect(page.locator('body')).toContainText(target, { timeout: 15000 });
      break;
    }
    case 'assert_no_text': {
      const target = resolveTemplate(getStepText(step), group.env);
      await expect(page.locator('body')).not.toContainText(target, { timeout: 15000 });
      break;
    }
    case 'assert_url_contains': {
      const target = resolveTemplate(getStepText(step), group.env);
      await expect(page).toHaveURL(new RegExp(escapeForRegExp(target))); 
      break;
    }
    case 'assert_no_bad_text': {
      await assertNoBadText(page, step.selector, step.expect?.blocklist as string | undefined);
      break;
    }
    case 'assert_console_clean': {
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors detected: ${consoleErrors.slice(0, 3).join(' | ')}`);
      }
      break;
    }
    case 'assert_no_stuck_loading': {
      const timeout = parseInt(step.value ?? '10000', 10);
      await assertNoStuckLoading(page, Number.isNaN(timeout) ? 10000 : timeout);
      break;
    }
    case 'screenshot': {
      await attachScreenshot(page, testInfo, journey.name, stepIndex);
      break;
    }
    default:
      throw new Error(`Unsupported journey action: ${step.action}`);
  }
};

/**
 * Resolve credentials for a journey group. Checks role-specific env vars first
 * (e.g. PLAYWRIGHT_TEST_EMAIL_COACH) so staging can override the hardcoded
 * synthetic emails in the JSON without editing every journey file.
 */
const resolveCredentials = (group: JourneyGroup): { email: string; password: string } => {
  const role = (group.role ?? '').toUpperCase();
  const envEmail = role ? process.env[`PLAYWRIGHT_TEST_EMAIL_${role}`] : undefined;
  const envPassword = role ? process.env[`PLAYWRIGHT_TEST_PASSWORD_${role}`] : undefined;
  return {
    email: envEmail || resolveTemplate(group.env?.TEST_EMAIL, group.env),
    password: envPassword || resolveTemplate(group.env?.TEST_PASSWORD, group.env),
  };
};

const ensureAuthIfNeeded = async (page: Page, group: JourneyGroup, journey: JourneyDefinition) => {
  if (!shouldAutoLogin(group, journey)) return;
  const { email, password } = resolveCredentials(group);
  if (!email || !password) {
    throw new Error(
      `Missing TEST_EMAIL/TEST_PASSWORD for group ${group.group}. Provide them in JSON env or via environment variables.`,
    );
  }
  await performLogin(page, getBaseUrl(group), email, password);
};

export const runJourney = async (
  page: Page,
  group: JourneyGroup,
  journey: JourneyDefinition,
  testInfo: TestInfo,
) => {
  const consoleErrors: string[] = [];
  const handler = (msg: any) => {
    if (msg.type && msg.type() === 'error') {
      const text = msg.text ? msg.text() : String(msg);
      if (!isNonCriticalConsoleError(text)) {
        consoleErrors.push(text);
      }
    }
  };

  page.on('console', handler);

  try {
    await ensureAuthIfNeeded(page, group, journey);
    for (let i = 0; i < journey.steps.length; i += 1) {
      await executeStep(page, group, journey, journey.steps[i], i, consoleErrors, testInfo);
    }
  } finally {
    page.off('console', handler);
  }
};
