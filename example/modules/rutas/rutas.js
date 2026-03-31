import { defineModule } from "../../../framework/module.js";

const TEXTS = {
  es: {
    title: "Rutas",
    description: "Router por hash con soporte de parámetros dinámicos.",
    demo: "Demo", code: "Código",
    currentRoute: "Ruta actual:",
    navLabel: "Navegar a un perfil con parámetro",
    btnGo: "Ir"
  },
  en: {
    title: "Routes",
    description: "Hash router with dynamic parameter support.",
    demo: "Demo", code: "Code",
    currentRoute: "Current route:",
    navLabel: "Navigate to a profile with a parameter",
    btnGo: "Go"
  }
};

const SNIPPET =
`// app.js
await initApp({
  routes: {
    home: "home",
    "perfil/:id": "perfil"
  }
});

// modules/perfil/perfil.js
mounted(ctx) {
  // ctx.props.params contains
  // the captured URL segments.
  const id = ctx.props.params.id;
  // #/perfil/42 → id = "42"
}`;

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    currentRoute: "",
    profileId: "",
    snippet: SNIPPET
  }),

  methods: {
    goToProfile(_, ctx) {
      const id = ctx.state.profileId.trim();
      if (!id) return;
      window.location.hash = `#/perfil/${id}`;
    }
  },

  mounted(ctx) {
    ctx.state.t = TEXTS[ctx.store.state.lang] || TEXTS.es;
    ctx.state.currentRoute = ctx.props.route || window.location.hash;
  }
});
