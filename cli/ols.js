#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function printHelp() {
  console.log("OLS CLI");
  console.log("");
  console.log("Usage:");
  console.log("  node cli/ols.js create module <name>");
  console.log("  node cli/ols.js create starter [folder]");
}

function fail(message) {
  console.error(`[OLS ERROR] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const [, , command, target, name] = argv;
  return { command, target, name };
}

function createModule(moduleName) {
  const modulesRoot = path.join(process.cwd(), "example", "modules");
  const moduleDir = path.join(modulesRoot, moduleName);
  const htmlPath = path.join(moduleDir, `${moduleName}.html`);
  const jsPath = path.join(moduleDir, `${moduleName}.js`);
  const cssPath = path.join(moduleDir, `${moduleName}.css`);

  if (!fs.existsSync(modulesRoot)) {
    fail("Directory 'example/modules' was not found.");
  }

  if (fs.existsSync(moduleDir)) {
    fail(`Module "${moduleName}" already exists.`);
  }

  fs.mkdirSync(moduleDir, { recursive: true });

  const title = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const htmlTemplate = `<div>
  <h1 data-bind="title"></h1>
  <button data-click="increment">+</button>
</div>
`;
  const jsTemplate = `import { defineModule } from "../../../framework/module.js";
// Para lógica de API, creá: services/${moduleName}.service.js
// import { getData } from "./services/${moduleName}.service.js";

export default defineModule({
  css: true,

  state: () => ({
    title: "${title}",
    count: 0
  }),

  methods: {
    increment(_, ctx) {
      ctx.state.count++;
    }
  }
});
`;
  const cssTemplate = `h1 {
  font-size: 24px;
}
`;

  fs.writeFileSync(htmlPath, htmlTemplate, "utf8");
  fs.writeFileSync(jsPath, jsTemplate, "utf8");
  fs.writeFileSync(cssPath, cssTemplate, "utf8");

  console.log(`[OLS] Created module: ${moduleName}`);
  console.log(`[OLS] - ${htmlPath}`);
  console.log(`[OLS] - ${jsPath}`);
  console.log(`[OLS] - ${cssPath}`);
}

function createStarter(targetFolder = "project") {
  const projectRoot = path.join(process.cwd(), targetFolder);
  const frameworkSource = path.join(process.cwd(), "framework");
  const frameworkTarget = path.join(projectRoot, "framework");
  const modulesRoot = path.join(projectRoot, "modules");
  const configRoot = path.join(projectRoot, "config");
  const homeModuleDir = path.join(modulesRoot, "home");

  if (!fs.existsSync(frameworkSource)) {
    fail("Directory 'framework' was not found in current workspace.");
  }

  if (fs.existsSync(projectRoot)) {
    fail(`Starter folder "${targetFolder}" already exists.`);
  }

  fs.mkdirSync(projectRoot, { recursive: true });
  fs.cpSync(frameworkSource, frameworkTarget, { recursive: true });
  fs.mkdirSync(modulesRoot, { recursive: true });
  fs.mkdirSync(configRoot, { recursive: true });
  fs.mkdirSync(homeModuleDir, { recursive: true });

  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OLS Starter</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>
`;

  const appJs = `import { initApp } from "./framework/app/init.js";

initApp({
  root: "#app",
  routes: {
    home: "home"
  },
  config: "./config/config.yaml",
  dev: true
}).catch((error) => {
  const root = document.getElementById("app");
  root.innerHTML = \`<pre>\${error.message}</pre>\`;
});
`;

  const configYaml = `appName: OLS Starter
environment: local
`;

  const homeHtml = `<div>
  <h1 data-bind="title"></h1>
  <button data-click="increment">+</button>
  <p>Count: <span data-bind="count"></span></p>
</div>
`;

  const homeJs = `import { defineModule } from "../../framework/module.js";
// Para lógica de API, creá: services/home.service.js
// import { getData } from "./services/home.service.js";

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
`;

  const homeCss = `h1 {
  font-size: 24px;
}
`;

  fs.writeFileSync(path.join(projectRoot, "index.html"), indexHtml, "utf8");
  fs.writeFileSync(path.join(projectRoot, "app.js"), appJs, "utf8");
  fs.writeFileSync(path.join(configRoot, "config.yaml"), configYaml, "utf8");
  fs.writeFileSync(path.join(homeModuleDir, "home.html"), homeHtml, "utf8");
  fs.writeFileSync(path.join(homeModuleDir, "home.js"), homeJs, "utf8");
  fs.writeFileSync(path.join(homeModuleDir, "home.css"), homeCss, "utf8");

  console.log(`[OLS] Starter created at: ${projectRoot}`);
  console.log("[OLS] Open index.html with a static server.");
}

function run() {
  const { command, target, name } = parseArgs(process.argv);

  if (!command) {
    printHelp();
    return;
  }

  if (command === "create" && target === "module") {
    if (!name) {
      fail("Missing module name. Usage: node cli/ols.js create module <name>");
    }
    createModule(name);
    return;
  }

  if (command === "create" && target === "starter") {
    createStarter(name || "project");
    return;
  }

  fail("Unknown command. Usage: node cli/ols.js create module <name>");
}

run();
