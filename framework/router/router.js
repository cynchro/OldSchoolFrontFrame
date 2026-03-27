export function createRouter(options = {}) {
  const routes = options.routes || {};
  const fallback = options.fallback || "#/home";
  const onRoute = options.onRoute || (() => {});
  const mount = options.mount || (() => {});

  const normalizeHash = (value) => {
    if (!value) return fallback;
    return value.startsWith("#") ? value : `#${value}`;
  };

  const resolve = () => {
    const hash = normalizeHash(window.location.hash || fallback);
    const target = routes[hash] ?? routes["*"];

    if (typeof target === "string") {
      mount(target, { route: hash });
    } else if (typeof target === "function") {
      target({ route: hash, mount });
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
