import { defineModule } from "../../../framework/module.js";

const TEXTS = {
  es: {
    title: "Store",
    description: "Estado global compartido entre módulos. Persiste al navegar.",
    demo: "Demo", code: "Código",
    userLabel: "Usuario en el store:",
    btnChange: "Cambiar",
    visitsLabel: "Veces que visitaste esta página:",
    visitsHint: "Navegá a otra sección y volvé — el contador persiste en el store porque vive en ctx.store, no en ctx.state."
  },
  en: {
    title: "Store",
    description: "Global state shared across modules. Persists while navigating.",
    demo: "Demo", code: "Code",
    userLabel: "User in the store:",
    btnChange: "Change",
    visitsLabel: "Times you visited this page:",
    visitsHint: "Navigate to another section and come back — the counter persists in the store because it lives in ctx.store, not ctx.state."
  }
};

const SNIPPET =
`// app.js — initial store
await initApp({
  store: {
    user: { name: "Dev User" },
    visits: 0
  }
});

// Read from any module:
mounted(ctx) {
  const name = ctx.store.state.user.name;
}

// Write (triggers reactivity):
ctx.store.patchState({
  user: { name: "New name" }
});

// Also available in the browser:
// window.$ols.store`;

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    userName: "",
    newName: "",
    visits: 0,
    snippet: SNIPPET
  }),

  methods: {
    changeName(_, ctx) {
      const name = ctx.state.newName.trim();
      if (!name) return;
      ctx.store.patchState({ user: { name } });
      ctx.state.userName = name;
      ctx.state.newName = "";
    }
  },

  mounted(ctx) {
    ctx.state.t = TEXTS[ctx.store.state.lang] || TEXTS.es;
    const visits = (ctx.store.state.visits || 0) + 1;
    ctx.store.patchState({ visits });
    ctx.state.visits   = visits;
    ctx.state.userName = ctx.store.state.user?.name ?? "—";
  }
});
