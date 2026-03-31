# AGENTS

Guia operativa para contribuir en este proyecto.

## Estructura por feature

- Usa `example/modules/<nombre>/` como unidad principal por ruta/feature.
- Mantén juntos los archivos de cada pantalla:
  - `<nombre>.html`
  - `<nombre>.js`
  - `<nombre>.css`

## Services

- Coloca logica de API/datos en `modules/<nombre>/services/`.
- En servicios: usa funciones puras o async y `fetch` cuando aplique.
- No toques DOM desde `services/`.
- El modulo consume servicios, actualiza `ctx.state` y renderiza.

## Components reutilizables

- Si algo se usa solo dentro de una feature, ponlo en `modules/<nombre>/components/`.
- Si se reutiliza en 2 o mas features, promovelo a `example/components/`.
- Evita convertir `example/components/` en cajon de sastre; solo piezas UI compartidas.

## Limites de framework vs app

- `framework/` es codigo de libreria del motor.
- Evita meter logica de negocio especifica de la app dentro de `framework/`.
- La logica de negocio va en `example/modules/` y `services/`.

## Convenciones de nombres

- Nombra el modulo igual que la ruta (`clientes` -> `modules/clientes/`).
- Usa sufijo `.service.js` para servicios (`clientes.service.js`).
- Mantén nombres explicitos y consistentes entre carpeta, archivo y ruta.
