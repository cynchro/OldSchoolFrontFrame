/**
 * OldSchoolFrontFrame (OLS)
 * © 2025 Cynchro. All rights reserved.
 */

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

export function attachEvents(root, handlers = {}, context = {}) {
  const disposers = [];

  // WHY: event delegation — one listener per event type on the module root instead of
  // one listener per element. This makes events work on dynamically rendered nodes
  // (e.g. items added by data-for) without re-scanning the DOM after each render.
  SUPPORTED_EVENTS.forEach((eventName) => {
    const attrName = `data-${eventName}`;

    const listener = (event) => {
      // Walk up from the actual target to find the closest element carrying the attribute.
      // This also handles clicks on child elements inside a [data-click] button.
      const target = event.target.closest(`[${attrName}]`);
      if (!target || !root.contains(target)) return;

      const handlerName = (target.getAttribute(attrName) || "").trim();
      if (!handlerName) return;

      const handler = handlers[handlerName];
      if (typeof handler !== "function") return;

      handler(event, context);
    };

    root.addEventListener(eventName, listener);
    disposers.push(() => root.removeEventListener(eventName, listener));
  });

  return () => disposers.forEach((dispose) => dispose());
}
