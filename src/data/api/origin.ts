const DEVELOPMENT_API_ORIGIN = "http://localhost:8000";
const PRODUCTION_API_ORIGIN =
    "https://orion-project-backend-production.up.railway.app";

/**
 * Where orion-bank-api lives, for the `/api/v1` rewrite and server-side calls.
 * `API_URL` wins; otherwise the local API in development, Railway in production.
 * The rewrite is baked in at build time, so set `API_URL` before `next build`.
 */
export function apiOrigin(): string {
    const configured = process.env.API_URL?.trim().replace(/\/+$/, "");
    if (configured) return configured;
    return process.env.NODE_ENV === "development"
        ? DEVELOPMENT_API_ORIGIN
        : PRODUCTION_API_ORIGIN;
}

/** Same-origin prefix the browser calls; Next rewrites it to `apiOrigin()`. */
export const API_PREFIX = "/api/v1";

/** Session cookie set by orion-bank-api (httpOnly); opaque to the web app. */
export const SESSION_COOKIE = "orion_sid";
