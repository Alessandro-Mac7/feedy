const ROLE_CACHE_KEY = "feedy-role";

export type CachedRole = "patient" | "nutritionist";

export function readCachedRole(): string | null {
  return localStorage.getItem(ROLE_CACHE_KEY);
}

export function writeCachedRole(role: CachedRole) {
  localStorage.setItem(ROLE_CACHE_KEY, role);
}

export function clearCachedRole() {
  localStorage.removeItem(ROLE_CACHE_KEY);
}

export function subscribeToRoleCache() {
  return () => {};
}

export function getServerRoleSnapshot(): string | null {
  return null;
}
