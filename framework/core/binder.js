/**
 * OldSchoolFrontFrame (OLS)
 * © 2025 Cynchro. All rights reserved.
 */

function readPath(source, path) {
  if (!path) return "";
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return "";
    return acc[key];
  }, source);
}

function writePath(target, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  let cursor = target;

  keys.forEach((key) => {
    if (cursor[key] == null || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key];
  });

  cursor[lastKey] = value;
}

function updateNodeValue(node, value) {
  if (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT") {
    node.value = value ?? "";
    return;
  }
  node.textContent = value ?? "";
}

// WHY: replace <template data-for="..."> with a comment anchor so the browser
// never renders the template, and we control exactly where items are inserted.
function setupForNodes(root) {
  const forNodes = new Map();

  root.querySelectorAll("template[data-for]").forEach((templateEl) => {
    const path = templateEl.dataset.for;
    const anchor = document.createComment(` data-for="${path}" `);
    templateEl.replaceWith(anchor);
    forNodes.set(path, { template: templateEl, anchor });
  });

  return forNodes;
}

function renderForPath(path, forNodes, state) {
  const def = forNodes.get(path);
  if (!def) return;

  const { template, anchor } = def;
  const items = readPath(state, path);

  // Remove previously rendered items (tagged with _forOwner reference to their anchor).
  let node = anchor.nextSibling;
  while (node && node._forOwner === anchor) {
    const next = node.nextSibling;
    node.remove();
    node = next;
  }

  if (!Array.isArray(items)) return;

  const frag = document.createDocumentFragment();
  items.forEach((item, index) => {
    const clone = template.content.cloneNode(true);
    clone.querySelectorAll("[data-bind]").forEach((el) => {
      updateNodeValue(el, item[el.dataset.bind] ?? "");
    });
    // Tag each top-level child so we can find and remove them on next render.
    Array.from(clone.children).forEach((child) => {
      child._forOwner = anchor;
      child.dataset.index = String(index);
    });
    frag.appendChild(clone);
  });

  anchor.after(frag);
}

export function bindData(root, state, options = {}) {
  // WHY: include [data-model] elements even when they lack [data-bind], so that a plain
  // <input data-model="field"> both displays the current value and writes back on input.
  const bindSelector = "[data-bind], [data-model]";
  const nodes = Array.from(root.querySelectorAll(bindSelector));
  if (root.matches(bindSelector)) nodes.unshift(root);
  const nodeGroupsByPath = new Map();

  nodes.forEach((node) => {
    // For elements with only data-model, use the model path for display as well.
    const path = node.dataset.bind || node.dataset.model;
    if (!path) return;
    if (!nodeGroupsByPath.has(path)) {
      nodeGroupsByPath.set(path, []);
    }
    nodeGroupsByPath.get(path).push(node);
  });

  const forNodes = setupForNodes(root);

  const renderPath = (path) => {
    const pathNodes = nodeGroupsByPath.get(path) || [];
    const value = readPath(state, path);
    pathNodes.forEach((node) => updateNodeValue(node, value));
  };

  const isRelatedPath = (changedPath, boundPath) => {
    return changedPath === boundPath
      || changedPath.startsWith(`${boundPath}.`)
      || boundPath.startsWith(`${changedPath}.`);
  };

  const renderRelated = (changedPath) => {
    nodeGroupsByPath.forEach((_pathNodes, boundPath) => {
      if (isRelatedPath(changedPath, boundPath)) {
        renderPath(boundPath);
      }
    });
    forNodes.forEach((_def, forPath) => {
      if (isRelatedPath(changedPath, forPath)) {
        renderForPath(forPath, forNodes, state);
      }
    });
  };

  const render = () => {
    nodeGroupsByPath.forEach((_pathNodes, path) => renderPath(path));
    forNodes.forEach((_def, path) => renderForPath(path, forNodes, state));
  };

  const attachTwoWay = () => {
    nodes.forEach((node) => {
      if (!node.dataset.model) return;

      const modelPath = node.dataset.model;
      const eventName = node.dataset.modelEvent || "input";

      node.addEventListener(eventName, () => {
        writePath(state, modelPath, node.value);
      });
    });
  };

  render();
  attachTwoWay();

  return { render, renderPath, renderRelated };
}
