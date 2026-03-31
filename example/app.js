import { initApp } from "../framework/app/init.js";

async function bootstrap() {
  await initApp({
    root: "#app",
    routes: {
      home:         "home",
      bindings:     "bindings",
      listas:       "listas",
      eventos:      "eventos",
      rutas:        "rutas",
      "perfil/:id": "perfil",
      store:        "store",
      servicios:    "servicios",
      componentes:  "componentes",
      auth:         "auth"
    },
    config: "./config.yaml",
    store: {
      lang:        localStorage.getItem("ols-lang") || "es",
      user:        { name: "Dev User" },
      visits:      0,
      lastVisited: null
    },
    dev: true
  });
}

bootstrap().catch((error) => {
  document.getElementById("app").innerHTML = `<pre class="text-danger p-4">${error.message}</pre>`;
});
