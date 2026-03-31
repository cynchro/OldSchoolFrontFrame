# OlsSchoolFrontFrame

**Frontend como antes — pero organizado.**

Un framework frontend mínimo para quienes solo quieren que HTML, CSS y JavaScript funcionen, sin ceremonias.

## De un vistazo

```html
<div id="app">
  <button data-click="increment">+</button>
  <span data-bind="count"></span>
</div>
```

`initApp` arranca la aplicación (rutas, configuración, store). **El estado y los manejadores viven en módulos** mediante `defineModule`, no dentro de `initApp`:

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

Sin paso de compilación. Sin magia. Solo código.

## Por qué existe

Los stacks frontend modernos resuelven muchos problemas, pero también añaden capas:

- demasiadas opciones de framework
- configuraciones pesadas de herramientas de build para apps pequeñas
- depuración más difícil por las abstracciones
- complejidad que parece innecesaria para CRUD, administración o herramientas internas

OlsSchoolFrontFrame existe para equipos que prefieren código explícito, comportamiento predecible y una incorporación rápida.

## Para quién es

- Desarrolladores que prefieren HTML + CSS + JS a la antigua
- Equipos que quieren bases de código pequeñas y legibles
- Herramientas internas, paneles de administración y apps CRUD
- Proyectos donde importa más «fácil de depurar» que el tamaño del ecosistema

## Características

- No hace falta paso de compilación
- Módulos basados en carpetas
- **Arquitectura de un módulo por carpeta** (inspirada en frameworks backend: una ruta, una carpeta, archivos obvios)
- Enlaces declarativos (`data-bind`, `data-model`)
- Renderizado declarativo de listas (`data-for`)
- Eventos declarativos (`data-click`, `data-change`, etc.)
- Router por hash con normalización de rutas y parámetros de ruta
- Carpeta opcional **services** por módulo (JS plano, `fetch`, sin DOM) — ver [framework/module/SERVICES.md](framework/module/SERVICES.md)
- Cargador de configuración JSON/YAML
- Logs opcionales en modo desarrollo
- CLI pequeña para generar módulos y plantillas iniciales

## Instalación

### Opción A: Docker

```bash
docker compose up --build
```

Abre: `http://localhost:9000/` (redirige a `/example/`) o directamente `http://localhost:9000/example/`

### Opción B: Servidor estático local (necesario para módulos ES)

**No abras `example/index.html` directamente desde disco** (`file://`). Los navegadores lo tratan como origen `null` y bloquean la carga de módulos ES (`<script type="module">`), lo que muestra errores CORS.

Desde la **raíz del repositorio**, sirve todo el proyecto por HTTP y luego abre la URL del ejemplo:

```bash
cd /path/to/OlsSchoolFrontFrame
python3 -m http.server 8080
```

Abre: `http://localhost:8080/example/`

Otras líneas de una sola orden funcionan igual si lo prefieres (sirve la raíz del repo, no solo la carpeta `example/`).

### Opción C: Apache (producción o hosting compartido)

Puedes alojar este proyecto en Apache sin Docker ni runtime de Node.

Reglas importantes:

- Sirve los archivos por `http://` o `https://` (no `file://`).
- Mantén la estructura de carpetas coherente para que los imports relativos sigan funcionando.
- Mantén `framework/` y `modules/` accesibles desde la URL de tu app.

Estructura recomendada dentro de `DocumentRoot`:

```text
index.html
app.js
config.yaml
framework/
modules/
```

Si `app.js` está al mismo nivel que `index.html`, importa así:

```js
import { initApp } from "./framework/app/init.js";
```

Ejemplo mínimo de virtual host en Apache:

```apache
<VirtualHost *:80>
  ServerName ols.local
  DocumentRoot /var/www/ols

  <Directory /var/www/ols>
    AllowOverride All
    Require all granted
  </Directory>

  # Opcional: redirigir la raíz a /example/
  # RedirectMatch 302 ^/$ /example/
</VirtualHost>
```

## Inicio rápido

`initApp` es asíncrono. Usa `await` en un script de módulo (top-level await) o envuélvelo en una función async como en `example/app.js`.

