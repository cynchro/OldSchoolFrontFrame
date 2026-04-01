# Philosophy

> "We don't abstract the web. We organize it."

---

## What problem does OldSchoolFrontFrame solve?

Not complexity. Chaos.

Vanilla JavaScript is perfectly capable of building admin panels, internal tools, and CRUD apps. The problem is not the language — it's that without conventions, every developer does things differently. Files grow to a thousand lines, data logic mixes with rendering, and nobody agrees on where anything goes.

OldSchoolFrontFrame does not replace JavaScript. It tells you where things live and how they connect.

---

## What it is

A set of conventions and a thin runtime layer that adds:

- **Reactive state** — change `ctx.state.count` and the DOM updates. No manual re-renders.
- **Declarative bindings** — `data-bind`, `data-model`, `data-for`, `data-click` in plain HTML.
- **Module system** — one folder per route. Predictable, obvious, easy to navigate.
- **Hash router** — with dynamic parameters, zero configuration.
- **Global store** — shared state that survives navigation.
- **No build step** — ES modules directly in the browser.

That is the full list. There is nothing else.

---

## What it is not

- Not a virtual DOM
- Not a component tree with reconciliation
- Not a state machine
- Not a build tool, bundler, or compiler
- Not an opinion on CSS
- Not a replacement for the DOM API

If you need any of those things, use React, Vue, or Svelte. They are excellent tools for what they do.

---

## The line we will not cross

Every decision in this framework passes one test:

> "Can a developer understand this by reading the code, without reading documentation first?"

If the answer is no, we do not add it.

This is why there is no:

- Magic imports or auto-registration
- Hidden side effects from framework internals
- Abstractions that require knowing the framework to debug

When something breaks, you should be able to open DevTools, read the stack trace, and find the problem in your own code — not in ours.

---

## On reactivity

The Proxy-based reactive system is intentional and is not "magic" in the bad sense.

When you write `ctx.state.count = 5`, the framework updates every `[data-bind="count"]` in the DOM. This is the same contract as a spreadsheet cell: you change the value, the display updates. There are no hidden watchers, no computed chains, no dependency graphs to reason about.

The full reactive implementation is 97 lines. Read it: `framework/core/reactivity.js`.

---

## On simplicity

Simplicity is not the same as doing less.

Simplicity means that the system is **understandable**. A 97-line reactive system that saves you from writing `document.querySelectorAll` loops manually is simpler than no reactive system — because it removes more cognitive load than it adds.

We will add features when they reduce overall complexity for the developer. We will not add features because they are interesting, trendy, or complete.

---

## Who this is for

A backend developer who needs to ship a frontend.

Not a frontend developer who wants to explore the ecosystem. Not a team building a complex SPA with real-time collaboration. Not a project that needs SSR, TypeScript decorators, or a component library.

If you are a Python, Go, Java, or PHP developer who needs a working UI for an internal tool — without learning a new mental model — this is for you.

---

## The conventions (non-negotiable)

These are not suggestions. They are the framework.

**One module per route.** Each feature lives in `modules/<name>/` with its own HTML, JS, and CSS. You do not put two routes in one module.

**Services own data fetching.** HTTP calls live in `modules/<name>/services/`. They return data. They do not touch the DOM. They do not update state.

**Modules own state.** The module receives data from services and writes it to `ctx.state`. The reactive system handles the rest.

**Components are shared UI only.** Promote something to `components/` only when two or more modules need it. Do not create components for single use.

**The store is for cross-module state.** If state belongs to one module, keep it in `ctx.state`. If multiple modules need it, use `ctx.store`.

---

## On staying honest

This framework will never be the right tool for every project. We would rather be the perfect tool for a narrow use case than a mediocre tool for a broad one.

If your project outgrows OldSchoolFrontFrame, that is a success — not a failure. It means you shipped something real.
