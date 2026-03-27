# Contributing to OlsSchoolFrontFrame

Thanks for contributing.

This project is intentionally minimal: plain HTML, CSS, and JavaScript with deterministic behavior and clear conventions.

## Before opening a PR

- Keep changes small and focused.
- Prefer readability over clever abstractions.
- Avoid adding dependencies unless strictly necessary.
- Preserve zero-build workflow (no bundlers, no transpilers).

## Development workflow

1. Run the example app:

```bash
docker compose up --build
```

2. Open:

`http://localhost:9000/example/`

3. Validate your change manually in the browser.

## Coding guidelines

- Favor explicit code over magic.
- Keep files short and easy to scan.
- Use small functions with clear names.
- Add comments only to explain why, not what.

## Module convention

Each module must follow:

```text
example/modules/{name}/
  {name}.html
  {name}.js
  {name}.css   (optional; use css: true in module)
```

Imports use the thin alias `framework/module.js` → `defineModule`.

## CLI

- `node cli/ols.js create module <name>` — scaffold under `example/modules/`
- `node cli/ols.js create starter [folder]` — optional standalone template (default folder name `project/`). It copies `framework/` into `<folder>/framework/` so the starter is self-contained; framework work in this repo stays under root `framework/` + `example/`. See README → **CLI** → **Create a starter**.

## Pull request checklist

- [ ] The change is scoped to one concern.
- [ ] The app still runs in Docker.
- [ ] README is updated if behavior changed.
- [ ] No unnecessary dependencies were introduced.

## Reporting issues

Please include:

- Expected behavior
- Actual behavior
- Steps to reproduce
- Browser and OS

Thanks for helping keep OlsSchoolFrontFrame simple and useful.