### 1) Inicializar la app

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

### Opciones de `initApp` (referencia)

| Opción | Propósito |
|--------|-----------|
| `root` | Selector o elemento para montar la app (por defecto `#app`). |
| `routes` | Mapa clave de ruta → nombre de carpeta del módulo, p. ej. `home: "home"` → `#/home`. |
| `fallback` | Clave de ruta inicial opcional si el hash está vacío (por defecto: la primera ruta en `routes`). |
| `config` | Ruta que termina en `.json`, `.yaml` o `.yml`, u objeto de opciones pasado a `loadConfig`. |
| `store` | Objeto inicial del store global. |
| `dev` | Si es `true`, registra actividad de rutas/módulos/estado y rellena `window.$ols`. |
| `exposeEnv` | Si es `true`, asigna `window.ENV` con la configuración cargada. |

### 2) Crear un módulo

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

## Estructura de carpetas

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

project/          (opcional; generado con: node cli/ols.js create starter)
```

## Convenciones del proyecto

- `modules/<nombre>/` es la unidad base para cada ruta/feature.
- Mantén juntos los archivos de la pantalla: `<nombre>.html`, `<nombre>.js`, `<nombre>.css`.
- Usa `modules/<nombre>/services/` solo para lógica de API/datos (sin tocar DOM).
- Coloca piezas reutilizables de UI en `components/` (global) o `modules/<nombre>/components/` (local de una feature).
- Sube algo a `components/` global solo cuando lo necesiten al menos 2 módulos.
- Deja `framework/` como código de librería; evita meter ahí lógica de negocio de la app.

Estructura sugerida:

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
      components/        (opcional; reutilizables locales de la feature)
  components/            (opcional; compartidos entre módulos)
```

## CLI

### Crear un módulo (dentro del ejemplo del repo)

Crea archivos bajo `example/modules/<nombre>/`:

```bash
node cli/ols.js create module clientes
```

```text
example/modules/clientes/
  clientes.html
  clientes.js
  clientes.css
```

### Crear un starter (plantilla de app independiente)

```bash
node cli/ols.js create starter project
```

Puedes usar otro nombre de carpeta en lugar de `project` (no debe existir aún).

Genera una app **autocontenida**: **copia** todo el árbol `framework/` en `project/framework/`, más `index.html`, `app.js`, `config/` y un `modules/home/` mínimo. Sirve esa carpeta con cualquier servidor estático y puedes empezar a construir tu app.

| Qué | Dónde trabajas |
|-----|----------------|
| **Tu nueva app** (rutas, módulos, HTML/CSS) | `project/app.js`, `project/modules/`, `project/config/` |
| **La copia del framework** (la librería que usan tus imports) | `project/framework/` — el mismo código que `framework/` en la raíz, duplicado a propósito para poder comprimir o desplegar solo `project/` |

**Desarrollar OlsSchoolFrontFrame en sí** (este repositorio): edita el **`framework/`** canónico en la raíz del repo y el demo **`example/`**. Regenera el starter cuando quieras una copia actualizada, o ejecuta `create starter` en una carpeta nueva.

## Ejemplo real: módulo clientes

El ejemplo **clientes** carga filas de una API pública de demostración (`getClientes()` en `services/`), las guarda en `ctx.state` y renderiza la tabla de forma declarativa con `data-for`.

Explorá: `example/modules/clientes/` (`clientes.html`, `clientes.js`, `clientes.css`, `services/clientes.service.js`).

## Enrutamiento

Usa claves de ruta claras:

```js
routes: {
  home: "home",
  clientes: "clientes",
  about: "about"
}
```

El framework normaliza internamente a rutas por hash (`#/home`, `#/clientes`, ...).

### Parámetros de ruta

Usá segmentos `:param` para rutas dinámicas:

```js
routes: {
  home: "home",
  "clientes/:id": "detalle"
}
```

Los parámetros están disponibles en el módulo como `ctx.props.params`:

```js
mounted(ctx) {
  const id = ctx.props.params.id; // ej. "42" desde #/clientes/42
}
```

