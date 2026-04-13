/**
 * OldSchoolFrontFrame (OLS)
 * © 2025 Cynchro. All rights reserved.
 */

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

function printBanner() {
  console.log(
    "%c OLS %c OldSchoolFrontFrame %c © 2025 Cynchro ",
    "background:#1a1a2e;color:#e94560;padding:3px 8px;border-radius:3px 0 0 3px;font-weight:bold",
    "background:#16213e;color:#a8d8ea;padding:3px 8px",
    "background:#0f3460;color:#a8b2d8;padding:3px 8px;border-radius:0 3px 3px 0"
  );
}

export async function initApp(options = {}) {
  printBanner();
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

  // WHY: only expose $ols in dev mode — in production the store and config should
  // not be inspectable or patchable from the browser console.
  if (dev) {
    window.$ols = { store, config, currentModule: null };
  }

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
      params: routeContext?.params || {},
      onStateChange: dev
        ? (change) => {
          log(`State updated: ${change.path} -> ${String(change.value)}`);
        }
        : undefined
    });
    currentModuleName = moduleName;
    if (dev) {
      window.$ols.currentModule = currentModule;
    }
  };

  const router = createRouter({
    routes,
    fallback,
    mount: (moduleName, routeContext) => {
      mount(moduleName, routeContext).catch((error) => {
        const moduleMissing = /Failed to load JS module/.test(error.message);
        if (moduleMissing) {
          console.error(`[OLS ERROR] Module "${moduleName}" not found`);
        } else {
          console.error(`[OLS ERROR] ${error.message}`);
        }

        const fallbackMessage = moduleMissing
          ? `Module "${moduleName}" not found`
          : error.message;
        root.innerHTML = `<pre>${fallbackMessage}</pre>`;
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
