# Test Patterns Reference

Copy-paste patterns for common testing scenarios.

## Pattern 1: Authentication Flow (P0)

The most critical test. Every app with auth needs this.

### Full Auth Test Suite

```typescript
// tests/auth.spec.ts
import { test, expect } from "@playwright/test";

// Load credentials from environment
const TEST_EMAIL = process.env.TEST_USER_EMAIL!;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("Authentication", () => {
  test("User can sign up with new account", async ({ page }) => {
    // Generate unique email for this test run
    const uniqueEmail = `test.${Date.now()}@example.com`;

    await page.goto("/signup");

    await page.getByTestId("email-input").fill(uniqueEmail);
    await page.getByTestId("password-input").fill("NewUser123!");
    await page.getByTestId("signup-btn").click();

    // Should redirect to dashboard or onboarding
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });

  test("User can log in with existing account", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("email-input").fill(TEST_EMAIL);
    await page.getByTestId("password-input").fill(TEST_PASSWORD);
    await page.getByTestId("login-btn").click();

    // Verify logged in
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByTestId("user-menu")).toBeVisible();
  });

  test("User can log out", async ({ page }) => {
    // First log in
    await page.goto("/login");
    await page.getByTestId("email-input").fill(TEST_EMAIL);
    await page.getByTestId("password-input").fill(TEST_PASSWORD);
    await page.getByTestId("login-btn").click();
    await expect(page).toHaveURL("/dashboard");

    // Now log out
    await page.getByTestId("user-menu").click();
    await page.getByTestId("logout-btn").click();

    // Should be back at home/login
    await expect(page).toHaveURL(/\/(login|\/)?$/);
  });

  test("Protected routes redirect to login", async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });

  test("Invalid credentials show error", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("email-input").fill("wrong@email.com");
    await page.getByTestId("password-input").fill("wrongpassword");
    await page.getByTestId("login-btn").click();

    // Should show error, NOT redirect
    await expect(page.getByTestId("error-message")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });
});
```

### Reusable Login Helper

Create `tests/helpers/auth.ts`:

```typescript
// tests/helpers/auth.ts
import { Page } from "@playwright/test";

export async function login(page: Page, email?: string, password?: string) {
  const testEmail = email || process.env.TEST_USER_EMAIL!;
  const testPassword = password || process.env.TEST_USER_PASSWORD!;

  await page.goto("/login");
  await page.getByTestId("email-input").fill(testEmail);
  await page.getByTestId("password-input").fill(testPassword);
  await page.getByTestId("login-btn").click();

  // Wait for redirect to complete
  await page.waitForURL("/dashboard");
}

export async function logout(page: Page) {
  await page.getByTestId("user-menu").click();
  await page.getByTestId("logout-btn").click();
  await page.waitForURL(/\/(login|\/)?$/);
}
```

Use in other tests:

```typescript
import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test("Logged in user can create project", async ({ page }) => {
  await login(page); // One line to handle auth

  // Now test the actual feature
  await page.getByTestId("create-project-btn").click();
  // ...
});
```

---

## Pattern 2: CRUD Operations (P0)

Test Create, Read, Update, Delete for your main entity.

```typescript
// tests/projects.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Project CRUD", () => {
  // Log in before each test
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Can CREATE a new project", async ({ page }) => {
    await page.getByTestId("create-project-btn").click();

    await page.getByTestId("project-name-input").fill("Test Project");
    await page
      .getByTestId("project-description-input")
      .fill("A test description");
    await page.getByTestId("save-project-btn").click();

    // Verify it appears in the list
    await expect(page.getByText("Test Project")).toBeVisible();
  });

  test("Can READ/view a project", async ({ page }) => {
    // Click on existing project
    await page.getByTestId("project-card").first().click();

    // Verify detail page loaded
    await expect(page.getByTestId("project-detail")).toBeVisible();
    await expect(page.getByTestId("project-title")).toBeVisible();
  });

  test("Can UPDATE a project", async ({ page }) => {
    // Navigate to project
    await page.getByTestId("project-card").first().click();
    await page.getByTestId("edit-btn").click();

    // Change the name
    await page.getByTestId("project-name-input").clear();
    await page.getByTestId("project-name-input").fill("Updated Name");
    await page.getByTestId("save-btn").click();

    // Verify change persisted
    await expect(page.getByText("Updated Name")).toBeVisible();
  });

  test("Can DELETE a project", async ({ page }) => {
    // Get count before
    const countBefore = await page.getByTestId("project-card").count();

    // Delete first project
    await page.getByTestId("project-card").first().click();
    await page.getByTestId("delete-btn").click();
    await page.getByTestId("confirm-delete-btn").click();

    // Verify removed
    const countAfter = await page.getByTestId("project-card").count();
    expect(countAfter).toBe(countBefore - 1);
  });
});
```

