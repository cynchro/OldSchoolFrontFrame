import { initApp } from "./framework/app/init.js";

initApp({
  root: "#app",
  routes: {
    home: "home"
  },
  config: "./config/config.yaml",
  dev: true
}).catch((error) => {
  const root = document.getElementById("app");
  root.innerHTML = `<pre>${error.message}</pre>`;
});
