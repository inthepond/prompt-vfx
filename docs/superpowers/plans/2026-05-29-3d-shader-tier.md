# 3D / Shader VFX Tier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `3D` tab to the prompt-VFX gallery: a Three.js-powered tier of WebGL/shader effects with pointer interactivity, sharing a single WebGL context across all cells.

**Architecture:** One `three-modules.js` (classic IIFE, like `gsap-modules.js`) registers effects into `window.THREE_MODULES` and mounters into `window.mounters`. A `SharedGL` singleton owns one `WebGLRenderer` and blits each visible cell's `THREE.Scene` into that cell's own 2D canvas (render model "B" — solves the ~16 WebGL-context cap). The shared render loop uses the *native* `requestAnimationFrame` captured before `VFX.html` patches it, so it is never bound to a cell lifecycle (avoids the GSAP-ticker bug class).

**Tech Stack:** Three.js r137 (UMD global build), vanilla JS, no build step.

**Environment notes:**
- **No automated test runner.** Verification = open the page and observe behavior / console. Run a local server from the project root: `python3 -m http.server 8000`, then open `http://localhost:8000/VFX.html`. Keep DevTools console open.
- **Not a git repo** in this environment. Commit steps are marked *(optional — only if `git init` has been run)*.
- Reference spec: `docs/superpowers/specs/2026-05-29-3d-shader-tier-design.md`.

---

## File structure

- **Create `three-modules.js`** — the entire tier: registry wiring, `SharedGL` singleton, `mountThree`/`bind3d`/`disposeScene`, `fragEffect` helper, the `R3` registration helper, and all 8 effect definitions. Single file, mirroring the existing `gsap-modules.js` (which holds 40 effects + its lifecycle bridge in one file — established pattern).
- **Modify `VFX.html`** — three small edits: two `<script>` tags in `<head>`, one line in the merge block, one conditional `CATEGORIES` push.

---

## Task 1: Wire up the tier skeleton (loads, registers nothing yet)

**Files:**
- Create: `three-modules.js`
- Modify: `VFX.html` (`<head>` ~line 25, merge block ~line 1026, `CATEGORIES` ~line 1801)

- [ ] **Step 1: Define expected behavior**

After this task: the page loads with `three.min.js` and `three-modules.js`; `window.THREE` and `window.THREE_MODULES` (empty array) exist; **no `3D` tab appears** (because `THREE_MODULES.length === 0`); no console errors.

- [ ] **Step 2: Create `three-modules.js` with registry wiring only**

```js
/* three-modules.js — 3D / shader VFX tier (the "3D" tab).
   One shared WebGLRenderer (1 context) blits into each cell's own 2D canvas.
   Mirrors gsap-modules.js / effects-extras.js registration. Loads in <head>
   BEFORE VFX.html patches window.requestAnimationFrame, so the shared render
   loop captures the native rAF and is never bound to a cell lifecycle
   (cf. the GSAP global-ticker freeze fixed in gsap-modules.js). */
(function () {
  if (!window.THREE) { console.warn('[three-modules] three not loaded — skipping'); return; }
  const THREE = window.THREE;
  const RAF = window.requestAnimationFrame.bind(window); // native rAF, pre-patch

  const REG = (window.THREE_MODULES = window.THREE_MODULES || []);
  const M = (window.mounters = window.mounters || window.__pendingMounters || {});
  if (!window.mounters) window.mounters = M;
  if (!window.__pendingMounters) window.__pendingMounters = M;

  /* Registry + mounter for one effect. build = (THREE, env) => {scene,camera,update,dispose?} */
  function R3(id, name, prompt, build, opts) {
    REG.push({ id, name, prompt, category: '3d' });
    M[id] = (root, cell) => mountThree(root, cell, build, opts || {});
  }

  // SharedGL, mountThree, bind3d, fragEffect, and effects are added in later tasks.
  // Expose hooks referenced below so the file parses standalone:
  window.__threeR3 = R3;
})();
```

- [ ] **Step 3: Add the two `<script>` tags in `VFX.html` `<head>`**

