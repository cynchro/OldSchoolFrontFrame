import { defineModule } from "../../../framework/module.js";

const TEXTS = {
  es: {
    title: "Perfil",
    description: "Módulo cargado desde una ruta dinámica #/perfil/:id.",
    paramLabel: "Parámetro :id recibido desde la URL:",
    fullRoute: "Ruta completa",
    howTitle: "¿Cómo llega el parámetro?",
    btnBack: "← Volver a Rutas"
  },
  en: {
    title: "Profile",
    description: "Module loaded from a dynamic route #/perfil/:id.",
    paramLabel: "The :id parameter received from the URL:",
    fullRoute: "Full route",
    howTitle: "How does the parameter arrive?",
    btnBack: "← Back to Routes"
  }
};

const SNIPPET =
`// app.js — dynamic route definition
routes: {
  "perfil/:id": "perfil"
}

// modules/perfil/perfil.js
mounted(ctx) {
  // ctx.props.params is filled
  // automatically from the URL.
  ctx.state.id = ctx.props.params.id;
}

// Navigate with parameter:
window.location.hash = "#/perfil/42";
// or from app.js:
app.go("perfil/42");`;

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    id: "",
    route: "",
    snippet: SNIPPET
  }),

  mounted(ctx) {
    ctx.state.t     = TEXTS[ctx.store.state.lang] || TEXTS.es;
    ctx.state.id    = ctx.props.params?.id ?? "—";
    ctx.state.route = ctx.props.route || window.location.hash;
  }
});
