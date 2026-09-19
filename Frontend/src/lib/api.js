// ─── Axios API Clients ────────────────────────────────────────────────────────
// Three pre-configured instances — one per microservice.
// All calls go through the Vite dev-proxy so no CORS changes needed.
// Each instance auto-attaches the JWT from localStorage on every request.
// On a 401 response it clears the token so the user is forced back to login.

import axios from "axios";
import { getToken, clearAll } from "./tokenStorage";

// ── helpers ──────────────────────────────────────────────────────────────────

function addAuthInterceptors(instance) {
  // Attach JWT on every outgoing request
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // On 401, wipe storage and hard-reload to landing page
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        // Ignore 401s specifically from new endpoints so it doesn't kick the user out if the server is out of sync
        if (err.config?.url?.includes('/notifications') || err.config?.url?.includes('/badges')) {
          return Promise.reject(err);
        }
        
        clearAll();
        // Dispatch an event instead of hard-reloading the page
        window.dispatchEvent(new Event("auth-expired"));
      }
      return Promise.reject(err);
    }
  );

  return instance;
}

// ── User Service  (port 8081) ─────────────────────────────────────────────────
// Handles: /api/auth/*, /api/users/*, /api/password-reset/*
export const userApi = addAuthInterceptors(
  axios.create({ baseURL: "/user" })
);

// ── Learning Service (port 8082) ──────────────────────────────────────────────
// Handles: /api/courses/*, /api/quizzes/*
export const learningApi = addAuthInterceptors(
  axios.create({ baseURL: "/learning" })
);

// ── Analytics Service (port 8083) ─────────────────────────────────────────────
// Handles: /api/progress/*, /api/leaderboard/*, /api/ai/*
export const analyticsApi = addAuthInterceptors(
  axios.create({ baseURL: "/analytics" })
);
