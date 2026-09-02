import { clearCachedRole } from "@/lib/auth/role-cache";
import { clearRuntimeCaches } from "@/lib/pwa/clear-runtime-caches";

/**
 * Devices can be shared between accounts (e.g. family sharing), and the
 * service worker's runtime caches (stale-while-revalidate on /api/diets,
 * /api/nutritionist/me) are keyed by URL only, not by user. Without this,
 * the next account to sign in on the same device would briefly see the
 * previous user's cached diet data and role.
 */
export async function clearLocalAuthState() {
  clearCachedRole();
  await clearRuntimeCaches();
}
