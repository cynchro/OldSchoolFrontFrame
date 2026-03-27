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

export function bindData(root, state, options = {}) {
  const selectors = options.selector || "[data-bind]";
  const nodes = root.matches(selectors)
    ? [root, ...Array.from(root.querySelectorAll(selectors))]
    : Array.from(root.querySelectorAll(selectors));
  const nodeGroupsByPath = new Map();

  nodes.forEach((node) => {
    const path = node.dataset.bind;
    if (!path) return;
    if (!nodeGroupsByPath.has(path)) {
      nodeGroupsByPath.set(path, []);
    }
    nodeGroupsByPath.get(path).push(node);
  });

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
  };

  const render = () => {
    nodeGroupsByPath.forEach((_pathNodes, path) => renderPath(path));
  };

  const attachTwoWay = () => {
    nodes.forEach((node) => {
      if (!node.matches("[data-model]")) return;

      const modelPath = node.dataset.model || node.dataset.bind;
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
