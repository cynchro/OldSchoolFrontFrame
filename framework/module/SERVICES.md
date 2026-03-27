# Services layer (modules)

Convention — **no DI container**, **no auto-registration**.

## Layout

```
modules/<nombre-modulo>/
  <nombre-modulo>.js
  <nombre-modulo>.html
  services/
    <nombre>.service.js   # plain JS, named exports
```

## Rules

1. **Plain functions** — export `async function getX()` / `function y()` as needed.
2. **HTTP** — use `fetch` (preferred). You may use axios if you add it to the page; keep it out of the framework core.
3. **No DOM** — services must not import or touch `document`, `window` for UI, or module HTML. They return data; the module renders.
4. **Import explicitly** — from the module file:  
   `import { getClientes } from "./services/clientes.service.js";`

The loader does not scan `services/`; you import what you need. That keeps the graph obvious and debuggable.
