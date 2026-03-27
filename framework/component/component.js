import { createReactiveState } from "../core/reactivity.js";
import { bindData } from "../core/binder.js";
import { attachEvents } from "../core/events.js";

const registry = new Map();

function resolveRoot(el) {
  const root = typeof el === "string" ? document.querySelector(el) : el;
  if (!(root instanceof Element)) {
    throw new Error("Component: `el` must be a selector or DOM Element.");
  }
  return root;
}

function normalizeDefinition(config = {}) {
  if (Object.prototype.hasOwnProperty.call(config, "state")) {
    return config;
  }

  // WHY: keep final API tiny (`data`) while internally using a single shape (`state`).
  return {
    template: config.template,
    state: () => ({ ...(config.data || {}) }),
    methods: config.methods || {},
    mounted: config.mounted,
    destroyed: config.destroyed
  };
}

function bindMethods(methods, state, context) {
  const out = {};
  Object.keys(methods || {}).forEach((name) => {
    if (typeof methods[name] !== "function") return;
    out[name] = (event) => methods[name].call(state, event, context);
  });
  return out;
}

function renderTemplate(root, template, props) {
  if (typeof template === "undefined") {
    return;
  }
  const html = typeof template === "function" ? template(props) : (template || "");
  root.innerHTML = html;
}

function mountDefinition(definition, root, props = {}) {
  renderTemplate(root, definition.template, props);

  const initialState = typeof definition.state === "function"
    ? definition.state(props)
    : (definition.state || {});
  const reactive = createReactiveState(initialState);

  const context = {
    state: reactive.state,
    root,
    props,
    // WHY: expose common globals directly so module code stays explicit and short.
    store: props.store,
    config: props.config
  };
  const methods = bindMethods(definition.methods || {}, reactive.state, context);
  const binder = bindData(root, reactive.state);
  const detachEvents = attachEvents(root, methods, context);
  const unsubscribe = reactive.subscribe((change) => {
    binder.renderRelated(change.path);

    if (typeof props.onStateChange === "function") {
      props.onStateChange(change);
    }
  });

  binder.render();
  if (typeof definition.mounted === "function") {
    definition.mounted(context);
  }

  return {
    state: reactive.state,
    methods,
    destroy() {
      unsubscribe();
      detachEvents();
      if (typeof definition.destroyed === "function") {
        definition.destroyed(context);
      }
      root.innerHTML = "";
    }
  };
}

export function Component(config = {}) {
  const definition = normalizeDefinition(config);

  if (Object.prototype.hasOwnProperty.call(config, "el")) {
    return mountDefinition(definition, resolveRoot(config.el), config.props || {});
  }

  return {
    mount(root, props = {}) {
      return mountDefinition(definition, resolveRoot(root), props);
    }
  };
}

export function defineComponent(name, definition) {
  registry.set(name, Component(definition));
}

export function getComponent(name) {
  return registry.get(name);
}

export function mountComponent(name, root, props = {}) {
  const component = getComponent(name);
  if (!component) {
    throw new Error(`Component "${name}" is not defined.`);
  }
  return component.mount(resolveRoot(root), props);
}