---

## Pattern 3: Form Validation

Test that forms catch errors before submission.

```typescript
// tests/forms.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Form Validation", () => {
  test("Email field validates format", async ({ page }) => {
    await page.goto("/signup");

    // Enter invalid email
    await page.getByTestId("email-input").fill("notanemail");
    await page.getByTestId("password-input").click(); // Blur the email field

    // Should show validation error
    await expect(page.getByTestId("email-error")).toBeVisible();
    await expect(page.getByTestId("email-error")).toContainText(/valid email/i);
  });

  test("Password field enforces minimum length", async ({ page }) => {
    await page.goto("/signup");

    await page.getByTestId("password-input").fill("123"); // Too short
    await page.getByTestId("email-input").click(); // Blur

    await expect(page.getByTestId("password-error")).toBeVisible();
  });

  test("Required fields show error when empty", async ({ page }) => {
    await page.goto("/signup");

    // Submit without filling anything
    await page.getByTestId("signup-btn").click();

    // Both fields should show required error
    await expect(page.getByTestId("email-error")).toBeVisible();
    await expect(page.getByTestId("password-error")).toBeVisible();
  });
});
```

---

## Pattern 4: Navigation & Routing

Test that pages load and navigation works.

```typescript
// tests/navigation.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Navigation", () => {
  test("Public pages are accessible", async ({ page }) => {
    // Home
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);

    // Login
    await page.goto("/login");
    await expect(page.getByTestId("login-btn")).toBeVisible();

    // Signup
    await page.goto("/signup");
    await expect(page.getByTestId("signup-btn")).toBeVisible();
  });

  test("Navbar links work", async ({ page }) => {
    await login(page);

    // Click Dashboard link
    await page.getByTestId("nav-dashboard").click();
    await expect(page).toHaveURL("/dashboard");

    // Click Settings link
    await page.getByTestId("nav-settings").click();
    await expect(page).toHaveURL("/settings");
  });

  test("404 page shows for invalid routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText(/not found|404/i)).toBeVisible();
  });
});
```

---

## Pattern 5: Loading & Error States

Test that your app handles async operations gracefully.

```typescript
// tests/async-states.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Loading and Error States", () => {
  test("Shows loading state while fetching", async ({ page }) => {
    await login(page);

    // Navigate to page that fetches data
    await page.goto("/dashboard");

    // Loading indicator should appear (briefly)
    // Note: This might be too fast to catch, adjust as needed
    await expect(page.getByTestId("loading-spinner")).toBeVisible();

    // Then data should load
    await expect(page.getByTestId("project-list")).toBeVisible();
  });

  test("Shows empty state when no data", async ({ page }) => {
    // Login as user with no projects
    await login(page, "empty-user@test.com", "password123");

    await page.goto("/dashboard");

    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByText(/no projects|get started/i)).toBeVisible();
  });
});
```

---

## Pattern 6: File Upload

```typescript
// tests/upload.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import path from "path";

test("User can upload avatar image", async ({ page }) => {
  await login(page);
  await page.goto("/settings/profile");

  // Upload a file
  const filePath = path.join(__dirname, "fixtures", "test-avatar.png");
  await page.getByTestId("avatar-upload").setInputFiles(filePath);

  // Wait for upload to complete
  await expect(page.getByTestId("upload-success")).toBeVisible();

  // Verify image preview updated
  const avatarImg = page.getByTestId("avatar-preview");
  await expect(avatarImg).toHaveAttribute("src", /test-avatar|blob:/);
});
```

---

## Pattern 7: Modal/Dialog Interactions

