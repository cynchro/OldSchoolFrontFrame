import { initApp } from "../framework/app/init.js";

const configRoot = document.getElementById("config");

async function bootstrap() {
  const app = await initApp({
    root: "#app",
    routes: {
      home: "home",
      about: "about",
      external: "external",
      clientes: "clientes"
    },
    config: "./config.yaml",
    store: {
      user: null
    }
  });

  configRoot.textContent = JSON.stringify(app.getConfig(), null, 2);
}

bootstrap().catch((error) => {
  const appRoot = document.getElementById("app");
  appRoot.innerHTML = `<pre>${error.message}</pre>`;
});
