import { defineModule } from "../../../framework/module.js";
import { getTodos } from "./services/listas.service.js";

const TEXTS = {
  es: {
    title: "Listas",
    description: "Renderizado declarativo de arrays con data-for.",
    demo: "Demo", code: "Código",
    btnAdd: "Agregar", btnLoad: "Cargar desde API",
    btnPrev: "← Anterior", btnNext: "Siguiente →",
    page: "Página",
    statusDefault: "Agregá ítems o cargá desde la API.",
    statusLoading: "Cargando desde API…",
    statusLoaded: (n, p) => `${n} ítems cargados (pág. ${p}).`,
    statusPage: (p) => `Página ${p}.`,
    statusError: (m) => `Error: ${m}`
  },
  en: {
    title: "Lists",
    description: "Declarative array rendering with data-for.",
    demo: "Demo", code: "Code",
    btnAdd: "Add", btnLoad: "Load from API",
    btnPrev: "← Previous", btnNext: "Next →",
    page: "Page",
    statusDefault: "Add items or load from API.",
    statusLoading: "Loading from API…",
    statusLoaded: (n, p) => `${n} items loaded (page ${p}).`,
    statusPage: (p) => `Page ${p}.`,
    statusError: (m) => `Error: ${m}`
  }
};

const SNIPPET =
`<!-- HTML -->
<template data-for="items">
  <li data-bind="title"></li>
</template>

// JS
state: () => ({ items: [] }),

mounted(ctx) {
  (async () => {
    ctx.state.items = await getTodos();
    // Re-renders automatically.
    // Works with replacement:
    //   ctx.state.items = newArray
    // And with mutation:
    //   ctx.state.items.push(item)
  })();
}`;

export default defineModule({
  state: () => ({
    t: TEXTS.es,
    items: [],
    newItem: "",
    count: 0,
    page: 1,
    status: TEXTS.es.statusDefault,
    snippet: SNIPPET
  }),

  methods: {
    addItem(_, ctx) {
      const title = ctx.state.newItem.trim();
      if (!title) return;
      ctx.state.items.push({ id: ctx.state.items.length + 1, title });
      ctx.state.newItem = "";
      ctx.state.count = ctx.state.items.length;
    },

    async loadFromApi(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      ctx.state.status = T.statusLoading;
      ctx.state.page = 1;
      try {
        ctx.state.items = await getTodos(1);
        ctx.state.count = ctx.state.items.length;
        ctx.state.status = T.statusLoaded(ctx.state.count, 1);
      } catch (err) {
        ctx.state.status = T.statusError(err.message);
      }
    },

    async nextPage(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      const next = ctx.state.page + 1;
      try {
        const items = await getTodos(next);
        if (!items.length) return;
        ctx.state.items = items;
        ctx.state.page = next;
        ctx.state.count = items.length;
        ctx.state.status = T.statusPage(next);
      } catch (err) {
        ctx.state.status = T.statusError(err.message);
      }
    },

    async prevPage(_, ctx) {
      const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
      if (ctx.state.page <= 1) return;
      const prev = ctx.state.page - 1;
      try {
        const items = await getTodos(prev);
        ctx.state.items = items;
        ctx.state.page = prev;
        ctx.state.count = items.length;
        ctx.state.status = T.statusPage(prev);
      } catch (err) {
        ctx.state.status = T.statusError(err.message);
      }
    }
  },

  mounted(ctx) {
    const T = TEXTS[ctx.store.state.lang] || TEXTS.es;
    ctx.state.t = T;
    ctx.state.status = T.statusDefault;
    ctx.state.items = [
      { id: 1, title: "Ítem de ejemplo A" },
      { id: 2, title: "Ítem de ejemplo B" },
      { id: 3, title: "Ítem de ejemplo C" }
    ];
    ctx.state.count = 3;
  }
});
