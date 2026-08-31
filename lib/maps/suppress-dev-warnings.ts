let patched = false;

/**
 * Google Maps logs a `console.error` when a project doesn't have billing
 * enabled (the map still renders, just watermarked). In `next dev` that
 * single console.error trips Next.js's full-screen error overlay even
 * though nothing is actually broken. This filters out only that specific,
 * known-non-fatal message — every other console.error still goes through
 * untouched.
 */
export function suppressGoogleMapsDevWarnings() {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === "string" && first.includes("Google Maps JavaScript API error")) {
      return;
    }
    originalError(...args);
  };
}
