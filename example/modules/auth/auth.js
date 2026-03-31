import { defineModule } from "../../../framework/module.js";
import { createAuth } from "../../components/auth/auth.js";

// Demo uses dummyjson.com — a public API that returns real JWTs.
// Credentials: emilys / emilyspass
const auth = createAuth({
  loginUrl: "https://dummyjson.com/auth/login",
  onExpired: () => { window.location.hash = "#/auth"; }
});

const TEXTS = {
  es: {
    title: "Autenticación JWT",
    description: "Helper reutilizable para flujos Login → Token → Requests autenticados.",
    demoNote: "Demo en vivo con dummyjson.com. Las credenciales ya están completas — solo presioná Login.",
    loginTitle: "Iniciar sesión",
    labelUser: "Usuario", labelPass: "Contraseña",
    btnLogin: "Login",
    authTitle: "✓ Autenticado",
    loggedAs: "Sesión activa como:",
    expiresAt: "Token expira:",
    btnFetch: "Fetch protegido",
    btnLogout: "Cerrar sesión",
    responseLabel: "Respuesta de la API:",
    code: "Código",
    errorInvalid: "Credenciales inválidas.",
    errorGeneric: (m) => `Error: ${m}`
  },
  en: {
    title: "JWT Authentication",
    description: "Reusable helper for Login → Token → Authenticated requests flows.",
    demoNote: "Live demo with dummyjson.com. Credentials are pre-filled — just press Login.",
    loginTitle: "Sign in",
    labelUser: "Username", labelPass: "Password",
    btnLogin: "Login",
    authTitle: "✓ Authenticated",
    loggedAs: "Logged in as:",
    expiresAt: "Token expires:",
    btnFetch: "Fetch protected",
    btnLogout: "Sign out",
    responseLabel: "API response:",
    code: "Code",
    errorInvalid: "Invalid credentials.",
    errorGeneric: (m) => `Error: ${m}`
  }
};

const SNIPPET =
`// components/auth/auth.js
import { createAuth } from "../../components/auth/auth.js";

// One instance per app — create it once, share it
const auth = createAuth({
  loginUrl: "/api/auth/login",
  onExpired: () => { app.go("login"); }
});

// modules/login/login.js
await auth.login({ username, password });

// services/users.service.js
// Use fetchWithAuth instead of fetch
export async function getUsers() {
  const res = await auth.fetchWithAuth("/api/users");
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

// Check before entering a protected module
mounted(ctx) {
  if (!auth.isAuthenticated()) {
    app.go("login");
    return;
  }
  const { username, exp } = auth.getPayload();
}

// Logout
auth.logout();
app.go("login");`;

function showPanel(id) {
  ["auth-login-panel", "auth-user-panel"].forEach((panelId) => {
    const el = document.getElementById(panelId);
    if (el) el.style.display = panelId === id ? "" : "none";
  });
}

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    username: "emilys",
    password: "emilyspass",
    error: "",
    loggedUser: "",
    expiry: "",
    apiResponse: "",
    snippet: SNIPPET
  }),

  methods: {
    async login(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      ctx.state.error = "";
      try {
        await auth.login({
          username: ctx.state.username,
          password: ctx.state.password
        });
        const payload = auth.getPayload();
        ctx.state.loggedUser = payload?.username ?? payload?.sub ?? "—";
        ctx.state.expiry = payload?.exp
          ? new Date(payload.exp * 1000).toLocaleString()
          : "—";
        ctx.state.apiResponse = "";
        showPanel("auth-user-panel");
      } catch (err) {
        ctx.state.error = err.message.includes("401")
          ? T.errorInvalid
          : T.errorGeneric(err.message);
      }
    },

    async fetchProtected(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      try {
        const res = await auth.fetchWithAuth("https://dummyjson.com/auth/me");
        const data = await res.json();
        // Show only a few safe fields
        const { id, username, email, firstName, lastName } = data;
        ctx.state.apiResponse = JSON.stringify({ id, username, email, firstName, lastName }, null, 2);
      } catch (err) {
        ctx.state.apiResponse = T.errorGeneric(err.message);
      }
    },

    logout(_, ctx) {
      auth.logout();
      ctx.state.loggedUser = "";
      ctx.state.expiry = "";
      ctx.state.apiResponse = "";
      showPanel("auth-login-panel");
    }
  },

  mounted(ctx) {
    ctx.state.t = TEXTS[ctx.store.state.lang] || TEXTS.es;
    // If already authenticated from a previous visit in this session
    if (auth.isAuthenticated()) {
      const payload = auth.getPayload();
      ctx.state.loggedUser = payload?.username ?? payload?.sub ?? "—";
      ctx.state.expiry = payload?.exp
        ? new Date(payload.exp * 1000).toLocaleString()
        : "—";
      showPanel("auth-user-panel");
    } else {
      showPanel("auth-login-panel");
    }
  }
});
