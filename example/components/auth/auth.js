// auth.js — JWT authentication helper
//
// Security model:
//   ✔ Token stored in closure — not on window, not in localStorage/sessionStorage
//   ✔ Expiry checked client-side by decoding the JWT payload (base64)
//   ✔ fetchWithAuth attaches Authorization: Bearer on every request
//   ✔ 401 response clears the token and calls onExpired()
//   ✔ getPayload() exposes claims (id, name, exp) without exposing the token string
//   ⚠ Client-side expiry check is a convenience — the server always has final say
//   ⚠ Use HTTPS in production so the token cannot be intercepted in transit

function decodePayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpired(payload) {
  if (!payload?.exp) return false;
  return Date.now() / 1000 > payload.exp;
}

// createAuth(options) → auth instance
//
// Options:
//   loginUrl  {string}    POST endpoint that receives credentials and returns a JWT
//   onExpired {function}  Called when the token is missing, expired, or a 401 is received
//
// Usage:
//   import { createAuth } from "../../components/auth/auth.js";
//
//   const auth = createAuth({
//     loginUrl: "/api/auth/login",
//     onExpired: () => { window.location.hash = "#/login"; }
//   });
//
//   // Login
//   await auth.login({ username: "user", password: "pass" });
//
//   // Protected fetch (replaces fetch in your services)
//   const res = await auth.fetchWithAuth("/api/data");
//   const data = await res.json();
//
//   // Check before entering a protected module
//   if (!auth.isAuthenticated()) app.go("login");
//
//   // Read JWT claims (id, email, exp, etc.) — never the token string
//   const { username, exp } = auth.getPayload();
//
//   // Logout
//   auth.logout();

export function createAuth(options = {}) {
  const { loginUrl, onExpired = () => {} } = options;

  // Token lives here — invisible to the rest of the app
  let token = null;

  const login = async (credentials) => {
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error(`Login failed: HTTP ${res.status}`);
    const data = await res.json();

    // Support common response shapes from different backends
    token = data.token ?? data.access_token ?? data.accessToken ?? data.jwt ?? null;
    if (!token) throw new Error("No token found in response");
    return data;
  };

  const logout = () => {
    token = null;
  };

  const isAuthenticated = () => {
    if (!token) return false;
    const payload = decodePayload(token);
    if (isExpired(payload)) {
      token = null;
      return false;
    }
    return true;
  };

  // Returns the decoded JWT payload (claims) — useful for username, id, exp
  // Does NOT return the token string itself
  const getPayload = () => {
    if (!token) return null;
    return decodePayload(token);
  };

  // Drop-in replacement for fetch() in your services
  // Adds Authorization header and handles 401 automatically
  const fetchWithAuth = async (url, options = {}) => {
    if (!isAuthenticated()) {
      onExpired();
      throw new Error("Not authenticated");
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      token = null;
      onExpired();
      throw new Error("Session expired (401)");
    }

    return res;
  };

  return { login, logout, isAuthenticated, fetchWithAuth, getPayload };
}
