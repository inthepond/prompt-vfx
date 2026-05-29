<div align="center">

<img src="assets/banner.svg?v=3" alt="prompt-vfx" width="100%" />

<br/>

**Visual effects, generated from prompts.** A live gallery where every cell is one effect — described in plain language, implemented as a tiny self-contained module, rendered in your browser.

[![Live Demo](https://img.shields.io/badge/▶_live_demo-ff5b1f?style=for-the-badge)](https://inthepond.github.io/prompt-vfx/)
&nbsp;
![No Build](https://img.shields.io/badge/no_build-000?style=for-the-badge&logo=html5&logoColor=white)
&nbsp;
![GSAP](https://img.shields.io/badge/GSAP_3.13-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
&nbsp;
![Three.js](https://img.shields.io/badge/three.js_r137-000?style=for-the-badge&logo=three.js&logoColor=white)

</div>

---

## ✨ What's inside

<table>
<tr>
<td width="33%" valign="top">

### 🟢 VFX · 100
2D canvas + DOM/CSS

Particles, fields & text FX — snow, embers, boids, fireworks, metaballs, voronoi, curl-noise, plasma, glitch, ASCII rain, pixel-sort, starfields…

</td>
<td width="33%" valign="top">

### 🔵 GSAP · 40
Timeline-driven

Morphing, motion paths, FLIP, 3D transforms, DrawSVG, scramble text — built on **GSAP 3.13** + plugins.

</td>
<td width="33%" valign="top">

### 🟠 3D · 22
WebGL via Three.js

Fragment shaders (plasma, fluid, kaleidoscope, raymarched SDFs, Julia sets, aurora, caustics) + true-3D scenes — all pointer-reactive.

</td>
</tr>
</table>

> 💡 Click the **`P`** badge on any cell to reveal the prompt that produced it.

## 🚀 Run it

It's fully static — serve the folder and open it:

```bash
python3 -m http.server 8000
# → open http://localhost:8000/
```

No install, no bundler, no dependencies.

## 🧩 How it works

The page renders a responsive grid and **lazily mounts** each effect on first scroll into view (`IntersectionObserver`). A per-cell lifecycle **pauses** offscreen cells and **tears them down** on tab switch — only what you can see is doing work.

```
index.html ········· grid · per-cell lifecycle · tabs · 20 inline VFX
effects-extras.js ··· 80 canvas VFX        →  window.EFFECTS_EXTRA
gsap-modules.js ····· 40 GSAP effects       →  pause/kill timelines with the cell
three-modules.js ···· 22 WebGL effects      →  one shared renderer, blit per cell
```

### Write an effect from a prompt

The 3D tier defines a tiny contract so a prompt maps straight to code:

```js
// Fragment shader — uniforms u_time, u_resolution, u_mouse are provided.
R3('my-effect', 'My effect', 'a glowing field that pulses with the cursor', fragEffect(`
  void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(uv, 0.5 + 0.5*sin(u_time), 1.0);
  }
`));

// …or a full 3D scene.
R3('my-3d', 'My 3D', 'a spinning knot', (THREE, env) => {
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  // build scene…
  return { scene, camera, update(t, env) { /* per-frame */ } };
});
```

## 🛠 Tech

`Vanilla JS` · `GSAP 3.13` · `Three.js r137` · `GitHub Pages` — zero build step.

---

<div align="center">
<sub>

`docs/superpowers/` holds the design spec + plan for the 3D tier · `ui-modules.js` is experimental and not yet wired into the tabs

</sub>
</div>
