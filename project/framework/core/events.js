const SUPPORTED_EVENTS = [
  "click",
  "change",
  "input",
  "submit",
  "keyup",
  "keydown",
  "blur",
  "focus"
];

function getScopedNodes(root, selector) {
  const inRoot = root.matches(selector) ? [root] : [];
  return [...inRoot, ...Array.from(root.querySelectorAll(selector))];
}

export function attachEvents(root, handlers = {}, context = {}) {
  const disposers = [];

  SUPPORTED_EVENTS.forEach((eventName) => {
    const attrName = `data-${eventName}`;
    const nodes = getScopedNodes(root, `[${attrName}]`);

    nodes.forEach((node) => {
      const handlerName = (node.getAttribute(attrName) || "").trim();
      if (!handlerName) return;

      const handler = handlers[handlerName];
      if (typeof handler !== "function") return;

      const listener = (event) => {
        // Always pass the same context shape so handlers stay predictable.
        handler(event, context);
      };

      node.addEventListener(eventName, listener);
      disposers.push(() => node.removeEventListener(eventName, listener));
    });
  });

  return () => disposers.forEach((dispose) => dispose());
}