Modify `VFX.html` — immediately after the `gsap-modules.js` script tag (line 25):

```html
<script src="gsap-modules.js"></script>
<!-- 3D / shader tier: Three.js UMD global + module file (load before the rAF patch) -->
<script src="https://cdn.jsdelivr.net/npm/three@0.137.0/build/three.min.js"></script>
<script src="three-modules.js"></script>
```

- [ ] **Step 4: Add the merge line in `VFX.html`**

Modify the merge block (after line 1026, `if (window.GSAP_MODULES) effects.push(...window.GSAP_MODULES);`):

```js
if (window.GSAP_MODULES) effects.push(...window.GSAP_MODULES);
if (window.THREE_MODULES) effects.push(...window.THREE_MODULES);
```

(`THREE_MODULES` entries already carry `category:'3d'`, so the default-`vfx` tag at line 1020 does not touch them — it runs earlier and only on the inline array.)

- [ ] **Step 5: Add the conditional `CATEGORIES` entry in `VFX.html`**

Modify the `CATEGORIES` array (~line 1801):

```js
const CATEGORIES = [
  { id: 'vfx',     label: 'VFX' },
  { id: 'gsap',    label: 'GSAP' },
];
if (window.THREE_MODULES && window.THREE_MODULES.length)
  CATEGORIES.push({ id: '3d', label: '3D' });
```

- [ ] **Step 6: Verify in browser**

Open `http://localhost:8000/VFX.html`. In the console run:
```js
typeof THREE; window.THREE_MODULES;
```
Expected: `"object"` (THREE loaded) and `[]` (empty registry). Expected: tabs show **VFX** and **GSAP** only, **no 3D tab**, no console errors.

- [ ] **Step 7: Commit** *(optional — only if `git init` has been run)*

```bash
git add three-modules.js VFX.html
git commit -m "feat(3d): wire up Three.js tier skeleton (no effects yet)"
```

---

## Task 2: SharedGL renderer + mount/lifecycle/dispose + fragEffect helper

**Files:**
- Modify: `three-modules.js`

- [ ] **Step 1: Define expected behavior**

After this task the harness exists but is exercised in Task 3. Expected once an effect registers: one `WebGLRenderer` for the whole tier; cells get their own `<canvas>`; offscreen cells stop rendering; tab-switch disposes GPU resources. No standalone visual yet.

- [ ] **Step 2: Replace the placeholder comment block in `three-modules.js`**

Replace the line `// SharedGL, mountThree, ...` and `window.__threeR3 = R3;` with the full harness:

