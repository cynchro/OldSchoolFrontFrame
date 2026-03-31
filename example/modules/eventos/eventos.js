import { defineModule } from "../../../framework/module.js";

const TEXTS = {
  es: {
    title: "Eventos",
    description: "Manejadores declarativos con atributos data-*.",
    demo: "Demo", code: "Código",
    btnClick: "Hacé click",
    selected: "Seleccionado",
    lastKey: "Última tecla",
    chars: "Caracteres",
    selectOptions: [
      { value: "Opción A" },
      { value: "Opción B" },
      { value: "Opción C" }
    ]
  },
  en: {
    title: "Events",
    description: "Declarative event handlers with data-* attributes.",
    demo: "Demo", code: "Code",
    btnClick: "Click me",
    selected: "Selected",
    lastKey: "Last key",
    chars: "Characters",
    selectOptions: [
      { value: "Option A" },
      { value: "Option B" },
      { value: "Option C" }
    ]
  }
};

const SNIPPET =
`<!-- Available attributes -->
data-click="handler"
data-change="handler"
data-input="handler"
data-keyup="handler"
data-keydown="handler"
data-submit="handler"
data-blur="handler"
data-focus="handler"

// All handlers receive (event, ctx)
methods: {
  onClick(event, ctx) {
    // event → native DOM Event
    // ctx.state → reactive state
    // ctx.store → global store
  }
}`;

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    clickMsg: "—",
    selected: "—",
    lastKey: "—",
    charCount: "0",
    clicks: 0,
    selectOptions: TEXTS.es.selectOptions,
    snippet: SNIPPET
  }),

  methods: {
    onClick(_, ctx) {
      ctx.state.clicks++;
      ctx.state.clickMsg = `${ctx.state.clicks} click${ctx.state.clicks !== 1 ? "s" : ""}`;
    },
    onChange(event, ctx) {
      ctx.state.selected = event.target.value || "—";
    },
    onKeyup(event, ctx) {
      ctx.state.lastKey = event.key;
    },
    onInput(event, ctx) {
      ctx.state.charCount = String(event.target.value.length);
    }
  },

  mounted(ctx) {
    const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
    ctx.state.t = T;
    ctx.state.selectOptions = T.selectOptions;
  }
});
