# 3D / Shader VFX Tier — Design Spec

**Date:** 2026-05-29
**Status:** Implemented (pending in-browser verification)
**Author:** brainstormed with Claude

## Goal

Add a new rendering tier to the prompt-driven VFX gallery: WebGL/3D effects via
Three.js, with built-in pointer interactivity. This is brand-new ground — the
existing catalog is ~100 2D-canvas/DOM VFX, 40 GSAP timeline demos, and the
UI-module categories — none of it touches WebGL or shaders.

The tier surfaces as a new **`3D`** tab and ships a **harness + 8 starter
effects**. The harness defines a clean prompt→effect contract so future effects
can be generated from prompts (the project's core premise).

## Non-goals (this batch)

- Mic / Web-Audio reactive effects (permission prompts, extra complexity) — deferred.
- A full 12–15 effect tab — start with 8, expand later.
- Modern ESM Three.js / build step — the project is intentionally no-build.

## Constraints discovered

- **WebGL context cap (~16 per browser).** The grid is scrollable (min 280px
  cells, 50% pre-warm `rootMargin`), so a wide screen can have 15–20 cells
  mounted at once. One context per cell would blow the cap and cause force-killed
  contexts (cells randomly going black). → drives the shared-renderer model.
- **The rAF-capture hazard.** `VFX.html` patches `window.requestAnimationFrame`
  to attribute timers to the cell currently mounting. A self-rescheduling loop
  started inside a mount gets bound to that cell's lifecycle and dies when the
  cell unmounts — the same class of bug as the GSAP global-ticker freeze fixed
  earlier (see `gsap-modules.js` keep-alive comment). The shared render loop must
  use the *original* rAF.
- **No test harness in the repo** (static HTML, no `package.json`) → manual
  verification checklist.
- **Not a git repository** in this environment → spec is written but not committed.

## Architecture

### New file: `three-modules.js`

Classic IIFE, mirroring `gsap-modules.js`:

- Guard: `if (!window.THREE) { console.warn('[three-modules] three not loaded — skipping'); return; }`
- Registers effects into `window.THREE_MODULES = []` as `{ id, name, prompt, category:'3d' }`.
- Adds mounters to `window.mounters` / `window.__pendingMounters` (same dual-write
  pattern as `effects-extras.js`, so it works whether it loads before or after the
  main script).
- Loads in `<head>` **before** the rAF patch installs, so it can capture the
  native rAF: `const RAF = window.requestAnimationFrame.bind(window);`

### Three.js delivery

UMD global build via CDN `<script src>` (like the GSAP plugins), pinned to a
version that still ships `build/three.min.js` (UMD exposing global `THREE`).
Keeps everything synchronous and no-build. (Modern ESM-only Three would force a
bootstrap refactor for marginal gain — rejected.)

### Shared renderer (render model "B")

A module-level `SharedGL` singleton:

- Owns **one** `THREE.WebGLRenderer` (one WebGL context, ever) with an offscreen
  canvas, sized once to the (uniform) cell pixel size, capped resolution, dpr ≤ 2.
- `active: Map<cell, entry>` where `entry = { scene, camera, update, pointer,
  paused, w, h, dispose }`.
- One global loop (`RAF`, the captured native one — **never** the patched
  `window.requestAnimationFrame`):
  ```
  function loop(t) {
    for (const [cell, e] of active) {
      if (e.paused) continue;
      e.update(t, { pointer: e.pointer, width: e.w, height: e.h });
      renderer.render(e.scene, e.camera);
      e.ctx.drawImage(renderer.domElement, 0, 0, e.w, e.h);
    }
    if (active.size) rafId = RAF(loop); else running = false;
  }
  ```
- `register(cell, entry)` adds to `active` and kicks the loop if idle.
  `unregister(cell)` removes it. Loop idles when `active` is empty (power saving),
  restarts on next register.

Each 3D cell keeps its **own** `<canvas>` inside its `.stage`, so flip/meta/overlay
layering, content-visibility culling, and the per-cell lifecycle all stay
unchanged.

### Lifecycle bridge

`bind3d(cell, entry, cleanup)` wraps `lc.pause/resume/destroy` (same pattern as
GSAP's `bind`):

- **pause** (scrolled offscreen) → `entry.paused = true` → loop skips it; zero GPU
  work offscreen, matching the grid's culling design.
- **resume** → `entry.paused = false` → `SharedGL.kick()`.
- **destroy** (tab switch / grid teardown) → `SharedGL.unregister(cell)` + dispose
  THREE geometries/materials/textures (prevents GPU leaks across tab switches) +
  remove the cell canvas + optional extra cleanup.

### Prompt → effect contract

Each effect supplies:

```js
build(env) => { scene, camera, update(t, env) }
// env = { pointer: {x, y}, width, height }   pointer normalized 0..1, null when outside
```

Helper for the common shader case:

```js
fragEffect(glslSource) // → build() that sets up a fullscreen ortho quad
                        //   ShaderMaterial with uniforms:
                        //   u_time (float), u_resolution (vec2), u_mouse (vec2)
```

So a generated effect is **either** a GLSL fragment-shader string (→ `fragEffect`)
**or** a short JS `build()` using THREE primitives. Pointer reactivity is wired by
the harness from per-cell `pointermove`/`pointerleave` (→ `u_mouse` for shaders, a
raycaster/parallax hook for 3D scenes). Listeners are attached on the cell node and
GC'd when the grid is torn down (`grid.innerHTML = ''`).

### Registration helper

```js
function R3(id, name, prompt, build, opts) {
  THREE_MODULES.push({ id, name, prompt, category: '3d' });
  M[id] = (root, cell) => mountThree(root, cell, build, opts);
}
```

`mountThree` creates the per-cell 2D canvas, calls `build(env)`, registers the
entry with `SharedGL`, and calls `bind3d`.

## Starter batch (8 — may trim to 6)

Fragment-shader (`fragEffect`):

1. **`3d-plasma`** — animated fbm/plasma field, hue drift; `u_mouse` warps the field.
2. **`3d-fluid`** — domain-warped curl-flow look; pointer pushes the flow.
3. **`3d-kaleido`** — kaleidoscope of a noise field; mouse rotates symmetry.
4. **`3d-raymarch`** — raymarched morphing SDF blob; mouse orbits the light.

True-3D (`build()` with THREE primitives):

5. **`3d-particles`** — instanced points forming a rotating galaxy/sphere; mouse parallax.
6. **`3d-mesh`** — noise vertex-displaced icosahedron, slow rotate; mouse tilt.
7. **`3d-tunnel`** — infinite instanced-ring tunnel; mouse steers.
8. **`3d-grid`** — instanced cube wave-grid; pointer creates a ripple.

## Integration edits to `VFX.html` (all minimal)

1. Two `<script>` tags in `<head>` (after the GSAP plugin block): Three.js UMD,
   then `three-modules.js`.
2. Merge block (~line 1026): `if (window.THREE_MODULES) effects.push(...window.THREE_MODULES);`
3. `CATEGORIES` (~line 1801): conditionally push `{ id:'3d', label:'3D' }` **only**
   when `window.THREE_MODULES?.length` — graceful degrade if the CDN fails.

(Mounters are already merged via `window.__pendingMounters` at ~line 1798.)

## Error handling

- `three-modules.js` missing `window.THREE` → warn + early return; tab not added.
- WebGL context creation failure in `SharedGL.ensure()` → log once; affected cells
  show a blank canvas rather than throwing.
- Shader compile error in `fragEffect` → catch, log the effect id + GLSL log, skip
  that cell (don't break sibling cells).

## Verification (manual checklist)

- [ ] `3D` tab appears with the correct effect count.
- [ ] Each cell renders and is pointer-reactive.
- [ ] Scrolling a cell offscreen stops its GPU work (`entry.paused`), resumes on return.
- [ ] Switching tabs disposes cleanly: WebGL context count stays 1, no "context
      lost" console warnings, no growing GPU memory across repeated switches.
- [ ] `gsap.ticker.frame` keeps incrementing — no cross-tier regression.
- [ ] Unmounting the **first-mounted** 3D cell does NOT kill the shared loop
      (the rAF-capture bug-class check).

## Open questions

None blocking. Audio-reactive effects and a larger batch are explicit follow-ups.