```js
  const RENDER = 512; // square internal render resolution; cells are ~square

  /* ---- Shared renderer: ONE WebGL context for the whole tier ---------- */
  const SharedGL = (() => {
    let renderer = null, running = false, failed = false;
    const active = new Map(); // cell -> entry

    function ensure() {
      if (renderer || failed) return renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true,
                                             powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(RENDER, RENDER, false);
      } catch (e) { failed = true; console.error('[three-modules] WebGL init failed', e); }
      return renderer;
    }
    function anyAwake() { for (const [, e] of active) if (!e.paused) return true; return false; }
    function loop(t) {
      const time = t * 0.001;
      for (const [, e] of active) {
        if (e.paused) continue;
        try {
          e.update && e.update(time, { pointer: e.pointer, width: RENDER, height: RENDER });
          renderer.render(e.scene, e.camera);
          e.ctx.clearRect(0, 0, e.cw, e.ch);
          e.ctx.drawImage(renderer.domElement, 0, 0, e.cw, e.ch);
        } catch (err) { e.paused = true; console.error('[three-modules]', e.id, err); }
      }
      if (anyAwake()) RAF(loop); else running = false;
    }
    function kick() { if (!running && ensure()) { running = true; RAF(loop); } }
    return {
      register(cell, e) { if (!ensure()) return; active.set(cell, e); kick(); },
      unregister(cell) { active.delete(cell); },
      kick,
      _active: active, // for verification
    };
  })();
  window.__SharedGL = SharedGL;

  /* ---- Per-cell mount -------------------------------------------------- */
  function mountThree(root, cell, build, opts) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;background:#000;';
    root.appendChild(canvas);
    const cw = canvas.clientWidth || 360, ch = canvas.clientHeight || 360;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = cw * ratio; canvas.height = ch * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    let built;
    try { built = build(THREE, { pointer: null, width: RENDER, height: RENDER }); }
    catch (e) { console.error('[three-modules] build failed', cell.dataset.id, e); return; }
    if (!built) return;

    const entry = {
      id: cell.dataset.id, scene: built.scene, camera: built.camera,
      update: built.update, dispose: built.dispose,
      paused: false, pointer: null, cw, ch, ctx, canvas,
    };

    const onMove = (ev) => {
      const r = canvas.getBoundingClientRect();
      entry.pointer = { x: (ev.clientX - r.left) / r.width,
                        y: 1 - (ev.clientY - r.top) / r.height }; // GL y-up
    };
    const onLeave = () => { entry.pointer = null; };
    cell.addEventListener('pointermove', onMove);
    cell.addEventListener('pointerleave', onLeave);

    SharedGL.register(cell, entry);
    bind3d(cell, entry);
  }

  /* ---- Lifecycle bridge (mirrors gsap-modules bind) -------------------- */
  function bind3d(cell, entry) {
    const lc = cell && cell.__lc; if (!lc) return;
    const _p = lc.pause.bind(lc), _r = lc.resume.bind(lc), _d = lc.destroy.bind(lc);
    lc.pause   = () => { _p(); entry.paused = true; };
    lc.resume  = () => { _r(); entry.paused = false; SharedGL.kick(); };
    lc.destroy = () => {
      _d();
      SharedGL.unregister(cell);
      disposeScene(entry.scene);
      if (entry.dispose) { try { entry.dispose(); } catch (e) { /* noop */ } }
    };
  }

  function disposeScene(scene) {
    if (!scene) return;
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => {
          for (const k in m) { const v = m[k]; if (v && v.isTexture) v.dispose(); }
          m.dispose();
        });
      }
    });
  }

  /* ---- fragEffect: fullscreen fragment-shader helper ------------------- */
  const VERT = 'void main(){ gl_Position = vec4(position, 1.0); }';
  function fragEffect(fragBody) {
    // ShaderMaterial prepends precision + built-ins; do NOT redeclare precision.
    const frag = 'uniform float u_time; uniform vec2 u_resolution; uniform vec2 u_mouse;\n' + fragBody;
    return (THREE, env) => {
      const scene = new THREE.Scene();
      const camera = new THREE.Camera(); // identity; quad is already in clip space
      const uniforms = {
        u_time:       { value: 0 },
        u_resolution: { value: new THREE.Vector2(env.width, env.height) },
        u_mouse:      { value: new THREE.Vector2(0.5, 0.5) },
      };
      const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
      return {
        scene, camera,
        update(t, e) {
          uniforms.u_time.value = t;
          if (e.pointer) uniforms.u_mouse.value.set(e.pointer.x, e.pointer.y);
        },
      };
    };
  }
```

- [ ] **Step 3: Verify the file still parses**

Reload the page. Console:
```js
typeof window.__SharedGL; typeof window.__threeR3;
```
Wait — `__threeR3` was removed; ignore it. Expected: `typeof window.__SharedGL === "object"`, no console errors, still no `3D` tab (no effects registered yet).

- [ ] **Step 4: Commit** *(optional)*

```bash
git add three-modules.js
git commit -m "feat(3d): shared renderer, per-cell mount, lifecycle bridge, fragEffect"
```

---

## Task 3: First fragment-shader effect — `3d-plasma` (proves the tab end-to-end)

**Files:**
- Modify: `three-modules.js`

- [ ] **Step 1: Define expected behavior**

A `3D` tab appears with count `01`. Its cell shows an animated, colorful plasma field. Moving the pointer over the cell warps the field. Scrolling it offscreen freezes it; scrolling back resumes.

