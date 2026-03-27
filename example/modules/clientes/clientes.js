import { defineModule } from "../../../framework/module.js";
import { getClientes } from "./services/clientes.service.js";

/**
 * Manual table render — no table helper; easy to inspect in DevTools.
 */
function renderClientesTable(ctx) {
  const tbody = ctx.root.querySelector("#clientes-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  ctx.state.clients.forEach((row) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = String(row.id);
    tr.appendChild(tdId);

    const tdName = document.createElement("td");
    tdName.textContent = row.name;
    tr.appendChild(tdName);

    const tdEmail = document.createElement("td");
    tdEmail.textContent = row.email;
    tr.appendChild(tdEmail);

    const tdPhone = document.createElement("td");
    tdPhone.textContent = row.phone ?? "";
    tr.appendChild(tdPhone);

    tbody.appendChild(tr);
  });
}

export default defineModule({
  css: true,

  state: () => ({
    title: "Clientes",
    newClientName: "",
    loadStatus: "Cargando…",
    clients: [],
    count: 0
  }),

  methods: {
    addClient(_, ctx) {
      const name = ctx.state.newClientName.trim();
      if (!name) return;

      const nextId =
        ctx.state.clients.length === 0
          ? 1
          : Math.max(...ctx.state.clients.map((c) => Number(c.id))) + 1;

      ctx.state.clients.push({
        id: nextId,
        name,
        email: "",
        phone: ""
      });
      ctx.state.newClientName = "";
      ctx.state.count = ctx.state.clients.length;
      renderClientesTable(ctx);
    }
  },

  mounted(ctx) {
    // Service returns data only; module owns state + DOM updates.
    (async () => {
      try {
        const rows = await getClientes();
        ctx.state.clients = rows;
        ctx.state.count = rows.length;
        ctx.state.loadStatus = "Datos desde API (demo).";
        renderClientesTable(ctx);
      } catch (err) {
        console.error(err);
        ctx.state.loadStatus = `Error: ${err.message}`;
        ctx.state.clients = [];
        ctx.state.count = 0;
        renderClientesTable(ctx);
      }
    })();
  }
});