## Contexto del módulo

Dentro de `methods`, `mounted` y `destroyed`, el contexto incluye:

- `ctx.state` — estado del módulo (objeto plano que lees y escribes)
- `ctx.root` — raíz DOM de este módulo (envuelta con `[data-module="name"]` al cargarse con `loadModule`)
- `ctx.store` — store global (desde `initApp`)
- `ctx.config` — configuración cargada (desde `initApp`)
- `ctx.props.params` — parámetros de ruta extraídos de rutas dinámicas (ej. `{ id: "42" }` desde `#/clientes/42`)

## Capa de servicios (llamadas a API)

Cada módulo de ruta puede incluir un directorio `services/`: archivos JavaScript planos que exportan funciones (normalmente `async`). Usa **`fetch`** para HTTP. **No** importes ni toques el DOM desde los servicios — devuelven datos; el módulo actualiza `ctx.state` y renderiza.

**No** hay registro de servicios: importa lo que necesites desde el archivo del módulo.

Convención y reglas completas: **[framework/module/SERVICES.md](framework/module/SERVICES.md)**.

Ejemplo (`example/modules/clientes/services/clientes.service.js`):

```js
export async function getClientes() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const users = await response.json();
  return users.map((u) => ({ id: u.id, name: u.name, email: u.email }));
}
```

Úsalo desde `mounted()` (o métodos) en el mismo módulo:

```js
import { getClientes } from "./services/clientes.service.js";

mounted(ctx) {
  (async () => {
    ctx.state.rows = await getClientes();
  })();
}
```

### Ejemplo: cargar datos desde una API y renderizar una lista

Usá `<template data-for="path">` para renderizar un array de forma reactiva. Colocalo donde deben aparecer los ítems — el framework lo reemplaza con una fila por ítem. Cada `data-bind` dentro del template referencia una propiedad del ítem.

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
    ctx.state.rows = await getRows(); // la lista se re-renderiza automáticamente
  })();
}
```

La lista se re-renderiza cuando el array se reemplaza (`ctx.state.rows = nuevoArray`) o se muta (`ctx.state.rows.push(item)`). Ver `example/modules/clientes/` para un ejemplo completo.

> **Recomendación:** dejá que el servidor maneje la paginación. Si tu API devuelve 20–50 ítems por página, `data-for` nunca renderiza más que eso a la vez — sin Virtual DOM, sin problemas de rendimiento. La herramienta correcta para listas grandes es un backend bien diseñado, no un frontend más inteligente.

```js
// services/clientes.service.js
export async function getClientes(page = 1, limit = 20) {
  const res = await fetch(`/api/clientes?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

```js
// clientes.js — estado y método de siguiente página
state: () => ({ clients: [], page: 1 }),

methods: {
  async nextPage(_, ctx) {
    ctx.state.page++;
    ctx.state.clients = await getClientes(ctx.state.page);
  }
}
```

## Modo desarrollo

Actívalo con:

```js
initApp({ dev: true, ... });
```

Obtienes:

- logs de cambios de ruta
- logs de carga/descarga de módulos
- logs de actualizaciones de estado
- helper de depuración `window.$ols` con `store`, `config` y `currentModule`

Ejemplo de salida:

```text
[OLS] Loading module: clientes
[OLS] State updated: count -> 3
```

## Filosofía

- Sin magia
- Sin arquitectura oculta
- Comportamiento explícito
- Código legible en minutos
- Convenciones sobre configuración

## Cuándo NO usar esto

Sé honesto con el encaje. Probablemente no sea lo ideal para:

- SPAs muy grandes y complejas
- Apps de colaboración en tiempo real muy exigentes
- equipos que necesitan arquitectura empresarial estricta o pipelines de herramientas rígidos

## Hoja de ruta

- Mejoras en la CLI (más plantillas, helper de rutas)
- Panel ligero de devtools en el navegador
- Experimento opcional de SSR (sin cambiar la simplicidad del núcleo)

## Licencia

[MIT](LICENSE)

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Código de conducta

Ver [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
