import { defineModule } from "../../../framework/module.js";
import { getUsers } from "./services/servicios.service.js";

const TEXTS = {
  es: {
    title: "Servicios",
    description: "Separar la lógica de API del módulo. El servicio solo fetchea; el módulo maneja estado.",
    demo: "Demo", code: "Código",
    btnLoad: "Cargar usuarios",
    btnError: "Simular error HTTP",
    statusDefault: "Presioná 'Cargar usuarios' para ver los datos.",
    statusLoading: "Cargando…",
    statusLoaded: (n) => `${n} usuarios cargados.`,
    statusError: (m) => `Error: ${m}`
  },
  en: {
    title: "Services",
    description: "Separate API logic from the module. The service only fetches; the module manages state.",
    demo: "Demo", code: "Code",
    btnLoad: "Load users",
    btnError: "Simulate HTTP error",
    statusDefault: "Press 'Load users' to see the data.",
    statusLoading: "Loading…",
    statusLoaded: (n) => `${n} users loaded.`,
    statusError: (m) => `Error: ${m}`
  }
};

const SNIPPET =
`// services/servicios.service.js
// Only fetch, no DOM access.
export async function getUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

// servicios.js — module handles state
import { getUsers } from "./services/...";

methods: {
  async load(_, ctx) {
    ctx.state.status = "Loading…";
    try {
      ctx.state.users = await getUsers();
      ctx.state.status = "Done.";
    } catch (err) {
      ctx.state.status = err.message;
    }
  }
}`;

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    users: [],
    status: TEXTS.es.statusDefault,
    snippet: SNIPPET
  }),

  methods: {
    async load(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      ctx.state.status = T.statusLoading;
      ctx.state.users = [];
      try {
        ctx.state.users = await getUsers(false);
        ctx.state.status = T.statusLoaded(ctx.state.users.length);
      } catch (err) {
        ctx.state.status = T.statusError(err.message);
      }
    },

    async loadError(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      ctx.state.status = T.statusLoading;
      ctx.state.users = [];
      try {
        ctx.state.users = await getUsers(true);
      } catch (err) {
        ctx.state.status = T.statusError(err.message);
      }
    }
  },

  mounted(ctx) {
    const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
    ctx.state.t = T;
    ctx.state.status = T.statusDefault;
  }
});
