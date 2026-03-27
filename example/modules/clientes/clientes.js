import { defineModule } from "../../../framework/module.js";

function renderClientList(ctx) {
  const list = ctx.root.querySelector("#clientes-list");
  if (!list) return;

  list.innerHTML = "";
  ctx.state.clients.forEach((name) => {
    const item = document.createElement("li");
    item.textContent = name;
    list.appendChild(item);
  });
}

export default defineModule({
  css: true,

  state: () => ({
    title: "Clientes",
    newClientName: "",
    clients: ["Ana", "Luis"],
    count: 2
  }),

  methods: {
    addClient(_, ctx) {
      const name = ctx.state.newClientName.trim();
      if (!name) return;

      ctx.state.clients.push(name);
      ctx.state.newClientName = "";
      ctx.state.count = ctx.state.clients.length;
      renderClientList(ctx);
    }
  },

  mounted(ctx) {
    renderClientList(ctx);
  }
});
