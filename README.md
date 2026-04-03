# OlsSchoolFrontFrame

**Frontend like it used to be — but organized.**

A minimal frontend framework for developers who just want HTML, CSS, and JavaScript to work—without ceremony.

## At a glance

```html
<div id="app">
  <button data-click="increment">+</button>
  <span data-bind="count"></span>
</div>
```

`initApp` boots the app (routes, config, store). **State and handlers live in modules** via `defineModule`—not inside `initApp`:

```js
import { initApp } from "./framework/app/init.js";

await initApp({
  root: "#app",
  routes: { home: "home" },
  config: "./config.yaml"
});
```

```js
import { defineModule } from "../../../framework/module.js";

export default defineModule({
  state: () => ({ count: 0 }),
  methods: {
    increment(_, ctx) {
      ctx.state.count++;
    }
  }
});
```

No build step. No magic. Just code.

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
- **Module-per-folder architecture** (inspired by backend frameworks: one route, one folder, obvious files)
- Declarative bindings (`data-bind`, `data-model`)
- Declarative list rendering (`data-for`)
- Declarative events (`data-click`, `data-change`, etc.)
- Hash router with route normalization and route parameters
- Optional **services** folder per module (plain JS, `fetch`, no DOM) — see [framework/module/SERVICES.md](framework/module/SERVICES.md)
- JSON/YAML config loader
- Optional dev mode logs
- Tiny CLI for module/starter generation

## Installation

### Option A: Docker

```bash
docker compose up --build
```

Open: `http://localhost:9000/` (redirects to `/example/`) or directly `http://localhost:9000/example/`

### Option B: Local static server (required for ES modules)

**Do not open `example/index.html` directly from disk** (`file://`). Browsers treat that as origin `null` and block ES module loads (`<script type="module">`), which shows CORS errors.

From the **repository root**, serve the whole project over HTTP, then open the example URL:

```bash
cd /path/to/OlsSchoolFrontFrame
python3 -m http.server 8080
```

Open: `http://localhost:8080/example/`

Other one-liners work the same way if you prefer (serve repo root, not only the `example/` folder).

### Option C: Apache (production or shared hosting)

You can host this project on Apache without Docker or Node runtime.

Important rules:

- Serve files over `http://` or `https://` (not `file://`).
- Keep folder structure consistent so relative imports still work.
- Keep `framework/` and `modules/` reachable from your app URL.

Recommended structure inside `DocumentRoot`:

```text
index.html
app.js
config.yaml
framework/
modules/
```

If `app.js` is at the same level as `index.html`, import like this:

```js
import { initApp } from "./framework/app/init.js";
```

Minimal Apache vhost example:

```apache
<VirtualHost *:80>
  ServerName ols.local
  DocumentRoot /var/www/ols

  <Directory /var/www/ols>
    AllowOverride All
    Require all granted
  </Directory>

  # Optional: redirect root to /example/
  # RedirectMatch 302 ^/$ /example/
</VirtualHost>
```

## Quick start

`initApp` is async. Use `await` in a module script (top-level await) or wrap it in an async function like `example/app.js`.

### 1) Initialize the app

```js
import { initApp } from "../framework/app/init.js";

await initApp({
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

### `initApp` options (reference)

| Option | Purpose |
|--------|---------|
| `root` | Selector or element for the app mount (default `#app`). |
| `routes` | Map of route key → module folder name, e.g. `home: "home"` → `#/home`. |
| `fallback` | Optional first route key if the hash is empty (default: first route in `routes`). |
| `config` | Path string ending in `.json`, `.yaml`, or `.yml`, or an options object passed to `loadConfig`. |
| `store` | Initial global store state object. |
| `dev` | If `true`, logs route/module/state activity and fills `window.$ols`. |
| `exposeEnv` | If `true`, sets `window.ENV` to the loaded config. |

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
      services/
        clientes.service.js

cli/
  ols.js

project/          (optional; generated by: node cli/ols.js create starter)
```

## Project conventions

- `modules/<name>/` is the default unit for each route/feature.
- Keep route-facing files together: `<name>.html`, `<name>.js`, `<name>.css`.
- Use `modules/<name>/services/` for API/data logic only (no DOM access there).
- Put reusable UI pieces in `components/` (global) or `modules/<name>/components/` (local to one feature).
- Promote code to global `components/` only when at least 2 modules need it.
- Keep `framework/` as library code; avoid app-specific business logic there.

Suggested shape:

```text
example/
  app.js
  modules/
    clientes/
      clientes.html
      clientes.js
      clientes.css
      services/
        clientes.service.js
      components/        (optional; feature-local reusable UI)
  components/            (optional; shared across modules)
```

## CLI

### Create a module (inside the repo example)

Creates files under `example/modules/<name>/`:

```bash
node cli/ols.js create module clientes
```

```text
example/modules/clientes/
  clientes.html
  clientes.js
  clientes.css
