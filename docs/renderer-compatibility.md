# Renderer Compatibility Matrix

## Contract

Baseline: OpenMAIC commit
`d8a0081c7d229081301dfa5f21ccfd7ba93bda51`,
`@openmaic/renderer@0.0.2`, MIT.

`@aiforus/vue-renderer@0.1.0-alpha.0` accepts the same frozen `Slide` JSON from
`@aiforus/dsl`. Compatibility means equivalent observable rendering/playback
at the serialized contract boundary. React props, context, Tailwind classes,
and editing APIs are not compatibility targets.

## Rendering matrix

| Capability                             | Status                  | Verification or deliberate implementation                                                           |
| -------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------- |
| Fixed design viewport and scale-to-fit | Supported               | `SlideCanvas` uses `viewportSize` and `viewportRatio`; fixed-scale and auto-fit tests               |
| Background color/image/gradient        | Supported               | `backgroundToStyle()` and golden gallery                                                            |
| Text                                   | Supported + hardened    | Rich HTML, typography, rotation, auto-fit floor, residual-overflow diagnostics                      |
| Shape                                  | Supported + hardened    | SVG geometry/fill/outline plus auto-fit shape text                                                  |
| Image                                  | Supported               | crop, clip shape, filters, opacity, outline, shadow, consumer slot                                  |
| Line                                   | Supported               | endpoints, dash styles, endpoint markers                                                            |
| Chart                                  | Compatible substitution | Dependency-free SVG bar/column/line/area/pie/ring/scatter/radar rendering; no ECharts runtime       |
| Table                                  | Supported               | fixed layout, cell fill/border/typography and overflow diagnostics                                  |
| LaTeX                                  | Compatible substitution | supplied HTML/SVG is preserved; plain LaTeX fallback; no bundled KaTeX                              |
| Video                                  | Supported               | native video/poster plus consumer slot                                                              |
| Code                                   | Compatible substitution | dependency-free line renderer, line numbers, wrapping, consumer slot; no Shiki                      |
| Audio                                  | Local extension         | The frozen DSL contains audio but upstream `SlideElement` does not dispatch it; local renderer does |
| Custom element renderer                | Supported               | Vue component `registry` keyed by DSL element type                                                  |
| Snapshot                               | Supported               | browser SVG `foreignObject` + canvas PNG; CORS restrictions documented                              |

The golden gallery contains all ten element discriminants. Browser acceptance
on Node `22.16.0` reports zero layout diagnostics. For title, chart, and code
focus targets, measured laser-center deltas from the rendered element centers
are below `0.0001px`.

## Effects and playback matrix

| Capability               | Ownership          | Behavior                                                                                |
| ------------------------ | ------------------ | --------------------------------------------------------------------------------------- |
| Spotlight                | Renderer           | Stable `element.id`; persists until replaced/reset                                      |
| Laser                    | Renderer           | Stable `element.id`; centered from the same design box; clears after its display window |
| Highlight                | Renderer API       | Same stable-ID geometry, configurable border/fill/animation                             |
| Zoom                     | Renderer API       | Same stable-ID geometry and transform origin                                            |
| Speech                   | Injected adapter   | Awaited before the next synchronous action; focus remains active                        |
| Play video               | Injected adapter   | Element reference validated before playback; adapter awaited                            |
| Whiteboard actions       | Host executor      | Typed delegation; never silently interpreted or dropped                                 |
| Discussion               | Host executor      | Typed delegation; independent application runtime                                       |
| Widget actions           | Host executor      | Typed delegation; used later by Deep Interactive host runtime                           |
| Missing Slide element ID | Validation error   | Fails before action playback, never falls back to array index                           |
| Missing required adapter | Typed player error | No silent no-op                                                                         |

All 21 frozen action discriminants are either handled by the renderer or
delegated through an explicit typed boundary. Quiz and Deep Interactive remain
separate scene/content modes; they are not accepted by `SlideCanvas`.

## Intentional differences from frozen OpenMAIC

- Vue 3 components replace React components and context.
- The local runtime has one package dependency (`@aiforus/dsl`) and one Vue
  peer; it does not require Tailwind, React, Motion, ECharts, Shiki, or KaTeX.
- Effect geometry uses the actual `viewportRatio`. The frozen upstream
  percentage helper hardcodes `0.5625` for Y geometry.
- Spotlight and laser do not query global DOM IDs; multiple players can render
  the same slide safely.
- DSL audio is rendered instead of being silently omitted.
- Text/shape auto-fit and layout diagnostics are local hardening for generated
  courseware.
- Editing is deliberately not part of this package. AIForUs will integrate
  authoring separately after the read-only playback path is stable.

## Release gate

Before publication, the repository must pass formatting, lint, type checking,
unit/conformance tests, build, exact tarball allow-list, production/development
license audit, clean consumer install, clean remote clone, and GitHub CI.
