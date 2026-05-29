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
        if (e.needsMeasure) measure(e);
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

  /* Resize a cell's 2D canvas backing store once real layout is available.
     Cells mount while offscreen (content-visibility:auto) so clientWidth is 0
     at mount; we re-measure on the first awake frame and on resume. */
  function measure(entry) {
    const cw = entry.canvas.clientWidth, ch = entry.canvas.clientHeight;
    if (!cw || !ch) return; // layout still skipped — keep current size
    if (cw === entry.cw && ch === entry.ch && !entry.needsMeasure) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    entry.cw = cw; entry.ch = ch;
    entry.canvas.width = cw * ratio; entry.canvas.height = ch * ratio;
    entry.ctx.setTransform(1, 0, 0, 1, 0, 0);
    entry.ctx.scale(ratio, ratio);
    entry.needsMeasure = false;
  }

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
      paused: false, pointer: null, cw, ch, ctx, canvas, needsMeasure: true,
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
    lc.resume  = () => { _r(); entry.paused = false; entry.needsMeasure = true; SharedGL.kick(); };
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
      if (o.isInstancedMesh && o.dispose) o.dispose();
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
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 4), mat);
    scene.add(mesh);
    return {
      scene, camera,
      update(t, e) {
        uniforms.u_time.value = t;
        mesh.rotation.y = t * 0.3;
        const tx = e.pointer ? (e.pointer.y - 0.5) * 1.2 : 0;
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
    // White per-vertex color: with vertexColors:true the shader multiplies by the
    // `color` attribute, which defaults to (0,0,0) if absent → black rings. White
    // keeps vColor=1 so instanceColor tints each ring.
    geo.setAttribute('color', new THREE.BufferAttribute(
      new Float32Array(geo.attributes.position.count * 3).fill(1), 3));
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

  /* ===================================================================
     Batch 2 — 12 more shader effects + 2 more true-3D (total 22)
     =================================================================== */

  R3('3d-voronoi', 'Voronoi cells',
`Animated Voronoi cells: each site orbits slowly; cells tinted by a cosine
palette and shaded by distance. A highlight tracks the pointer. Loops.`,
  fragEffect(`
vec2 hash2(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution)/u_resolution.y * 4.0;
  vec2 g = floor(uv), f = fract(uv);
  float md = 8.0; vec2 mr = vec2(0.0);
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 o = vec2(float(i), float(j));
    vec2 r = o + 0.5 + 0.5*sin(u_time + 6.2831*hash2(g+o)) - f;
    float d = dot(r,r);
    if(d < md){ md = d; mr = hash2(g+o); }
  }
  vec3 col = (0.5+0.5*cos(6.2831*(mr.x + vec3(0.0,0.33,0.67)) + u_time*0.5)) * (0.4+0.6*sqrt(md));
  col += smoothstep(0.25,0.0, length((u_mouse-0.5)*4.0 - uv)) * 0.3;
  gl_FragColor = vec4(col, 1.0);
}`));

  R3('3d-truchet', 'Truchet weave',
`Randomly flipped Truchet arc tiles forming a woven maze that scrolls; the
pointer shifts the weave. Neon arcs on near-black. Loops.`,
  fragEffect(`
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy/u_resolution * 6.0 + vec2(u_time*0.3 + (u_mouse.x-0.5)*4.0, u_time*0.1);
  vec2 g = floor(uv), f = fract(uv);
  if(hash(g) < 0.5) f.x = 1.0 - f.x;
  float d = min(abs(length(f - vec2(0.0,1.0)) - 0.5), abs(length(f - vec2(1.0,0.0)) - 0.5));
  float line = smoothstep(0.09, 0.0, d);
  gl_FragColor = vec4(mix(vec3(0.02), vec3(0.1,0.85,0.9), line), 1.0);
}`));

  R3('3d-moire', 'Moiré rings',
`Two concentric ring patterns — one centered, one tracking the pointer —
interfering into shifting moiré bands. Cosine-palette color. Loops.`,
  fragEffect(`
void main(){
  float d1 = length(gl_FragCoord.xy - u_resolution*0.5);
  float d2 = length(gl_FragCoord.xy - u_mouse*u_resolution);
  float v = sin(d1*0.15 - u_time*2.0) * sin(d2*0.15 + u_time*1.5);
  gl_FragColor = vec4(0.5+0.5*cos(6.2831*(v*0.5 + vec3(0.0,0.3,0.6)) + u_time), 1.0);
}`));

  R3('3d-julia', 'Julia drift',
`A Julia-set escape-time fractal whose seed c drifts in time and with the
pointer, so the fractal continuously morphs. Loops.`,
  fragEffect(`
void main(){
  vec2 z = (gl_FragCoord.xy - 0.5*u_resolution)/u_resolution.y * 3.0;
  vec2 c = vec2(0.355 + 0.1*sin(u_time*0.3) + (u_mouse.x-0.5)*0.4,
                0.355 + 0.1*cos(u_time*0.27) + (u_mouse.y-0.5)*0.4);
  float it = 0.0;
  for(int i=0;i<80;i++){
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if(dot(z,z) > 4.0) break;
    it += 1.0;
  }
  float m = it/80.0;
  vec3 col = it >= 80.0 ? vec3(0.02) : 0.5+0.5*cos(6.2831*(m*3.0 + vec3(0.0,0.4,0.7)) + u_time*0.3);
  gl_FragColor = vec4(col, 1.0);
}`));

  R3('3d-hex', 'Hex pulse',
`A hexagonal lattice where a pulse ripples outward from the center; pointer X
shifts the pulse phase. Glowing cell edges. Loops.`,
  fragEffect(`
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution)/u_resolution.y * 6.0;
  vec2 r = vec2(1.0, 1.7320508), h = r*0.5;
  vec2 a = mod(uv, r) - h, b = mod(uv - h, r) - h;
  vec2 gv = dot(a,a) < dot(b,b) ? a : b;
  float hd = max(abs(gv.x)*0.866 + abs(gv.y)*0.5, abs(gv.y));
  vec2 id = uv - gv;
  float pulse = sin(length(id) - u_time*3.0 + u_mouse.x*6.0)*0.5 + 0.5;
  float edge = smoothstep(0.5, 0.45, hd);
  gl_FragColor = vec4(mix(vec3(0.02), 0.5+0.5*cos(vec3(0.0,2.0,4.0) + pulse*4.0), edge*pulse), 1.0);
}`));

  R3('3d-warpstars', 'Warp stars',
`60 stars streaming outward from a vanishing point that follows the pointer,
each fading as it nears the edge — a hyperspace jump. Loops.`,
  fragEffect(`
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution)/u_resolution.y + (u_mouse-0.5)*0.5;
  vec3 col = vec3(0.0);
  for(int i=0;i<60;i++){
    float fi = float(i);
    float ang = hash(vec2(fi,1.0))*6.2831;
    float d = fract(hash(vec2(fi,3.0)) + u_time*(0.2 + hash(vec2(fi,2.0))*0.8)*0.3);
    vec2 sp = vec2(cos(ang), sin(ang))*d;
    col += vec3(1.0,0.9,0.8) * smoothstep(0.02, 0.0, length(uv - sp)) * d;
  }
  gl_FragColor = vec4(col, 1.0);
}`));

  R3('3d-aurora', 'Aurora',
`Layered noise-driven aurora bands drifting across a night sky, with a faint
ground glow. Pointer X slides the curtains. Loops.`,
  fragEffect(`
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
void main(){
  vec2 uv = gl_FragCoord.xy/u_resolution;
  uv.x += (u_mouse.x-0.5)*0.3;
  vec3 col = vec3(0.01,0.02,0.05);
  for(int i=0;i<3;i++){
    float fi = float(i);
    float y = 0.4 + 0.18*fi + 0.15*noise(vec2(uv.x*3.0 + u_time*0.2 + fi, fi));
    col += smoothstep(0.08, 0.0, abs(uv.y - y)) * (0.5+0.5*cos(vec3(0.0,2.0,4.0) + fi + uv.x*3.0 + u_time*0.3)) * 0.8;
  }
  col += smoothstep(0.6, 0.0, uv.y) * vec3(0.0,0.05,0.1);
  gl_FragColor = vec4(col, 1.0);
}`));

  R3('3d-phyllo', 'Phyllotaxis',
`A sunflower phyllotaxis spiral of 140 dots rotating by the golden angle;
pointer Y expands or contracts the bloom. Loops.`,
  fragEffect(`
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution)/u_resolution.y;
  vec3 col = vec3(0.02);
  float scale = 0.7 + u_mouse.y*0.6;
  for(int i=0;i<140;i++){
    float fi = float(i);
    float rr = sqrt(fi/140.0)*0.9*scale;
    float a = fi*2.39996 + u_time*0.5;
    float dd = smoothstep(0.02, 0.0, length(uv - vec2(cos(a), sin(a))*rr));
    col += dd * (0.5+0.5*cos(vec3(0.0,2.0,4.0) + fi*0.05 + u_time));
  }
  gl_FragColor = vec4(col, 1.0);
}`));

  R3('3d-lava', 'Lava lamp',
`Six metaball charges drifting in a thresholded field — molten blobs that
merge and split. The first blob follows the pointer. Loops.`,
  fragEffect(`
void main(){
  vec2 p = (gl_FragCoord.xy/u_resolution - 0.5)*2.0;
  float v = 0.0;
  for(int i=0;i<6;i++){
    float fi = float(i);
    vec2 c = 0.7*vec2(sin(u_time*0.5 + fi*1.3), cos(u_time*0.4 + fi*2.1));
    if(i == 0) c = (u_mouse-0.5)*2.0;
    v += 0.05/(dot(p-c, p-c) + 0.02);
  }
  vec3 col = mix(vec3(0.05,0.0,0.1), vec3(1.0,0.5,0.0), smoothstep(0.5,1.5,v));
  col = mix(col, vec3(1.0,1.0,0.6), smoothstep(1.5,3.0,v));
  gl_FragColor = vec4(col, 1.0);
}`));

  R3('3d-neongrid', 'Neon floor grid',
`A perspective-projected neon grid floor scrolling toward the horizon
(synthwave). Pointer steers the heading and speed. Loops.`,
  fragEffect(`
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution)/u_resolution.y;
  uv.y += 0.5;
  if(uv.y <= 0.001){ gl_FragColor = vec4(0.01,0.0,0.03,1.0); return; }
  vec2 p = vec2(uv.x/uv.y + (u_mouse.x-0.5)*2.0, 1.0/uv.y + u_time*2.0 + u_mouse.y*4.0);
  vec2 g = abs(fract(p) - 0.5);
  float line = smoothstep(0.05, 0.0, min(g.x, g.y));
  gl_FragColor = vec4(mix(vec3(0.02,0.0,0.05), vec3(0.9,0.2,0.8), line) * smoothstep(0.0,0.4,uv.y), 1.0);
}`));

  R3('3d-caustics', 'Water caustics',
`Interfering sine ripples producing bright caustic filaments over deep blue,
as if light through water. The pointer disturbs the surface. Loops.`,
  fragEffect(`
void main(){
  vec2 p = gl_FragCoord.xy/u_resolution * 6.0 + (u_mouse-0.5)*3.0;
  float t = u_time*0.6, v = 0.0;
  for(int i=0;i<4;i++){
    float fi = float(i)+1.0;
    v += sin(p.x*fi + t) + sin(p.y*fi*1.1 - t) + sin((p.x+p.y)*fi*0.7 + t*1.3);
  }
  float c = pow(1.0 - clamp(abs(v)*0.15, 0.0, 1.0), 3.0);
  gl_FragColor = vec4(mix(vec3(0.0,0.1,0.25), vec3(0.4,0.9,1.0), c), 1.0);
}`));

  R3('3d-spintunnel', 'Spin tunnel',
`A polar checkerboard tunnel rushing inward with a dark vignette center;
the pointer shifts the vanishing point. Loops.`,
  fragEffect(`
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution)/u_resolution.y + (u_mouse-0.5)*0.4;
  float a = atan(uv.y, uv.x), r = length(uv);
  float chk = mod(floor(a/6.2831*12.0) + floor((0.3/r + u_time*0.5)*12.0), 2.0);
  gl_FragColor = vec4(mix(vec3(0.1,0.0,0.2), vec3(1.0,0.4,0.7), chk) * smoothstep(0.0,0.4,r), 1.0);
}`));

  R3('3d-knot', 'Torus knot',
`A rotating torus-knot shaded by surface normals (rainbow facets), with
camera parallax following the pointer. True 3D geometry. Loops.`,
  (THREE, env) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 4;
    const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.32, 160, 24), new THREE.MeshNormalMaterial());
    scene.add(mesh);
    return {
      scene, camera,
      update(t, e) {
        mesh.rotation.x = t * 0.3; mesh.rotation.y = t * 0.4;
        const tx = e.pointer ? (e.pointer.x - 0.5) * 1.5 : 0;
        const ty = e.pointer ? (e.pointer.y - 0.5) * 1.5 : 0;
        camera.position.x += (tx - camera.position.x) * 0.05;
        camera.position.y += (ty - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
      },
    };
  });

  R3('3d-pointsheet', 'Point wave sheet',
`A 60×60 sheet of additive points rippling with travelling sine waves and a
radial ripple at the pointer; the sheet slowly spins. True 3D. Loops.`,
  (THREE, env) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 4, 6); camera.lookAt(0, 0, 0);
    const N = 60, span = 8;
    const pos = new Float32Array(N * N * 3);
    let k = 0;
    for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) {
      pos[k++] = (x/(N-1) - 0.5) * span; pos[k++] = 0; pos[k++] = (z/(N-1) - 0.5) * span;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.06, color: 0x4be0a0, transparent: true,
      opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    const arr = geo.attributes.position.array;
    return {
      scene, camera,
      update(t, e) {
        const mx = e.pointer ? (e.pointer.x - 0.5) * span : 0;
        const mz = e.pointer ? (e.pointer.y - 0.5) * span : 0;
        let i = 1;
        for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) {
          const px = (x/(N-1) - 0.5) * span, pz = (z/(N-1) - 0.5) * span;
          const d = Math.hypot(px - mx, pz - mz);
          arr[i] = Math.sin(px*1.2 + t*2)*0.4 + Math.cos(pz*1.2 + t*1.6)*0.4 + Math.cos(d*2.0 - t*4)*0.5;
          i += 3;
        }
        geo.attributes.position.needsUpdate = true;
        pts.rotation.y = t * 0.1;
      },
    };
  });
})();
