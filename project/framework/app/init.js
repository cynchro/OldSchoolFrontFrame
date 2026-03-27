import { createRouter } from "../router/router.js";
import { createStore } from "../store/store.js";
import { loadConfig } from "../config/config.js";
import { loadModule } from "../loader/loader.js";

function toElement(root) {
  const element = typeof root === "string" ? document.querySelector(root) : root;
  if (!(element instanceof Element)) {
    throw new Error("initApp(options): `root` must be a selector or DOM Element.");
  }
  return element;
}

function toHash(route) {
  const value = String(route || "").replace(/^#?\/?/, "");
  return `#/${value}`;
}

function toHashRoutes(routes = {}) {
  const normalized = {};
  Object.keys(routes).forEach((route) => {
    if (route === "*") {
      normalized["*"] = routes[route];
      return;
    }
    normalized[toHash(route)] = routes[route];
  });
  return normalized;
}

async function resolveConfig(configOption) {
  if (!configOption) return {};

  // Explicit inputs only: path string or loadConfig options object.
  if (typeof configOption === "string") {
    if (configOption.endsWith(".json")) {
      return loadConfig({ jsonPath: configOption, prefer: "json" });
    }

    if (configOption.endsWith(".yaml") || configOption.endsWith(".yml")) {
      return loadConfig({ yamlPath: configOption, prefer: "yaml" });
    }

    throw new Error("initApp(options): `config` string must end with .json, .yaml or .yml.");
  }

  return loadConfig(configOption);
}

export async function initApp(options = {}) {
  const root = toElement(options.root || "#app");
  const routes = toHashRoutes(options.routes || {});
  const routeKeys = Object.keys(routes).filter((key) => key !== "*");

  if (routeKeys.length === 0) {
    throw new Error("initApp(options): `routes` must include at least one route.");
  }

  const fallback = options.fallback ? toHash(options.fallback) : routeKeys[0];
  const config = await resolveConfig(options.config);
  const dev = options.dev === true;
  if (options.exposeEnv === true) {
    // WHY: old-school apps often read global config from window with no DI container.
    window.ENV = config;
  }
  const store = createStore(options.store || {});
  let currentModule = null;
  let currentModuleName = null;

  window.$ols = {
    store,
    config,
    currentModule: null
  };

  const log = (message) => {
    if (!dev) return;
    console.log(`[OLS] ${message}`);
  };

  const mount = async (moduleName, routeContext) => {
    if (currentModule) {
      log(`Unloading module: ${currentModuleName}`);
      currentModule.destroy();
    }

    log(`Loading module: ${moduleName}`);

    currentModule = await loadModule(moduleName, root, {
      store,
      config,
      route: routeContext?.route || window.location.hash,
      onStateChange: dev
        ? (change) => {
          log(`State updated: ${change.path} -> ${String(change.value)}`);
        }
        : undefined
    });
    currentModuleName = moduleName;
    window.$ols.currentModule = currentModule;
  };

  const router = createRouter({
    routes,
    fallback,
    mount: (moduleName, routeContext) => {
      mount(moduleName, routeContext).catch((error) => {
        root.innerHTML = `<pre>${error.message}</pre>`;
      });
    },
    onRoute: (hash) => {
      log(`Route changed: ${hash}`);
    }
  });

  router.start();

  return {
    go(route) {
      router.go(toHash(route));
    },
    getStore() {
      return store;
    },
    getConfig() {
      return config;
    }
  };
}
