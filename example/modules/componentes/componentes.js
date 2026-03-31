import { defineModule } from "../../../framework/module.js";
import { showAlert } from "../../components/alert/alert.js";

const TEXTS = {
  es: {
    title: "Componentes",
    description: "Piezas reutilizables creadas con Component(), usables desde cualquier módulo.",
    demoTitle: "Demo — Alert",
    demoHint: "Se cierra solo a los 3 segundos o al hacer click en ×. Usado desde cualquier módulo con una línea.",
    code: "Código",
    btnSuccess: "Éxito",
    btnError: "Error",
    btnInfo: "Info",
    alertSuccess: "Operación completada correctamente.",
    alertError: "Algo salió mal. Revisá los datos.",
    alertInfo: "Los cambios se guardan automáticamente."
  },
  en: {
    title: "Components",
    description: "Reusable pieces created with Component(), usable from any module.",
    demoTitle: "Demo — Alert",
    demoHint: "Auto-closes after 3 seconds or on click ×. Used from any module with one line.",
    code: "Code",
    btnSuccess: "Success",
    btnError: "Error",
    btnInfo: "Info",
    alertSuccess: "Operation completed successfully.",
    alertError: "Something went wrong. Check your data.",
    alertInfo: "Changes are saved automatically."
  }
};

const SNIPPET =
`// Import from any module
import { showAlert } from
  "../../components/alert/alert.js";

// Use in methods or mounted:
showAlert(ctx.root, "Saved.", "success");
showAlert(ctx.root, "Failed.", "error");
showAlert(ctx.root, "Note...", "info");

// The component uses Component() internally,
// auto-removes after 3 seconds,
// or on click ×.`;

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    snippet: SNIPPET
  }),

  methods: {
    showSuccess(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      showAlert(ctx.root, T.alertSuccess, "success");
    },
    showError(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      showAlert(ctx.root, T.alertError, "error");
    },
    showInfo(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      showAlert(ctx.root, T.alertInfo, "info");
    }
  },

  mounted(ctx) {
    ctx.state.t = TEXTS[ctx.store.state.lang] || TEXTS.es;
  }
});