- [ ] **Step 2: Register the effect** (add before the final closing `})();` of `three-modules.js`)

```js
  R3('3d-plasma', 'Plasma flow',
`Fullscreen animated plasma: layered sine fields + radial wave, hue cycling
through a cosine palette. The pointer warps the field (u_mouse). Loops.`,
  fragEffect(`
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = (uv - 0.5) * 3.0 + (u_mouse - 0.5) * 1.5;
  float t = u_time * 0.6;
  float v = sin(p.x*3.0 + t)
          + sin(p.y*3.0 + t*1.3)
          + sin((p.x+p.y)*2.0 + t*0.7)
          + sin(length(p)*4.0 - t*1.5);
  v *= 0.25;
  vec3 col = 0.5 + 0.5*cos(6.28318*(v + vec3(0.0,0.33,0.67)) + t);
  gl_FragColor = vec4(col, 1.0);
}`));
```

- [ ] **Step 3: Verify in browser**

Reload. Expected: a third tab **3D** with count `01`. Click it. Expected: animated plasma in the cell. Move the mouse over it — the pattern shifts under the cursor. Console (no errors):
```js
window.__SharedGL._active.size;  // 1 while the 3D tab is open
```

- [ ] **Step 4: Verify pause/resume**

Switch to the **GSAP** tab and back to **3D**. Expected: plasma still animates; `window.__SharedGL._active.size` returns to `1`; no "context lost" warnings.

- [ ] **Step 5: Commit** *(optional)*

```bash
git add three-modules.js
git commit -m "feat(3d): add 3d-plasma fragment-shader effect"
```

---

## Task 4: Remaining fragment-shader effects — fluid, kaleidoscope, raymarch

**Files:**
- Modify: `three-modules.js`

- [ ] **Step 1: Define expected behavior**

`3D` tab count becomes `04`. Three new cells render: a domain-warped flow, a kaleidoscope, and a raymarched blob — all pointer-reactive.

- [ ] **Step 2: Register the three effects** (after the `3d-plasma` registration)

```js
  R3('3d-fluid', 'Curl flow',
`Domain-warped fbm flow field, hue drifting across it; the pointer pushes the
warp origin. Persistent organic motion. Loops.`,
  fragEffect(`
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv*3.0 + (u_mouse-0.5)*2.0;
  float t = u_time*0.25;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));
  float f = fbm(p + 4.0*q + t);
  vec3 col = mix(vec3(0.02,0.03,0.08), vec3(1.0,0.45,0.15), f);
  col = mix(col, vec3(0.1,0.7,0.9), q.x*0.6);
  gl_FragColor = vec4(col, 1.0);
}`));

  R3('3d-kaleido', 'Kaleidoscope',
`A noise field folded into N-fold radial symmetry; the pointer rotates the
symmetry axis. Slowly evolving. Loops.`,
  fragEffect(`
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution) / u_resolution.y;
  float a = atan(uv.y, uv.x) + (u_mouse.x-0.5)*6.28318;
  float r = length(uv);
  float seg = 6.28318/8.0;
  a = abs(mod(a, seg) - seg*0.5);
  vec2 p = vec2(cos(a), sin(a))*r*4.0;
  float n = noise(p + u_time*0.3);
  vec3 col = 0.5 + 0.5*cos(6.28318*(n + vec3(0.0,0.4,0.7)) + u_time*0.5);
  col *= smoothstep(1.2, 0.1, r);
  gl_FragColor = vec4(col, 1.0);
}`));

  R3('3d-raymarch', 'SDF blob',
`A raymarched morphing sphere (sphere SDF + sine displacement). A point light
orbits with the pointer; soft Lambert shading. Loops.`,
  fragEffect(`
