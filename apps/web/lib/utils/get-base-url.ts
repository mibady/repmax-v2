/**
 * Returns the application base URL.
 * Priority: NEXT_PUBLIC_APP_URL > NEXT_PUBLIC_URL > VERCEL_URL > localhost (dev only).
 * Throws in production if no URL is configured to prevent silent localhost redirects.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable in production");
  }
  return "http://localhost:3000";
}
