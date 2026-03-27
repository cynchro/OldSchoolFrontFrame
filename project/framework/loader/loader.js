import { Component } from "../component/component.js";

function resolveMountPoint(mountPoint) {
  const root = typeof mountPoint === "string"
    ? document.querySelector(mountPoint)
    : mountPoint;

  if (!(root instanceof Element)) {
    throw new Error("loadModule(name, mountPoint): mountPoint must be a selector or DOM Element.");
  }

  return root;
}

async function fetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load file: ${path}`);
  }
  return response.text();
}

async function tryFetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) return null;
  return response.text();
}

function ensureCss(name, cssText) {
  const styleId = `module-style-${name}`;
  let styleNode = document.getElementById(styleId);

  if (!styleNode) {
    styleNode = document.createElement("style");
    styleNode.id = styleId;
    document.head.appendChild(styleNode);
  }

  styleNode.textContent = cssText;
}

function wrapModuleHtml(moduleName, html) {
  return `<div data-module="${moduleName}">${html}</div>`;
}

export function scopeCss(cssText, moduleName) {
  const scopePrefix = `[data-module="${moduleName}"]`;

  // WHY: keep CSS scoping readable and deterministic over full CSS-spec coverage.
  return cssText.replace(/(^|})\s*([^@{}][^{}]*)\s*\{/g, (match, blockStart, rawSelectors) => {
    const selectors = rawSelectors
      .split(",")
      .map((selector) => selector.trim())
      .filter(Boolean);

    if (selectors.length === 0) {
      return match;
    }

    const scopedSelectors = selectors
      .map((selector) => `${scopePrefix} ${selector}`)
      .join(", ");

    return `${blockStart} ${scopedSelectors} {`;
  });
}

async function importDefinition(jsPath) {
  const module = await import(jsPath);
  return module.default || {};
}

export async function loadModule(name, mountPoint, props = {}) {
  const root = resolveMountPoint(mountPoint);
  const moduleBaseUrl = new URL(`./modules/${name}/`, window.location.href);
  const htmlPath = new URL(`${name}.html`, moduleBaseUrl).href;
  const cssPath = new URL(`${name}.css`, moduleBaseUrl).href;
  const jsPath = new URL(`${name}.js`, moduleBaseUrl).href;

  const html = await fetchText(htmlPath);
  const wrappedHtml = wrapModuleHtml(name, html);
  root.innerHTML = wrappedHtml;
  const moduleRoot = root.querySelector(`[data-module="${name}"]`);
  if (!(moduleRoot instanceof Element)) {
    throw new Error(`Failed to mount module root for "${name}".`);
  }

  const definition = await importDefinition(jsPath);
  const component = Component(definition);
  const instance = component.mount(moduleRoot, props);

  if (definition.css === true) {
    const css = await tryFetchText(cssPath);
    if (typeof css === "string") {
      ensureCss(name, scopeCss(css, name));
    }
  }

  return instance;
}