float map(vec3 p){
  float d = length(p) - 1.0;
  d += 0.12*sin(4.0*p.x + u_time)*sin(4.0*p.y + u_time*1.1)*sin(4.0*p.z + u_time*0.9);
  return d;
}
vec3 nrm(vec3 p){
  vec2 e = vec2(0.001,0.0);
  return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),
                        map(p+e.yxy)-map(p-e.yxy),
                        map(p+e.yyx)-map(p-e.yyx)));
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution) / u_resolution.y;
  vec3 ro = vec3(0.0,0.0,3.2);
  vec3 rd = normalize(vec3(uv, -1.5));
  float t = 0.0; float hit = 0.0;
  for(int i=0;i<64;i++){
    vec3 p = ro + rd*t;
    float d = map(p);
    if(d < 0.001){ hit = 1.0; break; }
    t += d; if(t > 6.0) break;
  }
  vec3 col = vec3(0.02,0.03,0.05);
  if(hit > 0.5){
    vec3 p = ro + rd*t;
    vec3 n = nrm(p);
    vec3 lp = vec3((u_mouse.x-0.5)*4.0, (u_mouse.y-0.5)*4.0, 2.0);
    vec3 l = normalize(lp - p);
    float diff = max(dot(n, l), 0.0);
    col = mix(vec3(0.9,0.35,0.1), vec3(1.0,0.85,0.6), diff)*(0.2 + diff);
  }
  gl_FragColor = vec4(col, 1.0);
}`));
```

- [ ] **Step 3: Verify in browser**

Reload, open the **3D** tab. Expected: count `04`; four cells render distinct looks (plasma, flow, kaleidoscope, blob). Each reacts to the pointer. No shader-compile errors in the console (a compile failure logs `[three-modules] <id>` and that one cell stays black — fix the GLSL if so).

- [ ] **Step 4: Commit** *(optional)*

```bash
git add three-modules.js
git commit -m "feat(3d): add fluid, kaleido, raymarch shader effects"
```

---

## Task 5: First true-3D effect — `3d-particles` (establishes the `build()` pattern)

**Files:**
- Modify: `three-modules.js`

- [ ] **Step 1: Define expected behavior**

`3D` count becomes `05`. A rotating spiral-galaxy point cloud renders with additive glow; moving the pointer parallax-shifts the camera.

- [ ] **Step 2: Register the effect**

```js
  R3('3d-particles', 'Particle galaxy',
`8000 additive points arranged as a 3-arm spiral galaxy, slowly rotating.
The pointer parallax-shifts the camera. Orange→white glow. Loops.`,
  (THREE, env) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 6;
    const N = 8000;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = Math.pow(Math.random(), 0.5) * 4;
      const a = (i % 3) / 3 * Math.PI * 2 + r * 0.8;
      const j = () => (Math.random() - 0.5) * 0.4 * r * 0.25;
      pos[i*3]   = Math.cos(a) * r + j();
      pos[i*3+1] = (Math.random() - 0.5) * 0.4 + j();
      pos[i*3+2] = Math.sin(a) * r + j();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.045, color: 0xff7a3c, transparent: true,
      opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return {
      scene, camera,
      update(t, e) {
        points.rotation.y = t * 0.15;
        const tx = e.pointer ? (e.pointer.x - 0.5) * 3 : 0;
        const ty = e.pointer ? (e.pointer.y - 0.5) * 3 : 0;
        camera.position.x += (tx - camera.position.x) * 0.05;
        camera.position.y += (ty - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
      },
    };
  });
```

- [ ] **Step 3: Verify in browser**

Reload, **3D** tab, count `05`. Expected: a glowing rotating galaxy; pointer movement parallax-shifts the view smoothly.

- [ ] **Step 4: Verify dispose** — switch tabs away and back 3× quickly. Expected: no console errors, `window.__SharedGL._active.size` returns to `5`, no growing memory (check DevTools Memory if desired).

- [ ] **Step 5: Commit** *(optional)*

```bash
git add three-modules.js
git commit -m "feat(3d): add 3d-particles galaxy effect"
```

---

## Task 6: Remaining true-3D effects — mesh, tunnel, grid

**Files:**
- Modify: `three-modules.js`

- [ ] **Step 1: Define expected behavior**

