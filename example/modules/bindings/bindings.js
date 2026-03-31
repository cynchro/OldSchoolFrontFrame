import { defineModule } from "../../../framework/module.js";

const TEXTS = {
  es: {
    title: "Bindings",
    description: "Conectar el estado con el DOM de forma declarativa.",
    demo: "Demo", code: "Código",
    currentValue: "Valor actual", counter: "Contador",
    btnIncrement: "+1", btnReset: "Reset"
  },
  en: {
    title: "Bindings",
    description: "Connect state to the DOM declaratively.",
    demo: "Demo", code: "Code",
    currentValue: "Current value", counter: "Counter",
    btnIncrement: "+1", btnReset: "Reset"
  }
};

const SNIPPET =
`<!-- HTML -->
<input data-bind="message"
       data-model
       data-model-event="input" />

<span data-bind="message"></span>
<span data-bind="count"></span>

// JS (defineModule)
state: () => ({
  message: "",
  count: 0
}),
methods: {
  increment(_, ctx) {
    ctx.state.count++;
  }
}`;

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    message: "",
    count: 0,
    snippet: SNIPPET
  }),
  methods: {
    increment(_, ctx) { ctx.state.count++; },
    reset(_, ctx) { ctx.state.count = 0; }
  },
  mounted(ctx) {
    ctx.state.t = TEXTS[ctx.store.state.lang] || TEXTS.es;
  }
});
