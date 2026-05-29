/* Adds 80 effects to window.EFFECTS_EXTRA (registry entries) and
   appends mounters to window.mounters once that exists. */

(function () {
  const E = window.EFFECTS_EXTRA = [];
  const M = window.__pendingMounters = {};

  /* Registry entries -------------------------------------------------- */
  function R(id, name, prompt) { E.push({ id, name, prompt }); }

  R('ripple','Click ripple field',
`Dark bg. Click anywhere → expanding ring with thin stroke that fades. Multiple ripples coexist; auto-spawn every 1.6s when idle.`);
  R('metaballs','Metaballs',
`6 moving charges; field threshold rendered with rectangle approximation; bright single-color blob over black.`);
  R('lissajous','Lissajous curves',
`Lissajous figure with a/b ratios drifting slowly. Thin white stroke + persistence (low-alpha clear) → fading ink trail.`);
  R('tunnel','Vector tunnel',
`24 nested rotated polygons scaling + rotating from center to edge with subtle hue shifts per ring.`);
  R('pendulum','Harmonograph',
`Two-pendulum harmonograph trace. 4 frequencies + 4 phases + decay; thousands of small persistent line segments — etched-ink look.`);

  R('snow','Snowfall',
`200 white circles falling at varied speeds with lateral noise sway. Wrap at edges. Closer flakes are larger and faster.`);
  R('fireflies','Fireflies',
`Yellow-green motes wandering on slow brownian motion with soft radial bloom. Cursor gently attracts within radius.`);
  R('firework','Fireworks',
`Auto-launch a rocket every ~1.2s; explode into 80 sparks with gravity + drag + color drift + trail fade. Click → launch toward cursor.`);
  R('embers','Embers / fire',
`Particles spawn at the bottom and rise with upward velocity + horizontal jitter. Color lerp white → orange → smoke gray; fade near top.`);
  R('rain','Rain streaks',
`1px diagonal blue-tinted streaks falling fast. Splash particles bounce up where each streak hits a baseline.`);
  R('flock','Flocking (Boids)',
`120 boids with separation/alignment/cohesion. Persistence trail render. Cursor as soft attractor.`);
  R('curlnoise','Curl-noise flow',
`2D curl-noise field; 1500 particles advected through it. Persistence rendering with subtle hue rotation across the field.`);
  R('voronoi','Voronoi tessellation',
`16 moving sites, Voronoi diagram via per-pixel nearest-site at low res, upscaled. Cell colors drift slowly. Black hairline edges.`);
  R('starfield','Hyperspace starfield',
`Stars stream from center to edges with z-projection. Line length scales with speed → motion-blur warp lines.`);
  R('matrixhex','Hex code rain',
`Falling columns of hex digits in mono, color drifting amber → orange. Random "errors" — a column flashes red briefly.`);

  R('typewriter','Typewriter intro',
`Long quote typed one char at a time with a soft mechanical clack (visual jitter on each char). Cursor block at end. Pauses on punctuation.`);
  R('ticker','Stock ticker',
`Single-line scrolling ticker of fake symbols + ± deltas. Greens for up, reds for down. Mono font, hairlines top/bottom.`);
  R('codescroll','Auto-code scroll',
`Mock IDE scrolls source upward continuously. Syntax highlight (keywords purple, strings green, comments gray). Subtle scanline overlay.`);
  R('tape','Caution tape',
`Diagonal striped band slides slowly across the cell with mono text "DO NOT CROSS · DO NOT CROSS ·" embossed.`);
  R('spotlight','Spotlight follow',
`Dark cell. Radial-gradient spotlight follows the cursor revealing a hidden message ("HELLO") below.`);
  R('zoomgrid','Infinite zoom grid',
`A grid that scales up continuously and wraps when scale crosses a threshold → endless zoom-in illusion.`);
  R('flipcards','Flipping pixel grid',
`16×10 grid of small squares; each randomly flips along Y-axis on a staggered loop, revealing alternate color. Flipdot vibe.`);
  R('ledboard','LED dot matrix',
`Black bg, dot-matrix amber LEDs rendering "PORTFOLIO 2026" with a horizontal scroll. Each dot is a small radial gradient circle.`);
  R('rainbow','Rainbow trail',
`A single white dot moves on a sinusoidal path; behind it a rainbow gradient ribbon (segmented rectangles) trails with squashed pixel aesthetic.`);

  // ---------- Attractors / Math ----------
  R('dejong','De Jong attractor',
`Peter De Jong:
  x' = sin(a·y) − cos(b·x)
  y' = sin(c·x) − cos(d·y)
With a=1.4, b=−2.3, c=2.4, d=−2.1. Iterate 80k points/frame; plot at low alpha so density emerges. Slowly drift parameters.`);
  R('clifford','Clifford attractor',
`Clifford:
  x' = sin(a·y) + c·cos(a·x)
  y' = sin(b·x) + d·cos(b·y)
50k points/frame; additive blending; warm palette (orange/red on black).`);
  R('lorenz','Lorenz attractor',
`Lorenz (σ=10, ρ=28, β=8/3) integrated with small dt; project x,z to 2D. Persistent stroked line with low-alpha clear; rotating viewpoint.`);
  R('rossler','Rössler attractor',
`Rössler: dx=−y−z, dy=x+ay, dz=b+z(x−c). a=0.2, b=0.2, c=5.7. Animated 2D projection; white-on-black ink trail.`);
  R('henon','Hénon map',
`Hénon: xₙ₊₁=1−1.4xₙ²+yₙ, yₙ₊₁=0.3xₙ. Iterate 40k points/frame as 1px dots. Drift "a" between 1.0 and 1.4 over time.`);
  R('ikeda','Ikeda map',
`Ikeda map with u=0.918. 60k iterations/frame; low alpha; cool steel-blue palette; spiraling structure emerges.`);
  R('mandel','Mandelbrot zoom',
`Mandelbrot in a low-res ImageData buffer slowly zooming into a fixed point near a seahorse valley. Smooth-iter coloring.`);
  R('julia','Julia set drift',
`Julia set with c on a slow circular path through the M-set boundary. Quarter-res render with warm gradient.`);
  R('newton','Newton fractal',
`Newton fractal for z³−1; color by which root each pixel converges to, brightness by iteration count. Low-res buffer.`);
  R('phyllo','Phyllotaxis',
`Vogel sunflower spiral with golden angle 137.5°. 1500 dots, radius ∝ √n, color drifting around the wheel; slow rotation.`);
  R('rose','Rose curve',
`Polar rose r = cos(k·θ) with k drifting through integers and rationals; continuous stroked path with persistence trails.`);
  R('spirograph','Spirograph',
`Hypotrochoid / epitrochoid with R, r, d slowly drifting. Long persistent path — looks like ink on paper.`);
  R('superformula','Superformula',
`Gielis superformula plotted polar with m, n1, n2, n3 animated. White stroke on black, persistent trail.`);
  R('chladni','Chladni plate',
`f(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy). Particles random-walk biased toward zero crossings; m, n drift slowly.`);
  R('truchet','Truchet tiles',
`Square tiles with two arcs each, randomly oriented, forming continuous flowing curves. Occasional retile of a random cell.`);
  R('apollonian','Apollonian gasket',
`Apollonian gasket recursion to depth 6 starting from 3 mutually tangent circles. Stroke only; line-width by depth.`);
  R('lsystem','L-system fern',
`Stochastic L-system fern. Animated grow-in from base over ~5s. Soft transparent green stroke.`);
  R('tree','Recursive tree',
`Recursive branching tree, depth 9, randomized branch angle and length per draw. Re-draw every 4s with stochastic variation.`);
  R('koch','Koch snowflake',
`Koch snowflake iterating depth 0 → 5 over 5s, then resetting. Thin white stroke on black, soft ease.`);
  R('sierpinski','Sierpinski chaos game',
`Chaos game for Sierpinski triangle: random vertex, jump halfway, plot. 30k iterations/frame; never clear → reveal builds.`);
  R('dragon','Dragon curve',
`Heighway dragon curve at iteration 12, drawn as a single continuous polyline; hue progresses along the curve.`);

  // ---------- Generative / Sim ----------
  R('gol',"Conway's Life",
`Conway's Game of Life on a 100×60 toroidal grid. Random init seeded with gliders + r-pentomino. Tick at 12fps. Black bg, white live cells.`);
  R('langton',"Langton's ant",
`Single ant on a 120×80 grid following Langton's rule. Run thousands of steps/frame so the highway pattern emerges quickly.`);
  R('eca','Elementary CA · rule 30',
`Elementary CA rule 30, scrolling: bottom row computes the next, canvas scrolls up. Black/white pixels.`);
  R('sand','Falling sand',
`Cellular sand sim on 160×90. Two streams spawn at the top. Each frame, each grain falls or slides diagonally. Color by spawn time.`);
  R('piles','Abelian sandpile',
`Drop grains in the center; topple at ≥4 to neighbors. Render counts 0–3 with 4 distinct colors. Mesmerizing fractal grows.`);
  R('forestfire','Forest fire CA',
`empty/tree/burning automaton. Tree growth p, lightning f. Tiny colored cells; slow burns sweep through.`);
  R('predator','Predator-prey',
`Lotka-Volterra style chase: prey wander + reproduce slowly; predators chase nearest prey. Color-coded dots.`);
  R('fluid','2D smoke fluid',
`Stam-style stable fluid solver at 96×64. Inject density + velocity at the cursor. Render density with a warm gradient.`);
  R('wave','Wave equation',
`2D wave equation (FDTD). Initial drop at center; reflect at boundaries with damping. Diverging blue-red palette.`);
  R('inkdrop','Ink drop bloom',
`Drop a high-density ink particle cluster periodically; mild repel, advected by curl noise; persistent low-alpha clear → diffusing bloom.`);
  R('rotozoom','Rotozoomer',
`Classic rotozoomer: per-pixel texture sample with rotating + scaling matrix. Small generated checker texture wrapped.`);
  R('doomfire','Doom fire',
`Bottom row palette index = max; each cell above = below − rand(0..3) with random horizontal jitter. Palette black→red→yellow→white.`);
  R('water','2D ripple water',
`Two-buffer ripple algorithm. Cursor click drops a pulse. Render as horizontal-displaced gradient image — pond surface look.`);
  R('cardstack','Card shuffle',
`Stack of 7 cards centered. Top card flies off in arc, lands at back of deck; staggered loop every 1.2s. Subtle drop shadow & rotation.`);
  R('morphsvg','SVG morph cycle',
`A single path morphs through 5 simple shapes (square → circle → triangle → star → cross) using interpolated path data. Slow ease-in-out.`);
  R('kaleido','Kaleidoscope',
`Capture a slowly-rotating moving pattern (drifting blobs) and mirror it across 8 angular slices around the center. Smooth seamless joins.`);
  R('flowfield','Flow field paths',
`Perlin-driven 2D flow field. 80 walker paths follow the field, leaving thin lines. Periodic reseed at random points.`);
  R('starbirth','Stellar nursery',
`Black bg with thousands of tiny twinkling points; occasional bright star ignites with a soft radial bloom and shrinks back.`);

  R('bubbles','Bubbles',
`Translucent bubbles rise with sinuous lateral motion. Thin highlight, slight squash near surface, pop on click → particle puff.`);
  R('cloth','Verlet cloth',
`Verlet-integrated 16×10 grid pinned at top corners. Gravity + 8 constraint relaxation steps/frame. Drag with the cursor.`);
  R('spring','Spring chain',
`Chain of 24 nodes connected by springs, anchored at one end. Cursor drags the head; rest follows with damped spring physics.`);
  R('delaunay','Delaunay mesh',
`60 points drifting; Delaunay triangulation each frame; render only edges, white on black. Small dot per vertex.`);
  R('fbm','fBm noise field',
`Fractal Brownian Motion: 5 octaves of value-noise summed; sepia gradient palette; slowly translate + warp.`);
  R('sir','SIR epidemic',
`Compartmental SIR-style spatial sim: 600 walkers, infection on contact, recovery time, immunity. Color by state; live counts overlay.`);
  R('reaction','Reaction-diffusion',
`Gray-Scott at 128² resolution, ~5 update steps/frame. Render U as grayscale, upscaled. Periodic perturbation.`);
  R('penrose','Penrose-like tiling',
`Aperiodic-feel tiling using kites/darts arranged in a 5-fold radial layout. 3 muted tones, thin strokes.`);
  R('wireworld','Wireworld signal',
`Tiny Wireworld circuit hand-seeded into a small grid: a few wires with electron heads/tails forming a clock loop.`);
  R('tunnel3','Texture tunnel',
`Demoscene texture tunnel: precompute (u,v) lookup mapping each pixel to texture coords. Animate texture offset; warm checker.`);
  R('hilbert','Hilbert curve build',
`Animated build-out of a Hilbert space-filling curve over ~6s. Hue shifts along the curve.`);

  R('crt2','Mosaic shutter',
`Cell tiles into 64 mini-rectangles that flip Y-axis on staggered timing, revealing a hidden gradient. Auto-loops.`);
  R('barcode','Barcode scroll',
`Vertical bars of varied widths in 5 grays scroll horizontally; periodic red 'scan line' sweeps across.`);
  R('liquid','Liquid blob border',
`Single SVG path that morphs through 6 organic blob outlines using anchor noise drift; soft drop-shadow inside.`);
  R('orbital','Orbital decay',
`A planet on a slowly decaying elliptical orbit around a star; trail fades. After full collapse, reseed at random aphelion.`);
  R('text3d','Pseudo-3D text',
`The word "DEPTH" extruded by stacking ~30 offset copies of itself with decreasing brightness; gentle cursor-driven parallax.`);
  R('halftext','Halftone portrait',
`Centered glyph "@" rendered as a dot-halftone — dot radius proportional to underlying glyph alpha, sampled on a 24×24 grid. Slow rotation.`);

  /* Mounters --------------------------------------------------------- */

  // ripple
  M.ripple = (root) => {
    root.style.background = '#0a0a0a';
    const c = mkCanvas(root); const ctx = c.ctx;
    const ripples = [];
    function spawn(x, y) {
      ripples.push({ x, y, r: 0, t: 0 });
      if (ripples.length > 16) ripples.shift();
    }
    root.addEventListener('click', e => {
      const r = root.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top);
    });
    let last = 0;
    function frame(now) {
      if (!last) last = now;
      const dt = (now - last) / 1000; last = now;
      if (now % 1600 < 16 || ripples.length === 0) {
        if (ripples.length === 0 || (ripples[ripples.length-1].t > 1.6))
          spawn(Math.random()*c.w, Math.random()*c.h);
      }
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, c.w, c.h);
      ctx.lineWidth = 1;
      for (const rp of ripples) {
        rp.t += dt; rp.r += dt * 60;
        const a = Math.max(0, 1 - rp.t / 2);
        ctx.strokeStyle = `rgba(255,91,31,${a})`;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2); ctx.stroke();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  // metaballs
  M.metaballs = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const balls = Array.from({length: 6}, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5)*0.003, vy: (Math.random()-0.5)*0.003,
      r: 0.12 + Math.random()*0.12,
    }));
    function frame() {
      const w = c.iw, h = c.ih;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (const b of balls) {
        b.x += b.vx; b.y += b.vy;
        if (b.x<0.05||b.x>0.95) b.vx*=-1;
        if (b.y<0.05||b.y>0.95) b.vy*=-1;
      }
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let s = 0;
          const fx = x/w, fy = y/h;
          for (const b of balls) {
            const dx = fx - b.x, dy = fy - b.y;
            s += (b.r*b.r) / (dx*dx + dy*dy + 0.0001);
          }
          const i = (y*w + x)*4;
          if (s > 1.6) {
            const k = Math.min(255, (s-1.6)*180);
            d[i] = 255; d[i+1] = 110+k*0.3; d[i+2] = 30; d[i+3] = 255;
          } else {
            d[i] = 0; d[i+1] = 0; d[i+2] = 0; d[i+3] = 255;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // lissajous
  M.lissajous = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t = 0, a = 3, b = 4, ph = 0;
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0,0,c.w,c.h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const cx = c.w/2, cy = c.h/2, R = Math.min(cx, cy)*0.8;
      for (let i = 0; i < 600; i++) {
        const u = (t + i*0.01);
        const x = cx + Math.sin(a*u + ph) * R;
        const y = cy + Math.sin(b*u) * R;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      t += 0.01;
      ph += 0.0007;
      if (Math.random() < 0.003) { a = 1+Math.floor(Math.random()*5); b = 1+Math.floor(Math.random()*5); }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // tunnel
  M.tunnel = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t = 0;
    function frame() {
      t += 0.01;
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2;
      for (let i = 24; i >= 0; i--) {
        const phase = (i + t*4) % 24;
        const k = phase / 24;
        const R = (1 - k) * Math.min(c.w, c.h) * 0.7;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t*0.5 + i*0.2);
        const hue = (i*15 + t*30) % 360;
        ctx.strokeStyle = `hsl(${hue}, 80%, ${30+k*40}%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const sides = 6;
        for (let s = 0; s <= sides; s++) {
          const ang = (s/sides)*Math.PI*2;
          const x = Math.cos(ang)*R, y = Math.sin(ang)*R;
          if (s===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // pendulum / harmonograph
  M.pendulum = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t = 0;
    let p = randomHarmonograph();
    function randomHarmonograph() {
      return {
        f1: 2+Math.random()*3, f2: 2+Math.random()*3,
        f3: 2+Math.random()*3, f4: 2+Math.random()*3,
        p1: Math.random()*Math.PI*2, p2: Math.random()*Math.PI*2,
        p3: Math.random()*Math.PI*2, p4: Math.random()*Math.PI*2,
        d: 0.0008 + Math.random()*0.0008,
        t0: t,
      };
    }
    let last = null;
    function frame() {
      const cx = c.w/2, cy = c.h/2, A = Math.min(cx, cy)*0.6;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 0.6;
      for (let k = 0; k < 80; k++) {
        const tt = t;
        const e = Math.exp(-(tt - p.t0)*p.d);
        const x = cx + A*e*(Math.sin(p.f1*tt + p.p1) + Math.sin(p.f2*tt + p.p2))*0.5;
        const y = cy + A*e*(Math.sin(p.f3*tt + p.p3) + Math.sin(p.f4*tt + p.p4))*0.5;
        if (last) {
          ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(x, y); ctx.stroke();
        }
        last = {x, y};
        t += 0.015;
      }
      if ((t - p.t0) > 60) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,c.w,c.h);
        p = randomHarmonograph(); p.t0 = t; last = null;
      }
      requestAnimationFrame(frame);
    }
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    frame();
  };

  // snow
  M.snow = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let flakes = [];
    function init() {
      flakes = Array.from({length: 200}, () => ({
        x: Math.random()*c.w, y: Math.random()*c.h,
        s: 0.6 + Math.random()*1.6,
        vy: 0.3 + Math.random()*1.5,
        ph: Math.random()*Math.PI*2,
      }));
    }
    init();
    new ResizeObserver(init).observe(root);
    let t = 0;
    function frame() {
      t += 0.02;
      ctx.fillStyle = '#0a0a14'; ctx.fillRect(0,0,c.w,c.h);
      ctx.fillStyle = '#fff';
      for (const f of flakes) {
        f.y += f.vy * f.s;
        f.x += Math.sin(t + f.ph) * 0.3 * f.s;
        if (f.y > c.h) { f.y = -2; f.x = Math.random()*c.w; }
        ctx.globalAlpha = 0.4 + f.s*0.3;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    frame();
  };

  // fireflies
  M.fireflies = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const flies = Array.from({length: 30}, () => ({
      x: Math.random()*c.w, y: Math.random()*c.h, vx: 0, vy: 0, ph: Math.random()*100,
    }));
    let mx = -9999, my = -9999;
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    });
    root.addEventListener('pointerleave', () => { mx = my = -9999; });
    function frame() {
      ctx.fillStyle = 'rgba(5,8,5,0.4)'; ctx.fillRect(0,0,c.w,c.h);
      for (const f of flies) {
        f.vx += (Math.random()-0.5)*0.1;
        f.vy += (Math.random()-0.5)*0.1;
        const dx = mx - f.x, dy = my - f.y, d2 = dx*dx + dy*dy;
        if (d2 < 18000) { f.vx += dx/d2*60; f.vy += dy/d2*60; }
        f.vx *= 0.93; f.vy *= 0.93;
        f.x += f.vx; f.y += f.vy;
        if (f.x<0||f.x>c.w) f.vx*=-1;
        if (f.y<0||f.y>c.h) f.vy*=-1;
        f.ph += 0.06;
        const glow = 0.5 + 0.5*Math.sin(f.ph);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 12);
        g.addColorStop(0, `rgba(220,255,140,${glow})`);
        g.addColorStop(1, 'rgba(220,255,140,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(f.x, f.y, 12, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // firework
  M.firework = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const rockets = [], sparks = [];
    function launch(tx, ty) {
      rockets.push({ x: c.w/2 + (Math.random()-0.5)*c.w*0.4, y: c.h, tx, ty,
        vx: 0, vy: 0, t: 0,
        col: `hsl(${Math.random()*360},90%,60%)` });
    }
    setInterval(() => launch(c.w*Math.random(), c.h*0.2 + Math.random()*c.h*0.3), 1200);
    root.addEventListener('click', e => {
      const r = root.getBoundingClientRect();
      launch(e.clientX-r.left, e.clientY-r.top);
    });
    function explode(x, y, col) {
      for (let i = 0; i < 80; i++) {
        const a = Math.random()*Math.PI*2;
        const sp = 1 + Math.random()*3;
        sparks.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, t: 0, col });
      }
    }
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0,0,c.w,c.h);
      for (let i = rockets.length-1; i >= 0; i--) {
        const r = rockets[i];
        r.t += 0.016;
        r.x += (r.tx - r.x)*0.04;
        r.y += (r.ty - r.y)*0.04;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(r.x, r.y, 1.5, 0, Math.PI*2); ctx.fill();
        if (Math.hypot(r.x-r.tx, r.y-r.ty) < 4) {
          explode(r.x, r.y, r.col);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length-1; i >= 0; i--) {
        const s = sparks[i];
        s.t += 0.016;
        s.vy += 0.06; s.vx *= 0.99; s.vy *= 0.99;
        s.x += s.vx; s.y += s.vy;
        if (s.t > 1.6) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = s.col;
        ctx.globalAlpha = 1 - s.t/1.6;
        ctx.fillRect(s.x, s.y, 2, 2);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    frame();
  };

  // embers
  M.embers = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const ps = [];
    function spawn() {
      ps.push({ x: c.w*(0.2 + Math.random()*0.6), y: c.h+5,
        vx: (Math.random()-0.5)*0.6, vy: -0.8 - Math.random()*1.2, t: 0 });
    }
    function frame() {
      for (let i = 0; i < 4; i++) spawn();
      ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(0,0,c.w,c.h);
      for (let i = ps.length-1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx + Math.sin(p.t*4)*0.3;
        p.y += p.vy;
        p.vy *= 0.99;
        p.t += 0.016;
        if (p.y < 0 || p.t > 3) { ps.splice(i, 1); continue; }
        const k = p.t/3;
        const r = 90 + Math.floor((1-k)*120);
        const g = 30 + Math.floor((1-k)*120);
        const b = 10 + Math.floor((1-k)*40);
        ctx.fillStyle = `rgba(${255-k*60},${r},${b},${1-k})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // rain
  M.rain = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const drops = Array.from({length: 200}, () => ({
      x: Math.random()*c.w, y: Math.random()*c.h, sp: 6 + Math.random()*8,
    }));
    function frame() {
      ctx.fillStyle = 'rgba(0,0,15,0.35)'; ctx.fillRect(0,0,c.w,c.h);
      ctx.strokeStyle = 'rgba(180,210,255,0.6)';
      ctx.lineWidth = 1;
      for (const d of drops) {
        d.y += d.sp; d.x += d.sp*0.3;
        if (d.y > c.h) { d.y = -10; d.x = Math.random()*c.w; }
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.sp*0.3, d.y - d.sp);
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // flock (boids)
  M.flock = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 80;
    const boids = Array.from({length: N}, () => ({
      x: Math.random()*c.w, y: Math.random()*c.h,
      vx: (Math.random()-0.5)*1, vy: (Math.random()-0.5)*1,
    }));
    let mx = -9999, my = -9999;
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      mx = e.clientX-r.left; my = e.clientY-r.top;
    });
    root.addEventListener('pointerleave', () => { mx = my = -9999; });
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0,0,c.w,c.h);
      for (const b of boids) {
        let sx=0, sy=0, ax=0, ay=0, cx=0, cy=0, n=0;
        for (const o of boids) {
          if (o === b) continue;
          const dx = o.x - b.x, dy = o.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d > 0 && d < 40) {
            ax += o.vx; ay += o.vy;
            cx += o.x; cy += o.y;
            n++;
            if (d < 16) { sx -= dx/d; sy -= dy/d; }
          }
        }
        if (n > 0) {
          ax /= n; ay /= n; cx /= n; cy /= n;
          b.vx += (ax - b.vx)*0.04 + (cx - b.x)*0.001 + sx*0.06;
          b.vy += (ay - b.vy)*0.04 + (cy - b.y)*0.001 + sy*0.06;
        }
        const dxm = mx - b.x, dym = my - b.y, d2 = dxm*dxm + dym*dym;
        if (d2 < 12000) { b.vx += dxm/d2*30; b.vy += dym/d2*30; }
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 2.4) { b.vx = b.vx/sp*2.4; b.vy = b.vy/sp*2.4; }
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) b.x += c.w; if (b.x > c.w) b.x -= c.w;
        if (b.y < 0) b.y += c.h; if (b.y > c.h) b.y -= c.h;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(b.x, b.y, 1.4, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // curl-noise
  M.curlnoise = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 800;
    const ps = Array.from({length: N}, () => ({
      x: Math.random()*c.w, y: Math.random()*c.h,
    }));
    function n2(x, y) {
      return Math.sin(x*0.012 + y*0.008) * Math.cos(x*0.009 - y*0.011);
    }
    let t = 0;
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fillRect(0,0,c.w,c.h);
      t += 0.005;
      for (const p of ps) {
        const n0 = n2(p.x, p.y + t*100);
        const dx = (n2(p.x, p.y+1+t*100) - n0);
        const dy = (n2(p.x+1, p.y+t*100) - n0);
        p.x += dy * 18;
        p.y -= dx * 18;
        if (p.x < 0) p.x = c.w; if (p.x > c.w) p.x = 0;
        if (p.y < 0) p.y = c.h; if (p.y > c.h) p.y = 0;
        const hue = (p.x/c.w * 60 + 200) | 0;
        ctx.fillStyle = `hsla(${hue},70%,60%,0.5)`;
        ctx.fillRect(p.x|0, p.y|0, 1, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // voronoi
  M.voronoi = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const sites = Array.from({length: 14}, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5)*0.001, vy: (Math.random()-0.5)*0.001,
      hue: Math.random()*360,
    }));
    function frame() {
      const w = c.iw, h = c.ih;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (const s of sites) {
        s.x += s.vx; s.y += s.vy;
        if (s.x<0.05||s.x>0.95) s.vx*=-1;
        if (s.y<0.05||s.y>0.95) s.vy*=-1;
      }
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let bd = Infinity, bi = 0;
          const fx = x/w, fy = y/h;
          for (let i = 0; i < sites.length; i++) {
            const s = sites[i];
            const dx = fx - s.x, dy = fy - s.y;
            const dd = dx*dx + dy*dy;
            if (dd < bd) { bd = dd; bi = i; }
          }
          const s = sites[bi];
          const idx = (y*w + x)*4;
          // color by hue
          const c1 = hsl2rgb(s.hue, 0.5, 0.4);
          d[idx] = c1[0]; d[idx+1] = c1[1]; d[idx+2] = c1[2]; d[idx+3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // starfield
  M.starfield = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 200;
    const ss = Array.from({length: N}, () => ({
      x: (Math.random()-0.5), y: (Math.random()-0.5), z: Math.random(),
    }));
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      for (const s of ss) {
        const px = (s.x/s.z) * c.w * 0.5 + cx;
        const py = (s.y/s.z) * c.h * 0.5 + cy;
        s.z -= 0.005;
        if (s.z <= 0.05) { s.z = 1; s.x = (Math.random()-0.5); s.y = (Math.random()-0.5); }
        const px2 = (s.x/(s.z+0.005)) * c.w * 0.5 + cx;
        const py2 = (s.y/(s.z+0.005)) * c.h * 0.5 + cy;
        ctx.beginPath(); ctx.moveTo(px2, py2); ctx.lineTo(px, py); ctx.stroke();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // matrixhex
  M.matrixhex = (root) => {
    root.style.background = '#0a0500';
    root.style.fontFamily = 'inherit';
    root.style.fontSize = '12px';
    root.style.lineHeight = '1';
    root.style.overflow = 'hidden';
    function build() {
      root.innerHTML = '';
      const cols = Math.ceil(root.clientWidth / 12);
      for (let i = 0; i < cols; i++) {
        const col = document.createElement('div');
        col.style.position = 'absolute';
        col.style.left = (i*12)+'px';
        col.style.top = '-100%';
        col.style.color = '#ffaa30';
        col.style.whiteSpace = 'pre';
        col.style.textAlign = 'center';
        let s = '';
        for (let j = 0; j < 18; j++) s += Math.floor(Math.random()*16).toString(16).toUpperCase()+'\n';
        col.textContent = s;
        const dur = 4 + Math.random()*4;
        col.animate(
          [{transform:'translateY(0)'},{transform:'translateY(220%)'}],
          { duration: dur*1000, iterations: Infinity, delay: -Math.random()*dur*1000 }
        );
        if (Math.random() < 0.05) col.style.color = '#ff3030';
        root.appendChild(col);
      }
    }
    build();
    new ResizeObserver(build).observe(root);
  };

  // typewriter
  M.typewriter = (root) => {
    root.style.cssText += 'background:#f3eede;color:#222;padding:18px;font-size:13px;line-height:1.6;overflow:hidden;';
    const corpus = `"Design is intelligence made visible."

we type it slowly, like a key was hit.
each char nudges the line just a hair.

— a portfolio note, 2026`;
    const txt = document.createElement('div'); root.appendChild(txt);
    const cur = document.createElement('span');
    cur.textContent = '▮'; cur.style.cssText = 'animation:blink .7s steps(2) infinite;';
    let i = 0, jit = 0;
    function step() {
      if (i >= corpus.length) {
        setTimeout(() => { txt.textContent = ''; i = 0; step(); }, 1200);
        return;
      }
      const ch = corpus[i++];
      txt.textContent += ch;
      jit = (Math.random()-0.5)*1.5;
      txt.style.transform = `translate(${jit}px,0)`;
      const pause = ch === '.' || ch === ',' ? 220 : (40 + Math.random()*60);
      setTimeout(step, pause);
    }
    root.appendChild(cur);
    step();
  };

  // ticker
  M.ticker = (root) => {
    root.style.cssText += 'background:#000;display:flex;align-items:center;overflow:hidden;border-top:1px solid #222;border-bottom:1px solid #222;';
    const track = document.createElement('div');
    track.style.cssText = 'display:flex;gap:18px;white-space:nowrap;font-size:13px;animation:marq 30s linear infinite;';
    const sym = ['NVDA','AAPL','TSLA','GOOG','BTC','ETH','META','AMD','MSFT','SOL','SHOP','NFLX'];
    let html = '';
    for (let d = 0; d < 2; d++) {
      for (const s of sym) {
        const up = Math.random() > 0.5;
        const v = (Math.random()*5).toFixed(2);
        const col = up ? '#4be07a' : '#ff5555';
        html += `<span style="color:#fff">${s}</span> <span style="color:${col}">${up?'▲':'▼'} ${v}%</span>  `;
      }
    }
    track.innerHTML = html;
    root.appendChild(track);
  };

  // codescroll
  M.codescroll = (root) => {
    root.style.cssText += 'background:#0e1117;color:#9ba0a8;font-size:11px;line-height:1.5;overflow:hidden;padding:10px;';
    const lines = [
      ['function','#c084fc'],['render',''],['(){',''],
      ['const','#c084fc'],[' s = ',''],["'hi'",'#7ee787'],[';',''],
      ['// loop','#666'],
      ['for','#c084fc'],[' (let i=0; i<n; i++) {',''],
      ['  ctx.beginPath();',''],
      ['  ctx.arc(x, y, r, 0, π2);',''],
      ['}',''],['',''],
    ];
    const lineHTML = lines.map(([t,c]) =>
      c ? `<span style="color:${c}">${t}</span>` : `<span>${t}</span>`).join('');
    const block = `<div>${lineHTML}</div>`;
    let bigHTML = '';
    for (let i = 0; i < 40; i++) bigHTML += block;
    const inner = document.createElement('div');
    inner.innerHTML = bigHTML;
    inner.style.cssText = 'animation: scrollUp 40s linear infinite;';
    root.appendChild(inner);
    if (!document.getElementById('__scrollUpStyle')) {
      const st = document.createElement('style'); st.id = '__scrollUpStyle';
      st.textContent = `@keyframes scrollUp { to { transform: translateY(-50%); } }`;
      document.head.appendChild(st);
    }
  };

  // tape
  M.tape = (root) => {
    root.style.cssText += 'background:#222;overflow:hidden;display:grid;place-items:center;';
    const band = document.createElement('div');
    band.style.cssText = `
      position:absolute; left:-25%; right:-25%; top:38%;
      height:24%; background: repeating-linear-gradient(45deg,
        #ffd400 0 18px, #000 18px 36px);
      transform: rotate(-12deg);
      display: flex; align-items: center;
      animation: tapeRun 18s linear infinite;
      font-weight: 700; letter-spacing: 0.16em; color: #000;
      font-size: 14px; white-space: nowrap;
    `;
    let s = '';
    for (let i = 0; i < 30; i++) s += '<span style="padding:0 26px">DO NOT CROSS ·</span>';
    band.innerHTML = s;
    root.appendChild(band);
    if (!document.getElementById('__tapeStyle')) {
      const st = document.createElement('style'); st.id = '__tapeStyle';
      st.textContent = `@keyframes tapeRun { to { transform: rotate(-12deg) translateX(-30%); } }`;
      document.head.appendChild(st);
    }
  };

  // spotlight
  M.spotlight = (root) => {
    root.style.cssText += 'background:#000;display:grid;place-items:center;color:transparent;font-weight:700;font-size:36px;letter-spacing:0.18em;';
    root.dataset.txt = 'HELLO';
    const txt = document.createElement('div');
    txt.textContent = 'HELLO';
    txt.style.color = '#fff';
    root.appendChild(txt);
    const ov = document.createElement('div');
    ov.style.cssText = 'position:absolute; inset:0; background:#000; mix-blend-mode: multiply;';
    ov.style.background = 'radial-gradient(circle at 50% 50%, transparent 0px, transparent 60px, #000 90px)';
    root.appendChild(ov);
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      ov.style.background = `radial-gradient(circle at ${x}px ${y}px, transparent 0px, transparent 60px, #000 90px)`;
    });
  };

  // zoomgrid
  M.zoomgrid = (root) => {
    root.style.cssText += 'background:#0a0a0a;overflow:hidden;perspective:600px;';
    const g = document.createElement('div');
    g.style.cssText = `
      position:absolute; inset:-50%;
      background-image:
        linear-gradient(#ff5b1f33 1px, transparent 1px),
        linear-gradient(90deg, #ff5b1f33 1px, transparent 1px);
      background-size: 40px 40px;
      animation: zoomG 6s linear infinite;
    `;
    root.appendChild(g);
    if (!document.getElementById('__zgStyle')) {
      const st = document.createElement('style'); st.id = '__zgStyle';
      st.textContent = `@keyframes zoomG { from { transform: scale(1); } to { transform: scale(4); } }`;
      document.head.appendChild(st);
    }
  };

  // flipcards
  M.flipcards = (root) => {
    root.style.cssText += 'background:#0a0a0a;display:grid;grid-template-columns:repeat(16,1fr);gap:0;';
    for (let i = 0; i < 16*12; i++) {
      const c = document.createElement('div');
      c.style.cssText = `
        aspect-ratio:1/1; background:#1a1a1a;
        position:relative; transform-style:preserve-3d;
        animation: flipDot ${2 + Math.random()*3}s infinite;
        animation-delay: ${Math.random()*4}s;
      `;
      const front = document.createElement('div');
      front.style.cssText = 'position:absolute;inset:1px;background:#ff5b1f;backface-visibility:hidden;transform:rotateY(180deg);';
      c.appendChild(front);
      root.appendChild(c);
    }
    if (!document.getElementById('__flipStyle')) {
      const st = document.createElement('style'); st.id = '__flipStyle';
      st.textContent = `@keyframes flipDot { 0%,40%,100% { transform: rotateY(0); } 50%,90% { transform: rotateY(180deg); } }`;
      document.head.appendChild(st);
    }
  };

  // ledboard
  M.ledboard = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    // 5x7 font: minimal letters needed
    const F = {
      P:[".XXX.","X...X","X...X","XXXX.","X....","X....","X...."],
      O:[".XXX.","X...X","X...X","X...X","X...X","X...X",".XXX."],
      R:["XXXX.","X...X","X...X","XXXX.","X.X..","X..X.","X...X"],
      T:["XXXXX","..X..","..X..","..X..","..X..","..X..","..X.."],
      F:["XXXXX","X....","X....","XXXX.","X....","X....","X...."],
      L:["X....","X....","X....","X....","X....","X....","XXXXX"],
      I:["XXXXX","..X..","..X..","..X..","..X..","..X..","XXXXX"],
      "2":[".XXX.","X...X","....X","..XX.",".X...","X....","XXXXX"],
      "0":[".XXX.","X...X","X..XX","X.X.X","XX..X","X...X",".XXX."],
      "6":[".XXX.","X....","X....","XXXX.","X...X","X...X",".XXX."],
      " ":[".....",".....",".....",".....",".....",".....","....."],
    };
    const TXT = "PORTFOLIO 2026 ";
    let off = 0;
    function frame() {
      ctx.fillStyle = '#100806'; ctx.fillRect(0,0,c.w,c.h);
      const dot = 5;
      const cols = Math.ceil(c.w/dot);
      const rows = Math.floor(c.h/dot);
      const yOffset = Math.floor((rows - 7)/2);
      for (let cx = 0; cx < cols; cx++) {
        const charIdx = Math.floor((cx + off)/6) % TXT.length;
        const within = ((cx + off) % 6);
        const ch = TXT[charIdx];
        const glyph = F[ch] || F[' '];
        for (let cy = 0; cy < 7; cy++) {
          const lit = within < 5 && glyph[cy][within] === 'X';
          ctx.fillStyle = lit ? '#ffae20' : '#332014';
          ctx.beginPath();
          ctx.arc(cx*dot + dot/2, (cy + yOffset)*dot + dot/2, dot*0.35, 0, Math.PI*2);
          ctx.fill();
        }
      }
      off += 0.18;
      requestAnimationFrame(frame);
    }
    frame();
  };

  // rainbow trail
  M.rainbow = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t = 0;
    const colors = ['#ff3b30','#ff9500','#ffcc00','#34c759','#5ac8fa','#af52de'];
    function frame() {
      ctx.fillStyle = 'rgba(0,0,30,0.18)'; ctx.fillRect(0,0,c.w,c.h);
      t += 0.04;
      const x = (t*40) % (c.w + 60) - 30;
      const y = c.h/2 + Math.sin(t*1.4) * c.h*0.25;
      for (let i = 0; i < 18; i++) {
        const xi = x - i*4;
        const yi = c.h/2 + Math.sin(t*1.4 - i*0.18) * c.h*0.25;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(xi - 4, yi - 12, 4, 24);
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // De Jong attractor
  M.dejong = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let a = 1.4, b = -2.3, cP = 2.4, dP = -2.1;
    let x = 0.1, y = 0.1, t = 0;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.02)'; ctx.fillRect(0,0,c.w,c.h);
      t += 0.005;
      a = 1.4 + Math.sin(t)*0.4;
      b = -2.3 + Math.cos(t*0.8)*0.3;
      const cx = c.w/2, cy = c.h/2, S = Math.min(c.w, c.h)*0.22;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 25000; i++) {
        const nx = Math.sin(a*y) - Math.cos(b*x);
        const ny = Math.sin(cP*x) - Math.cos(dP*y);
        x = nx; y = ny;
        ctx.fillRect((cx + x*S)|0, (cy + y*S)|0, 1, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Clifford
  M.clifford = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let a = -1.4, b = 1.6, cP = 1.0, dP = 0.7;
    let x = 0.1, y = 0.1, t = 0;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.02)'; ctx.fillRect(0,0,c.w,c.h);
      t += 0.003;
      a = -1.4 + Math.sin(t)*0.3;
      cP = 1.0 + Math.cos(t*0.7)*0.4;
      const cx = c.w/2, cy = c.h/2, S = Math.min(c.w, c.h)*0.3;
      for (let i = 0; i < 20000; i++) {
        const nx = Math.sin(a*y) + cP*Math.cos(a*x);
        const ny = Math.sin(b*x) + dP*Math.cos(b*y);
        x = nx; y = ny;
        const hue = 20 + (Math.atan2(y, x)*60/Math.PI + 60);
        ctx.fillStyle = `hsla(${hue},85%,60%,0.05)`;
        ctx.fillRect((cx + x*S)|0, (cy + y*S)|0, 1, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Lorenz
  M.lorenz = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let x = 1, y = 1, z = 1, t = 0;
    const sigma = 10, rho = 28, beta = 8/3;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    let last = null;
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0,0,c.w,c.h);
      t += 0.005;
      const ang = t;
      const cx = c.w/2, cy = c.h*0.55, S = Math.min(c.w, c.h)*0.018;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 800; i++) {
        const dt = 0.005;
        const dx = sigma*(y - x);
        const dy = x*(rho - z) - y;
        const dz = x*y - beta*z;
        x += dx*dt; y += dy*dt; z += dz*dt;
        const px = cx + (x*Math.cos(ang) - y*Math.sin(ang))*S;
        const py = cy + (z - 25)*S;
        if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(px, py); }
        last = { x: px, y: py };
      }
      ctx.stroke();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Rössler
  M.rossler = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let x = 1, y = 1, z = 1;
    const a = 0.2, b = 0.2, cR = 5.7;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    let last = null;
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2, S = Math.min(c.w, c.h)*0.04;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 600; i++) {
        const dt = 0.02;
        const dx = -y - z;
        const dy = x + a*y;
        const dz = b + z*(x - cR);
        x += dx*dt; y += dy*dt; z += dz*dt;
        const px = cx + x*S;
        const py = cy + y*S;
        if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(px, py); }
        last = { x: px, y: py };
      }
      ctx.stroke();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Hénon
  M.henon = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let x = 0, y = 0, t = 0;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.fillRect(0,0,c.w,c.h);
      t += 0.003;
      const a = 1.0 + (Math.sin(t)*0.5 + 0.5)*0.4;
      const cx = c.w/2, cy = c.h/2, S = Math.min(c.w, c.h)*0.4;
      ctx.fillStyle = 'rgba(255,200,80,0.08)';
      for (let i = 0; i < 15000; i++) {
        const nx = 1 - a*x*x + y;
        const ny = 0.3*x;
        x = nx; y = ny;
        ctx.fillRect((cx + x*S)|0, (cy + y*S*2.5)|0, 1, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Ikeda
  M.ikeda = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let x = 0.1, y = 0.1;
    const u = 0.918;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.02)'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w*0.6, cy = c.h/2, S = Math.min(c.w, c.h)*0.16;
      ctx.fillStyle = 'rgba(140,200,255,0.05)';
      for (let i = 0; i < 30000; i++) {
        const tt = 0.4 - 6/(1 + x*x + y*y);
        const nx = 1 + u*(x*Math.cos(tt) - y*Math.sin(tt));
        const ny = u*(x*Math.sin(tt) + y*Math.cos(tt));
        x = nx; y = ny;
        ctx.fillRect((cx + x*S)|0, (cy + y*S)|0, 1, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Mandelbrot zoom
  M.mandel = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    let zoom = 1, t = 0;
    const cx0 = -0.745, cy0 = 0.113;
    function frame() {
      const w = c.iw, h = c.ih;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      const scale = 1.5/zoom;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const cx = cx0 + ((x/w) - 0.5)*scale;
          const cy = cy0 + ((y/h) - 0.5)*scale;
          let zr = 0, zi = 0, n = 0;
          for (; n < 60; n++) {
            const zr2 = zr*zr - zi*zi + cx;
            zi = 2*zr*zi + cy; zr = zr2;
            if (zr*zr + zi*zi > 4) break;
          }
          const k = n/60;
          const idx = (y*w + x)*4;
          d[idx] = Math.floor(255*Math.sin(k*5)*0.5 + 128);
          d[idx+1] = Math.floor(255*Math.sin(k*5 + 2)*0.5 + 128);
          d[idx+2] = Math.floor(255*Math.sin(k*5 + 4)*0.5 + 128);
          d[idx+3] = 255;
          if (n === 60) { d[idx]=d[idx+1]=d[idx+2]=0; }
        }
      }
      ctx.putImageData(img, 0, 0);
      zoom *= 1.01;
      if (zoom > 30) zoom = 1;
      t += 0.01;
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Julia
  M.julia = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    let t = 0;
    function frame() {
      t += 0.005;
      const cr = 0.7885*Math.cos(t);
      const ci = 0.7885*Math.sin(t);
      const w = c.iw, h = c.ih;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let zr = ((x/w) - 0.5)*3, zi = ((y/h) - 0.5)*3;
          let n = 0;
          for (; n < 50; n++) {
            const zr2 = zr*zr - zi*zi + cr;
            zi = 2*zr*zi + ci; zr = zr2;
            if (zr*zr + zi*zi > 4) break;
          }
          const k = n/50;
          const idx = (y*w + x)*4;
          d[idx]   = Math.floor(255*k);
          d[idx+1] = Math.floor(120*k);
          d[idx+2] = Math.floor(60*(1-k));
          d[idx+3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Newton fractal
  M.newton = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    let t = 0;
    const roots = [
      {r:1, i:0, col:[255,90,30]},
      {r:-0.5, i:Math.sqrt(3)/2, col:[120,210,80]},
      {r:-0.5, i:-Math.sqrt(3)/2, col:[80,180,240]},
    ];
    function frame() {
      t += 0.01;
      const w = c.iw, h = c.ih;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let zr = ((x/w) - 0.5)*3, zi = ((y/h) - 0.5)*3;
          let n = 0;
          for (; n < 30; n++) {
            const r2 = zr*zr - zi*zi;
            const i2 = 2*zr*zi;
            const r3 = r2*zr - i2*zi;
            const i3 = r2*zi + i2*zr;
            const dr = 3*r2;
            const di = 3*i2;
            const den = dr*dr + di*di;
            const fr = r3 - 1;
            const fi = i3;
            const dx = (fr*dr + fi*di)/den;
            const dy = (fi*dr - fr*di)/den;
            zr -= dx; zi -= dy;
            let conv = false;
            for (const rt of roots) {
              if ((zr-rt.r)*(zr-rt.r) + (zi-rt.i)*(zi-rt.i) < 0.001) {
                const k = 1 - n/30;
                const idx = (y*w + x)*4;
                d[idx] = rt.col[0]*k; d[idx+1] = rt.col[1]*k; d[idx+2] = rt.col[2]*k; d[idx+3] = 255;
                conv = true; break;
              }
            }
            if (conv) break;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // phyllotaxis
  M.phyllo = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let rot = 0;
    function frame() {
      rot += 0.003;
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2;
      const phi = 137.5 * Math.PI/180;
      const s = Math.min(c.w, c.h)*0.015;
      for (let n = 0; n < 1500; n++) {
        const a = n * phi + rot;
        const r = s * Math.sqrt(n);
        const x = cx + Math.cos(a)*r;
        const y = cy + Math.sin(a)*r;
        const hue = (n*0.6 + rot*60) % 360;
        ctx.fillStyle = `hsl(${hue},70%,60%)`;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // rose
  M.rose = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t = 0, k = 5;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    function frame() {
      t += 0.01;
      ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2, R = Math.min(cx, cy)*0.8;
      k = 3 + (Math.sin(t*0.3)*0.5+0.5)*5;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let i = 0; i < 800; i++) {
        const th = i/800 * Math.PI*4 + t;
        const r = R * Math.cos(k*th);
        const x = cx + Math.cos(th)*r;
        const y = cy + Math.sin(th)*r;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // spirograph
  M.spirograph = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    ctx.fillStyle = '#fdfcf2'; ctx.fillRect(0,0,c.w,c.h);
    let R = 100, r = 30, dd = 50, t = 0, last = null;
    function frame() {
      ctx.strokeStyle = 'rgba(70,40,140,0.6)';
      ctx.lineWidth = 0.6;
      const cx = c.w/2, cy = c.h/2;
      const S = Math.min(c.w, c.h)*0.003;
      ctx.beginPath();
      for (let k = 0; k < 200; k++) {
        const x = cx + ((R-r)*Math.cos(t) + dd*Math.cos((R-r)/r*t))*S;
        const y = cy + ((R-r)*Math.sin(t) - dd*Math.sin((R-r)/r*t))*S;
        if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(x, y); }
        last = {x, y};
        t += 0.02;
      }
      ctx.stroke();
      if (t > 600) {
        ctx.fillStyle = 'rgba(253,252,242,0.7)'; ctx.fillRect(0,0,c.w,c.h);
        R = 60+Math.random()*60; r = 10+Math.random()*40; dd = 20+Math.random()*60;
        t = 0; last = null;
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // superformula
  M.superformula = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t = 0;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    function sf(phi, m, n1, n2, n3) {
      const a = 1, b = 1;
      return Math.pow(
        Math.pow(Math.abs(Math.cos(m*phi/4)/a), n2) +
        Math.pow(Math.abs(Math.sin(m*phi/4)/b), n3),
        -1/n1
      );
    }
    function frame() {
      t += 0.005;
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2, S = Math.min(c.w, c.h)*0.35;
      const m = 4 + Math.sin(t)*3;
      const n1 = 0.3 + Math.abs(Math.cos(t*0.7))*1.5;
      const n2 = 1.7 + Math.sin(t*0.4)*1.2;
      const n3 = 1.7 + Math.cos(t*0.5)*1.2;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 720; i++) {
        const ph = i/720 * Math.PI*2;
        const r = sf(ph, m, n1, n2, n3) * S;
        const x = cx + Math.cos(ph)*r;
        const y = cy + Math.sin(ph)*r;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // chladni
  M.chladni = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 600;
    const ps = Array.from({length: N}, () => ({ x: Math.random(), y: Math.random() }));
    let t = 0, m = 3, n = 4;
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0,0,c.w,c.h);
      t += 0.005;
      if (Math.random() < 0.005) { m = 1 + Math.floor(Math.random()*6); n = 1 + Math.floor(Math.random()*6); }
      ctx.fillStyle = '#fff';
      for (const p of ps) {
        const v = Math.cos(n*Math.PI*p.x)*Math.cos(m*Math.PI*p.y) -
                  Math.cos(m*Math.PI*p.x)*Math.cos(n*Math.PI*p.y);
        const stoch = Math.abs(v);
        p.x += (Math.random()-0.5) * stoch * 0.04;
        p.y += (Math.random()-0.5) * stoch * 0.04;
        p.x = Math.max(0, Math.min(1, p.x));
        p.y = Math.max(0, Math.min(1, p.y));
        ctx.fillRect((p.x*c.w)|0, (p.y*c.h)|0, 1.5, 1.5);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // truchet
  M.truchet = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const SIZE = 36;
    let cells = [];
    function init() {
      cells = [];
      const cols = Math.ceil(c.w/SIZE), rows = Math.ceil(c.h/SIZE);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++)
        cells.push({ x, y, o: Math.random() < 0.5 ? 0 : 1 });
    }
    init();
    new ResizeObserver(init).observe(root);
    function draw() {
      ctx.fillStyle = '#0f1014'; ctx.fillRect(0,0,c.w,c.h);
      ctx.strokeStyle = '#ffe1b8'; ctx.lineWidth = 2.5;
      for (const cl of cells) {
        const px = cl.x*SIZE, py = cl.y*SIZE;
        ctx.beginPath();
        if (cl.o === 0) {
          ctx.arc(px, py, SIZE/2, 0, Math.PI/2);
          ctx.moveTo(px+SIZE, py+SIZE);
          ctx.arc(px+SIZE, py+SIZE, SIZE/2, Math.PI, Math.PI*1.5);
        } else {
          ctx.arc(px+SIZE, py, SIZE/2, Math.PI/2, Math.PI);
          ctx.moveTo(px, py+SIZE);
          ctx.arc(px, py+SIZE, SIZE/2, -Math.PI/2, 0);
        }
        ctx.stroke();
      }
    }
    draw();
    setInterval(() => {
      const cl = cells[Math.floor(Math.random()*cells.length)];
      cl.o = 1 - cl.o; draw();
    }, 80);
  };

  // apollonian (simplified)
  M.apollonian = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    function draw() {
      ctx.fillStyle = '#fefefa'; ctx.fillRect(0,0,c.w,c.h);
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1;
      const cx = c.w/2, cy = c.h/2, R = Math.min(cx, cy)*0.85;
      function circ(x, y, r, depth) {
        if (r < 1.5 || depth > 6) return;
        ctx.lineWidth = Math.max(0.4, 1.5 - depth*0.2);
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const a = i*2*Math.PI/3 + depth*0.3;
          const nx = x + Math.cos(a)*r*0.5;
          const ny = y + Math.sin(a)*r*0.5;
          circ(nx, ny, r*0.5, depth+1);
        }
      }
      circ(cx, cy, R, 0);
    }
    draw();
    new ResizeObserver(draw).observe(root);
  };

  // L-system fern
  M.lsystem = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t0 = performance.now();
    function draw(growth) {
      ctx.fillStyle = '#0a0f0a'; ctx.fillRect(0,0,c.w,c.h);
      ctx.strokeStyle = 'rgba(120,210,90,0.7)';
      ctx.lineWidth = 1;
      const stack = [];
      let x = c.w/2, y = c.h - 8, ang = -Math.PI/2;
      const len = Math.min(c.w, c.h)*0.012;
      const seq = "FFXFXFFXFXX"; // tiny stand-in
      function recur(depth) {
        if (depth <= 0) return;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          const nx = x + Math.cos(ang)*len;
          const ny = y + Math.sin(ang)*len;
          if (growth*100 > i + depth*4) { ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke(); x = nx; y = ny; }
          stack.push([x, y, ang]);
          ang -= 0.4 + (Math.random()-0.5)*0.1;
          recur(depth - 1);
          [x, y, ang] = stack.pop();
          stack.push([x, y, ang]);
          ang += 0.4 + (Math.random()-0.5)*0.1;
          recur(depth - 1);
          [x, y, ang] = stack.pop();
        }
      }
      recur(3);
    }
    function frame() {
      const t = (performance.now() - t0)/5000;
      draw(Math.min(1, t));
      if (t > 1.6) t0 = performance.now();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // recursive tree
  M.tree = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    function draw() {
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,c.w,c.h);
      ctx.strokeStyle = 'rgba(255,220,180,0.7)';
      function branch(x, y, len, ang, depth) {
        if (depth <= 0 || len < 2) return;
        const x2 = x + Math.cos(ang)*len;
        const y2 = y + Math.sin(ang)*len;
        ctx.lineWidth = depth*0.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        const da = 0.35 + Math.random()*0.25;
        branch(x2, y2, len*(0.65 + Math.random()*0.15), ang - da, depth - 1);
        branch(x2, y2, len*(0.65 + Math.random()*0.15), ang + da, depth - 1);
      }
      branch(c.w/2, c.h - 4, Math.min(c.w, c.h)*0.18, -Math.PI/2, 9);
    }
    draw();
    setInterval(draw, 4000);
  };

  // koch
  M.koch = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t0 = performance.now();
    function koch(p1, p2, depth) {
      if (depth === 0) {
        ctx.lineTo(p2[0], p2[1]);
        return;
      }
      const dx = p2[0]-p1[0], dy = p2[1]-p1[1];
      const a = [p1[0]+dx/3, p1[1]+dy/3];
      const b = [p1[0]+2*dx/3, p1[1]+2*dy/3];
      const ang = Math.atan2(dy, dx) - Math.PI/3;
      const dist = Math.hypot(dx, dy)/3;
      const peak = [a[0]+Math.cos(ang)*dist, a[1]+Math.sin(ang)*dist];
      koch(p1, a, depth-1);
      koch(a, peak, depth-1);
      koch(peak, b, depth-1);
      koch(b, p2, depth-1);
    }
    function frame() {
      const t = ((performance.now() - t0)/5000) % 1;
      const depth = Math.floor(t*5);
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2, R = Math.min(cx, cy)*0.7;
      const verts = [];
      for (let i = 0; i < 3; i++) {
        const a = i*2*Math.PI/3 - Math.PI/2;
        verts.push([cx+Math.cos(a)*R, cy+Math.sin(a)*R]);
      }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(verts[0][0], verts[0][1]);
      for (let i = 0; i < 3; i++) koch(verts[i], verts[(i+1)%3], depth);
      ctx.closePath(); ctx.stroke();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // sierpinski chaos
  M.sierpinski = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    let x = 0, y = 0;
    const cx = c.w/2, cy = c.h/2, R = Math.min(cx, cy)*0.85;
    const verts = [];
    for (let i = 0; i < 3; i++) {
      const a = i*2*Math.PI/3 - Math.PI/2;
      verts.push([cx+Math.cos(a)*R, cy+Math.sin(a)*R]);
    }
    x = cx; y = cy;
    function frame() {
      ctx.fillStyle = 'rgba(255,140,80,0.5)';
      for (let i = 0; i < 8000; i++) {
        const v = verts[Math.floor(Math.random()*3)];
        x = (x + v[0])/2; y = (y + v[1])/2;
        ctx.fillRect(x|0, y|0, 1, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // dragon
  M.dragon = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let depth = 12;
    function frame() {
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,c.w,c.h);
      // Generate L-system: iterate {X→X+YF+, Y→-FX-Y}
      let x = "FX";
      for (let i = 0; i < depth; i++) {
        let n = "";
        for (const ch of x) {
          if (ch === 'X') n += "X+YF+";
          else if (ch === 'Y') n += "-FX-Y";
          else n += ch;
        }
        x = n;
        if (x.length > 200000) break;
      }
      let cx = c.w/2, cy = c.h/2, ang = 0;
      const step = Math.min(c.w, c.h) * 0.6 / Math.pow(2, depth/2);
      ctx.lineWidth = 1;
      let prevX = cx, prevY = cy;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      let i = 0;
      for (const ch of x) {
        if (ch === 'F') {
          cx += Math.cos(ang)*step;
          cy += Math.sin(ang)*step;
          const hue = (i/x.length * 280 + 30);
          ctx.strokeStyle = `hsl(${hue},80%,60%)`;
          ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(cx, cy); ctx.stroke();
          prevX = cx; prevY = cy;
        } else if (ch === '+') ang += Math.PI/2;
        else if (ch === '-') ang -= Math.PI/2;
        i++;
      }
    }
    frame();
    new ResizeObserver(frame).observe(root);
  };

  // GoL
  M.gol = (root) => {
    const c = mkCanvas(root, 6); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let g = new Uint8Array(W*H);
    for (let i = 0; i < W*H; i++) g[i] = Math.random() < 0.25 ? 1 : 0;
    let t = 0;
    function step() {
      const n = new Uint8Array(W*H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let c2 = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const xx = (x+dx+W)%W, yy = (y+dy+H)%H;
          c2 += g[yy*W + xx];
        }
        const cur = g[y*W+x];
        n[y*W+x] = (cur && (c2===2||c2===3)) || (!cur && c2===3) ? 1 : 0;
      }
      g = n;
    }
    function frame() {
      t++;
      if (t % 5 === 0) step();
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = g[i] ? 230 : 0;
        d[i*4]=v; d[i*4+1]=v; d[i*4+2]=v; d[i*4+3]=255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Langton's ant
  M.langton = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    const g = new Uint8Array(W*H);
    let ax = (W/2)|0, ay = (H/2)|0, dir = 0;
    function frame() {
      for (let s = 0; s < 800; s++) {
        const i = ay*W + ax;
        if (g[i]) { dir = (dir+3)%4; g[i] = 0; }
        else      { dir = (dir+1)%4; g[i] = 1; }
        if (dir===0) ay--; else if (dir===1) ax++;
        else if (dir===2) ay++; else ax--;
        ax = (ax+W)%W; ay = (ay+H)%H;
      }
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = g[i] ? 240 : 10;
        d[i*4]=v; d[i*4+1]=v; d[i*4+2]=v; d[i*4+3]=255;
      }
      d[(ay*W+ax)*4] = 255; d[(ay*W+ax)*4+1] = 80; d[(ay*W+ax)*4+2] = 30;
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // ECA rule 30
  M.eca = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let row = new Uint8Array(W);
    row[(W/2)|0] = 1;
    const img = ctx.createImageData(W, H);
    const d = img.data;
    let yPos = 0;
    function step() {
      // draw row at yPos
      for (let x = 0; x < W; x++) {
        const v = row[x] ? 240 : 0;
        const i = (yPos*W + x)*4;
        d[i]=v; d[i+1]=v; d[i+2]=v; d[i+3]=255;
      }
      yPos++;
      if (yPos >= H) {
        // shift up
        const slice = d.slice(W*4);
        d.set(slice);
        d.fill(0, (H-1)*W*4);
        yPos = H-1;
      }
      const nrow = new Uint8Array(W);
      for (let x = 0; x < W; x++) {
        const l = row[(x-1+W)%W], cc = row[x], r = row[(x+1)%W];
        const idx = (l<<2)|(cc<<1)|r;
        nrow[x] = (30 >> idx) & 1;
      }
      row = nrow;
    }
    function frame() {
      for (let s = 0; s < 2; s++) step();
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // sand
  M.sand = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    const g = new Uint8Array(W*H); // 0 empty, 1+ filled
    let t = 0;
    const colors = ['#000','#ffaa30','#ff5b1f','#80c0ff','#fff'];
    function frame() {
      t++;
      // spawn
      if (t % 2 === 0) {
        g[(2)*W + (W*0.3)|0] = 1 + ((t/40)|0)%4;
        g[(2)*W + (W*0.7)|0] = 1 + ((t/40)|0)%4;
      }
      // step bottom-up
      for (let y = H-2; y >= 0; y--) {
        for (let x = 0; x < W; x++) {
          const v = g[y*W+x];
          if (!v) continue;
          if (!g[(y+1)*W+x]) { g[(y+1)*W+x] = v; g[y*W+x] = 0; }
          else if (x>0 && !g[(y+1)*W+x-1] && Math.random()<0.5) { g[(y+1)*W+x-1] = v; g[y*W+x] = 0; }
          else if (x<W-1 && !g[(y+1)*W+x+1]) { g[(y+1)*W+x+1] = v; g[y*W+x] = 0; }
        }
      }
      // render
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = g[i];
        const col = colors[v] || '#000';
        const r = parseInt(col.substr(1,2),16);
        const gr = parseInt(col.substr(3,2),16);
        const b = parseInt(col.substr(5,2),16);
        d[i*4]=r; d[i*4+1]=gr; d[i*4+2]=b; d[i*4+3]=255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // sandpile (simplified rendering)
  M.piles = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    const g = new Int16Array(W*H);
    const cols = [[15,15,30],[40,90,160],[230,140,80],[255,210,70],[255,255,255]];
    let t = 0;
    function frame() {
      t++;
      g[(H/2)|0 * W + ((W/2)|0)] += 100;
      // topple
      for (let s = 0; s < 4; s++) {
        for (let y = 1; y < H-1; y++) {
          for (let x = 1; x < W-1; x++) {
            const i = y*W+x;
            if (g[i] >= 4) {
              const e = (g[i]/4)|0;
              g[i] -= e*4;
              g[i-1]+=e; g[i+1]+=e; g[i-W]+=e; g[i+W]+=e;
            }
          }
        }
      }
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = Math.min(4, g[i]);
        const col = cols[Math.max(0, v)];
        d[i*4]=col[0]; d[i*4+1]=col[1]; d[i*4+2]=col[2]; d[i*4+3]=255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // forest fire
  M.forestfire = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let g = new Uint8Array(W*H);
    for (let i = 0; i < W*H; i++) g[i] = Math.random() < 0.5 ? 1 : 0;
    let t = 0;
    function step() {
      const n = new Uint8Array(W*H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y*W+x;
        const v = g[i];
        if (v === 2) n[i] = 0;
        else if (v === 1) {
          let burn = false;
          for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
            const xx=(x+dx+W)%W, yy=(y+dy+H)%H;
            if (g[yy*W+xx] === 2) burn = true;
          }
          if (burn || Math.random() < 0.0001) n[i] = 2;
          else n[i] = 1;
        } else {
          n[i] = Math.random() < 0.005 ? 1 : 0;
        }
      }
      g = n;
    }
    function frame() {
      t++;
      if (t % 4 === 0) step();
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = g[i];
        let col;
        if (v === 1) col = [40,140,60];
        else if (v === 2) col = [255,120,30];
        else col = [10,12,8];
        d[i*4]=col[0]; d[i*4+1]=col[1]; d[i*4+2]=col[2]; d[i*4+3]=255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // predator-prey
  M.predator = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const prey = [], preds = [];
    for (let i = 0; i < 80; i++) prey.push({ x: Math.random()*c.w, y: Math.random()*c.h, vx: 0, vy: 0 });
    for (let i = 0; i < 12; i++) preds.push({ x: Math.random()*c.w, y: Math.random()*c.h, vx: 0, vy: 0, e: 1 });
    function frame() {
      ctx.fillStyle = 'rgba(0,15,5,0.25)'; ctx.fillRect(0,0,c.w,c.h);
      for (const p of prey) {
        p.vx += (Math.random()-0.5)*0.4;
        p.vy += (Math.random()-0.5)*0.4;
        p.vx *= 0.9; p.vy *= 0.9;
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>c.w) p.vx*=-1;
        if (p.y<0||p.y>c.h) p.vy*=-1;
        ctx.fillStyle = '#a8e060';
        ctx.fillRect(p.x|0, p.y|0, 2, 2);
      }
      for (const pr of preds) {
        let nearest, nd = Infinity;
        for (const p of prey) {
          const d = (p.x-pr.x)**2 + (p.y-pr.y)**2;
          if (d < nd) { nd = d; nearest = p; }
        }
        if (nearest) {
          pr.vx += (nearest.x - pr.x) * 0.005;
          pr.vy += (nearest.y - pr.y) * 0.005;
        }
        pr.vx *= 0.95; pr.vy *= 0.95;
        pr.x += pr.vx; pr.y += pr.vy;
        if (nearest && nd < 9) {
          const idx = prey.indexOf(nearest);
          if (idx >= 0) { prey.splice(idx, 1); prey.push({ x: Math.random()*c.w, y: Math.random()*c.h, vx:0, vy:0 }); }
        }
        ctx.fillStyle = '#ff4040';
        ctx.fillRect(pr.x|0, pr.y|0, 3, 3);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // fluid (very simplified)
  M.fluid = (root) => {
    const c = mkCanvas(root, 6); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let dens = new Float32Array(W*H);
    let u = new Float32Array(W*H), v = new Float32Array(W*H);
    let mx = -1, my = -1, lmx = -1, lmy = -1;
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      mx = ((e.clientX-r.left)/r.width)*W|0;
      my = ((e.clientY-r.top)/r.height)*H|0;
    });
    function frame() {
      if (mx >= 0) {
        const i = my*W+mx;
        if (i >= 0 && i < W*H) {
          dens[i] += 1;
          if (lmx >= 0) {
            u[i] += (mx - lmx)*0.5;
            v[i] += (my - lmy)*0.5;
          }
        }
      }
      lmx = mx; lmy = my;
      // diffuse + advect (cheap)
      const nd = new Float32Array(W*H);
      for (let y = 1; y < H-1; y++) for (let x = 1; x < W-1; x++) {
        const i = y*W+x;
        nd[i] = (dens[i]*0.7 +
          dens[i-1]*0.07 + dens[i+1]*0.07 +
          dens[i-W]*0.07 + dens[i+W]*0.07);
      }
      // gravity-ish drift up
      for (let y = 1; y < H-1; y++) for (let x = 0; x < W; x++) {
        nd[(y-1)*W+x] += nd[y*W+x]*0.05;
        nd[y*W+x] *= 0.95;
      }
      dens = nd;
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const k = Math.min(1, dens[i]);
        d[i*4] = 80 + k*175;
        d[i*4+1] = 30 + k*120;
        d[i*4+2] = 10 + k*30;
        d[i*4+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // wave
  M.wave = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let cur = new Float32Array(W*H);
    let prev = new Float32Array(W*H);
    cur[(H/2)|0 * W + ((W/2)|0)] = 12;
    function frame() {
      const next = new Float32Array(W*H);
      for (let y = 1; y < H-1; y++) for (let x = 1; x < W-1; x++) {
        const i = y*W+x;
        next[i] = ((cur[i-1]+cur[i+1]+cur[i-W]+cur[i+W])/2 - prev[i]) * 0.99;
      }
      prev = cur; cur = next;
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = cur[i];
        const r = v > 0 ? 255*Math.min(1,v) : 0;
        const b = v < 0 ? 255*Math.min(1,-v) : 0;
        d[i*4] = r; d[i*4+1] = 30; d[i*4+2] = b; d[i*4+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // ink drop
  M.inkdrop = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const ps = [];
    function drop() {
      const cx = c.w*(0.2+Math.random()*0.6), cy = c.h*(0.2+Math.random()*0.6);
      for (let i = 0; i < 60; i++) {
        const a = Math.random()*Math.PI*2;
        ps.push({ x: cx+Math.cos(a)*5, y: cy+Math.sin(a)*5,
          vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
          col: `hsla(${Math.random()*60+200},80%,55%,0.4)` });
      }
    }
    setInterval(drop, 1500);
    drop();
    function n2(x, y, t) { return Math.sin(x*0.013 + t) * Math.cos(y*0.011 - t); }
    let t = 0;
    function frame() {
      t += 0.005;
      ctx.fillStyle = 'rgba(245,245,240,0.04)'; ctx.fillRect(0,0,c.w,c.h);
      for (const p of ps) {
        const n0 = n2(p.x, p.y, t);
        const dx = (n2(p.x, p.y+1, t) - n0);
        const dy = (n2(p.x+1, p.y, t) - n0);
        p.vx += dy*1.5; p.vy -= dx*1.5;
        p.vx *= 0.96; p.vy *= 0.96;
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x|0, p.y|0, 2, 2);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // rotozoom
  M.rotozoom = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let t = 0;
    function tex(u, v) {
      u = ((u%1)+1)%1; v = ((v%1)+1)%1;
      if ((Math.floor(u*8)+Math.floor(v*8))%2) return [255,150,40];
      return [40,30,80];
    }
    function frame() {
      t += 0.01;
      const img = ctx.createImageData(W, H);
      const d = img.data;
      const ca = Math.cos(t), sa = Math.sin(t);
      const z = 0.5 + 0.4*Math.sin(t*0.7);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const u = ((x-W/2)*ca - (y-H/2)*sa)*z*0.02 + t*0.1;
          const v = ((x-W/2)*sa + (y-H/2)*ca)*z*0.02;
          const tc = tex(u, v);
          const i = (y*W+x)*4;
          d[i]=tc[0]; d[i+1]=tc[1]; d[i+2]=tc[2]; d[i+3]=255;
        }
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // doom fire
  M.doomfire = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    const buf = new Uint8Array(W*H);
    const palette = [];
    for (let i = 0; i < 36; i++) {
      let r=0, g=0, b=0;
      if (i < 8) { r = i*30; }
      else if (i < 18) { r = 255; g = (i-8)*22; }
      else if (i < 28) { r = 255; g = 220; b = (i-18)*22; }
      else { r = 255; g = 240+i; b = 200+i; }
      palette.push([Math.min(255,r), Math.min(255,g), Math.min(255,b)]);
    }
    function frame() {
      for (let x = 0; x < W; x++) buf[(H-1)*W+x] = 35;
      for (let y = 0; y < H-1; y++) {
        for (let x = 0; x < W; x++) {
          const rand = (Math.random()*3)|0;
          const dst = (y*W + x - rand + 1 + W) % W;
          const val = buf[(y+1)*W+x] - (rand & 1);
          buf[(y)*W+dst] = Math.max(0, val);
        }
      }
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const c2 = palette[buf[i]] || [0,0,0];
        d[i*4]=c2[0]; d[i*4+1]=c2[1]; d[i*4+2]=c2[2]; d[i*4+3]=255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // water
  M.water = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let cur = new Float32Array(W*H), prev = new Float32Array(W*H);
    root.addEventListener('click', e => {
      const r = root.getBoundingClientRect();
      const x = ((e.clientX-r.left)/r.width)*W|0;
      const y = ((e.clientY-r.top)/r.height)*H|0;
      if (x>0 && x<W-1 && y>0 && y<H-1) cur[y*W+x] = 30;
    });
    setInterval(() => {
      const x = (Math.random()*(W-4)+2)|0, y = (Math.random()*(H-4)+2)|0;
      cur[y*W+x] = 16;
    }, 2200);
    function frame() {
      const next = new Float32Array(W*H);
      for (let y = 1; y < H-1; y++) for (let x = 1; x < W-1; x++) {
        const i = y*W+x;
        next[i] = ((cur[i-1]+cur[i+1]+cur[i-W]+cur[i+W])/2 - prev[i]) * 0.985;
      }
      prev = cur; cur = next;
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = cur[i];
        const k = 0.5 + v*0.05;
        d[i*4] = 30 + k*30;
        d[i*4+1] = 80 + k*60;
        d[i*4+2] = 160 + k*60;
        d[i*4+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // cardstack
  M.cardstack = (root) => {
    root.style.cssText += 'background:#101218;display:grid;place-items:center;perspective:600px;';
    const stack = document.createElement('div');
    stack.style.cssText = 'position:relative;width:50%;aspect-ratio:5/7;transform-style:preserve-3d;';
    const N = 7;
    const cards = [];
    for (let i = 0; i < N; i++) {
      const cd = document.createElement('div');
      cd.style.cssText = `
        position:absolute; inset:0; background:#fff;
        border-radius:6px;
        background: linear-gradient(135deg, #ff5b1f, #ffd166);
        border: 2px solid #fff;
        box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        transition: transform 1.2s cubic-bezier(.6,.1,.4,1);
        transform: translateZ(${(N-i)*4}px) translateY(${(i)*1}px);
      `;
      stack.appendChild(cd); cards.push(cd);
    }
    root.appendChild(stack);
    let i = 0;
    setInterval(() => {
      const cd = cards[i];
      cd.style.transform = `translateZ(40px) translateX(120%) translateY(-30%) rotate(20deg)`;
      setTimeout(() => {
        cd.style.transition = 'none';
        cd.style.transform = `translateZ(0px) translateY(${(N-1)*1}px)`;
        cd.offsetHeight;
        cd.style.transition = '';
      }, 1100);
      i = (i+1)%N;
    }, 1300);
  };

  // morphsvg
  M.morphsvg = (root) => {
    root.style.cssText += 'background:#0a0a0a;display:grid;place-items:center;';
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '-50 -50 100 100');
    svg.style.cssText = 'width:60%;height:60%;';
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#ff5b1f');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);
    root.appendChild(svg);

    function shape(name, t) {
      // each returns 64 sample points in [-30,30]
      const pts = [];
      for (let i = 0; i < 64; i++) {
        const u = i/64 * Math.PI*2;
        let r;
        if (name === 'circle') r = 30;
        else if (name === 'square') {
          const a = ((u+Math.PI/4)%(Math.PI/2)) - Math.PI/4;
          r = 30/Math.cos(a);
        } else if (name === 'triangle') {
          const seg = (u % (Math.PI*2/3)) - Math.PI/3;
          r = 30/Math.cos(seg) * 0.8;
        } else if (name === 'star') {
          r = 28 + 8*Math.cos(5*u);
        } else { // cross
          const a = u % (Math.PI/2);
          r = 30 / (Math.abs(Math.cos(a*2)) + 0.5);
        }
        pts.push([Math.cos(u)*r, Math.sin(u)*r]);
      }
      return pts;
    }
    function lerp(a, b, t) {
      return a.map((p, i) => [p[0]*(1-t) + b[i][0]*t, p[1]*(1-t) + b[i][1]*t]);
    }
    const names = ['square','circle','triangle','star','cross'];
    let phase = 0;
    function frame() {
      const i = Math.floor(phase) % names.length;
      const j = (i+1) % names.length;
      const t = phase - Math.floor(phase);
      const tt = 0.5 - 0.5*Math.cos(t*Math.PI);
      const A = shape(names[i]); const B = shape(names[j]);
      const pts = lerp(A, B, tt);
      let dStr = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
      for (let k = 1; k < pts.length; k++) dStr += ` L ${pts[k][0].toFixed(2)} ${pts[k][1].toFixed(2)}`;
      dStr += ' Z';
      path.setAttribute('d', dStr);
      phase += 0.005;
      requestAnimationFrame(frame);
    }
    frame();
  };

  // kaleido (simple approximation: rotating colored sectors)
  M.kaleido = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let t = 0;
    function frame() {
      t += 0.005;
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2, R = Math.min(cx, cy);
      const slices = 8;
      for (let s = 0; s < slices; s++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t + s*Math.PI*2/slices);
        if (s % 2) ctx.scale(-1, 1);
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `hsla(${(t*40 + i*60)%360},80%,55%,0.6)`;
          const r = R * (0.3 + i*0.15);
          const a = i*0.4 + t;
          ctx.beginPath();
          ctx.arc(Math.cos(a)*r*0.4, Math.sin(a)*r*0.4, R*0.18, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // flowfield
  M.flowfield = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 50;
    let walkers = [];
    function reseed() {
      walkers = Array.from({length: N}, () => ({
        x: Math.random()*c.w, y: Math.random()*c.h, life: 0,
      }));
    }
    reseed();
    setInterval(reseed, 8000);
    let t = 0;
    function frame() {
      t += 0.003;
      ctx.fillStyle = 'rgba(248,246,238,0.02)'; ctx.fillRect(0,0,c.w,c.h);
      ctx.strokeStyle = 'rgba(20,20,30,0.3)';
      ctx.lineWidth = 0.5;
      for (const w of walkers) {
        const ang = (Math.sin(w.x*0.01 + t) + Math.cos(w.y*0.012 - t))*Math.PI;
        const nx = w.x + Math.cos(ang)*1.4;
        const ny = w.y + Math.sin(ang)*1.4;
        ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(nx, ny); ctx.stroke();
        w.x = nx; w.y = ny; w.life++;
        if (w.x < 0 || w.x > c.w || w.y < 0 || w.y > c.h || w.life > 800) {
          w.x = Math.random()*c.w; w.y = Math.random()*c.h; w.life = 0;
        }
      }
      requestAnimationFrame(frame);
    }
    ctx.fillStyle = '#f8f6ee'; ctx.fillRect(0,0,c.w,c.h);
    frame();
  };

  // starbirth
  M.starbirth = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 400;
    const stars = Array.from({length: N}, () => ({
      x: Math.random()*c.w, y: Math.random()*c.h, ph: Math.random()*100,
      ignite: 0,
    }));
    function frame() {
      ctx.fillStyle = 'rgba(0,0,8,0.45)'; ctx.fillRect(0,0,c.w,c.h);
      for (const s of stars) {
        s.ph += 0.04;
        if (Math.random() < 0.0008) s.ignite = 1;
        s.ignite *= 0.96;
        const tw = 0.3 + 0.7*(0.5 + 0.5*Math.sin(s.ph));
        if (s.ignite > 0.05) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 12);
          g.addColorStop(0, `rgba(255,255,255,${s.ignite})`);
          g.addColorStop(1, 'rgba(255,200,100,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(s.x, s.y, 12, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = `rgba(255,255,255,${tw})`;
        ctx.fillRect(s.x|0, s.y|0, 1, 1);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // bubbles
  M.bubbles = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const bs = [];
    function spawn() {
      bs.push({ x: Math.random()*c.w, y: c.h+10, r: 4 + Math.random()*16,
        vy: -0.4 - Math.random()*1.0, ph: Math.random()*100 });
    }
    for (let i = 0; i < 20; i++) spawn();
    setInterval(spawn, 350);
    root.addEventListener('click', e => {
      const r = root.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      for (let i = bs.length-1; i >= 0; i--) {
        const b = bs[i];
        if (Math.hypot(b.x-cx, b.y-cy) < b.r) bs.splice(i, 1);
      }
    });
    let t = 0;
    function frame() {
      t += 0.02;
      ctx.fillStyle = 'rgba(10,30,60,0.35)'; ctx.fillRect(0,0,c.w,c.h);
      for (let i = bs.length-1; i >= 0; i--) {
        const b = bs[i];
        b.y += b.vy;
        b.x += Math.sin(t + b.ph)*0.6;
        if (b.y < -20) { bs.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(180,220,255,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.arc(b.x - b.r*0.3, b.y - b.r*0.4, b.r*0.18, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // verlet cloth
  M.cloth = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const COLS = 14, ROWS = 10;
    let pts = [];
    let constraints = [];
    function init() {
      pts = []; constraints = [];
      const sx = c.w*0.15, sy = c.h*0.1, gw = c.w*0.7/(COLS-1), gh = c.h*0.6/(ROWS-1);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        pts.push({ x: sx+x*gw, y: sy+y*gh, ox: sx+x*gw, oy: sy+y*gh, pinned: y===0 && (x===0||x===COLS-1) });
      }
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const i = y*COLS+x;
        if (x < COLS-1) constraints.push([i, i+1, gw]);
        if (y < ROWS-1) constraints.push([i, i+COLS, gh]);
      }
    }
    init();
    new ResizeObserver(init).observe(root);
    let mx = -1, my = -1, dragIdx = -1;
    root.addEventListener('pointerdown', e => {
      const r = root.getBoundingClientRect();
      mx = e.clientX-r.left; my = e.clientY-r.top;
      let bd = 999, bi = -1;
      for (let i = 0; i < pts.length; i++) {
        const d = Math.hypot(pts[i].x-mx, pts[i].y-my);
        if (d < bd) { bd = d; bi = i; }
      }
      if (bd < 30) dragIdx = bi;
    });
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      mx = e.clientX-r.left; my = e.clientY-r.top;
    });
    root.addEventListener('pointerup', () => dragIdx = -1);
    function frame() {
      // verlet
      for (const p of pts) {
        if (p.pinned) continue;
        const vx = p.x - p.ox, vy = p.y - p.oy;
        p.ox = p.x; p.oy = p.y;
        p.x += vx*0.99; p.y += vy*0.99 + 0.4;
      }
      if (dragIdx >= 0) { pts[dragIdx].x = mx; pts[dragIdx].y = my; }
      for (let it = 0; it < 6; it++) {
        for (const [a, b, len] of constraints) {
          const pa = pts[a], pb = pts[b];
          const dx = pb.x-pa.x, dy = pb.y-pa.y;
          const d = Math.hypot(dx, dy) || 1;
          const diff = (d-len)/d * 0.5;
          if (!pa.pinned) { pa.x += dx*diff; pa.y += dy*diff; }
          if (!pb.pinned) { pb.x -= dx*diff; pb.y -= dy*diff; }
        }
      }
      ctx.fillStyle = '#0a0a14'; ctx.fillRect(0,0,c.w,c.h);
      ctx.strokeStyle = 'rgba(230,200,250,0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (const [a, b] of constraints) {
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
      }
      ctx.stroke();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // spring chain
  M.spring = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 30;
    const nodes = Array.from({length: N}, (_, i) => ({ x: c.w/2, y: c.h/2 + i*4, vx: 0, vy: 0 }));
    let mx = c.w/2, my = c.h/2;
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      mx = e.clientX-r.left; my = e.clientY-r.top;
    });
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0,0,c.w,c.h);
      let tx = mx, ty = my;
      ctx.strokeStyle = '#80c0ff'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        n.vx += (tx - n.x)*0.25; n.vy += (ty - n.y)*0.25;
        n.vx *= 0.6; n.vy *= 0.6;
        n.x += n.vx; n.y += n.vy;
        if (i===0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y);
        tx = n.x; ty = n.y;
      }
      ctx.stroke();
      ctx.fillStyle = '#fff';
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI*2); ctx.fill(); }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // delaunay (cheap O(n^3) every K frames)
  M.delaunay = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 30;
    const ps = Array.from({length: N}, () => ({
      x: Math.random()*c.w, y: Math.random()*c.h,
      vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
    }));
    function inCircle(p, a, b, c2) {
      const ax = a.x-p.x, ay = a.y-p.y;
      const bx = b.x-p.x, by = b.y-p.y;
      const cx = c2.x-p.x, cy = c2.y-p.y;
      return ((ax*ax+ay*ay)*(bx*cy-cx*by) -
              (bx*bx+by*by)*(ax*cy-cx*ay) +
              (cx*cx+cy*cy)*(ax*by-bx*ay)) > 0;
    }
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0,0,c.w,c.h);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>c.w) p.vx*=-1;
        if (p.y<0||p.y>c.h) p.vy*=-1;
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < N; i++)
        for (let j = i+1; j < N; j++)
          for (let k = j+1; k < N; k++) {
            // check no other point is inside circumcircle (Delaunay condition)
            let ok = true;
            for (let m = 0; m < N; m++) {
              if (m===i||m===j||m===k) continue;
              if (inCircle(ps[m], ps[i], ps[j], ps[k])) { ok = false; break; }
            }
            if (ok) {
              ctx.beginPath();
              ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y);
              ctx.lineTo(ps[k].x, ps[k].y); ctx.closePath();
              ctx.stroke();
            }
          }
      ctx.fillStyle = '#fff';
      for (const p of ps) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI*2); ctx.fill(); }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // fbm
  M.fbm = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    function noise(x, y) {
      return (Math.sin(x*1.7 + y*0.9) + Math.sin(x*0.6 - y*1.3) + Math.cos(x*1.2 + y*0.4)) / 3;
    }
    function fbm(x, y) {
      let v = 0, amp = 0.5;
      for (let i = 0; i < 5; i++) {
        v += amp * noise(x, y);
        x *= 2; y *= 2; amp *= 0.5;
      }
      return v;
    }
    let t = 0;
    function frame() {
      t += 0.01;
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const v = fbm((x/W)*4 + t, (y/H)*4 + t*0.6);
        const k = 0.5 + v*0.5;
        const i = (y*W+x)*4;
        d[i] = 200 + k*55;
        d[i+1] = 150 + k*60;
        d[i+2] = 100 + k*50;
        d[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // SIR
  M.sir = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 350;
    const ag = Array.from({length: N}, (_, i) => ({
      x: Math.random()*c.w, y: Math.random()*c.h,
      vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6,
      s: i < 3 ? 1 : 0, t: 0,
    }));
    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0,0,c.w,c.h);
      for (const a of ag) {
        a.x += a.vx; a.y += a.vy;
        if (a.x<0||a.x>c.w) a.vx*=-1;
        if (a.y<0||a.y>c.h) a.vy*=-1;
        if (a.s === 1) { a.t++; if (a.t > 240) a.s = 2; }
      }
      for (let i = 0; i < N; i++) for (let j = i+1; j < N; j++) {
        const a = ag[i], b = ag[j];
        if (a.s + b.s === 1 && (a.x-b.x)**2 + (a.y-b.y)**2 < 36) {
          if (a.s === 0) { a.s = 1; a.t = 0; } else { b.s = 1; b.t = 0; }
        }
      }
      for (const a of ag) {
        ctx.fillStyle = a.s === 1 ? '#ff5b1f' : a.s === 2 ? '#80c0ff' : '#fff';
        ctx.fillRect(a.x|0, a.y|0, 2, 2);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // reaction-diffusion (Gray-Scott, simplified)
  M.reaction = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let U = new Float32Array(W*H), V = new Float32Array(W*H);
    for (let i = 0; i < W*H; i++) U[i] = 1;
    for (let i = 0; i < 5; i++) {
      const cx = (W*Math.random())|0, cy = (H*Math.random())|0;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const xx = cx+dx, yy = cy+dy;
        if (xx>=0&&xx<W&&yy>=0&&yy<H) { V[yy*W+xx] = 1; U[yy*W+xx] = 0; }
      }
    }
    const F = 0.055, K = 0.062, dU = 1.0, dV = 0.5;
    function step() {
      const nU = new Float32Array(U), nV = new Float32Array(V);
      for (let y = 1; y < H-1; y++) for (let x = 1; x < W-1; x++) {
        const i = y*W+x;
        const lU = U[i-1]+U[i+1]+U[i-W]+U[i+W] - 4*U[i];
        const lV = V[i-1]+V[i+1]+V[i-W]+V[i+W] - 4*V[i];
        const uvv = U[i]*V[i]*V[i];
        nU[i] = U[i] + (dU*lU - uvv + F*(1 - U[i]));
        nV[i] = V[i] + (dV*lV + uvv - (F+K)*V[i]);
      }
      U = nU; V = nV;
    }
    function frame() {
      for (let s = 0; s < 5; s++) step();
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = Math.min(1, Math.max(0, V[i]));
        const k = v*255;
        d[i*4]=k; d[i*4+1]=k*0.6; d[i*4+2]=k*0.3; d[i*4+3]=255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // penrose-like
  M.penrose = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    function draw() {
      ctx.fillStyle = '#f3eee2'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2;
      const cols = ['#1a1a2e','#bd5c3a','#dca77a'];
      ctx.lineWidth = 1; ctx.strokeStyle = '#1a1a2e';
      for (let r = 1; r < 10; r++) {
        const sectors = r < 4 ? 5 : 10;
        for (let s = 0; s < sectors; s++) {
          const a1 = s/sectors * Math.PI*2;
          const a2 = (s+1)/sectors * Math.PI*2;
          const r1 = r*9, r2 = (r+1)*9;
          ctx.fillStyle = cols[(r+s)%3];
          ctx.beginPath();
          ctx.moveTo(cx+Math.cos(a1)*r1, cy+Math.sin(a1)*r1);
          ctx.lineTo(cx+Math.cos(a2)*r1, cy+Math.sin(a2)*r1);
          ctx.lineTo(cx+Math.cos(a2)*r2, cy+Math.sin(a2)*r2);
          ctx.lineTo(cx+Math.cos(a1)*r2, cy+Math.sin(a1)*r2);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
      }
    }
    draw();
    new ResizeObserver(draw).observe(root);
  };

  // wireworld
  M.wireworld = (root) => {
    const c = mkCanvas(root, 5); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let g = new Uint8Array(W*H); // 0 empty, 1 wire, 2 head, 3 tail
    // layout: simple loop of wire with one head
    const cx = (W/2)|0, cy = (H/2)|0;
    const R = Math.min(cx, cy) - 4;
    for (let a = 0; a < 360; a++) {
      const x = (cx + Math.cos(a*Math.PI/180)*R)|0;
      const y = (cy + Math.sin(a*Math.PI/180)*R)|0;
      if (x>=0&&x<W&&y>=0&&y<H) g[y*W+x] = 1;
    }
    g[cy*W + (cx+R)] = 2;
    g[(cy+1)*W + (cx+R)] = 3;
    function step() {
      const n = new Uint8Array(W*H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y*W+x;
        const v = g[i];
        if (v === 0) n[i] = 0;
        else if (v === 2) n[i] = 3;
        else if (v === 3) n[i] = 1;
        else { // wire
          let h = 0;
          for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
            if (dx===0&&dy===0) continue;
            const xx=(x+dx+W)%W, yy=(y+dy+H)%H;
            if (g[yy*W+xx] === 2) h++;
          }
          n[i] = (h===1||h===2) ? 2 : 1;
        }
      }
      g = n;
    }
    let t = 0;
    function frame() {
      t++;
      if (t % 5 === 0) step();
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const v = g[i];
        let col;
        if (v === 1) col = [80,60,30];
        else if (v === 2) col = [80,180,255];
        else if (v === 3) col = [200,80,40];
        else col = [10,10,10];
        d[i*4]=col[0]; d[i*4+1]=col[1]; d[i*4+2]=col[2]; d[i*4+3]=255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // texture tunnel
  M.tunnel3 = (root) => {
    const c = mkCanvas(root, 4); const ctx = c.ctx;
    const W = c.iw, H = c.ih;
    let lookup;
    function buildLookup() {
      lookup = new Float32Array(W*H*2);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const dx = x - W/2, dy = y - H/2;
        const a = Math.atan2(dy, dx)/Math.PI*0.5 + 0.5;
        const r = 80 / (Math.hypot(dx, dy) + 1);
        lookup[(y*W+x)*2] = a;
        lookup[(y*W+x)*2+1] = r;
      }
    }
    buildLookup();
    new ResizeObserver(() => buildLookup()).observe(root);
    let t = 0;
    function frame() {
      t += 0.02;
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W*H; i++) {
        const u = lookup[i*2] + t*0.1;
        const v = lookup[i*2+1] + t;
        const ui = (u*16)|0, vi = (v*4)|0;
        const lit = (ui+vi) & 1;
        const fade = Math.min(1, lookup[i*2+1]/4);
        if (lit) { d[i*4] = 240*fade; d[i*4+1]=160*fade; d[i*4+2]=60*fade; }
        else     { d[i*4] = 30*fade;  d[i*4+1]=20*fade;  d[i*4+2]=10*fade; }
        d[i*4+3]=255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // Hilbert
  M.hilbert = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const N = 6;
    const total = 4**N;
    function d2xy(d) {
      let x = 0, y = 0, t = d, rx, ry;
      for (let s = 1; s < (1<<N); s <<= 1) {
        rx = 1 & (t/2);
        ry = 1 & (t ^ rx);
        if (ry === 0) {
          if (rx === 1) { x = s-1-x; y = s-1-y; }
          [x, y] = [y, x];
        }
        x += s*rx; y += s*ry;
        t = (t/4)|0;
      }
      return [x, y];
    }
    let t0 = performance.now();
    function frame() {
      const t = ((performance.now()-t0)/6000) % 1;
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,c.w,c.h);
      const M = Math.floor(total*t);
      const cell = Math.min(c.w, c.h)/(1<<N);
      const offX = (c.w - cell*(1<<N))/2, offY = (c.h - cell*(1<<N))/2;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < M; i++) {
        const [x, y] = d2xy(i);
        const px = offX + x*cell + cell/2;
        const py = offY + y*cell + cell/2;
        if (i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      const grad = ctx.createLinearGradient(0, 0, c.w, c.h);
      grad.addColorStop(0, '#ff5b1f'); grad.addColorStop(1, '#80c0ff');
      ctx.strokeStyle = grad; ctx.stroke();
      requestAnimationFrame(frame);
    }
    frame();
  };

  // crt2 mosaic shutter
  M.crt2 = (root) => {
    root.style.cssText += 'background:#0a0a0a;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);';
    for (let i = 0; i < 64; i++) {
      const t = document.createElement('div');
      const hue = (i*5 + 200) % 360;
      t.style.cssText = `
        background: linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${(hue+40)%360},70%,40%));
        animation: crt2flip 4s ease-in-out infinite;
        animation-delay: ${(i%8)*60 + Math.floor(i/8)*40}ms;
        transform-origin: center;
      `;
      root.appendChild(t);
    }
    if (!document.getElementById('__crt2Style')) {
      const st = document.createElement('style'); st.id = '__crt2Style';
      st.textContent = `@keyframes crt2flip { 0%,40%,100% { transform: scaleY(1); } 50%,90% { transform: scaleY(-0.05); } }`;
      document.head.appendChild(st);
    }
  };

  // barcode scroll
  M.barcode = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    const grays = ['#1a1a1a','#3a3a3a','#5a5a5a','#8a8a8a','#cacaca'];
    const bars = [];
    function rebuild() {
      bars.length = 0;
      let x = 0;
      while (x < c.w*2) {
        const w = 2 + Math.random()*14;
        bars.push({ x, w, c: grays[Math.floor(Math.random()*grays.length)] });
        x += w + 1;
      }
    }
    rebuild();
    new ResizeObserver(rebuild).observe(root);
    let off = 0, scan = -50;
    function frame() {
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,c.w,c.h);
      off = (off + 0.6) % (c.w);
      for (const b of bars) {
        const x = b.x - off;
        if (x > -20 && x < c.w) {
          ctx.fillStyle = b.c;
          ctx.fillRect(x, 0, b.w, c.h);
        }
      }
      scan += 4;
      if (scan > c.w + 50) scan = -50;
      ctx.fillStyle = 'rgba(255,40,40,0.5)';
      ctx.fillRect(scan, 0, 2, c.h);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // liquid blob morph
  M.liquid = (root) => {
    root.style.cssText += 'background:#0c0c12;display:grid;place-items:center;';
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '-100 -100 200 200');
    svg.style.cssText = 'width:70%;height:70%;filter:drop-shadow(0 0 16px rgba(255,91,31,0.4));';
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('fill', '#ff5b1f');
    svg.appendChild(path);
    root.appendChild(svg);
    const N = 16;
    const seeds = Array.from({length: N}, () => ({ ph: Math.random()*100, sp: 0.3 + Math.random()*0.4 }));
    let t = 0;
    function frame() {
      t += 0.01;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const a = i/N * Math.PI*2;
        const r = 60 + Math.sin(t*seeds[i].sp + seeds[i].ph)*15 + Math.cos(t*0.5 + i)*10;
        pts.push([Math.cos(a)*r, Math.sin(a)*r]);
      }
      let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 0; i < N; i++) {
        const cur = pts[i], next = pts[(i+1)%N];
        const mx = (cur[0]+next[0])/2, my = (cur[1]+next[1])/2;
        d += ` Q ${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      d += ' Z';
      path.setAttribute('d', d);
      requestAnimationFrame(frame);
    }
    frame();
  };

  // orbital decay
  M.orbital = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let a = 1, b = 0.5, ang = 0, decay = 1;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
    function frame() {
      ctx.fillStyle = 'rgba(0,0,5,0.05)'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2;
      // star
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
      g.addColorStop(0, 'rgba(255,240,180,1)');
      g.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI*2); ctx.fill();
      // planet
      const S = Math.min(c.w, c.h)*0.35;
      const x = cx + Math.cos(ang)*a*S*decay;
      const y = cy + Math.sin(ang)*b*S*decay;
      ctx.fillStyle = '#80c0ff';
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
      ang += 0.04 / Math.max(0.2, decay);
      decay *= 0.9995;
      if (decay < 0.06) {
        decay = 1;
        a = 0.6 + Math.random()*0.5;
        b = 0.3 + Math.random()*0.5;
        ctx.fillStyle = '#000'; ctx.fillRect(0,0,c.w,c.h);
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  // pseudo-3D text
  M.text3d = (root) => {
    root.style.cssText += 'background:#0a0a14;display:grid;place-items:center;perspective:600px;overflow:hidden;';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;font-weight:800;font-size:64px;letter-spacing:0.05em;transform-style:preserve-3d;transition:transform 200ms;';
    const N = 26;
    for (let i = 0; i < N; i++) {
      const layer = document.createElement('div');
      const k = 1 - i/N;
      layer.textContent = 'DEPTH';
      layer.style.cssText = `
        position:absolute; inset:0;
        color: rgba(${255*k},${120*k},${40*k},1);
        transform: translate(${i*0.7}px, ${i*0.7}px);
        font-family: inherit;
      `;
      wrap.appendChild(layer);
    }
    const top = document.createElement('div');
    top.textContent = 'DEPTH';
    top.style.cssText = 'position:relative;color:#fff;';
    wrap.appendChild(top);
    root.appendChild(wrap);
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      const dx = (e.clientX - r.left)/r.width - 0.5;
      const dy = (e.clientY - r.top)/r.height - 0.5;
      wrap.style.transform = `rotateY(${dx*30}deg) rotateX(${-dy*30}deg)`;
    });
  };

  // halftone glyph
  M.halftext = (root) => {
    const c = mkCanvas(root); const ctx = c.ctx;
    let buf = null, bw = 0, bh = 0;
    function rebuild() {
      const off = document.createElement('canvas');
      off.width = 80; off.height = 80;
      const oc = off.getContext('2d');
      oc.fillStyle = '#000'; oc.fillRect(0,0,80,80);
      oc.fillStyle = '#fff';
      oc.font = 'bold 76px Helvetica, Arial, sans-serif';
      oc.textAlign = 'center'; oc.textBaseline = 'middle';
      oc.fillText('@', 40, 44);
      buf = oc.getImageData(0, 0, 80, 80).data;
      bw = 80; bh = 80;
    }
    rebuild();
    let t = 0;
    function frame() {
      t += 0.005;
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,c.w,c.h);
      const cx = c.w/2, cy = c.h/2;
      const G = 28, cell = Math.min(c.w, c.h)*0.85 / G;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t);
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        const sx = ((x/G)*bw)|0;
        const sy = ((y/G)*bh)|0;
        const v = buf[(sy*bw + sx)*4]/255;
        if (v < 0.05) continue;
        const px = (x - G/2 + 0.5)*cell;
        const py = (y - G/2 + 0.5)*cell;
        ctx.fillStyle = '#ff5b1f';
        ctx.beginPath();
        ctx.arc(px, py, v*cell*0.5, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
      requestAnimationFrame(frame);
    }
    frame();
  };

  /* Helpers ---------------------------------------------------------- */
  function mkCanvas(root, scale) {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    root.appendChild(cv);
    const ctx = cv.getContext('2d', { willReadFrequently: !!scale });
    const obj = { c: cv, ctx };
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const W = root.clientWidth, H = root.clientHeight;
      obj.w = W; obj.h = H;
      if (scale) {
        obj.iw = Math.max(8, Math.floor(W/scale));
        obj.ih = Math.max(8, Math.floor(H/scale));
        cv.width = obj.iw; cv.height = obj.ih;
        cv.style.imageRendering = 'pixelated';
      } else {
        cv.width = Math.max(1, W*dpr);
        cv.height = Math.max(1, H*dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }
    }
    resize();
    new ResizeObserver(resize).observe(root);
    return obj;
  }
  function hsl2rgb(h, s, l) {
    h = h/360; const a = s*Math.min(l, 1-l);
    function f(n) {
      const k = (n + h*12) % 12;
      return l - a*Math.max(-1, Math.min(k-3, 9-k, 1));
    }
    return [Math.floor(f(0)*255), Math.floor(f(8)*255), Math.floor(f(4)*255)];
  }

  /* Wire mounters into window.mounters once it exists --------------- */
  function attach() {
    if (!window.mounters) { setTimeout(attach, 30); return; }
    Object.assign(window.mounters, M);
  }
  attach();
})();