`3D` count becomes `08`. Three new cells: a noise-displaced icosahedron (mouse tilt), an instanced-ring tunnel (mouse steer), and an instanced cube wave-grid (pointer ripple).

- [ ] **Step 2: Register the three effects**

```js
  R3('3d-mesh', 'Displaced icosphere',
`A high-detail icosahedron displaced by 3D sine noise in a custom vertex
shader, slowly rotating. The pointer tilts it. Wireframe-over-fill look. Loops.`,
  (THREE, env) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 3.2;
    const uniforms = { u_time: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        uniform float u_time; varying float v_d;
        void main(){
          vec3 p = position;
          float d = 0.18 * sin(3.0*p.x + u_time) * sin(3.0*p.y + u_time*1.2) * sin(3.0*p.z + u_time*0.8);
          p += normal * d; v_d = d;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        varying float v_d;
        void main(){
          vec3 col = mix(vec3(0.9,0.3,0.1), vec3(1.0,0.9,0.7), v_d*3.0 + 0.5);
          gl_FragColor = vec4(col, 1.0);
        }`,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 6), mat);
    scene.add(mesh);
    return {
      scene, camera,
      update(t, e) {
        uniforms.u_time.value = t;
        mesh.rotation.y = t * 0.3;
        const tx = e.pointer ? (e.pointer.y - 0.5) * 1.2 : 0;
        const ty = e.pointer ? (e.pointer.x - 0.5) * 1.2 : 0;
        mesh.rotation.x += (tx - mesh.rotation.x) * 0.05;
      },
    };
  });

  R3('3d-tunnel', 'Ring tunnel',
`40 instanced torus rings receding into Z, scrolling toward the camera and
recycling, with a hue gradient by depth. The pointer steers the tunnel. Loops.`,
  (THREE, env) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
    camera.position.z = 5;
    const COUNT = 40, SPACING = 1.2;
    const geo = new THREE.TorusGeometry(1.4, 0.06, 8, 32);
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true });
    const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
    const color = new THREE.Color();
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) { color.setHSL((i / COUNT) * 0.6 + 0.05, 0.8, 0.55);
      colors[i*3]=color.r; colors[i*3+1]=color.g; colors[i*3+2]=color.b; }
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    scene.add(mesh);
    const dummy = new THREE.Object3D();
    return {
      scene, camera,
      update(t, e) {
        const ox = e.pointer ? (e.pointer.x - 0.5) * 2 : 0;
        const oy = e.pointer ? (e.pointer.y - 0.5) * 2 : 0;
        for (let i = 0; i < COUNT; i++) {
          let z = -((i * SPACING - (t * 2.0) % SPACING));
          z = ((z % (COUNT * SPACING)) + COUNT * SPACING) % (COUNT * SPACING);
          dummy.position.set(ox * (z * 0.1), oy * (z * 0.1), 4 - z);
          dummy.rotation.z = t * 0.2 + i * 0.3;
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      },
    };
  });

  R3('3d-grid', 'Cube wave grid',
`A 16×16 grid of instanced cubes whose heights follow a travelling sine wave.
The pointer injects a radial ripple at the cursor. Loops.`,
  (THREE, env) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 7, 9); camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.1));
    const dir = new THREE.DirectionalLight(0xffa060, 0.8); dir.position.set(3, 6, 4); scene.add(dir);
    const N = 16, GAP = 0.55;
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.4, 1, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 }), N * N);
    scene.add(mesh);
    const dummy = new THREE.Object3D();
    return {
      scene, camera,
      update(t, e) {
        const mx = e.pointer ? (e.pointer.x - 0.5) * N : 0;
        const mz = e.pointer ? (e.pointer.y - 0.5) * N : 0;
        let i = 0;
        for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) {
          const px = (x - N/2) * GAP, pz = (z - N/2) * GAP;
          const wave = Math.sin(x*0.6 + t*2) + Math.cos(z*0.6 + t*1.7);
          const ripple = e.pointer
            ? Math.cos(Math.hypot(x - (mx + N/2), z - (mz + N/2)) * 0.6 - t*4) * 1.2 : 0;
          const h = 0.6 + (wave + ripple) * 0.5 + 1.0;
          dummy.position.set(px, h/2, pz);
          dummy.scale.set(1, h, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i++, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      },
    };
  });
