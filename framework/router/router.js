// WHY: separate static from dynamic routes at setup time so resolution stays O(1)
// for the common case (static) and only scans dynamic patterns when needed.
function buildRouteMatcher(routes) {
  const staticRoutes = {};
  const dynamicRoutes = [];

  Object.keys(routes).forEach((pattern) => {
    if (pattern !== "*" && pattern.includes(":")) {
      const keys = [];
      const regexStr = pattern
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/:([a-zA-Z_]\w*)/g, (_, key) => {
          keys.push(key);
          return "([^/]+)";
        });
      dynamicRoutes.push({ regex: new RegExp(`^${regexStr}$`), keys, target: routes[pattern] });
    } else {
      staticRoutes[pattern] = routes[pattern];
    }
  });

  return (hash) => {
    const staticTarget = staticRoutes[hash] ?? staticRoutes["*"];
    if (staticTarget !== undefined) {
      return { target: staticTarget, params: {} };
    }
    for (const { regex, keys, target } of dynamicRoutes) {
      const match = hash.match(regex);
      if (match) {
        const params = {};
        keys.forEach((key, i) => { params[key] = match[i + 1]; });
        return { target, params };
      }
    }
    return null;
  };
}

export function createRouter(options = {}) {
  const routes = options.routes || {};
  const fallback = options.fallback || "#/home";
  const onRoute = options.onRoute || (() => {});
  const mount = options.mount || (() => {});

  const normalizeHash = (value) => {
    if (!value) return fallback;
    return value.startsWith("#") ? value : `#${value}`;
  };

  const matchRoute = buildRouteMatcher(routes);

  const resolve = () => {
    const hash = normalizeHash(window.location.hash || fallback);
    const matched = matchRoute(hash);
    if (!matched) return;

    const { target, params } = matched;
    if (typeof target === "string") {
      mount(target, { route: hash, params });
    } else if (typeof target === "function") {
      target({ route: hash, params, mount });
    }

    onRoute(hash);
  };

  const start = () => {
    window.addEventListener("hashchange", resolve);
    if (!window.location.hash) {
      window.location.hash = fallback;
      return;
    }
    resolve();
  };

  const stop = () => {
    window.removeEventListener("hashchange", resolve);
  };

  const go = (path) => {
    window.location.hash = normalizeHash(path);
  };

  return { start, stop, go, resolve };
}
