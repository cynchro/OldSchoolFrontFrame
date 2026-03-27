# OlsSchoolFrontFrame

A minimal frontend framework for developers who just want HTML, CSS, and JavaScript to work.

OlsSchoolFrontFrame is a simple alternative for developers who want control and clarity.

## Why this exists

Modern frontend stacks solve many problems, but they also add layers:

- too many framework choices
- heavy build-tool setups for small apps
- harder debugging due to abstractions
- complexity that feels unnecessary for CRUD/admin/internal tools

OlsSchoolFrontFrame exists for teams that prefer explicit code, predictable behavior, and fast onboarding.

## Who this is for

- Developers who prefer old-school HTML + CSS + JS
- Teams that want small, readable codebases
- Internal tools, admin panels, and CRUD apps
- Projects where "easy to debug" matters more than ecosystem size

## Features

- No build step required
- Folder-based modules
- Declarative bindings (`data-bind`, `data-model`)
- Declarative events (`data-click`, `data-change`, etc.)
- Hash router with route normalization
- JSON/YAML config loader
- Optional dev mode logs
- Tiny CLI for module/starter generation

## Installation

### Option A: Docker

```bash
docker compose up --build
```

Open: `http://localhost:9000/example/`

### Option B: Any static server

Serve the repository as static files and open `example/index.html`.

## Quick start

### 1) Initialize the app

```js
import { initApp } from "../framework/app/init.js";

initApp({
  root: "#app",
  routes: {
    home: "home",
    clientes: "clientes"
  },
  config: "./config.yaml",
  store: {
    user: null
  },
  dev: true
});
```

### 2) Create a module

```js
import { defineModule } from "../../../framework/module.js";

export default defineModule({
  css: true,
  state: () => ({
    title: "Home",
    count: 0
  }),
  methods: {
    increment(_, ctx) {
      ctx.state.count += 1;
    }
  }
});
```

## Folder structure

```text
framework/
  app/
  component/
  config/
  core/
  loader/
  module/
  router/
  store/
  module.js

example/
  app.js
  index.html
  config.yaml
  modules/
    home/
    about/
    external/
    clientes/
```

## Create a module with CLI

```bash
node cli/ols.js create module clientes
```

Generated files:

```text
example/modules/clientes/
  clientes.html
  clientes.js
  clientes.css
```

## Real example: Clientes module

This example includes:

- list of users
- add user button
- total users counter

`example/modules/clientes/clientes.html`

```html
<section>
  <h2 data-bind="title"></h2>
  <p>Total clientes: <strong data-bind="count"></strong></p>
  <input type="text" data-bind="newClientName" data-model data-model-event="input" placeholder="Nuevo cliente" />
  <button data-click="addClient">Agregar</button>
  <ul id="clientes-list"></ul>
</section>
```

`example/modules/clientes/clientes.js`

```js
import { defineModule } from "../../../framework/module.js";

function renderClientList(ctx) {
  const list = ctx.root.querySelector("#clientes-list");
  if (!list) return;
  list.innerHTML = "";

  ctx.state.clients.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    list.appendChild(li);
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
```

## Routing

Use clean route keys:

```js
routes: {
  home: "home",
  clientes: "clientes",
  about: "about"
}
```

The framework normalizes internally to hash routes (`#/home`, `#/clientes`, ...).

## Dev mode

Enable with:

```js
initApp({ dev: true, ... });
```

What you get:

- route change logs
- module load/unload logs
- state update logs
- `window.$ols` debug helper with `store`, `config`, and `currentModule`

## Philosophy

- No magic
- No hidden architecture
- Explicit behavior
- Readable code in minutes
- Conventions over configuration

## When NOT to use this

Be honest about fit. This is probably not ideal for:

- very large complex SPAs
- heavy real-time collaboration apps
- teams requiring strict enterprise architecture/tooling pipelines

## Roadmap

- CLI improvements (more templates, route helper)
- lightweight browser devtools panel
- optional SSR experiment (without changing core simplicity)

## License

[MIT](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
