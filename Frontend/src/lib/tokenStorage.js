// ─── Token Storage Helpers ───────────────────────────────────────────────────
// All JWT and user-profile persistence lives here so every other module imports
// from one place instead of scattering localStorage keys around the codebase.

const TOKEN_KEY   = "bw_access_token";
const REFRESH_KEY = "bw_refresh_token";
const USER_KEY    = "bw_user";

export const getToken      = ()    => localStorage.getItem(TOKEN_KEY);
export const setToken      = (t)   => localStorage.setItem(TOKEN_KEY, t);
export const clearToken    = ()    => localStorage.removeItem(TOKEN_KEY);

export const getRefresh    = ()    => localStorage.getItem(REFRESH_KEY);
export const setRefresh    = (t)   => localStorage.setItem(REFRESH_KEY, t);
export const clearRefresh  = ()    => localStorage.removeItem(REFRESH_KEY);

export const getUser       = ()    => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};
export const setUser       = (u)   => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const clearUser     = ()    => localStorage.removeItem(USER_KEY);

export const clearAll = () => {
  clearToken();
  clearRefresh();
  clearUser();
};