```

### Create a starter (standalone app template)

```bash
node cli/ols.js create starter project
```

You can use another folder name instead of `project` (it must not exist yet).

This generates a **self-contained** app: it **copies** the whole `framework/` tree into `project/framework/`, plus `index.html`, `app.js`, `config/`, and a minimal `modules/home/`. Serve that folder with any static server and you are ready to build your app.

| What | Where you work |
|------|----------------|
| **Your new app** (routes, modules, HTML/CSS) | `project/app.js`, `project/modules/`, `project/config/` |
| **The framework copy** (library your imports use) | `project/framework/` — same code as root `framework/`, duplicated on purpose so you can zip or deploy `project/` alone |

**Developing OlsSchoolFrontFrame itself** (this repository): edit the canonical **`framework/`** at the repo root and the **`example/`** demo. Regenerate the starter when you want an updated copy, or run `create starter` in a fresh folder.

## Real example: Clientes module

The **clientes** example loads rows from a public demo API (`getClientes()` in `services/`), stores them in `ctx.state`, and renders the table declaratively with `data-for`.

Browse: `example/modules/clientes/` (`clientes.html`, `clientes.js`, `clientes.css`, `services/clientes.service.js`).

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

### Route parameters

Use `:param` segments for dynamic routes:

```js
routes: {
  home: "home",
  "clientes/:id": "detalle"
}
```

Parameters are available in the module as `ctx.props.params`:

```js
mounted(ctx) {
  const id = ctx.props.params.id; // e.g. "42" from #/clientes/42
}
```

## Module context

Inside `methods`, `mounted`, and `destroyed`, the context includes:

- `ctx.state` — module state (plain object you read and write)
- `ctx.root` — DOM root for this module (wrapped with `[data-module="name"]` when loaded via `loadModule`)
- `ctx.store` — global store (from `initApp`)
- `ctx.config` — loaded config (from `initApp`)
- `ctx.props.params` — route parameters extracted from dynamic routes (e.g. `{ id: "42" }` from `#/clientes/42`)

## Services layer (API calls)

Each route module can include a `services/` directory: plain JavaScript files that export functions (usually `async`). Use **`fetch`** for HTTP. **Do not** import or touch the DOM from services — they return data; the module updates `ctx.state` and renders.

There is **no** service registry: import what you need from the module file.

Full convention and rules: **[framework/module/SERVICES.md](framework/module/SERVICES.md)**.

Example (`example/modules/clientes/services/clientes.service.js`):

```js
export async function getClientes() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const users = await response.json();
  return users.map((u) => ({ id: u.id, name: u.name, email: u.email }));
}
```

Use it from `mounted()` (or methods) in the same module:

```js
import { getClientes } from "./services/clientes.service.js";

mounted(ctx) {
  (async () => {
    ctx.state.rows = await getClientes();
  })();
}
```

### Example: Load data from API and render a list

Use `<template data-for="path">` to render an array reactively. Place it where the items should appear — the framework replaces it with a rendered row per item. Each `data-bind` inside the template refers to a property of the item.

```html
<table>
  <tbody>
    <template data-for="rows">
      <tr>
        <td data-bind="id"></td>
        <td data-bind="name"></td>
      </tr>
    </template>
  </tbody>
</table>
```

```js
mounted(ctx) {
  (async () => {
    ctx.state.rows = await getRows(); // list re-renders automatically
  })();
}
```

The list re-renders whenever the array is replaced (`ctx.state.rows = newArray`) or mutated (`ctx.state.rows.push(item)`). See `example/modules/clientes/` for a full working example.

> **Recommendation:** let the server handle pagination. If your API returns 20–50 items per page, `data-for` never renders more than that at once — no virtual DOM needed, no performance concerns. The right tool for large lists is a well-designed backend, not a smarter frontend.

```js
// services/clientes.service.js
export async function getClientes(page = 1, limit = 20) {
  const res = await fetch(`/api/clientes?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

```js
// clientes.js — state and next-page method
state: () => ({ clients: [], page: 1 }),

methods: {
  async nextPage(_, ctx) {
    ctx.state.page++;
    ctx.state.clients = await getClientes(ctx.state.page);
  }
}
```

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

Example output:

```text
[OLS] Loading module: clientes
[OLS] State updated: count -> 3
```

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

## WIKI

See https://cynchro.github.io/OldSchoolFrontFrame/example/

## Philosophy

See [PHILOSOPHY.md](PHILOSOPHY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Contact
alexissaucedo@gmail.com

## Buy me a coffee?
https://www.paypal.com/donate/?hosted_button_id=YX332RT7KSJ4Q

<iframe src="https://ghbtns.com/github-btn.html?user=cynchro&repo=OldSchoolFrontFrame&type=star&count=true"
  frameborder="0"
  scrolling="0"
  width="170"
  height="30"
  title="GitHub">
</iframe>