```typescript
// tests/modals.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Modal Interactions", () => {
  test("Confirmation modal blocks destructive action", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");

    // Click delete
    await page.getByTestId("delete-btn").first().click();

    // Modal should appear
    await expect(page.getByTestId("confirm-modal")).toBeVisible();
    await expect(page.getByText(/are you sure/i)).toBeVisible();

    // Cancel should close modal without deleting
    await page.getByTestId("cancel-btn").click();
    await expect(page.getByTestId("confirm-modal")).not.toBeVisible();
  });

  test("Modal closes on backdrop click", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");

    await page.getByTestId("open-modal-btn").click();
    await expect(page.getByTestId("modal")).toBeVisible();

    // Click outside (backdrop)
    await page.getByTestId("modal-backdrop").click();
    await expect(page.getByTestId("modal")).not.toBeVisible();
  });
});
```

---

## Pattern 8: API Response Mocking

When you need to test error states or specific scenarios:

```typescript
// tests/api-errors.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test("Shows error message when API fails", async ({ page }) => {
  await login(page);

  // Intercept the API call and make it fail
  await page.route("**/api/projects", (route) => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  });

  await page.goto("/dashboard");

  // Should show error state
  await expect(page.getByTestId("error-message")).toBeVisible();
  await expect(page.getByText(/something went wrong/i)).toBeVisible();
});

test("Handles slow network gracefully", async ({ page }) => {
  await login(page);

  // Slow down the API response
  await page.route("**/api/projects", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay
    route.continue();
  });

  await page.goto("/dashboard");

  // Should show loading state during delay
  await expect(page.getByTestId("loading-spinner")).toBeVisible();

  // Eventually should load
  await expect(page.getByTestId("project-list")).toBeVisible({
    timeout: 10000,
  });
});
```

---

## Pattern 9: Mobile Responsiveness

```typescript
// tests/mobile.spec.ts
import { test, expect, devices } from "@playwright/test";

// Use iPhone viewport
test.use({ ...devices["iPhone 13"] });

test.describe("Mobile Experience", () => {
  test("Mobile menu toggles correctly", async ({ page }) => {
    await page.goto("/");

    // Desktop nav should be hidden
    await expect(page.getByTestId("desktop-nav")).not.toBeVisible();

    // Hamburger menu should be visible
    await expect(page.getByTestId("mobile-menu-btn")).toBeVisible();

    // Click to open
    await page.getByTestId("mobile-menu-btn").click();
    await expect(page.getByTestId("mobile-nav")).toBeVisible();

    // Click to close
    await page.getByTestId("mobile-menu-btn").click();
    await expect(page.getByTestId("mobile-nav")).not.toBeVisible();
  });
});
```

---

## Common Selectors Reference

```typescript
// tests/helpers/selectors.ts
export const SELECTORS = {
  // Auth
  emailInput: "email-input",
  passwordInput: "password-input",
  loginBtn: "login-btn",
  signupBtn: "signup-btn",
  logoutBtn: "logout-btn",
  userMenu: "user-menu",

  // Common
  submitBtn: "submit-btn",
  cancelBtn: "cancel-btn",
  deleteBtn: "delete-btn",
  editBtn: "edit-btn",
  saveBtn: "save-btn",

  // States
  loadingSpinner: "loading-spinner",
  errorMessage: "error-message",
  successMessage: "success-message",
  emptyState: "empty-state",

  // Modals
  modal: "modal",
  modalBackdrop: "modal-backdrop",
  confirmModal: "confirm-modal",
} as const;
```

---

## Assertion Cheat Sheet

```typescript
// URL
await expect(page).toHaveURL("/dashboard");
await expect(page).toHaveURL(/dashboard/); // Regex

// Title
await expect(page).toHaveTitle("My App");

// Visibility
await expect(locator).toBeVisible();
await expect(locator).not.toBeVisible();
await expect(locator).toBeHidden();

// Text
await expect(locator).toHaveText("Exact text");
await expect(locator).toContainText("partial");

// Attributes
await expect(locator).toHaveAttribute("href", "/link");
await expect(locator).toHaveClass(/active/);

// State
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();

// Count
await expect(locator).toHaveCount(5);

// Input value
await expect(locator).toHaveValue("filled text");
```