```

- [ ] **Step 3: Verify in browser**

Reload, **3D** tab, count `08`. Expected: all 8 cells render and animate; mesh tilts to the pointer, tunnel steers, grid ripples under the cursor. No console errors.

- [ ] **Step 4: Commit** *(optional)*

```bash
git add three-modules.js
git commit -m "feat(3d): add mesh, tunnel, cube-grid true-3D effects"
```

---

## Task 7: Cross-tier verification pass (manual checklist)

**Files:** none (verification only)

- [ ] **Step 1: Single context** — open the **3D** tab. Console:
```js
// Count live WebGL contexts indirectly: only one renderer should exist.
window.__SharedGL._active.size; // 8 with all cells in view (or fewer if some are offscreen)
```
Expected: no "WARNING: Too many active WebGL contexts" messages anywhere, ever.

- [ ] **Step 2: Offscreen culling** — scroll so some 3D cells leave the viewport. Expected: offscreen cells stop updating (their `entry.paused` is true). Confirm by watching CPU/GPU drop, or temporarily add a `console.count` in `loop` (remove after).

- [ ] **Step 3: Tab-switch dispose** — switch 3D → VFX → GSAP → 3D several times. Expected: no "context lost" warnings; `window.__SharedGL._active.size` returns to the visible-cell count each time; DevTools Memory shows no unbounded growth (geometries/materials disposed).

- [ ] **Step 4: No cross-tier regression (GSAP ticker)** — open the **GSAP** tab, note `gsap.ticker.frame`, switch to **3D** and back, check it again:
```js
gsap.ticker.frame; // run twice across a 3D visit — must keep increasing
```
Expected: strictly increasing. The shared 3D loop uses native rAF and must not interfere.

- [ ] **Step 5: rAF-capture bug-class check** — the failure mode we are guarding against: the shared loop dying when the first-mounted 3D cell unmounts. Test: open **3D**, scroll the **first** cell offscreen (pauses it), confirm the **other** cells keep animating. Then scroll the first cell fully out and back. Expected: every other cell keeps rendering throughout; the loop never stops while any cell is awake.

- [ ] **Step 6: Update the spec status** — edit `docs/superpowers/specs/2026-05-29-3d-shader-tier-design.md`, change `**Status:** Approved (pending spec review)` to `**Status:** Implemented`.

- [ ] **Step 7: Commit** *(optional)*

```bash
git add docs/superpowers/specs/2026-05-29-3d-shader-tier-design.md
git commit -m "docs(3d): mark 3D/shader tier spec implemented"
```

---

## Self-review notes (author)

- **Spec coverage:** architecture (Task 1–2), shared renderer model B (Task 2), lifecycle bridge + dispose (Task 2), rAF-capture safeguard (Task 1 RAF capture + Task 7 Step 5), prompt→effect contract + `fragEffect` (Task 2), all 8 starter effects (Tasks 3–6), three `VFX.html` integration edits (Task 1), graceful degrade if THREE fails (Task 1 Step 5 conditional + Task 2 `ensure()` try/catch), shader-compile error isolation (Task 2 `loop` try/catch), verification checklist (Task 7). No gaps found.
- **Type/name consistency:** `SharedGL.register/unregister/kick`, `entry.{scene,camera,update,dispose,paused,pointer,cw,ch,ctx,canvas}`, `R3(id,name,prompt,build,opts)`, `build(THREE, env)=>{scene,camera,update,dispose?}`, `fragEffect(fragBody)`, `mountThree`, `bind3d`, `disposeScene`, `RENDER` — all used consistently across tasks.
- **Known tuning risk:** the 8 effects are functional starters; aesthetics are expected to be iterated via the prompt workflow. A shader that fails to compile isolates to its own black cell (logged) and does not break siblings.
