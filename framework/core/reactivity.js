/**
 * OldSchoolFrontFrame (OLS)
 * © 2025 Cynchro. All rights reserved.
 */

export function createReactiveState(initialState = {}) {
  const listeners = new Set();
  const pathListeners = new Map();
  // WHY: WeakMap<target, Map<basePath, proxy>> — keying by (target, basePath) prevents
  // returning a cached proxy with the wrong path when the same object appears at two
  // different state paths (e.g. state.billing and state.shipping pointing to the same obj).
  const proxyCache = new WeakMap();
  let proxy = null;

  const notify = (change) => {
    listeners.forEach((listener) => listener(change));

    const scoped = pathListeners.get(change.path);
    if (scoped) {
      scoped.forEach((listener) => listener(change));
    }
  };

  const getPath = (basePath, prop) => {
    return basePath ? `${basePath}.${String(prop)}` : String(prop);
  };

  const getCached = (target, basePath) => {
    const byPath = proxyCache.get(target);
    return byPath ? byPath.get(basePath) : undefined;
  };

  const setCached = (target, basePath, wrapped) => {
    if (!proxyCache.has(target)) {
      proxyCache.set(target, new Map());
    }
    proxyCache.get(target).set(basePath, wrapped);
  };

  const makeReactive = (target, basePath = "") => {
    if (target === null || typeof target !== "object") {
      return target;
    }

    const cached = getCached(target, basePath);
    if (cached) return cached;

    const wrapped = new Proxy(target, {
      get(obj, prop) {
        const value = obj[prop];
        if (value && typeof value === "object") {
          return makeReactive(value, getPath(basePath, prop));
        }
        return value;
      },
      set(obj, prop, value) {
        const oldValue = obj[prop];
        if (Object.is(oldValue, value)) {
          return true;
        }

        obj[prop] = value;
        const path = getPath(basePath, prop);
        notify({
          type: "set",
          path,
          value,
          oldValue,
          state: proxy
        });
        return true;
      },
      deleteProperty(obj, prop) {
        if (!(prop in obj)) return true;
        const oldValue = obj[prop];
        delete obj[prop];
        const path = getPath(basePath, prop);
        notify({
          type: "delete",
          path,
          value: undefined,
          oldValue,
          state: proxy
        });
        return true;
      }
    });

    setCached(target, basePath, wrapped);
    return wrapped;
  };

  proxy = makeReactive({ ...initialState });

  return {
    state: proxy,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    subscribePath(path, listener) {
      if (!pathListeners.has(path)) {
        pathListeners.set(path, new Set());
      }
      const scopedListeners = pathListeners.get(path);
      scopedListeners.add(listener);

      return () => {
        scopedListeners.delete(listener);
        if (scopedListeners.size === 0) {
          pathListeners.delete(path);
        }
      };
    }
  };
}
