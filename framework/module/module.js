function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Declares a route module (HTML + reactive state + methods).
 * Optional **services**: plain JS under `modules/<name>/services/` — import them explicitly;
 * see `SERVICES.md` in this folder. Services must not touch the DOM.
 */
export function defineModule(moduleDefinition = {}) {
  if (!isPlainObject(moduleDefinition)) {
    throw new Error("defineModule(definition): definition must be an object.");
  }

  const state = moduleDefinition.state;
  if (typeof state !== "undefined" && typeof state !== "function" && !isPlainObject(state)) {
    throw new Error("defineModule(definition): `state` must be a function or an object.");
  }

  const methods = moduleDefinition.methods;
  if (typeof methods !== "undefined" && !isPlainObject(methods)) {
    throw new Error("defineModule(definition): `methods` must be an object.");
  }

  const mounted = moduleDefinition.mounted;
  if (typeof mounted !== "undefined" && typeof mounted !== "function") {
    throw new Error("defineModule(definition): `mounted` must be a function.");
  }

  const destroyed = moduleDefinition.destroyed;
  if (typeof destroyed !== "undefined" && typeof destroyed !== "function") {
    throw new Error("defineModule(definition): `destroyed` must be a function.");
  }

  return {
    css: moduleDefinition.css === true,
    state: typeof state === "undefined" ? () => ({}) : state,
    methods: methods || {},
    mounted,
    destroyed
  };
}
