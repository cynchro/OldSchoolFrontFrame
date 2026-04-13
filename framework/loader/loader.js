/**
 * OldSchoolFrontFrame (OLS)
 * © 2025 Cynchro. All rights reserved.
 */

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
    throw new Error(`Failed to load HTML: ${path}`);
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
  // Limitation: only one level of nesting is handled — sufficient for module styles.
  // @keyframes and unknown @-rules are left untouched.
  function scopeSelectors(block) {
    return block.replace(/(^|})\s*([^@{}][^{}]*?)\s*\{/g, (match, blockStart, rawSelectors) => {
      const selectors = rawSelectors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!selectors.length) return match;
      const scoped = selectors.map((s) => `${scopePrefix} ${s}`).join(", ");
      return `${blockStart} ${scoped} {`;
    });
  }

  // WHY: @media/@supports blocks need their inner selectors scoped too. Process them
  // first so the top-level pass doesn't see already-scoped text as double-scope candidates.
  // Pattern matches one level deep: @rule { selector { props } selector { props } }
  const withAtRules = cssText.replace(
    /(@(?:media|supports)\b[^{]*)\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g,
    (match, atRule, inner) => `${atRule}{\n${scopeSelectors(inner)}\n}`
  );

  return scopeSelectors(withAtRules);
}

async function importDefinition(jsPath) {
  try {
    const module = await import(jsPath);
    return module.default || {};
  } catch (_error) {
    throw new Error(`Failed to load JS module: ${jsPath}`);
  }
}

export async function loadModule(name, mountPoint, props = {}) {
  const root = resolveMountPoint(mountPoint);
  const moduleBaseUrl = new URL(`./modules/${name}/`, window.location.href);
  const htmlPath = new URL(`${name}.html`, moduleBaseUrl).href;
  const cssPath = new URL(`${name}.css`, moduleBaseUrl).href;
  const jsPath = new URL(`${name}.js`, moduleBaseUrl).href;

  // WHY: fetch HTML and JS in parallel to reduce load time, then apply CSS before
  // injecting HTML into the DOM to prevent a Flash of Unstyled Content (FOUC).
  const [html, definition] = await Promise.all([
    fetchText(htmlPath),
    importDefinition(jsPath)
  ]);

  if (definition.css === true) {
    const css = await tryFetchText(cssPath);
    if (typeof css === "string") {
      ensureCss(name, scopeCss(css, name));
    }
  }

  const wrappedHtml = wrapModuleHtml(name, html);
  root.innerHTML = wrappedHtml;
  const moduleRoot = root.querySelector(`[data-module="${name}"]`);
  if (!(moduleRoot instanceof Element)) {
    throw new Error(`Failed to mount module root for "${name}".`);
  }

  const component = Component(definition);
  return component.mount(moduleRoot, props);
}
