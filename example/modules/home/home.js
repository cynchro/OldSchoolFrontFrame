import { defineModule } from "../../../framework/module.js";

const TEXTS = {
  es: {
    title: "OldSchoolFrontFrame",
    subtitle: "Frontend sin build steps. Sin magia. Solo código.",
    card1Title: "Filosofía",
    card2Title: "Para quién",
    card3Title: "Arrancar",
    card3Body: "Servir desde la raíz del repo. Abrir localhost:8080/example/",
    sectionsLabel: "Secciones de esta wiki",
    linkBindings:    "— data-bind, data-model, estado reactivo",
    linkListas:      "— data-for, arrays reactivos, paginación",
    linkEventos:     "— data-click, data-change, data-keyup y más",
    linkRutas:       "— router hash con parámetros dinámicos",
    linkStore:       "— estado global compartido entre módulos",
    linkServicios:   "— fetch, loading states, manejo de errores",
    linkComponentes: "— piezas reutilizables con Component()",
    patternsLabel: "Patrones",
    linkAuth: "— login, token en memoria, fetch autenticado",
    philosophy: [
      { text: "Sin paso de compilación" },
      { text: "Módulos por carpeta" },
      { text: "Estado reactivo explícito" },
      { text: "Legible en minutos" }
    ],
    audience: [
      { text: "Devs backend que necesitan un frontend" },
      { text: "Paneles admin y herramientas internas" },
      { text: "Apps CRUD sin overhead" }
    ]
  },
  en: {
    title: "OldSchoolFrontFrame",
    subtitle: "Frontend without build steps. No magic. Just code.",
    card1Title: "Philosophy",
    card2Title: "Who it's for",
    card3Title: "Getting started",
    card3Body: "Serve from the repo root. Open localhost:8080/example/",
    sectionsLabel: "Wiki sections",
    linkBindings:    "— data-bind, data-model, reactive state",
    linkListas:      "— data-for, reactive arrays, pagination",
    linkEventos:     "— data-click, data-change, data-keyup and more",
    linkRutas:       "— hash router with dynamic parameters",
    linkStore:       "— global state shared across modules",
    linkServicios:   "— fetch, loading states, error handling",
    linkComponentes: "— reusable pieces with Component()",
    patternsLabel: "Patterns",
    linkAuth: "— login, in-memory token, authenticated fetch",
    philosophy: [
      { text: "No build step" },
      { text: "Folder-based modules" },
      { text: "Explicit reactive state" },
      { text: "Readable in minutes" }
    ],
    audience: [
      { text: "Backend devs who need a frontend" },
      { text: "Admin panels and internal tools" },
      { text: "CRUD apps without overhead" }
    ]
  }
};

export default defineModule({
  state: () => ({ t: TEXTS.es }),
  mounted(ctx) {
    ctx.state.t = TEXTS[ctx.store.state.lang] || TEXTS.es;
  }
});
