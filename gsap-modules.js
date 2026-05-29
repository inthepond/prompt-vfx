/* GSAP Modules — 20 animations for the "GSAP" tab.
   Populates window.GSAP_MODULES (registry) and adds mounters to the shared
   window.mounters. Every animation is built with the GSAP 3.13 core + plugins
   loaded in VFX.html. Each mounter wires its looping animations into the cell
   lifecycle (cell.__lc) so timelines PAUSE when the cell scrolls off-screen and
   are KILLED on tab switch — matching the grid's offscreen-culling design. */

(function () {
  if (!window.gsap) { console.warn('[gsap-modules] gsap not loaded — skipping'); return; }
  const gsap = window.gsap;

  /* Register every plugin we use (all free & public since GSAP 3.13).
     Flip.register() only wires up its internal helpers (toArray, etc.) when
     document.body exists. This file loads in <head> (no body yet), so register
     again once the DOM is ready — otherwise Flip.getState() throws at mount. */
  const PLUGINS = [
    window.TextPlugin, window.MotionPathPlugin, window.Flip, window.CustomEase,
    window.CustomBounce, window.CustomWiggle, window.DrawSVGPlugin, window.MorphSVGPlugin,
    window.Physics2DPlugin, window.ScrambleTextPlugin, window.SplitText,
  ].filter(Boolean);
  const registerAll = () => gsap.registerPlugin(...PLUGINS);
  registerAll();
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', registerAll, { once: true });

  /* Keep GSAP's single global ticker permanently awake. It otherwise auto-sleeps
     after ~120 idle frames, and the next tween creation re-reads
     window.requestAnimationFrame to reschedule its tick. VFX.html patches rAF to
     attribute timers to the cell currently mounting, so a wake() triggered inside
     a cell mount binds the SHARED ticker to that one cell's lifecycle — and when
     that cell scrolls off-screen (tick deferred) or tab-switches (tick dropped),
     every GSAP cell freezes. GSAP only sleeps when ticker._listeners.length < 2,
     so a permanent no-op listener keeps the sleep branch from ever running. */
  gsap.ticker.add(() => {});

  const REG = (window.GSAP_MODULES = window.GSAP_MODULES || []);
  const M = (window.mounters = window.mounters || window.__pendingMounters || {});
  if (!window.mounters) window.mounters = M;
  if (!window.__pendingMounters) window.__pendingMounters = M;

  /* Register one effect: registry entry + its mounter. */
  function R(id, name, prompt, mount) {
    REG.push({ id, name, prompt, category: 'gsap' });
    M[id] = mount;
  }

  /* ---- Lifecycle bridge ------------------------------------------------
     The grid pauses/destroys cells via cell.__lc. GSAP runs on its own global
     ticker, so we extend those hooks to pause/kill the cell's GSAP animations.
       loops   : looping animation(s) to pause/resume/kill with the cell
       cleanup : extra teardown (kill transient tweens, revert SplitText, etc.) */
  function bind(cell, loops, cleanup) {
    const lc = cell && cell.__lc;
    const arr = (Array.isArray(loops) ? loops : [loops]).filter(Boolean);
    if (!lc) return;
    const _p = lc.pause.bind(lc), _r = lc.resume.bind(lc), _d = lc.destroy.bind(lc);
    lc.pause   = () => { _p(); arr.forEach(a => a.pause && a.pause()); };
    lc.resume  = () => { _r(); arr.forEach(a => a.resume && a.resume()); };
    lc.destroy = () => { _d(); arr.forEach(a => a.kill && a.kill());
                         if (cleanup) { try { cleanup(); } catch (e) { /* noop */ } } };
  }

  /* ---- Tiny helpers ---------------------------------------------------- */
  function base(root, extra) {
    root.style.cssText += `position:absolute;inset:0;display:flex;align-items:center;` +
      `justify-content:center;background:#000;overflow:hidden;${extra || ''}`;
  }
  function div(css, parent) {
    const d = document.createElement('div');
    if (css) d.style.cssText = css;
    if (parent) parent.appendChild(d);
    return d;
  }
  /* Smooth closed organic blob path (catmull-rom → cubic bezier). */
  function blob(cx, cy, r, variance, n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 + (Math.random() * 2 - 1) * variance);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)} `;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ` +
           `${p2[0].toFixed(2)},${p2[1].toFixed(2)} `;
    }
    return d + 'Z';
  }

  const MONO = `'JetBrains Mono', ui-monospace, monospace`;

  /* ============================================================
     01 — STAGGER GRID · grid stagger from center, color shift
     ============================================================ */
  R('gsap-stagger', 'Stagger grid · pulse',
`A 12×12 grid of small squares. A single tween scales them down toward
zero and shifts them to orange, rippling out from the center with a grid
stagger (from:"center"), then yoyos back. Loops forever.`,
  (root, cell) => {
    base(root);
    const N = 12;
    const wrap = div(`display:grid;grid-template-columns:repeat(${N},1fr);gap:6px;width:78%;aspect-ratio:1;`, root);
    const cells = [];
    for (let i = 0; i < N * N; i++) cells.push(div('background:#e8e8e8;border-radius:1px;aspect-ratio:1;', wrap));
    gsap.set(cells, { transformOrigin: 'center' });
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'power1.inOut' } })
      .to(cells, { scale: 0.12, backgroundColor: '#ff5b1f', duration: 1,
                   stagger: { grid: [N, N], from: 'center', amount: 1.4 } });
    bind(cell, tl, () => gsap.killTweensOf(cells));
  });

  /* ============================================================
     02 — SCRAMBLE TEXT · ScrambleTextPlugin
     ============================================================ */
  R('gsap-scramble', 'Scramble text',
`Centered monospace word that scrambles through random characters and
resolves into the next word in a list, holds, then scrambles to the next.
Uses ScrambleTextPlugin. Loops.`,
  (root, cell) => {
    base(root, 'padding:18px;');
    const t = div(`font:600 clamp(16px,5vw,30px)/1.2 ${MONO};color:#e8e8e8;letter-spacing:.04em;text-align:center;`, root);
    t.textContent = 'ASSEMBLING';
    const words = ['ASSEMBLING', 'RESOLVING', 'GREENSOCK', 'DECRYPTED', 'REWRITING', 'COMPLETE'];
    const tl = gsap.timeline({ repeat: -1 });
    words.forEach((w) => {
      tl.to(t, { duration: 1.1, ease: 'none',
                 scrambleText: { text: w, chars: 'upperCase', speed: 0.6, revealDelay: 0.25 } })
        .to({}, { duration: 0.7 });
    });
    bind(cell, tl, () => gsap.killTweensOf(t));
  });

  /* ============================================================
     03 — SPLIT HEADLINE · SplitText char entrance/exit
     ============================================================ */
  R('gsap-split', 'Split headline',
`Headline split into individual characters with SplitText. Chars fly up
from below with a 3D flip (rotationX) and back.out ease, hold, then fly
out upward. Loops.`,
  (root, cell) => {
    base(root, 'padding:16px;perspective:500px;');
    const h = div(`font:700 clamp(20px,7vw,40px)/1 ${MONO};color:#e8e8e8;text-align:center;`, root);
    h.textContent = 'MOTION';
    const split = new window.SplitText(h, { type: 'chars' });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
      .from(split.chars, { duration: 0.7, yPercent: 130, rotationX: -90, autoAlpha: 0,
                           transformOrigin: '50% 100% -20', stagger: 0.08, ease: 'back.out(1.7)' })
      .to(split.chars, { duration: 0.5, yPercent: -130, autoAlpha: 0,
                         stagger: 0.05, ease: 'power2.in' }, '+=0.7');
    bind(cell, tl, () => { gsap.killTweensOf(split.chars); split.revert(); });
  });

  /* ============================================================
     04 — MOTION PATH · comet following an SVG path (MotionPathPlugin)
     ============================================================ */
  R('gsap-motionpath', 'Motion path · comet',
`A bright leading dot plus a tail of smaller dimming dots travel along a
looping SVG path (a soft figure-eight). Dots are offset with a stagger so
the tail trails like a comet. Uses MotionPathPlugin. Loops.`,
  (root, cell) => {
    base(root);
    const w = div('width:80%;aspect-ratio:1;', root);
    w.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible;">
      <path id="p" d="M50,50 C18,18 18,82 50,50 C82,18 82,82 50,50 Z"
            fill="none" stroke="#1c1c1c" stroke-width="0.8"/></svg>`;
    const svg = w.querySelector('svg'), path = w.querySelector('#p');
    const NS = 'http://www.w3.org/2000/svg', dots = [];
    for (let i = 0; i < 9; i++) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', (3.4 - i * 0.32).toFixed(2));
      c.setAttribute('fill', i === 0 ? '#ff5b1f' : '#e8e8e8');
      c.setAttribute('opacity', (1 - i * 0.1).toFixed(2));
      svg.appendChild(c); dots.push(c);
    }
    const tw = gsap.to(dots, { duration: 4, ease: 'none', repeat: -1, stagger: { each: 0.07 },
      motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5] } });
    bind(cell, tw, () => gsap.killTweensOf(dots));
  });

  /* ============================================================
     05 — DRAW SVG · self-drawing line + ring (DrawSVGPlugin)
     ============================================================ */
  R('gsap-draw', 'Draw SVG · signature',
`An orange "signature" stroke draws itself on across a self-drawing white
ring, then both un-draw (yoyo). Uses DrawSVGPlugin. Loops.`,
  (root, cell) => {
    base(root);
    const w = div('width:72%;aspect-ratio:1;', root);
    w.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible;">
      <circle cx="50" cy="50" r="38" fill="none" stroke="#e8e8e8" stroke-width="1.5"/>
      <path d="M12,68 C28,28 42,30 52,56 C61,80 74,80 88,38" fill="none"
            stroke="#ff5b1f" stroke-width="2.6" stroke-linecap="round"/></svg>`;
    const ring = w.querySelector('circle'), sig = w.querySelector('path');
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'power1.inOut' } })
      .from(ring, { drawSVG: '50% 50%', duration: 1.2 }, 0)
      .from(sig, { drawSVG: '0%', duration: 1.4 }, 0.2);
    bind(cell, tl, () => gsap.killTweensOf([ring, sig]));
  });

  /* ============================================================
     06 — MORPH SVG · circle → star → blob (MorphSVGPlugin)
     ============================================================ */
  R('gsap-morph', 'Morph SVG · shapes',
`A single filled shape morphs smoothly through a circle, a five-point star
and an organic blob, recoloring between orange and white as it goes. Uses
MorphSVGPlugin. Loops.`,
  (root, cell) => {
    base(root);
    const w = div('width:64%;aspect-ratio:1;', root);
    const circle = 'M50,12 C71,12 88,29 88,50 C88,71 71,88 50,88 C29,88 12,71 12,50 C12,29 29,12 50,12Z';
    const star   = 'M50,8 L61,38 L93,38 L67,57 L77,90 L50,70 L23,90 L33,57 L7,38 L39,38Z';
    const blobA  = blob(50, 50, 38, 0.2, 6);
    w.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible;">
      <path d="${circle}" fill="#ff5b1f"/></svg>`;
    const p = w.querySelector('path');
    const tl = gsap.timeline({ repeat: -1, defaults: { duration: 1, ease: 'power2.inOut' } })
      .to(p, { morphSVG: star,  fill: '#e8e8e8' }, '+=0.4')
      .to(p, { morphSVG: blobA, fill: '#ff5b1f' }, '+=0.4')
      .to(p, { morphSVG: circle }, '+=0.4');
    bind(cell, tl, () => gsap.killTweensOf(p));
  });

  /* ============================================================
     07 — FIREWORKS · Physics2DPlugin shells + radial bursts
     ============================================================ */
  R('gsap-fireworks', 'Fireworks',
`A looping fireworks show. Glowing shells launch from the base, decelerate
to an apex, then explode into 24–40 radial sparks that fly outward, fall
under gravity, twinkle and fade. Overlapping shells in shifting colors.
Uses Physics2DPlugin.`,
  (root, cell) => {
    base(root, 'overflow:hidden;');
    const palette = ['#ff5b1f', '#ffe14d', '#1fa8ff', '#7a1fff', '#ff4da6', '#e8e8e8'];
    const live = new Set();
    const W = () => root.clientWidth, H = () => root.clientHeight;
    function dot(x, y, r, color) {
      const d = div(`position:absolute;left:${x}px;top:${y}px;width:${r * 2}px;height:${r * 2}px;` +
        `margin:${-r}px 0 0 ${-r}px;border-radius:50%;background:${color};` +
        `box-shadow:0 0 ${r * 2.5}px ${color};will-change:transform,opacity;`, root);
      live.add(d); return d;
    }
    function explode(cx, cy, color) {
      const n = gsap.utils.random(32, 48, 1);
      for (let i = 0; i < n; i++) {
        const s = dot(cx, cy, gsap.utils.random(1.6, 3), Math.random() < 0.25 ? '#ffffff' : color);
        gsap.to(s, { duration: gsap.utils.random(1.1, 1.8),
          physics2D: { velocity: gsap.utils.random(70, 180), angle: gsap.utils.random(0, 360), gravity: 170 },
          onComplete() { s.remove(); live.delete(s); } });
        gsap.to(s, { autoAlpha: 0, scale: 0.2, duration: gsap.utils.random(0.7, 1.1),
          delay: gsap.utils.random(0.4, 0.8), ease: 'power1.in' });
      }
    }
    function launch() {
      const color = gsap.utils.random(palette);
      const sx = gsap.utils.random(W() * 0.25, W() * 0.75), sy = H() * 0.98;
      const dx = gsap.utils.random(-W() * 0.12, W() * 0.12), apex = -gsap.utils.random(H() * 0.55, H() * 0.78);
      const shell = dot(sx, sy, 2.4, color);
      gsap.to(shell, { x: dx, y: apex, duration: gsap.utils.random(0.7, 0.95), ease: 'power2.out',
        onComplete() { shell.remove(); live.delete(shell); explode(sx + dx, sy + apex, color); } });
    }
    const loop = gsap.timeline({ repeat: -1 }).call(launch).to({}, { duration: 0.55 });
    bind(cell, loop, () => { live.forEach(p => { gsap.killTweensOf(p); p.remove(); }); live.clear(); });
  });

  /* ============================================================
     08 — ELASTIC BARS · elastic ease + repeatRefresh randomness
     ============================================================ */
  R('gsap-elastic', 'Elastic bars',
`A row of 14 gradient bars that spring to new random heights with an
elastic.out ease, staggered from the center, then settle back (yoyo).
repeatRefresh re-randomizes the heights every cycle. Loops.`,
  (root, cell) => {
    base(root, 'align-items:flex-end;padding:16% 12%;');
    const wrap = div('display:flex;gap:5px;align-items:flex-end;width:100%;height:62%;', root);
    const bars = [];
    for (let i = 0; i < 14; i++)
      bars.push(div('flex:1;height:100%;transform-origin:bottom;background:linear-gradient(#ff5b1f,#5a1c0a);', wrap));
    gsap.set(bars, { scaleY: 0.1 });
    const tw = gsap.to(bars, { scaleY: () => gsap.utils.random(0.2, 1), duration: 1.1,
      ease: 'elastic.out(1,0.4)', stagger: { each: 0.06, from: 'center' },
      repeat: -1, yoyo: true, repeatRefresh: true });
    bind(cell, tw, () => gsap.killTweensOf(bars));
  });

  /* ============================================================
     09 — LOADER SEQUENCE · timeline labels + position + TextPlugin
     ============================================================ */
  R('gsap-timeline', 'Loader sequence',
`A choreographed loading sequence built with one timeline: three dots
bounce in stagger while a progress bar fills, the label retypes from
"LOADING" to "COMPLETE", then everything fades and resets. Shows labels
and the position parameter. Loops.`,
  (root, cell) => {
    base(root, 'flex-direction:column;gap:16px;padding:24px;');
    const dotsWrap = div('display:flex;gap:8px;', root);
    for (let i = 0; i < 3; i++) div('width:10px;height:10px;border-radius:50%;background:#ff5b1f;', dotsWrap);
    const track = div('width:70%;height:4px;background:#1c1c1c;border-radius:2px;overflow:hidden;', root);
    const fill = div('width:100%;height:100%;background:#ff5b1f;transform-origin:left;', track);
    const label = div(`font:500 11px/1 ${MONO};letter-spacing:.25em;color:#5a5a5a;`, root);
    label.textContent = 'LOADING';
    const dots = Array.from(dotsWrap.children);
    gsap.set(fill, { scaleX: 0 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
      .addLabel('go')
      .to(dots, { y: -8, duration: 0.3, ease: 'sine.inOut', stagger: 0.12, yoyo: true, repeat: 3 }, 'go')
      .to(fill, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 'go')
      .to(label, { duration: 0.5, text: 'COMPLETE', color: '#e8e8e8', ease: 'none' }, '-=0.2')
      .to([dotsWrap, track, label], { autoAlpha: 0, duration: 0.4, stagger: 0.05 }, '+=0.5')
      .set([dotsWrap, track, label], { autoAlpha: 1 })
      .set(label, { text: 'LOADING', color: '#5a5a5a' });
    bind(cell, tl, () => gsap.killTweensOf([fill, label, dotsWrap, track, ...dots]));
  });

  /* ============================================================
     10 — WARP TUNNEL · 3D translateZ flight through perspective
     ============================================================ */
  R('gsap-tunnel', 'Warp tunnel',
`An endless 3D tunnel: rounded frames fly from deep in the distance toward
the camera through CSS perspective, each offset in depth and rotation so
they stream continuously, fading in far and out as they pass. The whole
scene slowly rolls. Pure GSAP 3D transforms (z, rotation).`,
  (root, cell) => {
    base(root, 'perspective:420px;');
    const scene = div('position:absolute;inset:0;transform-style:preserve-3d;', root);
    const N = 18, period = 4.2, loops = [], rings = [];
    for (let i = 0; i < N; i++) {
      const r = div(`position:absolute;left:50%;top:50%;width:74%;height:74%;margin:-37% 0 0 -37%;` +
        `border:2px solid ${i % 2 ? '#ff5b1f' : '#e8e8e8'};border-radius:12px;will-change:transform,opacity;`, scene);
      rings.push(r);
      const tl = gsap.timeline({ repeat: -1 })
        .fromTo(r, { z: -1700, autoAlpha: 0, rotationZ: i * 10 },
                   { z: 300, autoAlpha: 1, rotationZ: i * 10 + 50, duration: period * 0.72, ease: 'none' })
        .to(r, { z: 400, autoAlpha: 0, duration: period * 0.28, ease: 'power1.in' });
      tl.progress(i / N);            // distribute the frames evenly through the cycle
      loops.push(tl);
    }
    loops.push(gsap.to(scene, { rotationZ: 360, duration: 36, ease: 'none', repeat: -1 }));
    bind(cell, loops, () => gsap.killTweensOf([scene, ...rings]));
  });

  /* ============================================================
     11 — FLIP GRID · Flip plugin layout shuffle
     ============================================================ */
  R('gsap-flip', 'FLIP grid shuffle',
`A 3×3 grid of tiles. On each cycle the DOM order is shuffled and Flip.from
animates every tile smoothly from its old cell to its new one. Uses the
Flip plugin (First-Last-Invert-Play). Loops.`,
  (root, cell) => {
    base(root);
    const grid = div('display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:70%;aspect-ratio:1;', root);
    const items = [];
    for (let i = 0; i < 9; i++)
      items.push(div(`border-radius:3px;background:${i % 2 ? '#ff5b1f' : '#e8e8e8'};`, grid));
    function shuffle() {
      const state = window.Flip.getState(items);
      const arr = items.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      arr.forEach(n => grid.appendChild(n));
      window.Flip.from(state, { duration: 0.8, ease: 'power2.inOut', stagger: 0.03, absolute: true });
    }
    const loop = gsap.timeline({ repeat: -1, repeatDelay: 1 }).call(shuffle).to({}, { duration: 0.9 });
    bind(cell, loop, () => gsap.killTweensOf(items));
  });

  /* ============================================================
     12 — SINE WAVE · per-item staggered yoyo (traveling wave)
     ============================================================ */
  R('gsap-wave', 'Sine wave dots',
`A row of 16 dots rising and falling as a continuous traveling wave. One
tween with a stagger that itself repeats and yoyos, so each dot lags the
last. Dots brighten and grow at the crest. Loops.`,
  (root, cell) => {
    base(root);
    const wrap = div('display:flex;gap:6px;align-items:center;', root);
    const dots = [];
    for (let i = 0; i < 16; i++) dots.push(div('width:8px;height:8px;border-radius:50%;background:#ff5b1f;', wrap));
    const tw = gsap.to(dots, { y: -22, scale: 1.4, backgroundColor: '#e8e8e8', ease: 'sine.inOut',
      duration: 0.7, stagger: { each: 0.08, repeat: -1, yoyo: true } });
    bind(cell, tw, () => gsap.killTweensOf(dots));
  });

  /* ============================================================
     13 — 3D CARD FLIP · rotationX/Y + perspective
     ============================================================ */
  R('gsap-rotate3d', '3D card flip',
`A two-sided card flips on its Y axis between a dark "3D" face and an
orange "GSAP" face, pausing on each side, while a slow rotationX wobble
adds depth. Uses 3D transforms + perspective. Loops.`,
  (root, cell) => {
    base(root, 'perspective:700px;');
    const card = div('position:relative;width:52%;aspect-ratio:3/4;transform-style:preserve-3d;', root);
    const face = (bg, fg, txt, back) => {
      const f = div(`position:absolute;inset:0;display:grid;place-items:center;backface-visibility:hidden;` +
        `background:${bg};color:${fg};font:700 22px/1 ${MONO};border:1px solid #2a2a2a;` +
        (back ? 'transform:rotateY(180deg);' : ''), card);
      f.textContent = txt;
    };
    face('#0a0a0a', '#ff5b1f', '3D');
    face('#ff5b1f', '#0a0a0a', 'GSAP', true);
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power3.inOut' } })
      .to(card, { rotationY: 180, duration: 1.2 }).to({}, { duration: 0.8 })
      .to(card, { rotationY: 360, duration: 1.2 }).to({}, { duration: 0.8 });
    const wob = gsap.to(card, { rotationX: 12, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    bind(cell, [tl, wob], () => gsap.killTweensOf(card));
  });

  /* ============================================================
     14 — SQUASH & STRETCH · CustomBounce (synced bounce + squash eases)
     ============================================================ */
  R('gsap-bounce', 'Squash & stretch',
`A ball drops, deforms on impact and bounces with realistic, decaying hops.
CustomBounce generates two synced eases — one for the vertical bounce and a
matching one that squashes the ball flat exactly at each impact — while a
light-pool on the floor swells with every landing.`,
  (root, cell) => {
    base(root);
    window.CustomBounce.create('bnc', { strength: 0.66, squash: 2.4, squashID: 'bnc-squash' });
    const floorY = 80;                       // % from top
    div(`position:absolute;left:12%;right:12%;top:${floorY}%;height:2px;background:#2a2a2a;`, root);
    const pool = div(`position:absolute;left:50%;top:${floorY}%;width:90px;height:20px;` +
      `margin:-7px 0 0 -45px;border-radius:50%;background:radial-gradient(closest-side,#ff5b1f,transparent);`, root);
    const ball = div(`position:absolute;left:50%;top:${floorY}%;width:30px;height:30px;margin-left:-15px;` +
      `border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffd1bf,#ff5b1f 60%,#b33a10);`, root);
    gsap.set(ball, { yPercent: -100, transformOrigin: '50% 100%' });   // rest on the floor line
    gsap.set(pool, { transformOrigin: '50% 50%' });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.25 })
      .from(ball, { y: () => -root.clientHeight * 0.66, duration: 2, ease: 'bnc' }, 0)
      .to(ball, { scaleX: 1.45, scaleY: 0.55, duration: 2, ease: 'bnc-squash' }, 0)
      .fromTo(pool, { scaleX: 0.35, autoAlpha: 0.12 },
                    { scaleX: 1.1, autoAlpha: 0.5, duration: 2, ease: 'bnc' }, 0);
    bind(cell, tl, () => gsap.killTweensOf([ball, pool]));
  });

  /* ============================================================
     15 — PHYLLOTAXIS BLOOM · golden-angle spiral + radial stagger
     ============================================================ */
  R('gsap-phyllotaxis', 'Phyllotaxis bloom',
`240 dots arranged by the golden angle into a sunflower spiral, tinted in a
hue ramp from orange core to violet rim. A scale ripple rings outward from
the center and back via an index-ordered repeating/yoyo stagger, while the
whole field rotates slowly. Loops.`,
  (root, cell) => {
    base(root);
    const wrap = div('position:relative;width:90%;aspect-ratio:1;', root);
    const N = 240, golden = Math.PI * (3 - Math.sqrt(5)), dots = [];
    for (let i = 0; i < N; i++) {
      const a = i * golden, rad = Math.sqrt(i / N) * 46;     // 0..46% radius
      const x = 50 + Math.cos(a) * rad, y = 50 + Math.sin(a) * rad;
      const sz = 2 + (i / N) * 5, hue = 22 + (i / N) * 268;  // orange → violet
      dots.push(div(`position:absolute;left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;` +
        `margin:${-sz / 2}px 0 0 ${-sz / 2}px;border-radius:50%;background:hsl(${hue},90%,58%);`, wrap));
    }
    gsap.set(dots, { scale: 0.5, transformOrigin: 'center' });
    const ripple = gsap.to(dots, { scale: 1.3, ease: 'sine.inOut', duration: 1,
      stagger: { each: 0.011, from: 'start', repeat: -1, yoyo: true } });
    const spin = gsap.to(wrap, { rotation: 360, duration: 44, ease: 'none', repeat: -1 });
    bind(cell, [ripple, spin], () => gsap.killTweensOf([...dots, wrap]));
  });

  /* ============================================================
     16 — COUNTER + RING · synced number tween + DrawSVG ring
     ============================================================ */
  R('gsap-counter', 'Counter + ring',
`A percentage counter ticks 0→100 (snapped to whole numbers via onUpdate)
while a DrawSVG progress ring fills in perfect sync, with a little pop at
the end. Then it resets. Loops.`,
  (root, cell) => {
    base(root);
    const w = div('position:relative;width:62%;aspect-ratio:1;display:grid;place-items:center;', root);
    w.innerHTML = `<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#1c1c1c" stroke-width="6"/>
      <circle id="r" cx="50" cy="50" r="42" fill="none" stroke="#ff5b1f" stroke-width="6" stroke-linecap="round"/></svg>`;
    const num = div(`font:600 30px/1 ${MONO};color:#e8e8e8;`, w);
    num.textContent = '0%';
    const ring = w.querySelector('#r'), obj = { v: 0 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      .fromTo(ring, { drawSVG: '0%' }, { drawSVG: '100%', duration: 2.4, ease: 'power2.inOut' }, 0)
      .to(obj, { v: 100, duration: 2.4, ease: 'power2.inOut',
                 onUpdate() { num.textContent = gsap.utils.snap(1, obj.v) + '%'; } }, 0)
      .to(num, { scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '>-0.15');
    bind(cell, tl, () => gsap.killTweensOf([ring, obj, num]));
  });

  /* ============================================================
     17 — TYPEWRITER · TextPlugin type/erase with blinking caret
     ============================================================ */
  R('gsap-typewriter', 'Typewriter',
`A terminal that types out lines of GSAP code, pauses, erases, and types
the next — all via TextPlugin — beside a blinking block caret. Loops.`,
  (root, cell) => {
    base(root, 'padding:22px;flex-direction:column;align-items:flex-start;justify-content:center;');
    const holder = div('display:flex;align-items:center;', root);
    const line = div(`font:500 14px/1.5 ${MONO};color:#e8e8e8;white-space:pre-wrap;`, holder);
    const caret = div('width:8px;height:16px;background:#ff5b1f;margin-left:3px;', holder);
    const blink = gsap.to(caret, { autoAlpha: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' });
    const phrases = ['> gsap.to(box,{x:100})', '> ease: "elastic.out"', '> timeline().play()', '> repeat: -1 // forever'];
    const tl = gsap.timeline({ repeat: -1 });
    phrases.forEach((p) => {
      tl.to(line, { duration: p.length * 0.045, text: { value: p, delimiter: '' }, ease: 'none' })
        .to({}, { duration: 1.0 })
        .to(line, { duration: 0.5, text: { value: '', delimiter: '' }, ease: 'none' });
    });
    bind(cell, [tl, blink], () => gsap.killTweensOf([line, caret]));
  });

  /* ============================================================
     18 — WAVE TEXT · SplitText chars in a traveling wave
     ============================================================ */
  R('gsap-wavetext', 'Wave text',
`The word GREENSOCK split into characters; each letter rides up and back in
a continuous wave (staggered, repeating, yoyo tween) and tints orange at
the top. Uses SplitText. Loops.`,
  (root, cell) => {
    base(root, 'padding:16px;');
    const h = div(`font:700 clamp(22px,8vw,46px)/1 ${MONO};color:#e8e8e8;white-space:nowrap;`, root);
    h.textContent = 'GREENSOCK';
    const split = new window.SplitText(h, { type: 'chars' });
    gsap.set(split.chars, { display: 'inline-block' });
    const tw = gsap.to(split.chars, { y: -16, color: '#ff5b1f', ease: 'sine.inOut', duration: 0.6,
      stagger: { each: 0.06, repeat: -1, yoyo: true } });
    bind(cell, tw, () => { gsap.killTweensOf(split.chars); split.revert(); });
  });

  /* ============================================================
     19 — LIQUID BLOB · MorphSVG between random organic shapes
     ============================================================ */
  R('gsap-blob', 'Liquid blob',
`A gradient blob endlessly morphs between several random organic shapes
(MorphSVGPlugin) while slowly rotating, for a lava-lamp feel. Loops.`,
  (root, cell) => {
    base(root);
    const w = div('width:66%;aspect-ratio:1;', root);
    const b0 = blob(50, 50, 36, 0.16, 6), b1 = blob(50, 50, 36, 0.24, 6),
          b2 = blob(50, 50, 36, 0.18, 6), b3 = blob(50, 50, 36, 0.26, 6);
    w.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible;">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff5b1f"/><stop offset="1" stop-color="#7a1fff"/></linearGradient></defs>
      <path d="${b0}" fill="url(#bg)"/></svg>`;
    const p = w.querySelector('path');
    const tl = gsap.timeline({ repeat: -1, defaults: { duration: 1.6, ease: 'sine.inOut' } })
      .to(p, { morphSVG: b1 }).to(p, { morphSVG: b2 }).to(p, { morphSVG: b3 }).to(p, { morphSVG: b0 });
    const spin = gsap.to(p, { rotation: 360, transformOrigin: '50% 50%', duration: 16, ease: 'none', repeat: -1 });
    bind(cell, [tl, spin], () => gsap.killTweensOf(p));
  });

  /* ============================================================
     20 — INFINITE MARQUEE · seamless xPercent loop
     ============================================================ */
  R('gsap-marquee', 'Infinite marquee',
`Three stacked text rows scroll horizontally at different speeds and
directions, seamlessly looping by animating a duplicated strip xPercent
-50% with ease:"none". Loops forever with no visible seam.`,
  (root, cell) => {
    base(root, 'flex-direction:column;gap:10px;align-items:stretch;');
    const tweens = [], targets = [];
    function row(txt, dir, color, weight) {
      const r = div('overflow:hidden;white-space:nowrap;width:100%;', root);
      const strip = div(`display:inline-flex;will-change:transform;font:${weight} clamp(18px,6vw,30px)/1 ${MONO};` +
        `color:${color};letter-spacing:.04em;`, r);
      const unit = div('', strip); unit.textContent = (txt + '  ·  ').repeat(6);
      strip.appendChild(unit.cloneNode(true));
      targets.push(strip);
      tweens.push(gsap.fromTo(strip, { xPercent: dir > 0 ? -50 : 0 },
        { xPercent: dir > 0 ? 0 : -50, duration: 12, ease: 'none', repeat: -1 }));
    }
    row('GREENSOCK ANIMATION PLATFORM', 1, '#e8e8e8', 700);
    row('TWEEN · TIMELINE · EASE',     -1, '#ff5b1f', 500);
    row('REPEAT -1 · YOYO · STAGGER',   1, '#5a5a5a', 500);
    bind(cell, tweens, () => gsap.killTweensOf(targets));
  });

  /* ============================================================
     21 — MASKED LINE REVEAL · SplitText lines + clip masks
     ============================================================ */
  R('gsap-reveal', 'Masked line reveal',
`A headline split into lines, each clipped by its own mask. Lines slide up
into view from behind the mask with a stagger, hold, then slide up and out.
Uses SplitText (mask:"lines"). Loops.`,
  (root, cell) => {
    base(root, 'padding:20px;');
    const h = div(`font:700 clamp(18px,5.5vw,32px)/1.25 ${MONO};color:#e8e8e8;text-align:center;`, root);
    h.innerHTML = 'ANIMATE<br>WITH<br>GSAP';
    const split = new window.SplitText(h, { type: 'lines', mask: 'lines' });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      .from(split.lines, { yPercent: 110, duration: 0.7, ease: 'power3.out', stagger: 0.15 })
      .to(split.lines, { yPercent: -110, duration: 0.6, ease: 'power3.in', stagger: 0.12 }, '+=0.9');
    bind(cell, tl, () => { gsap.killTweensOf(split.lines); split.revert(); });
  });

  /* ============================================================
     22 — ODOMETER · rolling digit columns
     ============================================================ */
  R('gsap-odometer', 'Odometer',
`A four-digit odometer that counts up; each wheel rolls continuously at its
own rate (ones fast, thousands slow) by translating a 0–9 strip. Loops.`,
  (root, cell) => {
    base(root);
    const wrap = div('display:flex;gap:5px;', root);
    const cols = 4, H = 46, strips = [];
    for (let c = 0; c < cols; c++) {
      const win = div(`position:relative;width:30px;height:${H}px;overflow:hidden;` +
        `background:#0d0d0d;border:1px solid #222;border-radius:4px;`, wrap);
      const strip = div(`position:absolute;left:0;top:0;width:100%;display:flex;flex-direction:column;` +
        `align-items:center;font:700 32px/${H}px ${MONO};color:#ff5b1f;`, win);
      for (let d = 0; d <= 10; d++) { const c0 = div(`height:${H}px;`, strip); c0.textContent = d % 10; }
      strips.push(strip);
    }
    const obj = { v: 0 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
      .to(obj, { v: 9999, duration: 5, ease: 'power1.inOut', onUpdate() {
        const div10 = [obj.v / 1000, obj.v / 100, obj.v / 10, obj.v];
        for (let c = 0; c < cols; c++) gsap.set(strips[c], { y: -((div10[c] % 10 + 10) % 10) * H });
      } });
    bind(cell, tl, () => gsap.killTweensOf([obj, ...strips]));
  });

  /* ============================================================
     23 — WAVEFORM · layered sine paths redrawn each frame
     ============================================================ */
  R('gsap-waveform', 'Waveform',
`Three layered sine waves flowing across the cell, each path's "d" rebuilt
every frame from an animated phase and tapered to zero at the edges. A
single tween drives the phase via onUpdate. Loops.`,
  (root, cell) => {
    base(root);
    const w = div('width:90%;height:58%;', root);
    w.innerHTML = `<svg viewBox="0 0 200 100" preserveAspectRatio="none" style="width:100%;height:100%;overflow:visible;">
      <path id="w1" fill="none" stroke="#ff5b1f" stroke-width="2"/>
      <path id="w2" fill="none" stroke="#7a1fff" stroke-width="1.6" opacity="0.7"/>
      <path id="w3" fill="none" stroke="#e8e8e8" stroke-width="1" opacity="0.35"/></svg>`;
    const paths = [...w.querySelectorAll('path')];
    const cfg = [{ a: 24, f: 2, s: 1 }, { a: 18, f: 3, s: -0.75 }, { a: 12, f: 1.5, s: 1.5 }];
    const obj = { t: 0 };
    function draw() {
      paths.forEach((p, i) => {
        const { a, f, s } = cfg[i]; let d = 'M0,50';
        for (let x = 0; x <= 200; x += 4) {
          const env = Math.sin((x / 200) * Math.PI);
          d += ` L${x},${(50 + Math.sin((x / 200) * Math.PI * 2 * f + obj.t * s) * a * env).toFixed(1)}`;
        }
        p.setAttribute('d', d);
      });
    }
    const tw = gsap.to(obj, { t: Math.PI * 2, duration: 3, ease: 'none', repeat: -1, onUpdate: draw });
    draw();
    bind(cell, tw, () => {});
  });

  /* ============================================================
     24 — SKILL BARS · staggered fills + live counters
     ============================================================ */
  R('gsap-bars', 'Skill bars',
`Labelled progress bars fill to their targets with a stagger while each
percentage counts up in sync via onUpdate, then drain and repeat. Loops.`,
  (root, cell) => {
    base(root, 'flex-direction:column;gap:11px;padding:24px;align-items:stretch;');
    const data = [['MOTION', 92], ['TIMELINE', 78], ['EASING', 88], ['SVG', 64], ['PHYSICS', 71]];
    const fills = [], nums = [];
    data.forEach(([name, pct]) => {
      const row = div('', root);
      const head = div(`display:flex;justify-content:space-between;font:500 10px/1.5 ${MONO};letter-spacing:.1em;color:#9a9a9a;`, row);
      const label = div('', head); label.textContent = name;
      const num = div('', head); num.textContent = '0%'; num.style.color = '#ff5b1f';
      const track = div('height:5px;background:#1c1c1c;border-radius:3px;overflow:hidden;margin-top:4px;', row);
      const fill = div('height:100%;width:100%;background:linear-gradient(90deg,#ff5b1f,#ffd1bf);transform-origin:left;', track);
      gsap.set(fill, { scaleX: 0 });
      fills.push({ fill, pct }); nums.push(num);
    });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    fills.forEach((f, i) => {
      const o = { v: 0 };
      tl.to(f.fill, { scaleX: f.pct / 100, duration: 1.1, ease: 'power2.out' }, i * 0.12)
        .to(o, { v: f.pct, duration: 1.1, ease: 'power2.out', onUpdate() { nums[i].textContent = Math.round(o.v) + '%'; } }, i * 0.12);
    });
    tl.to(fills.map(f => f.fill), { scaleX: 0, duration: 0.5, stagger: 0.05 }, '+=0.9')
      .add(() => nums.forEach(n => n.textContent = '0%'));
    bind(cell, tl, () => {});
  });

  /* ============================================================
     25 — 3D CUBE · six faces, continuous tumble
     ============================================================ */
  R('gsap-cube', '3D cube',
`A real CSS 3D cube: six colored faces positioned with translateZ inside a
preserve-3d scene that tumbles on two axes at different speeds. Loops.`,
  (root, cell) => {
    base(root, 'perspective:600px;');
    const S = 110, scene = div('position:relative;width:0;height:0;transform-style:preserve-3d;', root);
    const faces = [
      ['#ff5b1f', `rotateY(0deg) translateZ(${S / 2}px)`], ['#e8e8e8', `rotateY(90deg) translateZ(${S / 2}px)`],
      ['#7a1fff', `rotateY(180deg) translateZ(${S / 2}px)`], ['#1fa8ff', `rotateY(270deg) translateZ(${S / 2}px)`],
      ['#ffd1bf', `rotateX(90deg) translateZ(${S / 2}px)`], ['#ff4da6', `rotateX(-90deg) translateZ(${S / 2}px)`],
    ];
    faces.forEach(([c, t]) => {
      const f = div(`position:absolute;width:${S}px;height:${S}px;margin:${-S / 2}px 0 0 ${-S / 2}px;` +
        `background:${c};opacity:0.9;border:1px solid #000;`, scene);
      f.style.transform = t;
    });
    const a = gsap.to(scene, { rotateY: 360, duration: 10, ease: 'none', repeat: -1 });
    const b = gsap.to(scene, { rotateX: 360, duration: 14, ease: 'none', repeat: -1 });
    bind(cell, [a, b], () => gsap.killTweensOf(scene));
  });

  /* ============================================================
     26 — DNA HELIX · two phase-shifted strands + rungs
     ============================================================ */
  R('gsap-dna', 'DNA helix',
`A rotating double helix: two strands of nodes set by sin/cos of a phase,
with depth faked through scale, opacity and z-index, and rungs spanning the
pair. A single tween drives the phase via onUpdate. Loops.`,
  (root, cell) => {
    base(root);
    const wrap = div('position:relative;width:60%;height:90%;', root);
    const N = 18, A = 0.42, rungs = [];
    for (let i = 0; i < N; i++) {
      const y = (i / (N - 1)) * 100;
      const bar = div(`position:absolute;left:50%;top:${y}%;height:2px;background:#4a4a4a;`, wrap);
      const a = div(`position:absolute;left:50%;top:${y}%;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;background:#ff5b1f;`, wrap);
      const b = div(`position:absolute;left:50%;top:${y}%;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;background:#1fa8ff;`, wrap);
      rungs.push({ a, b, bar, i });
    }
    const obj = { p: 0 };
    function draw() {
      const W = wrap.clientWidth;
      rungs.forEach(({ a, b, bar, i }) => {
        const ph = obj.p + i * 0.5, off = Math.sin(ph), depth = Math.cos(ph);
        const x1 = off * A * W, x2 = -off * A * W;
        gsap.set(a, { x: x1, scale: 0.6 + 0.4 * (depth + 1) / 2, zIndex: Math.round(depth * 10) + 20, opacity: 0.35 + 0.65 * (depth + 1) / 2 });
        gsap.set(b, { x: x2, scale: 0.6 + 0.4 * (-depth + 1) / 2, zIndex: Math.round(-depth * 10) + 20, opacity: 0.35 + 0.65 * (-depth + 1) / 2 });
        gsap.set(bar, { x: Math.min(x1, x2), width: Math.abs(x1 - x2), opacity: 0.15 + 0.3 * Math.abs(depth) });
      });
    }
    const tw = gsap.to(obj, { p: Math.PI * 2, duration: 4, ease: 'none', repeat: -1, onUpdate: draw });
    draw();
    bind(cell, tw, () => gsap.killTweensOf(rungs.flatMap(r => [r.a, r.b, r.bar])));
  });

  /* ============================================================
     27 — GRADIENT SHIMMER · animated sheen across clipped text
     ============================================================ */
  R('gsap-shimmer', 'Gradient shimmer',
`Bold text painted with a gradient clipped to the glyphs; a bright sheen
sweeps across by animating background-position. Loops.`,
  (root, cell) => {
    base(root, 'padding:16px;');
    const h = div(`font:800 clamp(30px,11vw,60px)/1 ${MONO};letter-spacing:.02em;` +
      `background:linear-gradient(110deg,#3a1f12 0%,#3a1f12 38%,#ff5b1f 48%,#ffe7dc 52%,#ff5b1f 56%,#3a1f12 66%,#3a1f12 100%);` +
      `background-size:300% 100%;-webkit-background-clip:text;background-clip:text;` +
      `color:transparent;-webkit-text-fill-color:transparent;`, root);
    h.textContent = 'GSAP';
    const tw = gsap.fromTo(h, { backgroundPosition: '150% 0' },
      { backgroundPosition: '-150% 0', duration: 2.4, ease: 'power1.inOut', repeat: -1, repeatDelay: 0.5 });
    bind(cell, tw, () => gsap.killTweensOf(h));
  });

  /* ============================================================
     28 — VORTEX · concentric bands in differential rotation
     ============================================================ */
  R('gsap-vortex', 'Vortex',
`Particles grouped into concentric bands; inner bands spin faster than outer
ones (differential rotation) so the field shears into a galaxy-like swirl.
Pure rotation tweens, seamless loop.`,
  (root, cell) => {
    base(root, 'overflow:hidden;');
    const wrap = div('position:relative;width:100%;height:100%;', root);
    const bands = 6, loops = [], all = [];
    for (let b = 0; b < bands; b++) {
      const ring = div('position:absolute;inset:0;', wrap);
      gsap.set(ring, { transformOrigin: '50% 50%' });
      const count = 8 + b * 6, rmin = (b / bands) * 48, rmax = ((b + 1) / bands) * 48;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2, rr = rmin + Math.random() * (rmax - rmin);
        const x = 50 + Math.cos(ang) * rr, y = 50 + Math.sin(ang) * rr;
        const sz = 1.5 + (1 - b / bands) * 3, hue = 18 + (b / bands) * 50;
        all.push(div(`position:absolute;left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;` +
          `margin:${-sz / 2}px 0 0 ${-sz / 2}px;border-radius:50%;background:hsl(${hue},95%,${62 - b * 4}%);`, ring));
      }
      loops.push(gsap.to(ring, { rotation: 360, duration: 5 + b * 3.5, ease: 'none', repeat: -1 }));
    }
    bind(cell, loops, () => gsap.killTweensOf([...all, wrap.children]));
  });

  /* ============================================================
     29 — RADIAL MENU · items spring out on an arc (back ease)
     ============================================================ */
  R('gsap-radial', 'Radial menu',
`A center button rotates as eight items spring outward into a ring with a
back ease and stagger, hold, then retract. Function-based stagger values
place each item by angle. Loops.`,
  (root, cell) => {
    base(root);
    const wrap = div('position:relative;width:80%;aspect-ratio:1;', root);
    const center = div(`position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;` +
      `border-radius:50%;background:#ff5b1f;display:grid;place-items:center;color:#000;font:700 20px/1 ${MONO};`, wrap);
    center.textContent = '+';
    const N = 8, items = [];
    for (let i = 0; i < N; i++) {
      const it = div('position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#e8e8e8;', wrap);
      it._a = (i / N) * Math.PI * 2 - Math.PI / 2; items.push(it);
    }
    gsap.set(items, { scale: 0 });
    const Rd = () => wrap.clientWidth * 0.36;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(center, { rotation: 135, duration: 0.4, ease: 'back.out(2)' }, 0)
      .to(items, { scale: 1, x: i => Math.cos(items[i]._a) * Rd(), y: i => Math.sin(items[i]._a) * Rd(),
                   duration: 0.7, ease: 'back.out(1.8)', stagger: 0.05 }, 0.1)
      .to(items, { scale: 0, x: 0, y: 0, duration: 0.4, ease: 'back.in(1.5)', stagger: 0.03 }, '+=0.9')
      .to(center, { rotation: 0, duration: 0.3 }, '<');
    bind(cell, tl, () => gsap.killTweensOf([center, ...items]));
  });

  /* ============================================================
     30 — SUCCESS CHECK · DrawSVG ring + checkmark, pop, fade
     ============================================================ */
  R('gsap-check', 'Success check',
`A confirmation animation: the ring draws around, the checkmark draws in,
the whole mark pops with a back ease, holds, then fades and replays. Uses
DrawSVGPlugin. Loops.`,
  (root, cell) => {
    base(root);
    const w = div('width:46%;aspect-ratio:1;', root);
    w.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible;">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#ff5b1f" stroke-width="5"/>
      <path d="M30,52 L45,67 L72,36" fill="none" stroke="#ff5b1f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const ring = w.querySelector('circle'), check = w.querySelector('path');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9 })
      .from(ring, { drawSVG: '0%', duration: 0.7, ease: 'power2.inOut' })
      .from(check, { drawSVG: '0%', duration: 0.4, ease: 'power2.out' }, '-=0.05')
      .to(w, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut', transformOrigin: '50% 50%' })
      .to(w.firstElementChild, { autoAlpha: 0, duration: 0.4 }, '+=0.6');
    bind(cell, tl, () => gsap.killTweensOf([ring, check, w, w.firstElementChild]));
  });

  /* ============================================================
     31 — 3D RIPPLE · dot matrix on a tilted plane, radial wave
     ============================================================ */
  R('gsap-ripple', '3D ripple',
`A grid of dots on a plane tilted in 3D; a radial wave travels outward from
the center, displacing each dot in z (with matching scale/opacity) as a
function of its distance and time. Seamless loop driven by onUpdate.`,
  (root, cell) => {
    base(root, 'perspective:600px;');
    const scene = div('position:absolute;inset:0;display:grid;place-items:center;transform-style:preserve-3d;', root);
    const G = 12, grid = div(`display:grid;grid-template-columns:repeat(${G},10px);gap:7px;transform:rotateX(56deg);transform-style:preserve-3d;`, scene);
    const dots = [], c = (G - 1) / 2;
    for (let r = 0; r < G; r++) for (let col = 0; col < G; col++) {
      dots.push({ d: div('width:8px;height:8px;border-radius:50%;background:#ff5b1f;', grid), dist: Math.hypot(col - c, r - c) });
    }
    const obj = { t: 0 };
    function draw() {
      dots.forEach(({ d, dist }) => {
        const z = Math.sin(dist * 0.6 - obj.t * Math.PI * 2) * 16, k = (z + 16) / 32;
        gsap.set(d, { z, opacity: 0.35 + k * 0.65, scale: 0.5 + k * 0.7 });
      });
    }
    const tw = gsap.to(obj, { t: 1, duration: 2.4, ease: 'none', repeat: -1, onUpdate: draw });
    draw();
    bind(cell, tw, () => gsap.killTweensOf(dots.map(o => o.d)));
  });

  /* ============================================================
     32 — SPOTLIGHT · radial mask sweeping over text
     ============================================================ */
  R('gsap-spotlight', 'Spotlight text',
`Dim text with a bright copy on top, revealed only through a circular mask
that sweeps left-to-right. The mask follows an animated CSS variable. Loops.`,
  (root, cell) => {
    base(root, 'padding:16px;');
    const stage = div('position:relative;', root);
    const css = `font:800 clamp(24px,8vw,42px)/1 ${MONO};letter-spacing:.04em;`;
    const dim = div(css + 'color:#262626;', stage); dim.textContent = 'SPOTLIGHT';
    const bright = div('position:absolute;inset:0;' + css + 'color:#ff5b1f;', stage); bright.textContent = 'SPOTLIGHT';
    const mask = 'radial-gradient(circle 46px at var(--mx) 50%, #000 52%, transparent 72%)';
    bright.style.webkitMaskImage = mask; bright.style.maskImage = mask;
    const tw = gsap.fromTo(bright, { '--mx': '-12%' },
      { '--mx': '112%', duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
    bind(cell, tw, () => gsap.killTweensOf(bright));
  });

  /* ============================================================
     33 — LIQUID FILL · rising wavy surface clipped to a circle
     ============================================================ */
  R('gsap-liquid', 'Liquid fill',
`A circle fills with liquid: a wavy surface ripples horizontally (a wide
sine path looping seamlessly) while the whole body rises and drains, with a
live percentage. Loops.`,
  (root, cell) => {
    base(root);
    const w = div('width:52%;aspect-ratio:1;', root);
    w.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible;">
      <defs><clipPath id="lqclip"><circle cx="50" cy="50" r="44"/></clipPath></defs>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#ff5b1f" stroke-width="2.5"/>
      <g clip-path="url(#lqclip)"><g id="lq"><path id="lqw" fill="#ff5b1f" opacity="0.85"/></g></g>
      <text id="lqp" x="50" y="55" text-anchor="middle" font-family="monospace" font-size="17" font-weight="700" fill="#fff">0%</text></svg>`;
    const wave = w.querySelector('#lqw'), body = w.querySelector('#lq'), pct = w.querySelector('#lqp');
    let d = 'M0,0'; for (let x = 0; x <= 200; x += 5) d += ` L${x},${(Math.sin((x / 50) * Math.PI) * 3).toFixed(1)}`;
    wave.setAttribute('d', d + ' L200,120 L0,120 Z');
    const ripple = gsap.fromTo(wave, { x: 0 }, { x: -100, duration: 1.6, ease: 'none', repeat: -1 });
    const obj = { v: 0 };
    const setFill = () => { gsap.set(body, { y: 96 - (obj.v / 100) * 90 }); pct.textContent = Math.round(obj.v) + '%'; };
    gsap.set(body, { y: 96 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
      .to(obj, { v: 100, duration: 3, ease: 'power1.inOut', onUpdate: setFill })
      .to({}, { duration: 0.5 })
      .to(obj, { v: 0, duration: 1.4, ease: 'power1.in', onUpdate: setFill });
    bind(cell, [tl, ripple], () => gsap.killTweensOf([wave, body, obj]));
  });

  /* ============================================================
     34 — GOOEY LOADER · SVG goo filter merges orbiting blobs
     ============================================================ */
  R('gsap-gooey', 'Gooey loader',
`Satellite circles orbit a core; an SVG blur + threshold filter fuses them
into a metaball that stretches and splits as they pass. Seamless integer
periods keep the loop smooth.`,
  (root, cell) => {
    base(root);
    const w = div('width:70%;aspect-ratio:1;', root);
    w.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible;">
      <defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
        <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"/></filter></defs>
      <g filter="url(#goo)" fill="#ff5b1f">
        <circle cx="50" cy="50" r="12"/><circle id="g1" cx="50" cy="50" r="8.5"/>
        <circle id="g2" cx="50" cy="50" r="8.5"/><circle id="g3" cx="50" cy="50" r="7"/></g></svg>`;
    const sats = [
      { el: w.querySelector('#g1'), r: 24, sp: 1, ph: 0 },
      { el: w.querySelector('#g2'), r: 19, sp: -1, ph: 1.5 },
      { el: w.querySelector('#g3'), r: 28, sp: 2, ph: 3 },
    ];
    const obj = { t: 0 };
    function draw() { sats.forEach(s => { const a = obj.t * s.sp + s.ph; s.el.setAttribute('cx', 50 + Math.cos(a) * s.r); s.el.setAttribute('cy', 50 + Math.sin(a) * s.r); }); }
    const tw = gsap.to(obj, { t: Math.PI * 2, duration: 3.5, ease: 'none', repeat: -1, onUpdate: draw });
    draw();
    bind(cell, tw, () => {});
  });

  /* ============================================================
     35 — 3D CAROUSEL · cards ringed around a cylinder
     ============================================================ */
  R('gsap-carousel', '3D carousel',
`Numbered cards arranged around a cylinder (rotateY + translateZ) inside a
preserve-3d scene that spins continuously with a gentle tilt wobble. Loops.`,
  (root, cell) => {
    base(root, 'perspective:760px;');
    const scene = div('position:relative;width:0;height:0;transform-style:preserve-3d;', root);
    const N = 8, Rd = 130, step = 360 / N;
    for (let i = 0; i < N; i++) {
      const card = div(`position:absolute;width:80px;height:112px;margin:-56px 0 0 -40px;` +
        `background:linear-gradient(160deg,#1c1c1c,#080808);border:1px solid ${i % 2 ? '#ff5b1f' : '#444'};` +
        `border-radius:9px;display:grid;place-items:center;font:700 24px/1 ${MONO};color:#ff5b1f;`, scene);
      card.textContent = String(i + 1).padStart(2, '0');
      card.style.transform = `rotateY(${i * step}deg) translateZ(${Rd}px)`;
    }
    const spin = gsap.to(scene, { rotateY: 360, duration: 16, ease: 'none', repeat: -1 });
    const tilt = gsap.to(scene, { rotateX: 10, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    bind(cell, [spin, tilt], () => gsap.killTweensOf(scene));
  });

  /* ============================================================
     36 — TEXT EXPLODE · Physics2D scatter, then reassemble
     ============================================================ */
  R('gsap-explode', 'Text explode',
`Characters of a word blast apart on physics trajectories (velocity, angle,
gravity, spin) and fade, then snap back together with a back ease. Uses
SplitText + Physics2DPlugin. Loops.`,
  (root, cell) => {
    base(root, 'padding:16px;');
    const h = div(`font:800 clamp(26px,9vw,46px)/1 ${MONO};color:#ff5b1f;`, root);
    h.textContent = 'EXPLODE';
    const split = new window.SplitText(h, { type: 'chars' });
    const chars = split.chars;
    gsap.set(chars, { display: 'inline-block' });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
    chars.forEach((ch, i) => {
      tl.to(ch, { duration: gsap.utils.random(0.9, 1.3), autoAlpha: 0, rotation: gsap.utils.random(-220, 220), ease: 'none',
        physics2D: { velocity: gsap.utils.random(140, 280), angle: gsap.utils.random(0, 360), gravity: 90 } }, i * 0.015);
    });
    tl.set(chars, { clearProps: 'transform,opacity,visibility' }, '>')
      .from(chars, { duration: 0.6, scale: 0, autoAlpha: 0, rotationX: -90, transformOrigin: '50% 50%', stagger: 0.04, ease: 'back.out(1.7)' }, '+=0.25');
    bind(cell, tl, () => { gsap.killTweensOf(chars); split.revert(); });
  });

  /* ============================================================
     37 — PENDULUM WAVE · phase-drifting pendulums realign
     ============================================================ */
  R('gsap-pendulum', 'Pendulum wave',
`Fifteen pendulums of increasing length swing at incrementally different
periods, so the row drifts through snaking patterns and realigns each
cycle — the classic pendulum-wave illusion. Pure sine-eased yoyo tweens.`,
  (root, cell) => {
    base(root);
    const wrap = div('position:relative;width:92%;height:90%;', root);
    const N = 15, T = 11, base0 = 24, loops = [], arms = [];
    for (let i = 0; i < N; i++) {
      const len = 22 + (74 - 22) * (i / (N - 1)), x = ((i + 0.5) / N) * 100;
      const arm = div(`position:absolute;left:${x}%;top:0;width:1px;height:${len}%;background:#3a3a3a;transform-origin:top center;`, wrap);
      div(`position:absolute;left:50%;bottom:-5px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:hsl(${20 + (i / N) * 70},90%,56%);`, arm);
      arms.push(arm);
      const period = T / (base0 + i);
      loops.push(gsap.fromTo(arm, { rotation: -30 }, { rotation: 30, duration: period / 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }
    bind(cell, loops, () => gsap.killTweensOf(arms));
  });

  /* ============================================================
     38 — STARBURST · rotating rays with a staggered length pulse
     ============================================================ */
  R('gsap-rays', 'Starburst',
`Radial rays fan out from the center, slowly rotating while a length pulse
sweeps around them via a stagger — a breathing sunburst. Loops.`,
  (root, cell) => {
    base(root, 'overflow:hidden;');
    const hub = div('position:absolute;left:50%;top:50%;width:0;height:0;', root);
    const N = 36, rays = [];
    for (let i = 0; i < N; i++) {
      const ray = div(`position:absolute;left:0;top:0;width:3px;height:150px;margin-left:-1.5px;` +
        `transform-origin:top center;background:linear-gradient(${i % 2 ? '#ff5b1f' : '#7a1fff'},transparent);`, hub);
      gsap.set(ray, { rotation: (i / N) * 360 });
      rays.push(ray);
    }
    const spin = gsap.to(hub, { rotation: 360, duration: 20, ease: 'none', repeat: -1 });
    const pulse = gsap.to(rays, { scaleY: 0.4, transformOrigin: 'top center', duration: 1.3, ease: 'sine.inOut',
      yoyo: true, repeat: -1, stagger: { each: 0.045, from: 'start' } });
    bind(cell, [spin, pulse], () => gsap.killTweensOf([hub, ...rays]));
  });

  /* ============================================================
     39 — GLITCH · RoughEase jitter + chromatic ghosts
     ============================================================ */
  R('gsap-glitch', 'Glitch text',
`Text that judders with a RoughEase (jagged, randomized motion) while cyan
and magenta ghost copies tear away and snap back — a chromatic glitch.
Showcases EasePack's RoughEase. Loops.`,
  (root, cell) => {
    base(root);
    const stage = div('position:relative;', root);
    const css = `font:800 clamp(26px,9vw,48px)/1 ${MONO};letter-spacing:.03em;`;
    const cyan = div('position:absolute;inset:0;' + css + 'color:#00e5ff;mix-blend-mode:screen;', stage); cyan.textContent = 'GLITCH';
    const mag = div('position:absolute;inset:0;' + css + 'color:#ff2db5;mix-blend-mode:screen;', stage); mag.textContent = 'GLITCH';
    const main = div(css + 'color:#e8e8e8;', stage); main.textContent = 'GLITCH';
    const rough = s => `rough({strength:${s},points:30,template:none,taper:none,randomize:true,clamp:false})`;
    const tl = gsap.timeline({ repeat: -1 })
      .to(main, { x: 5, duration: 0.5, ease: rough(8) }, 0)
      .to(cyan, { x: -8, y: 2, duration: 0.5, ease: rough(12) }, 0)
      .to(mag, { x: 8, y: -2, duration: 0.5, ease: rough(12) }, 0)
      .to([main, cyan, mag], { x: 0, y: 0, duration: 0.4, ease: rough(4) })
      .to({}, { duration: 0.7 });
    bind(cell, tl, () => gsap.killTweensOf([main, cyan, mag]));
  });

  /* ============================================================
     40 — JELLY · CustomWiggle squash-and-wobble
     ============================================================ */
  R('gsap-wiggle', 'Jelly wobble',
`A gummy tile gets squashed, then wobbles back to rest — its scale and
rotation settling through a CustomWiggle ease for an organic, decaying
jiggle. Loops.`,
  (root, cell) => {
    base(root, 'flex-direction:column;gap:18px;');
    window.CustomWiggle.create('jelly', { wiggles: 9, type: 'easeOut' });
    window.CustomWiggle.create('jelly2', { wiggles: 6, type: 'anticipate' });
    const box = div('width:96px;height:96px;border-radius:16px;background:linear-gradient(135deg,#ff5b1f,#ff2db5);', root);
    const label = div(`font:500 9px/1 ${MONO};letter-spacing:.22em;color:#5a5a5a;`, root); label.textContent = 'CUSTOMWIGGLE';
    gsap.set(box, { transformOrigin: '50% 100%' });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
      .to(box, { scaleX: 1.35, scaleY: 0.65, duration: 0.16, ease: 'power2.in' })
      .to(box, { scaleX: 1, scaleY: 1, duration: 1.3, ease: 'jelly' })
      .to(box, { rotation: 10, duration: 1.1, ease: 'jelly2' }, '<');
    bind(cell, tl, () => gsap.killTweensOf(box));
  });

})();
