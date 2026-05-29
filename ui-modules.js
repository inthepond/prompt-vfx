/* UI Modules — populates window.UI_MODULES (registry) and adds mounters
   to window.mounters (or window.__pendingMounters). Each cell is its own
   micro-canvas with bespoke aesthetic. */

(function () {
  const REG = (window.UI_MODULES = []);
  const M = (window.mounters = window.mounters || window.__pendingMounters || {});
  if (!window.mounters) window.mounters = M;
  if (!window.__pendingMounters) window.__pendingMounters = M;

  function R(category, id, name, prompt, mount) {
    REG.push({ id, name, prompt, category });
    M[id] = mount;
  }

  /* ============================================================
     LAYOUTS — 20 cells. Each is a self-contained mini canvas with
     its own typography, palette and aesthetic.
     ============================================================ */

  R('layouts', 'lay-hero-classic', 'Hero · split editorial',
`Two-column hero. Left: oversized serif headline (clamp 36-72px), short
sub-deck in a sans, two CTAs (filled + ghost). Right: a textured
placeholder block. Off-white bg #f5f1ea, ink #111. Generous 8px grid.`,
(root) => {
  root.style.cssText += `
    background:#f5f1ea; color:#111; padding:18px;
    font-family: 'Times New Roman', serif;
    display:grid; grid-template-columns: 1.3fr 1fr; gap: 14px; align-items:center;`;
  root.innerHTML = `
    <div>
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.2em; color:#666; margin-bottom:14px;">— ISSUE 14</div>
      <h1 style="font-size:clamp(22px, 4.4vw, 38px); margin:0 0 10px; font-weight:500; line-height:1.05; letter-spacing:-0.02em;">A quieter<br/>kind of <em>luxury.</em></h1>
      <p style="font:400 11px/1.5 ui-sans-serif, system-ui; color:#444; margin:0 0 14px; max-width:34ch;">Furniture and objects, made carefully and seldom.</p>
      <div style="display:flex; gap:8px;">
        <span style="font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em; padding:9px 14px; background:#111; color:#f5f1ea;">SHOP →</span>
        <span style="font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em; padding:9px 14px; border:1px solid #111; color:#111;">JOURNAL</span>
      </div>
    </div>
    <div style="aspect-ratio:4/5; background:
      repeating-linear-gradient(-30deg, #cdbfa6 0 6px, #b8a98c 6px 8px),
      #b8a98c; position:relative;">
      <div style="position:absolute; inset:8px; border:1px solid rgba(0,0,0,.25);"></div>
    </div>`;
});

  R('layouts', 'lay-hero-brutal', 'Hero · brutalist mono',
`Brutalist hero, stark white-on-black. Massive sans-serif headline that
fills the cell. Tiny scaffold of metadata in the corners (issue,
date, location). One link "→ START".`,
(root) => {
  root.style.cssText += `
    background:#000; color:#fff; padding:14px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    display:grid; grid-template-rows: auto 1fr auto; gap: 8px;`;
  root.innerHTML = `
    <div style="display:flex; justify-content:space-between; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#888;">
      <span>FIELD/02</span><span>02.05.26</span>
    </div>
    <div style="display:grid; place-items:center;">
      <div style="font-weight:900; font-size:clamp(28px, 9vw, 80px); line-height:0.85; letter-spacing:-0.04em;">
        BUILD<br/>LOUD<sup style="font-size:.3em; vertical-align:top;">®</sup>
      </div>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:end;">
      <span style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#888;">BERLIN · NYC</span>
      <span style="font:500 11px/1 'JetBrains Mono', monospace; letter-spacing:.16em; border-bottom:1px solid #fff; padding-bottom:2px;">→ START</span>
    </div>`;
});

  R('layouts', 'lay-pricing-3', 'Pricing · 3 tiers',
`Three pricing tiers in a row. Middle tier elevated with a subtle
"Most popular" tag. Each card: tier name, price/month, 3 bullet
features, one CTA. Use a calm neutral palette and a single accent.`,
(root) => {
  root.style.cssText += `background:#0e1117; color:#e6e6e6; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid;
    grid-template-columns: repeat(3, 1fr); gap: 8px; align-items:stretch;`;
  const tiers = [
    {n:'Starter', p:'$0',  f:['1 project','Community','Basic exports'], hi:false},
    {n:'Studio',  p:'$24', f:['10 projects','Real-time','HD exports'],  hi:true},
    {n:'Atelier', p:'$96', f:['Unlimited','Priority','4K exports'],     hi:false},
  ];
  root.innerHTML = tiers.map(t => `
    <div style="background:${t.hi ? '#1a2030' : '#161a22'}; border:1px solid ${t.hi ? '#3a8eff' : '#22272f'};
                padding:12px 10px; position:relative; display:flex; flex-direction:column;">
      ${t.hi ? `<span style="position:absolute; top:-1px; left:50%; transform:translate(-50%,-50%);
        font:500 8px/1 'JetBrains Mono', monospace; letter-spacing:.16em; padding:3px 8px;
        background:#3a8eff; color:#000;">POPULAR</span>` : ''}
      <div style="font:600 11px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#9aa; margin-bottom:8px;">${t.n.toUpperCase()}</div>
      <div style="font-size:24px; font-weight:600; letter-spacing:-.02em; margin-bottom:4px;">${t.p}<span style="font-size:10px; color:#778; font-weight:400; margin-left:4px;">/mo</span></div>
      <ul style="list-style:none; padding:0; margin:8px 0 10px; font-size:10px; line-height:1.7; color:#a8b0bb; flex:1;">
        ${t.f.map(x => `<li style="display:flex; gap:6px;"><span style="color:${t.hi?'#3a8eff':'#5a6'};">+</span>${x}</li>`).join('')}
      </ul>
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em;
                  text-align:center; padding:7px 0;
                  background:${t.hi?'#3a8eff':'transparent'}; color:${t.hi?'#000':'#e6e6e6'};
                  border:1px solid ${t.hi?'#3a8eff':'#22272f'};">CHOOSE</div>
    </div>
  `).join('');
});

  R('layouts', 'lay-feature-grid', 'Feature grid · 3×2 icons',
`3x2 grid of feature tiles. Each tile: small geometric glyph (square,
circle, triangle, slash), short title, one line of supporting copy.
Hairline grid lines between cells. Pale yellow background.`,
(root) => {
  root.style.cssText += `background:#fbf6e2; color:#1a1a1a; padding:0;
    font-family: ui-sans-serif, system-ui;
    display:grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap:0;`;
  const feats = [
    {g:'■', t:'Stable',      d:'Predictable across runs.'},
    {g:'●', t:'Composable',  d:'Drop in, mix and match.'},
    {g:'▲', t:'Fast',        d:'Sub-50ms render budget.'},
    {g:'/', t:'Documented',  d:'Live examples, not screenshots.'},
    {g:'+', t:'Accessible',  d:'WCAG AA out of the box.'},
    {g:'∞', t:'Open',        d:'MIT, fork freely.'},
  ];
  root.innerHTML = feats.map((f,i) => `
    <div style="padding:14px 12px; border-right:${(i%3<2)?'1px solid rgba(0,0,0,.12)':'0'};
                border-bottom:${i<3?'1px solid rgba(0,0,0,.12)':'0'};">
      <div style="font-size:22px; line-height:1; margin-bottom:8px; color:#c66;">${f.g}</div>
      <div style="font-size:12px; font-weight:600; letter-spacing:-.01em; margin-bottom:3px;">${f.t}</div>
      <div style="font-size:10px; line-height:1.45; color:#555;">${f.d}</div>
    </div>
  `).join('');
});

  R('layouts', 'lay-testimonials', 'Testimonials · marquee',
`Continuous horizontal marquee of customer quotes. Each card: avatar
initial, name, role, short quote. Cream background, deep ink text,
hover pauses the scroll.`,
(root) => {
  root.style.cssText += `background:#f3eee2; color:#1a1a1a;
    font-family: 'Georgia', serif; overflow:hidden; display:flex;
    align-items:center; padding:0 0;`;
  const items = [
    {n:'Mara K.', r:'Designer, OFFLINE', q:'Got back hours of my week.'},
    {n:'Jin S.',  r:'PM, Lattice',       q:'Honestly, the best small tool I use.'},
    {n:'Iris N.', r:'Eng, Notion',       q:'Fast, quiet, dependable.'},
    {n:'Theo R.', r:'Founder, Cabin',    q:'Replaced three subscriptions.'},
  ];
  const card = it => `
    <div style="display:flex; gap:10px; align-items:center; padding:0 18px;
                white-space:normal; max-width:280px; flex-shrink:0;">
      <div style="width:34px; height:34px; border-radius:50%; background:#1a1a1a;
                  color:#f3eee2; display:grid; place-items:center;
                  font:600 13px/1 ui-sans-serif; flex-shrink:0;">${it.n[0]}</div>
      <div>
        <div style="font:italic 12px/1.4 Georgia, serif; margin-bottom:4px;">"${it.q}"</div>
        <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#777;">
          ${it.n.toUpperCase()} · ${it.r.toUpperCase()}
        </div>
      </div>
    </div>`;
  const track = document.createElement('div');
  track.style.cssText = `display:flex; gap:0; animation: testMarq 26s linear infinite;`;
  track.innerHTML = (items.concat(items)).map(card).join('');
  root.appendChild(track);
  if (!document.getElementById('__testMarq')) {
    const st = document.createElement('style'); st.id = '__testMarq';
    st.textContent = `@keyframes testMarq { to { transform: translateX(-50%); } }`;
    document.head.appendChild(st);
  }
  root.addEventListener('mouseenter', () => track.style.animationPlayState='paused');
  root.addEventListener('mouseleave', () => track.style.animationPlayState='running');
});

  R('layouts', 'lay-footer-mega', 'Footer · multi-column',
`Big footer. Four columns of small links (Product, Company, Resources,
Legal), a thin top rule, brand mark on the left, copy and locale on the
bottom. Pure CSS grid, dark mode.`,
(root) => {
  root.style.cssText += `background:#0a0a0a; color:#bbb; padding:14px 12px;
    font-family: ui-sans-serif, system-ui; font-size:10px; line-height:1.7;
    display:flex; flex-direction:column; gap:8px;`;
  root.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:10px; border-top:1px solid #222; padding-top:10px;">
      ${[
        ['Product',['Overview','Pricing','Changelog','Roadmap']],
        ['Company',['About','Careers','Press','Contact']],
        ['Resources',['Docs','Guides','API','Status']],
        ['Legal',['Privacy','Terms','Security','DPA']],
      ].map(([h,xs])=>`
        <div>
          <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#fff; margin-bottom:6px;">${h.toUpperCase()}</div>
          ${xs.map(x=>`<div>${x}</div>`).join('')}
        </div>
      `).join('')}
    </div>
    <div style="display:flex; justify-content:space-between; border-top:1px solid #222; padding-top:8px; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#666;">
      <span>◆ STUDIO</span>
      <span>EN/US · © 2026</span>
    </div>`;
});

  R('layouts', 'lay-sidebar-app', 'Sidebar · app shell',
`App shell. Left rail with stacked icon nav and active indicator. Right
side a faint scrollable mock content with a workspace title and 3 list
rows. Subtle separator. macOS-feel light.`,
(root) => {
  root.style.cssText += `background:#fafafa; color:#222;
    font-family: ui-sans-serif, system-ui;
    display:grid; grid-template-columns: 56px 1fr; height:100%;`;
  root.innerHTML = `
    <aside style="background:#f0eee8; border-right:1px solid #e3e0d6; padding:10px 0;
                  display:flex; flex-direction:column; align-items:center; gap:6px;">
      ${['◆','▣','◐','▤','✦'].map((g,i)=>`
        <div style="width:34px; height:34px; display:grid; place-items:center;
                    border-radius:8px; font-size:14px; color:${i===1?'#fff':'#888'};
                    background:${i===1?'#1a1a1a':'transparent'};">${g}</div>`).join('')}
    </aside>
    <main style="padding:14px;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#888;">WORKSPACE</div>
      <div style="font-size:18px; font-weight:600; letter-spacing:-.01em; margin:2px 0 12px;">Untitled studio</div>
      ${[1,2,3].map(i => `
        <div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-top:1px solid #e8e6df;">
          <div style="width:8px; height:8px; border-radius:50%; background:#${['ffb648','3a8eff','5ad27a'][i-1]};"></div>
          <div style="font-size:11px; flex:1;">Item ${i}</div>
          <div style="font:500 9px/1 'JetBrains Mono', monospace; color:#aaa;">${i*7}m</div>
        </div>`).join('')}
    </main>`;
});

  R('layouts', 'lay-bento', 'Bento grid · 5 tiles',
`Asymmetric bento layout. One large tile, one tall tile, three small
tiles. Each shows a different type of content: stat, image-block,
mini-list, big quote, badge. Strong visual hierarchy.`,
(root) => {
  root.style.cssText += `background:#0e0e10; color:#eee; padding:8px;
    font-family: ui-sans-serif, system-ui; gap:6px;
    display:grid; grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 1fr 1fr; grid-auto-flow: dense;`;
  root.innerHTML = `
    <div style="grid-row: span 2; background:linear-gradient(135deg,#3a2f6b,#86307a);
                padding:12px; display:flex; flex-direction:column; justify-content:end; border-radius:6px;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; opacity:.8;">FEATURED</div>
      <div style="font-size:18px; font-weight:600; line-height:1.05; margin-top:6px;">A new way to ship.</div>
    </div>
    <div style="background:#1a1a22; padding:10px; border-radius:6px;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#9aa;">USERS</div>
      <div style="font-size:22px; font-weight:600; letter-spacing:-.02em; margin-top:4px;">12.4k</div>
      <div style="font:500 9px/1 'JetBrains Mono', monospace; color:#5ad27a; margin-top:2px;">▲ 18%</div>
    </div>
    <div style="background:#1a1a22; padding:10px; border-radius:6px; font-size:10px; line-height:1.5; color:#c0c4cc;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#9aa; margin-bottom:6px;">CHANGELOG</div>
      <div>· v1.4 shipped</div><div>· auth fixes</div><div>· faster export</div>
    </div>
    <div style="background:#fbf6e2; color:#222; padding:10px; border-radius:6px; grid-column: span 2;
                font: italic 13px/1.3 Georgia, serif;">
      "Built right." <span style="font:500 9px/1 'JetBrains Mono', monospace; color:#888; letter-spacing:.14em; margin-left:4px;">— THE TIMES</span>
    </div>`;
});

  R('layouts', 'lay-stats-strip', 'Stats strip · 4 metrics',
`Horizontal strip of 4 large numeric stats with small captions. Hairline
dividers between. Numbers in display serif, captions in mono caps.
Background nearly black, text pure white.`,
(root) => {
  root.style.cssText += `background:#070707; color:#fff;
    font-family: ui-sans-serif, system-ui; padding:14px 0;
    display:grid; grid-template-columns: repeat(4, 1fr); align-items:center;`;
  const stats = [
    ['12.4M', 'requests/day'],
    ['99.99%','uptime'],
    ['38ms', 'p50 latency'],
    ['142', 'countries'],
  ];
  root.innerHTML = stats.map(([n, c],i) => `
    <div style="text-align:center; ${i<3?'border-right:1px solid #222;':''}">
      <div style="font: 600 clamp(20px,4vw,32px)/1 'Times New Roman', serif; letter-spacing:-.02em;">${n}</div>
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#888; margin-top:6px;">${c.toUpperCase()}</div>
    </div>`).join('');
});

  R('layouts', 'lay-changelog', 'Changelog · timeline',
`Timeline-style changelog. Each entry: date in mono caps, version pill,
title, two bullet items. Items connected with a vertical thread. Cool
gray palette.`,
(root) => {
  root.style.cssText += `background:#13161c; color:#dde; padding:12px 14px;
    font-family: ui-sans-serif, system-ui; font-size:11px; line-height:1.5; overflow:auto;`;
  const log = [
    {d:'05.02', v:'1.4.0', t:'Improved exports', b:['4K MP4 added','Faster encode']},
    {d:'04.18', v:'1.3.2', t:'Auth fixes',      b:['SSO with Okta','Session refresh']},
    {d:'04.01', v:'1.3.0', t:'New canvas',      b:['Shared cursors','Snap guides']},
  ];
  root.innerHTML = `
    <div style="position:relative; padding-left:14px;">
      <div style="position:absolute; left:5px; top:6px; bottom:6px; width:1px; background:#2a3140;"></div>
      ${log.map(e => `
        <div style="position:relative; margin-bottom:10px;">
          <div style="position:absolute; left:-13px; top:5px; width:9px; height:9px; border-radius:50%; background:#3a8eff;"></div>
          <div style="display:flex; gap:6px; align-items:center; margin-bottom:2px;">
            <span style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#7a8;">${e.d}</span>
            <span style="font:500 8px/1 'JetBrains Mono', monospace; padding:2px 5px; background:#1c2030; color:#9bf;">v${e.v}</span>
          </div>
          <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#fff;">${e.t}</div>
          <div style="color:#9aa; font-size:10px;">${e.b.map(x=>`· ${x}`).join('  ')}</div>
        </div>`).join('')}
    </div>`;
});

  R('layouts', 'lay-magazine', 'Editorial · article hero',
`Magazine-style article hero. Big headline (display serif), drop-cap
intro paragraph, byline + read time. Cream paper texture, deep ink.`,
(root) => {
  root.style.cssText += `background:#f5f0e6; color:#1a1a1a; padding:14px 16px;
    font-family: 'Times New Roman', serif; overflow:hidden;`;
  root.innerHTML = `
    <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.2em; color:#a44;">— ESSAY 14</div>
    <h1 style="font: 500 clamp(20px,4vw,32px)/1 'Times New Roman', serif; letter-spacing:-.02em; margin: 8px 0 6px;">
      The unhurried web.
    </h1>
    <div style="font:italic 11px/1.5 'Times New Roman', serif; color:#555; margin-bottom:8px;">
      by M. Calder · 6 min read
    </div>
    <p style="font-size:11px; line-height:1.55; margin:0; color:#222;">
      <span style="float:left; font: 600 38px/0.85 'Times New Roman', serif; padding: 4px 6px 0 0; color:#a44;">W</span>e
      grew up on a fast web — speed as a virtue, scrolls measured in
      kilometers. There is a quieter version still possible, if we want it.
    </p>`;
});

  R('layouts', 'lay-cta', 'CTA banner · split',
`Big call-to-action banner. Left: a punchy headline + subhead. Right:
single oversized button. Pastel mint background, ink text. The button
has a thick black underline that animates on hover.`,
(root) => {
  root.style.cssText += `background:#cce8d8; color:#0d2a1a; padding:0 16px;
    font-family: ui-sans-serif, system-ui;
    display:grid; grid-template-columns: 1fr auto; align-items:center; gap:12px;`;
  root.innerHTML = `
    <div>
      <div style="font: 600 clamp(16px,3vw,24px)/1.1 ui-sans-serif; letter-spacing:-.02em;">Ship calmer.</div>
      <div style="font-size:11px; color:#3a5a48; margin-top:4px;">A weekly note from the studio. No spam. Unsubscribe anytime.</div>
    </div>
    <button style="all:unset; cursor:pointer; padding:10px 16px; background:#0d2a1a; color:#cce8d8;
                   font: 500 11px/1 ui-sans-serif; letter-spacing:.06em;">SUBSCRIBE →</button>`;
});

  R('layouts', 'lay-stack-cards', 'Stacked cards on scroll',
`Three colored cards stacked with slight rotation, like a deck. Hover
the cell to fan them out. Each card holds a single tag word. Soft
shadow, rounded corners.`,
(root) => {
  root.style.cssText += `background:#0e0e10; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:relative; width:62%; aspect-ratio:5/7;`;
  const cards = [
    {bg:'#ff7a59', t:'DESIGN', r:-8, x:-18, z:1},
    {bg:'#ffd166', t:'BUILD',  r:0,   x:0,   z:2},
    {bg:'#4ecdc4', t:'SHIP',   r:8,   x:18,  z:3},
  ];
  wrap.innerHTML = cards.map(c => `
    <div class="ds-card" style="position:absolute; inset:0; background:${c.bg}; border-radius:8px;
                color:#1a1a1a; display:grid; place-items:end start; padding:10px;
                font:600 12px/1 'JetBrains Mono', monospace; letter-spacing:.14em;
                box-shadow: 0 6px 18px rgba(0,0,0,.45);
                transform: translateX(${c.x*0.3}px) rotate(${c.r*0.4}deg);
                z-index:${c.z}; transition: transform .5s cubic-bezier(.6,.1,.4,1);"
         data-x="${c.x}" data-r="${c.r}">${c.t}</div>`).join('');
  root.appendChild(wrap);
  root.addEventListener('mouseenter', () => {
    wrap.querySelectorAll('.ds-card').forEach(el => {
      el.style.transform = `translateX(${el.dataset.x}px) rotate(${el.dataset.r}deg)`;
    });
  });
  root.addEventListener('mouseleave', () => {
    wrap.querySelectorAll('.ds-card').forEach(el => {
      el.style.transform = `translateX(${parseFloat(el.dataset.x)*0.3}px) rotate(${parseFloat(el.dataset.r)*0.4}deg)`;
    });
  });
});

  R('layouts', 'lay-logocloud', 'Logo cloud · clients',
`Grid of 8 placeholder client logos, all desaturated to a single ink
color. Slight hover lift. Tiny "TRUSTED BY" tag at the top.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:12px;
    font-family: ui-sans-serif, system-ui;
    display:flex; flex-direction:column; gap:8px;`;
  const logos = ['◆ northwind','● helio','▲ paragraph','/ slash','+ adder','■ blockwork','✦ northstar','◐ lune'];
  root.innerHTML = `
    <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888; text-align:center;">— TRUSTED BY 200+ TEAMS</div>
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; flex:1; align-items:center;">
      ${logos.map(l=>`
        <div style="display:grid; place-items:center; padding:6px; color:#444;
                    font:500 11px/1 ui-sans-serif; opacity:.75; transition:opacity .2s;"
             onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.75">${l}</div>`).join('')}
    </div>`;
});

  R('layouts', 'lay-faq', 'FAQ · accordion',
`Stacked accordion FAQ. 4 questions visible, first open. Clicking a
question expands its answer with a small chevron rotate. Hairline
between rows, off-white background.`,
(root) => {
  root.style.cssText += `background:#f8f6f0; color:#1a1a1a; padding:10px 12px;
    font-family: ui-sans-serif, system-ui; font-size:11px; overflow:auto;`;
  const qa = [
    {q:'Is it free to start?', a:'Yes. The Starter tier is free forever.', open:true},
    {q:'Can I cancel anytime?', a:'Yes. No questions asked.'},
    {q:'Do you offer team plans?', a:'Yes. Studio and Atelier tiers.'},
    {q:'Is my data exportable?', a:'Always. JSON or CSV.'},
  ];
  root.innerHTML = qa.map((x,i) => `
    <details ${x.open?'open':''} style="border-bottom:1px solid #e2dfd5;">
      <summary style="list-style:none; padding:9px 0; cursor:pointer;
                      display:flex; justify-content:space-between; align-items:center;
                      font-weight:600;">
        <span>${x.q}</span>
        <span style="font:500 12px/1 'JetBrains Mono', monospace; transition:transform .2s;
                     transform:rotate(${x.open?45:0}deg); color:#a44;">+</span>
      </summary>
      <div style="padding: 0 0 10px; color:#555; font-size:10px; line-height:1.55;">${x.a}</div>
    </details>`).join('');
  root.querySelectorAll('details').forEach(d => {
    d.addEventListener('toggle', () => {
      const sp = d.querySelector('summary span:last-child');
      sp.style.transform = `rotate(${d.open?45:0}deg)`;
    });
  });
});

  R('layouts', 'lay-blog-list', 'Blog list · ruled',
`A clean ruled list of 4 blog posts. Each row: date in mono caps, title
in serif, short excerpt, faint divider. Hover lifts the title color.`,
(root) => {
  root.style.cssText += `background:#fffefb; color:#222; padding:12px;
    font-family: 'Times New Roman', serif; overflow:auto;`;
  const ps = [
    {d:'05.02.26', t:'On slow software', e:'A defense of taking longer.'},
    {d:'04.21.26', t:'Letterforms',      e:'Notes from a workshop in Basel.'},
    {d:'04.10.26', t:'Studio update',    e:'What we shipped this week.'},
    {d:'03.28.26', t:'Field journal',    e:'Mountains, mostly.'},
  ];
  root.innerHTML = ps.map(p => `
    <a href="javascript:void(0)" style="display:block; text-decoration:none; color:inherit;
       padding:8px 0; border-bottom:1px solid #e9e5d8;"
       onmouseover="this.querySelector('h3').style.color='#a44'"
       onmouseout="this.querySelector('h3').style.color='#222'">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#888;">${p.d}</div>
      <h3 style="margin:4px 0 2px; font: 500 14px/1.1 'Times New Roman', serif; transition:color .2s;">${p.t}</h3>
      <div style="font-size:10px; color:#666; font-style:italic;">${p.e}</div>
    </a>`).join('');
});

  R('layouts', 'lay-team', 'Team · grid of 6',
`Grid of 6 team member cards. Each: square avatar (color block with
initials), name, role, location. Quiet, neutral, generous spacing.`,
(root) => {
  root.style.cssText += `background:#0f1115; color:#e6e6e6; padding:8px;
    font-family: ui-sans-serif, system-ui;
    display:grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr 1fr; gap:6px;`;
  const ppl = [
    ['MK','Mara Köhler','Designer','BER'],
    ['JS','Jin Sato',   'Engineer','TYO'],
    ['IN','Iris Nakai', 'Founder', 'NYC'],
    ['TR','Theo Rune',  'PM',      'LIS'],
    ['AB','Ana Borges', 'DevRel',  'POA'],
    ['LK','Lior Katz',  'Engineer','TLV'],
  ];
  const colors = ['#3a8eff','#ff7a59','#5ad27a','#c084fc','#ffd166','#f87171'];
  root.innerHTML = ppl.map(([i,n,r,l],idx) => `
    <div style="background:#171a20; padding:8px; display:flex; flex-direction:column; gap:4px;">
      <div style="aspect-ratio:1/1; width:60%; background:${colors[idx]}; color:#0a0a0a;
                  display:grid; place-items:center; font:600 16px/1 ui-sans-serif;
                  letter-spacing:-.02em;">${i}</div>
      <div style="font-size:11px; font-weight:600; margin-top:auto;">${n}</div>
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#888;">${r.toUpperCase()} · ${l}</div>
    </div>`).join('');
});

  R('layouts', 'lay-comparison', 'Comparison table',
`Three-column comparison table. Left: feature names. Other two:
"Us" and "Them". Checkmarks and dashes. Highlight the "Us" column with
a subtle accent stripe.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:10px;
    font-family: ui-sans-serif, system-ui; font-size:11px;`;
  const rows = [
    ['Real-time canvas',  true,  false],
    ['Native exports',    true,  true],
    ['Design tokens',     true,  false],
    ['Free tier',         true,  true],
    ['Self-host',         true,  false],
  ];
  root.innerHTML = `
    <div style="display:grid; grid-template-columns: 1.4fr 1fr 1fr; align-items:stretch;">
      <div></div>
      <div style="background:#fff8e8; padding:6px 8px; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#a44; text-align:center;">US</div>
      <div style="padding:6px 8px; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#888; text-align:center;">THEM</div>
      ${rows.map((r,i)=>`
        <div style="padding:7px 4px; border-top:1px solid #eee;">${r[0]}</div>
        <div style="padding:7px 4px; border-top:1px solid #eee; background:#fff8e8; text-align:center; color:${r[1]?'#0a8a3a':'#bbb'};">${r[1]?'✓':'—'}</div>
        <div style="padding:7px 4px; border-top:1px solid #eee; text-align:center; color:${r[2]?'#0a8a3a':'#bbb'};">${r[2]?'✓':'—'}</div>
      `).join('')}
    </div>`;
});

  R('layouts', 'lay-newsletter', 'Newsletter · inline',
`Compact inline newsletter card. Headline left, email input + button
on the right. Soft outlined card on a warm gray bg. Helper text under
the input ("No spam. Once a week.").`,
(root) => {
  root.style.cssText += `background:#1c1c1c; color:#eee; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  root.innerHTML = `
    <div style="width:90%; max-width:400px; border:1px solid #2a2a2a; padding:14px; background:#222;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#888;">— NEWSLETTER</div>
      <div style="font-size:14px; font-weight:600; margin:5px 0 8px;">Notes from the studio.</div>
      <div style="display:flex; gap:0;">
        <input placeholder="you@domain.com"
          style="flex:1; min-width:0; background:#111; border:1px solid #2a2a2a; color:#eee;
                 font:400 11px/1 ui-sans-serif; padding:9px 10px; outline:none;
                 border-right:0;" />
        <button style="all:unset; cursor:pointer; padding:9px 12px; background:#fff; color:#000;
                       font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">JOIN →</button>
      </div>
      <div style="font-size:9px; color:#666; margin-top:6px;">No spam. Once a week.</div>
    </div>`;
});

  R('layouts', 'lay-event-card', 'Event · invite card',
`Single event invite card. Big date block on the left (large day
number, month, year stacked), event title and meta on the right (time,
venue, capacity). Stamp-like rotated tag in the corner.`,
(root) => {
  root.style.cssText += `background:#101010; color:#fff; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;
    position:relative; overflow:hidden;`;
  root.innerHTML = `
    <div style="position:absolute; top:14px; right:-26px; transform:rotate(28deg);
                font:600 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em;
                color:#0a0a0a; background:#ffd166; padding:5px 30px;">RSVP CLOSED</div>
    <div style="display:grid; grid-template-columns: auto 1fr; gap:14px; align-items:center;">
      <div style="text-align:center; border:1px solid #ffd166; padding:8px 12px;">
        <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#ffd166;">FRI</div>
        <div style="font: 500 28px/1 'Times New Roman', serif; margin:3px 0;">17</div>
        <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em;">MAY 26</div>
      </div>
      <div>
        <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#888;">SHOWCASE</div>
        <div style="font-size:14px; font-weight:600; margin:3px 0 3px; letter-spacing:-.01em;">Open Studio Night</div>
        <div style="font-size:10px; line-height:1.5; color:#aaa;">19:00 · Friedrichstraße 117 · 80 seats</div>
      </div>
    </div>`;
});

  R('layouts', 'lay-dashboard', 'Dashboard · KPI + sparkline',
`Dark dashboard tile. Top: two KPI mini-cards (revenue, churn) with a
delta indicator. Middle: an inline-SVG line-chart sparkline with one
highlighted peak. Bottom: a 3-row activity log of timestamp + label +
status dot. Mono captions, sans numbers, neon accent.`,
(root) => {
  root.style.cssText += `background:#0b0d10; color:#dce2ea; padding:10px;
    font-family: ui-sans-serif, system-ui; display:grid;
    grid-template-rows: auto 1fr auto; gap:8px;`;
  const pts = [22,28,18,42,22,55,40,33,12,38,52,18,30];
  const w = 260, h = 70, max = Math.max(...pts), step = w / (pts.length - 1);
  let d = 'M0,' + (h - (pts[0] / max) * h);
  pts.forEach((v, i) => { if (i > 0) d += ' L' + (i * step) + ',' + (h - (v / max) * h); });
  const peakI = pts.indexOf(max);
  root.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
      <div style="background:#161a20; padding:8px; border-radius:4px;">
        <div style="font:500 8px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#7a8693;">REVENUE</div>
        <div style="font-size:18px; font-weight:600; margin-top:4px; letter-spacing:-.01em;">$84.2k</div>
        <div style="font:500 9px/1 'JetBrains Mono', monospace; color:#5ad27a; margin-top:2px;">▲ 12.4%</div>
      </div>
      <div style="background:#161a20; padding:8px; border-radius:4px;">
        <div style="font:500 8px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#7a8693;">CHURN</div>
        <div style="font-size:18px; font-weight:600; margin-top:4px; letter-spacing:-.01em;">2.1%</div>
        <div style="font:500 9px/1 'JetBrains Mono', monospace; color:#ff6b5b; margin-top:2px;">▲ 0.3%</div>
      </div>
    </div>
    <div style="background:#101317; padding:10px; border-radius:4px; display:flex; flex-direction:column; justify-content:flex-end;">
      <div style="font:500 8px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#7a8693; margin-bottom:6px;">SESSIONS · 7D</div>
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%; height:60px;">
        <path d="${d}" fill="none" stroke="#5ad2ff" stroke-width="1.5"/>
        <circle cx="${peakI * step}" cy="${h - (max / max) * h}" r="3" fill="#5ad2ff"/>
      </svg>
    </div>
    <div style="display:grid; gap:3px; font:500 9px/1.4 'JetBrains Mono', monospace;">
      <div style="display:grid; grid-template-columns:auto 1fr auto; gap:8px; align-items:center;">
        <span style="color:#5a6471;">14:02</span><span style="color:#dce2ea;">deploy · staging</span><span style="width:6px; height:6px; background:#5ad27a; border-radius:50%;"></span>
      </div>
      <div style="display:grid; grid-template-columns:auto 1fr auto; gap:8px; align-items:center;">
        <span style="color:#5a6471;">13:48</span><span style="color:#dce2ea;">migrations · prod</span><span style="width:6px; height:6px; background:#ffd166; border-radius:50%;"></span>
      </div>
      <div style="display:grid; grid-template-columns:auto 1fr auto; gap:8px; align-items:center;">
        <span style="color:#5a6471;">13:21</span><span style="color:#dce2ea;">webhook · failed retry</span><span style="width:6px; height:6px; background:#ff6b5b; border-radius:50%;"></span>
      </div>
    </div>`;
});

  R('layouts', 'lay-kanban', 'Kanban · 3 columns',
`Three-column board: TODO, DOING, DONE. Each column gets 2-3 small
sticky-note cards in distinct pastel tints (yellow / blue / green).
Column headers in mono caps with a count pill. Soft warm-gray bg.`,
(root) => {
  root.style.cssText += `background:#f5f0e6; color:#1a1a1a; padding:10px;
    font-family: ui-sans-serif, system-ui;
    display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;`;
  const cols = [
    { name:'TODO',  tint:'#fff3b0', cards:['Spec onboarding','Audit color tokens','Refactor router'] },
    { name:'DOING', tint:'#bde0fe', cards:['Build dashboard mock','Pair w/ J on auth'] },
    { name:'DONE',  tint:'#c8e6c9', cards:['Logo lockup v3','Migrate analytics'] },
  ];
  root.innerHTML = cols.map(col => `
    <div style="display:flex; flex-direction:column; gap:6px; min-width:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0 2px 4px;">
        <span style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#555;">${col.name}</span>
        <span style="font:500 9px/1 'JetBrains Mono', monospace; color:#888; padding:2px 6px; background:rgba(0,0,0,0.06); border-radius:8px;">${col.cards.length}</span>
      </div>
      ${col.cards.map(c => `<div style="background:${col.tint}; padding:8px; border-radius:3px; font-size:10px; line-height:1.35; box-shadow:0 1px 0 rgba(0,0,0,0.08);">${c}</div>`).join('')}
    </div>`).join('');
});

  R('layouts', 'lay-calendar', 'Calendar · month grid',
`Newspaper-style monthly calendar. Header row Mon-Sun, then 5 rows of
date cells. One day highlighted with a small mono event tag. Off-white
bg, hairline ink rules, serif date numbers, mono weekday headers.`,
(root) => {
  root.style.cssText += `background:#f7f3ec; color:#1a1a1a; padding:12px;
    font-family: 'Times New Roman', serif;
    display:flex; flex-direction:column;`;
  const days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const cells = [];
  for (let i = 0; i < 3; i++) cells.push(null);          // May 2026 starts on Thu — skip Mon-Wed
  for (let i = 1; i <= 31; i++) cells.push(i);
  while (cells.length % 7) cells.push(null);
  const highlight = 17;
  root.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
      <div style="font-size:14px; font-weight:600; letter-spacing:-.01em;">May 2026</div>
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888;">WK 18-22</div>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7,1fr); border-top:1px solid #d8d2c4; border-left:1px solid #d8d2c4;">
      ${days.map(d => `<div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#888; padding:5px 4px; border-right:1px solid #d8d2c4; border-bottom:1px solid #d8d2c4; text-align:center;">${d}</div>`).join('')}
    </div>
    <div style="flex:1; display:grid; grid-template-columns:repeat(7,1fr); grid-auto-rows:1fr; border-left:1px solid #d8d2c4;">
      ${cells.map(n => {
        const isHl = n === highlight;
        return `<div style="padding:4px 5px; font-size:11px; border-right:1px solid #d8d2c4; border-bottom:1px solid #d8d2c4; ${isHl ? 'background:#1a1a1a; color:#f7f3ec;' : 'color:#222;'} display:flex; flex-direction:column; justify-content:space-between; min-height:0;">
          <span>${n ?? ''}</span>
          ${isHl ? `<span style="font:500 7px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#ffd166;">SHOW</span>` : ''}
        </div>`;
      }).join('')}
    </div>`;
});

  R('layouts', 'lay-docs', 'Docs · article + TOC',
`Documentation tile. Left: narrow TOC sidebar with 5 section links,
current one highlighted with an accent rule. Right: small kicker,
H1, lede paragraph, and a mono code snippet block at the bottom.
Cream paper bg, ink type, single accent color.`,
(root) => {
  root.style.cssText += `background:#f8f4ec; color:#1a1a1a; padding:14px;
    font-family: 'Times New Roman', serif;
    display:grid; grid-template-columns: 92px 1fr; gap:14px;`;
  root.innerHTML = `
    <aside style="font:500 9px/1.7 'JetBrains Mono', monospace; letter-spacing:.1em; color:#888; border-right:1px solid #d8d2c4; padding-right:10px;">
      <div style="color:#aaa; letter-spacing:.18em; margin-bottom:8px;">CONTENTS</div>
      <div style="color:#888;">01 · Intro</div>
      <div style="color:#1a1a1a; border-left:2px solid #ff5b1f; padding-left:6px; margin-left:-8px;">02 · Install</div>
      <div style="color:#888;">03 · Usage</div>
      <div style="color:#888;">04 · API</div>
      <div style="color:#888;">05 · Changelog</div>
    </aside>
    <article style="display:flex; flex-direction:column; gap:8px; min-width:0;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#ff5b1f;">GUIDES · GETTING STARTED</div>
      <h1 style="font-size:18px; font-weight:600; line-height:1.15; margin:0; letter-spacing:-.01em;">Install the toolkit</h1>
      <p style="font-size:11px; line-height:1.5; color:#444; margin:0;">A single command bootstraps the project, dependencies, and example pages. Re-run any time to refresh the local registry.</p>
      <pre style="margin:auto 0 0; background:#1a1a1a; color:#e8e8e8; padding:8px 10px; border-radius:3px; font:500 10px/1.4 'JetBrains Mono', monospace; overflow:hidden; white-space:pre;"><span style="color:#888;">$</span> npx @studio/init <span style="color:#5ad2ff;">--with-vfx</span></pre>
    </article>`;
});

  R('layouts', 'lay-portfolio', 'Portfolio · project tiles',
`Black bg masonry-ish grid of 6 project tiles in mixed gradient fills.
Each tile shows a small mono category label top-left and a project
name bottom-left. Two tiles span 2 cells (one tall, one wide) to break
the rhythm. Reads like a studio index.`,
(root) => {
  root.style.cssText += `background:#000; color:#fff; padding:6px; gap:6px;
    font-family: ui-sans-serif, system-ui;
    display:grid; grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr; grid-auto-flow: dense;`;
  const tiles = [
    { name:'Aurora',  cat:'BRAND',     style:'background:linear-gradient(135deg,#3a2f6b,#86307a); grid-row: span 2;' },
    { name:'Drift',   cat:'WEB',       style:'background:linear-gradient(135deg,#1f4068,#162447);' },
    { name:'Helix',   cat:'TYPE',      style:'background:linear-gradient(135deg,#ff5b1f,#ffb47a);' },
    { name:'Pulse',   cat:'MOTION',    style:'background:linear-gradient(135deg,#0f3057,#00587a); grid-column: span 2;' },
    { name:'Stratum', cat:'EDITORIAL', style:'background:linear-gradient(135deg,#22223b,#4a4e69);' },
    { name:'Vellum',  cat:'PRINT',     style:'background:linear-gradient(135deg,#fbf6e2,#d8c99b); color:#1a1a1a; grid-column: span 2;' },
  ];
  root.innerHTML = tiles.map(t => `
    <div style="${t.style} padding:8px; display:flex; flex-direction:column; justify-content:space-between; border-radius:3px; min-width:0; min-height:0;">
      <div style="font:500 8px/1 'JetBrains Mono', monospace; letter-spacing:.18em; opacity:.85;">${t.cat}</div>
      <div style="font-size:13px; font-weight:600; letter-spacing:-.01em;">${t.name}</div>
    </div>`).join('');
});

  /* ============================================================
     FORMS — 20 cells. Functional where it makes sense (OTP,
     dropzone, range, multi-step), static for the rest.
     ============================================================ */

  R('forms', 'form-login', 'Login · email + password',
`Standard login form. Email + password fields, "Remember me" check,
"Forgot?" link, primary button. SSO row underneath with three
provider buttons. Soft card on a neutral surface.`,
(root) => {
  root.style.cssText += `background:#f3f1ec; color:#1a1a1a; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  root.innerHTML = `
    <form style="width:88%; max-width:280px; background:#fff; padding:14px;
                 border:1px solid #e2dfd5; display:flex; flex-direction:column; gap:8px;"
          onsubmit="event.preventDefault();">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888;">— SIGN IN</div>
      <input placeholder="Email" style="font:400 11px/1 ui-sans-serif; padding:8px 10px;
        border:1px solid #d8d4c8; outline:none; background:#fafaf6;" />
      <input placeholder="Password" type="password" style="font:400 11px/1 ui-sans-serif; padding:8px 10px;
        border:1px solid #d8d4c8; outline:none; background:#fafaf6;" />
      <div style="display:flex; justify-content:space-between; align-items:center;
                  font-size:10px; color:#666;">
        <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" checked /> Remember me</label>
        <a href="javascript:void(0)" style="color:#a44; text-decoration:none;">Forgot?</a>
      </div>
      <button type="submit" style="all:unset; cursor:pointer; padding:9px 0; background:#1a1a1a;
        color:#fff; text-align:center; font:500 11px/1 ui-sans-serif; letter-spacing:.04em;">Continue →</button>
      <div style="display:flex; gap:6px; margin-top:4px;">
        ${['GH','GG','TW'].map(x => `
          <button type="button" style="all:unset; cursor:pointer; flex:1; padding:7px 0; border:1px solid #d8d4c8;
            font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; text-align:center; color:#444;">${x}</button>
        `).join('')}
      </div>
    </form>`;
});

  R('forms', 'form-otp', 'One-time passcode · 6 digits',
`Six-cell OTP input. Each cell auto-focuses the next on input,
backspace jumps back, paste fills all cells. Big mono digits, square
cells with a thick bottom rule. A small "didn't get it?" link below.`,
(root) => {
  root.style.cssText += `background:#0e1117; color:#e6e6e6; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#9bf; text-align:center;">— VERIFY</div>
    <div style="font-size:13px; font-weight:600; margin:6px 0 12px; text-align:center;">Enter your code</div>
    <div class="otp-row" style="display:flex; gap:6px; justify-content:center;"></div>
    <div style="text-align:center; margin-top:10px; font-size:10px; color:#788;">Didn't get it? <a href="javascript:void(0)" style="color:#9bf;">Resend</a></div>
  `;
  const row = wrap.querySelector('.otp-row');
  for (let i = 0; i < 6; i++) {
    const inp = document.createElement('input');
    inp.maxLength = 1; inp.dataset.i = i;
    inp.style.cssText = `width:30px; height:36px; text-align:center; background:#181c24; color:#fff;
      font: 500 16px/1 'JetBrains Mono', monospace; border:0; border-bottom:2px solid #2a3140; outline:none;`;
    inp.addEventListener('input', e => {
      if (e.target.value && i < 5) row.children[i+1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) row.children[i-1].focus();
    });
    inp.addEventListener('paste', e => {
      const t = (e.clipboardData?.getData('text') || '').replace(/\D/g,'').slice(0,6);
      if (t.length) {
        e.preventDefault();
        for (let j = 0; j < t.length; j++) row.children[j].value = t[j];
        row.children[Math.min(t.length,5)].focus();
      }
    });
    inp.addEventListener('focus', () => inp.style.borderBottomColor = '#3a8eff');
    inp.addEventListener('blur',  () => inp.style.borderBottomColor = '#2a3140');
    row.appendChild(inp);
  }
  root.appendChild(wrap);
});

  R('forms', 'form-multi-step', 'Multi-step · 3-step wizard',
`Three-step wizard. Top: numbered steps with active/completed states
and a connecting line. Body: shows the active step's mini form. Footer
buttons: Back / Continue. Clicking Continue advances state.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:12px;
    font-family: ui-sans-serif, system-ui; display:flex; flex-direction:column; gap:10px;`;
  let step = 0;
  const steps = ['Account', 'Profile', 'Confirm'];
  const stepEl = document.createElement('div');
  stepEl.style.cssText = `display:grid; grid-template-columns: 1fr 1fr 1fr; align-items:center; gap:0;`;
  const bodyEl = document.createElement('div');
  bodyEl.style.cssText = `flex:1; padding:10px; background:#f8f6f0; min-height:60px; font-size:11px; line-height:1.5;`;
  const navEl = document.createElement('div');
  navEl.style.cssText = `display:flex; gap:6px; justify-content:flex-end;`;
  navEl.innerHTML = `
    <button data-act="back" style="all:unset; cursor:pointer; padding:7px 12px; border:1px solid #d8d4c8; font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">BACK</button>
    <button data-act="next" style="all:unset; cursor:pointer; padding:7px 12px; background:#1a1a1a; color:#fff; font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">NEXT →</button>
  `;
  function render() {
    stepEl.innerHTML = steps.map((s, i) => `
      <div style="display:flex; align-items:center; gap:6px; ${i<2?'border-right:1px solid #eee;':''} padding:0 6px;">
        <div style="width:20px; height:20px; border-radius:50%; display:grid; place-items:center;
                    font:600 10px/1 'JetBrains Mono', monospace;
                    background:${i<step?'#0a8a3a':i===step?'#1a1a1a':'#e2dfd5'};
                    color:${i<=step?'#fff':'#888'};">${i<step?'✓':i+1}</div>
        <div style="font-size:10px; color:${i===step?'#1a1a1a':'#888'}; font-weight:${i===step?'600':'400'};">${s}</div>
      </div>`).join('');
    bodyEl.innerHTML = `<div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888; margin-bottom:6px;">STEP ${step+1} · ${steps[step].toUpperCase()}</div>
      <div>Form fields for ${steps[step]} go here.</div>`;
    navEl.children[0].style.opacity = step === 0 ? '0.4' : '1';
    navEl.children[1].textContent = step === steps.length-1 ? 'FINISH ✓' : 'NEXT →';
  }
  navEl.addEventListener('click', e => {
    const a = e.target.dataset.act;
    if (a === 'back') step = Math.max(0, step-1);
    if (a === 'next') step = Math.min(steps.length-1, step+1);
    render();
  });
  root.append(stepEl, bodyEl, navEl);
  render();
});

  R('forms', 'form-validation', 'Inline validation',
`Form with live inline validation. As the user types, fields show a
green check, red x, or amber dot in their right edge. Below each field,
a tiny hint message appears in the matching color.`,
(root) => {
  root.style.cssText += `background:#fafaf6; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:flex; flex-direction:column; gap:8px; justify-content:center;`;
  const fields = [
    {label:'Email', pl:'name@domain.com', test: v => /^\S+@\S+\.\S+$/.test(v), hint:'Please enter a valid email.'},
    {label:'Username', pl:'min 4 chars', test: v => v.length >= 4, hint:'At least 4 characters.'},
    {label:'Password', pl:'8+ chars, 1 number', test: v => v.length >= 8 && /\d/.test(v), hint:'Need 8+ chars and a number.'},
  ];
  fields.forEach(f => {
    const w = document.createElement('div');
    w.innerHTML = `
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#666; margin-bottom:3px;">${f.label.toUpperCase()}</div>
      <div style="display:flex; align-items:center; background:#fff; border:1px solid #d8d4c8; padding:0 8px;">
        <input placeholder="${f.pl}" style="flex:1; border:0; outline:none; font:400 11px/1 ui-sans-serif; padding:8px 0; background:transparent;" />
        <span class="ind" style="font:500 12px/1 'JetBrains Mono', monospace; color:#bbb;">·</span>
      </div>
      <div class="hint" style="font:500 9px/1.4 'JetBrains Mono', monospace; color:#bbb; margin-top:3px; height:11px;"></div>
    `;
    const inp = w.querySelector('input'), ind = w.querySelector('.ind'), hint = w.querySelector('.hint');
    inp.addEventListener('input', () => {
      if (!inp.value) { ind.textContent='·'; ind.style.color='#bbb'; hint.textContent=''; return; }
      if (f.test(inp.value)) { ind.textContent='✓'; ind.style.color='#0a8a3a'; hint.textContent='Looks good.'; hint.style.color='#0a8a3a'; }
      else { ind.textContent='✕'; ind.style.color='#c0382f'; hint.textContent=f.hint; hint.style.color='#c0382f'; }
    });
    root.appendChild(w);
  });
});

  R('forms', 'form-dropzone', 'File · dropzone',
`File dropzone. Dashed border, big "Drop files or click to upload"
message, supported types listed below. On drag-over, the border turns
the accent color and the bg lightens.`,
(root) => {
  root.style.cssText += `background:#0a0a0a; color:#e6e6e6; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const z = document.createElement('div');
  z.style.cssText = `width:90%; aspect-ratio:5/3; border:2px dashed #444; display:grid; place-items:center;
    text-align:center; padding:14px; transition: border-color .2s, background .2s;`;
  z.innerHTML = `
    <div>
      <div style="font-size:24px; line-height:1; color:#666; margin-bottom:6px;">⬆</div>
      <div style="font-size:12px; font-weight:600;">Drop files here</div>
      <div style="font:500 9px/1.5 'JetBrains Mono', monospace; letter-spacing:.14em; color:#666; margin-top:4px;">OR CLICK TO BROWSE</div>
      <div style="font-size:9px; color:#444; margin-top:8px;">PNG · JPG · PDF · max 10MB</div>
    </div>`;
  z.addEventListener('dragover', e => { e.preventDefault(); z.style.borderColor='#3a8eff'; z.style.background='#0d1320'; });
  z.addEventListener('dragleave',()=>{ z.style.borderColor='#444'; z.style.background='transparent'; });
  z.addEventListener('drop', e => { e.preventDefault(); z.style.borderColor='#0a8a3a'; z.querySelector('div').innerHTML = `<div style="color:#0a8a3a; font-size:12px;">✓ ${e.dataTransfer.files.length} file(s) ready</div>`; });
  root.appendChild(z);
});

  R('forms', 'form-date', 'Date picker · mini calendar',
`Mini calendar date picker. Month + year header with arrows, weekday
row, 7-col grid. Today is outlined; selected day is filled. Faded prev/
next month days at the edges.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:10px;
    font-family: ui-sans-serif, system-ui; font-size:10px; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `width:90%; max-width:240px;`;
  let cur = new Date();
  let selected = new Date();
  function render() {
    const y = cur.getFullYear(), m = cur.getMonth();
    const first = new Date(y, m, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const today = new Date();
    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:6px;">
        <button data-d="-1" style="all:unset; cursor:pointer; padding:2px 6px;">‹</button>
        <div style="font-weight:600;">${first.toLocaleString('en',{month:'short'})} ${y}</div>
        <button data-d="1" style="all:unset; cursor:pointer; padding:2px 6px;">›</button>
      </div>
      <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:2px;">
        ${['M','T','W','T','F','S','S'].map(d=>`<div style="font:500 8px/1 'JetBrains Mono', monospace; color:#888; text-align:center; padding:4px 0;">${d}</div>`).join('')}`;
    const lead = (startDay+6)%7;
    for (let i = 0; i < lead; i++) html += `<div style="text-align:center; padding:4px 0; color:#ccc;">·</div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
      const isSel = d === selected.getDate() && m === selected.getMonth() && y === selected.getFullYear();
      html += `<button data-day="${d}" style="all:unset; cursor:pointer; text-align:center; padding:4px 0;
        ${isSel?'background:#1a1a1a; color:#fff;':isToday?'border:1px solid #1a1a1a;':''}">${d}</button>`;
    }
    html += `</div>`;
    wrap.innerHTML = html;
    wrap.querySelectorAll('button[data-d]').forEach(b => b.addEventListener('click', () => {
      cur = new Date(y, m + parseInt(b.dataset.d), 1); render();
    }));
    wrap.querySelectorAll('button[data-day]').forEach(b => b.addEventListener('click', () => {
      selected = new Date(cur.getFullYear(), cur.getMonth(), parseInt(b.dataset.day)); render();
    }));
  }
  render();
  root.appendChild(wrap);
});

  R('forms', 'form-range', 'Range · dual-thumb slider',
`Dual-thumb price range slider, $50–$500. The active range is colored,
both ends draggable. Numeric labels above each thumb. Tick marks under
the track.`,
(root) => {
  root.style.cssText += `background:#0e1117; color:#e6e6e6; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `width:88%;`;
  let lo = 120, hi = 380, MIN = 50, MAX = 500;
  wrap.innerHTML = `
    <div style="display:flex; justify-content:space-between; font:500 11px/1 'JetBrains Mono', monospace; color:#fff;">
      <span class="lo-l">$${lo}</span>
      <span style="color:#666;">PRICE</span>
      <span class="hi-l">$${hi}</span>
    </div>
    <div class="track" style="position:relative; height:24px; margin-top:8px;">
      <div style="position:absolute; left:0; right:0; top:50%; height:2px; background:#2a3140; transform:translateY(-50%);"></div>
      <div class="active" style="position:absolute; top:50%; height:2px; background:#3a8eff; transform:translateY(-50%);"></div>
      <div class="th lo" style="position:absolute; top:50%; transform:translate(-50%,-50%); width:14px; height:14px; background:#fff; border-radius:50%; cursor:grab; box-shadow:0 0 0 1px #3a8eff;"></div>
      <div class="th hi" style="position:absolute; top:50%; transform:translate(-50%,-50%); width:14px; height:14px; background:#fff; border-radius:50%; cursor:grab; box-shadow:0 0 0 1px #3a8eff;"></div>
    </div>
    <div style="display:flex; justify-content:space-between; font:500 9px/1 'JetBrains Mono', monospace; color:#666; margin-top:4px;">
      <span>$50</span><span>$200</span><span>$350</span><span>$500</span>
    </div>`;
  function pct(v) { return ((v-MIN)/(MAX-MIN)*100).toFixed(1); }
  function update() {
    wrap.querySelector('.th.lo').style.left = pct(lo)+'%';
    wrap.querySelector('.th.hi').style.left = pct(hi)+'%';
    const a = wrap.querySelector('.active');
    a.style.left = pct(lo)+'%'; a.style.width = (pct(hi)-pct(lo))+'%';
    wrap.querySelector('.lo-l').textContent = '$'+lo;
    wrap.querySelector('.hi-l').textContent = '$'+hi;
  }
  update();
  function drag(which) {
    return e => {
      e.preventDefault();
      const tr = wrap.querySelector('.track');
      const r = tr.getBoundingClientRect();
      function move(ev) {
        const x = ((ev.clientX || ev.touches?.[0]?.clientX) - r.left) / r.width;
        const v = Math.round(MIN + Math.max(0, Math.min(1, x)) * (MAX-MIN));
        if (which === 'lo') lo = Math.min(v, hi-10);
        else hi = Math.max(v, lo+10);
        update();
      }
      function up() { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); }
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    };
  }
  wrap.querySelector('.th.lo').addEventListener('pointerdown', drag('lo'));
  wrap.querySelector('.th.hi').addEventListener('pointerdown', drag('hi'));
  root.appendChild(wrap);
});

  R('forms', 'form-search', 'Search · with autocomplete',
`Search bar with live autocomplete. Typing filters a list of suggestions
underneath. Each suggestion has an icon, label, and small "TYPE" tag.
Arrow keys move highlight, Enter picks.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:flex; flex-direction:column; gap:0;`;
  const items = [
    ['◆','Account settings','SETTINGS'],
    ['▣','Billing & invoices','SETTINGS'],
    ['✦','Latest changelog','DOC'],
    ['/','API reference','DOC'],
    ['●','Public profile','USER'],
    ['◐','Notifications','SETTINGS'],
  ];
  const inp = document.createElement('input');
  inp.placeholder = 'Search anything...';
  inp.style.cssText = `font:400 13px/1 ui-sans-serif; padding:10px 12px; border:1px solid #d8d4c8;
    border-bottom:0; outline:none; background:#fafaf6;`;
  const list = document.createElement('div');
  list.style.cssText = `border:1px solid #d8d4c8; max-height:170px; overflow:auto; background:#fff;`;
  let idx = 0;
  function render(q) {
    const filtered = items.filter(i => i[1].toLowerCase().includes(q.toLowerCase()));
    if (idx >= filtered.length) idx = 0;
    list.innerHTML = filtered.length ? filtered.map((it,i) => `
      <div data-i="${i}" style="display:flex; align-items:center; gap:8px; padding:8px 10px;
        background:${i===idx?'#fff8e8':'transparent'}; cursor:pointer; font-size:11px;">
        <span style="width:18px; text-align:center; color:#888;">${it[0]}</span>
        <span style="flex:1;">${it[1]}</span>
        <span style="font:500 8px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#888;">${it[2]}</span>
      </div>`).join('')
      : `<div style="padding:14px; text-align:center; color:#aaa; font-size:11px;">No results.</div>`;
    list.querySelectorAll('[data-i]').forEach(el => el.addEventListener('mouseenter', () => {
      idx = parseInt(el.dataset.i); render(inp.value);
    }));
  }
  inp.addEventListener('input', () => render(inp.value));
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { idx++; render(inp.value); }
    if (e.key === 'ArrowUp')   { idx = Math.max(0, idx-1); render(inp.value); }
  });
  render('');
  root.append(inp, list);
});

  R('forms', 'form-tags', 'Tags input',
`Tag input. Type a word, press Enter or comma to chip it. Each chip
has an X to remove. Dark theme.`,
(root) => {
  root.style.cssText += `background:#0e1117; color:#fff; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `width:90%;`;
  wrap.innerHTML = `
    <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#9bf; margin-bottom:6px;">— TAGS</div>
    <div class="box" style="display:flex; flex-wrap:wrap; gap:5px; padding:6px; background:#181c24; border:1px solid #2a3140; min-height:40px; align-items:center;">
      <input style="flex:1; min-width:80px; background:transparent; border:0; outline:none; color:#fff;
        font:400 11px/1 ui-sans-serif; padding:4px;" placeholder="Add tag…" />
    </div>
    <div style="font-size:9px; color:#788; margin-top:4px;">Press Enter or comma to add</div>`;
  const box = wrap.querySelector('.box'), inp = wrap.querySelector('input');
  let tags = ['design','frontend'];
  function render() {
    [...box.querySelectorAll('.chip')].forEach(c => c.remove());
    tags.forEach((t, i) => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.style.cssText = `display:inline-flex; align-items:center; gap:4px; padding:3px 6px;
        background:#3a8eff; color:#000; font:500 10px/1 'JetBrains Mono', monospace;`;
      c.innerHTML = `${t}<span style="cursor:pointer; opacity:.7; padding:0 2px;">✕</span>`;
      c.querySelector('span').addEventListener('click', () => { tags.splice(i,1); render(); });
      box.insertBefore(c, inp);
    });
  }
  inp.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) {
      tags.push(inp.value.trim()); inp.value = ''; render(); e.preventDefault();
    }
    if (e.key === 'Backspace' && !inp.value && tags.length) { tags.pop(); render(); }
  });
  render();
  root.appendChild(wrap);
});

  R('forms', 'form-toggle-row', 'Toggle row · settings',
`A vertical list of 4 setting rows. Each row has a label, helper line
underneath, and an iOS-style toggle on the right. Hairline dividers.`,
(root) => {
  root.style.cssText += `background:#fff; color:#1a1a1a; padding:8px 12px;
    font-family: ui-sans-serif, system-ui; display:flex; flex-direction:column; justify-content:center; gap:0;`;
  const settings = [
    ['Email notifications', 'Get notified about replies.', true],
    ['Marketing',           'Updates from our team.',     false],
    ['2-factor auth',       'Authenticator app required.',true],
    ['Beta features',       'Try new things early.',      false],
  ];
  root.innerHTML = settings.map((s, i) => `
    <div style="display:flex; align-items:center; gap:10px; padding:9px 0; ${i<3?'border-bottom:1px solid #eee;':''}">
      <div style="flex:1;">
        <div style="font-size:11px; font-weight:600;">${s[0]}</div>
        <div style="font-size:9px; color:#888; margin-top:2px;">${s[1]}</div>
      </div>
      <div class="tog" data-on="${s[2]}" style="width:34px; height:20px; border-radius:99px;
        background:${s[2]?'#0a8a3a':'#d8d4c8'}; cursor:pointer; position:relative; transition:background .15s;">
        <div style="position:absolute; top:2px; left:${s[2]?'16px':'2px'}; width:16px; height:16px;
          background:#fff; border-radius:50%; transition:left .15s; box-shadow:0 1px 2px rgba(0,0,0,.2);"></div>
      </div>
    </div>`).join('');
  root.querySelectorAll('.tog').forEach(t => t.addEventListener('click', () => {
    const on = t.dataset.on === 'true';
    t.dataset.on = !on;
    t.style.background = !on ? '#0a8a3a' : '#d8d4c8';
    t.firstElementChild.style.left = !on ? '16px' : '2px';
  }));
});

  R('forms', 'form-segmented', 'Segmented control',
`Segmented control with 3 options (Day / Week / Month). Active segment
slides smoothly using a tracked indicator div. Pure CSS + a bit of JS.`,
(root) => {
  root.style.cssText += `background:#f3eee2; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:relative; display:inline-flex; padding:3px; background:#e8e3d3; border-radius:7px;`;
  const opts = ['Day','Week','Month'];
  let active = 1;
  wrap.innerHTML = `
    <div class="ind" style="position:absolute; top:3px; bottom:3px; background:#1a1a1a; border-radius:5px; transition:left .25s cubic-bezier(.6,.1,.4,1), width .25s;"></div>
    ${opts.map((o,i) => `
      <button data-i="${i}" style="all:unset; cursor:pointer; padding:6px 14px;
        font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em; z-index:1;
        color:${i===active?'#fff':'#666'}; transition:color .2s;">${o.toUpperCase()}</button>`).join('')}`;
  function place() {
    const buttons = wrap.querySelectorAll('button');
    const b = buttons[active];
    const ind = wrap.querySelector('.ind');
    ind.style.left = b.offsetLeft + 'px';
    ind.style.width = b.offsetWidth + 'px';
    buttons.forEach((bb, i) => bb.style.color = i === active ? '#fff' : '#666');
  }
  wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    active = parseInt(b.dataset.i); place();
  }));
  root.appendChild(wrap);
  requestAnimationFrame(place);
});

  R('forms', 'form-checkbox-group', 'Checkbox group',
`A group of 5 checkboxes for "filters". Each row has a label and a
count badge on the right (number of items matching that filter).`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:flex; flex-direction:column; gap:5px; justify-content:center;`;
  const opts = [
    ['Components', 124, true],
    ['Patterns',   78,  true],
    ['Hooks',      32,  false],
    ['Utilities',  56,  false],
    ['Tokens',     22,  false],
  ];
  root.innerHTML = `<div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888; margin-bottom:6px;">— FILTERS</div>` +
    opts.map((o,i) => `
    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:5px 4px;">
      <input type="checkbox" ${o[2]?'checked':''} style="accent-color:#1a1a1a;" />
      <span style="flex:1; font-size:11px;">${o[0]}</span>
      <span style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#888;
        background:#f0eee8; padding:3px 6px; min-width:24px; text-align:center;">${o[1]}</span>
    </label>`).join('');
});

  R('forms', 'form-slider', 'Slider · single value',
`Single-thumb slider for "Volume". Track has a filled portion to the
left of the thumb. Live numeric value under the slider. Cool blue
accent.`,
(root) => {
  root.style.cssText += `background:#0e1117; color:#fff; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `width:90%;`;
  let v = 64;
  wrap.innerHTML = `
    <div style="display:flex; justify-content:space-between; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#9bf;">
      <span>VOLUME</span><span class="val">${v}</span>
    </div>
    <div class="track" style="position:relative; height:24px; margin-top:8px; cursor:pointer;">
      <div style="position:absolute; left:0; right:0; top:50%; height:2px; background:#2a3140; transform:translateY(-50%);"></div>
      <div class="fill" style="position:absolute; left:0; top:50%; height:2px; background:#3a8eff; transform:translateY(-50%);"></div>
      <div class="th" style="position:absolute; top:50%; transform:translate(-50%,-50%); width:14px; height:14px; background:#fff; border-radius:50%; box-shadow:0 0 0 1px #3a8eff; cursor:grab;"></div>
    </div>`;
  function update() {
    wrap.querySelector('.fill').style.width = v + '%';
    wrap.querySelector('.th').style.left = v + '%';
    wrap.querySelector('.val').textContent = v;
  }
  update();
  const tr = wrap.querySelector('.track');
  function pick(e) {
    const r = tr.getBoundingClientRect();
    v = Math.round(Math.max(0, Math.min(1, ((e.clientX || e.touches?.[0]?.clientX) - r.left)/r.width))*100);
    update();
  }
  tr.addEventListener('pointerdown', e => {
    pick(e);
    function move(ev) { pick(ev); }
    function up() { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });
  root.appendChild(wrap);
});

  R('forms', 'form-rating', 'Star rating',
`5-star rating row. Hover a star to preview that rating, click to set,
hover off shows the set value. Animated fill.`,
(root) => {
  root.style.cssText += `background:#fffbea; color:#1a1a1a; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `text-align:center;`;
  let value = 4, hover = 0;
  wrap.innerHTML = `
    <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888; margin-bottom:8px;">— RATE THIS</div>
    <div class="stars" style="display:flex; gap:4px; justify-content:center;"></div>
    <div class="lab" style="font:500 11px/1 'JetBrains Mono', monospace; color:#a44; margin-top:8px;"></div>`;
  const stars = wrap.querySelector('.stars');
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span');
    s.style.cssText = `font-size:24px; cursor:pointer; line-height:1; transition: color .15s, transform .15s;`;
    s.dataset.i = i;
    s.addEventListener('mouseenter', () => { hover = i; render(); });
    s.addEventListener('mouseleave', () => { hover = 0; render(); });
    s.addEventListener('click',     () => { value = i; render(); });
    stars.appendChild(s);
  }
  function render() {
    const n = hover || value;
    stars.querySelectorAll('span').forEach((s, i) => {
      s.textContent = i < n ? '★' : '☆';
      s.style.color = i < n ? '#f5a300' : '#ccc';
      s.style.transform = (hover === i+1) ? 'translateY(-2px) scale(1.1)' : '';
    });
    wrap.querySelector('.lab').textContent = ['','Poor','Fair','Good','Great','Excellent'][n] || '';
  }
  render();
  root.appendChild(wrap);
});

  R('forms', 'form-color', 'Color picker · swatches',
`Color picker as a row of preset swatches plus a hex input. Selected
swatch is outlined. Typing a valid hex updates the preview tile.`,
(root) => {
  root.style.cssText += `background:#fafaf6; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:flex; flex-direction:column; gap:8px; justify-content:center;`;
  const swatches = ['#1a1a1a','#ff5b1f','#3a8eff','#0a8a3a','#ffd166','#c084fc','#ff7a59','#4ecdc4'];
  let val = swatches[1];
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888;">— ACCENT</div>
    <div class="row" style="display:flex; gap:5px; flex-wrap:wrap; margin:6px 0 8px;">
      ${swatches.map(c => `
        <button data-c="${c}" style="all:unset; cursor:pointer; width:24px; height:24px; background:${c};
          ${c===val?'box-shadow: 0 0 0 2px #fff, 0 0 0 3px #1a1a1a;':''}"></button>`).join('')}
    </div>
    <div style="display:flex; gap:6px; align-items:center;">
      <div class="prev" style="width:28px; height:28px; background:${val};"></div>
      <input class="hex" value="${val}" style="font:500 12px/1 'JetBrains Mono', monospace; padding:7px 8px;
        background:#fff; border:1px solid #d8d4c8; outline:none; flex:1; text-transform:uppercase;" />
    </div>`;
  function set(c) {
    val = c;
    wrap.querySelector('.prev').style.background = c;
    wrap.querySelector('.hex').value = c;
    wrap.querySelectorAll('[data-c]').forEach(b => {
      b.style.boxShadow = b.dataset.c.toLowerCase() === c.toLowerCase()
        ? '0 0 0 2px #fff, 0 0 0 3px #1a1a1a' : '';
    });
  }
  wrap.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => set(b.dataset.c)));
  wrap.querySelector('.hex').addEventListener('input', e => {
    if (/^#[0-9a-f]{6}$/i.test(e.target.value)) set(e.target.value);
  });
  root.appendChild(wrap);
});

  R('forms', 'form-textarea', 'Textarea · with counter',
`Auto-grow textarea with a character counter underneath. Counter turns
amber at 80% of limit and red at 100%. Limit 200.`,
(root) => {
  root.style.cssText += `background:#fff; color:#1a1a1a; padding:14px;
    font-family: ui-sans-serif, system-ui; display:flex; flex-direction:column; justify-content:center; gap:6px;`;
  const LIMIT = 200;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888;">— BIO</div>
    <textarea placeholder="Tell us about you..." style="font:400 12px/1.45 ui-sans-serif; padding:10px; border:1px solid #d8d4c8; outline:none; resize:none; min-height:60px; max-height:120px; background:#fafaf6;"></textarea>
    <div style="display:flex; justify-content:space-between; font-size:9px;">
      <span style="color:#888;">Be brief.</span>
      <span class="ct" style="color:#888;">0 / ${LIMIT}</span>
    </div>`;
  const ta = wrap.querySelector('textarea');
  const ct = wrap.querySelector('.ct');
  ta.addEventListener('input', () => {
    if (ta.value.length > LIMIT) ta.value = ta.value.slice(0, LIMIT);
    ct.textContent = `${ta.value.length} / ${LIMIT}`;
    const k = ta.value.length / LIMIT;
    ct.style.color = k >= 1 ? '#c0382f' : k >= 0.8 ? '#d68a00' : '#888';
    ta.style.height = 'auto';
    ta.style.height = Math.min(120, ta.scrollHeight) + 'px';
  });
  root.appendChild(wrap);
});

  R('forms', 'form-radio', 'Radio cards',
`Radio "cards" — three selectable cards laid out in a row, each with
an icon, label, and short blurb. Selected card has a colored border
and a small check badge.`,
(root) => {
  root.style.cssText += `background:#f7f2e6; color:#1a1a1a; padding:10px 8px;
    font-family: ui-sans-serif, system-ui; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px; align-items:stretch;`;
  const opts = [
    ['◆','Personal','For solo work.'],
    ['▣','Team',    'Up to 10.'],
    ['✦','Studio',  'Unlimited seats.'],
  ];
  let sel = 1;
  function render() {
    root.innerHTML = opts.map((o,i) => `
      <button data-i="${i}" style="all:unset; cursor:pointer; padding:9px; background:#fff;
        border: 2px solid ${i===sel?'#1a1a1a':'#e2dfd5'}; position:relative;
        display:flex; flex-direction:column; gap:3px;">
        ${i===sel ? `<span style="position:absolute; top:-7px; right:-7px; width:18px; height:18px; border-radius:50%;
          background:#1a1a1a; color:#fff; display:grid; place-items:center; font-size:10px;">✓</span>` : ''}
        <div style="font-size:18px; line-height:1; color:#a44;">${o[0]}</div>
        <div style="font-size:11px; font-weight:600;">${o[1]}</div>
        <div style="font-size:9px; color:#666;">${o[2]}</div>
      </button>`).join('');
    root.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { sel = parseInt(b.dataset.i); render(); }));
  }
  render();
});

  R('forms', 'form-pin', 'Pin · 4-digit secure',
`4-digit numeric PIN entry. Each digit appears as a filled circle once
typed. Big square inputs with bottom rule. Errors flash a shake animation.`,
(root) => {
  root.style.cssText += `background:#0a0a0a; color:#fff; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `text-align:center;`;
  wrap.innerHTML = `
    <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#9bf;">— PIN</div>
    <div style="font-size:13px; font-weight:600; margin:6px 0 12px;">Enter your 4-digit code</div>
    <div class="row" style="display:flex; gap:7px; justify-content:center;"></div>`;
  const row = wrap.querySelector('.row');
  for (let i = 0; i < 4; i++) {
    const inp = document.createElement('input');
    inp.maxLength = 1; inp.type = 'password'; inp.inputMode = 'numeric';
    inp.style.cssText = `width:32px; height:36px; text-align:center; background:transparent; color:#fff;
      font: 500 18px/1 'JetBrains Mono', monospace; border:0; border-bottom:2px solid #2a3140; outline:none;`;
    inp.addEventListener('input', e => {
      if (!/^\d?$/.test(e.target.value)) { e.target.value = ''; return; }
      if (e.target.value && i < 3) row.children[i+1].focus();
      const all = [...row.children].map(c => c.value).join('');
      if (all.length === 4 && all !== '1234') {
        wrap.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}], {duration:200});
        row.querySelectorAll('input').forEach(c => c.style.borderBottomColor = '#c0382f');
        setTimeout(() => row.querySelectorAll('input').forEach(c => { c.value=''; c.style.borderBottomColor='#2a3140'; }), 400);
        row.children[0].focus();
      } else if (all === '1234') {
        row.querySelectorAll('input').forEach(c => c.style.borderBottomColor = '#0a8a3a');
      }
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) row.children[i-1].focus();
    });
    row.appendChild(inp);
  }
  root.appendChild(wrap);
});

  R('forms', 'form-time', 'Time picker · scroller',
`Hour/minute scroller picker. Two columns with snap-scroll, each shows
a centered "selection" highlight. Numbers fade as they leave the
center.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `display:flex; gap:6px; position:relative;`;
  function col(max) {
    const c = document.createElement('div');
    c.style.cssText = `height:120px; overflow-y:auto; scroll-snap-type: y mandatory;
      width:46px; text-align:center; padding:48px 0;
      mask-image: linear-gradient(to bottom, transparent 0, black 30%, black 70%, transparent 100%);`;
    let inner = '';
    for (let i = 0; i < max; i++) {
      inner += `<div style="height:24px; line-height:24px; scroll-snap-align: center;
        font: 500 14px/1 'JetBrains Mono', monospace; color:#1a1a1a;">${String(i).padStart(2,'0')}</div>`;
    }
    c.innerHTML = inner;
    return c;
  }
  wrap.innerHTML = `
    <div style="position:absolute; left:0; right:0; top:50%; transform:translateY(-50%);
      height:24px; background:#fff8e8; border-top:1px solid #1a1a1a; border-bottom:1px solid #1a1a1a; z-index:0;"></div>`;
  wrap.appendChild(col(24));
  const sep = document.createElement('div');
  sep.style.cssText = `display:grid; place-items:center; font:500 14px/1 'JetBrains Mono', monospace;
    color:#1a1a1a; padding:0 4px; z-index:1;`;
  sep.textContent = ':';
  wrap.appendChild(sep);
  wrap.appendChild(col(60));
  root.appendChild(wrap);
});

  R('forms', 'form-confirm', 'Destructive confirm',
`Delete confirmation pattern. A primary "Delete" button starts in a
muted state. Clicking it reveals a "Type DELETE to confirm" input. The
button only enables when the input matches.`,
(root) => {
  root.style.cssText += `background:#1a0e0e; color:#fff; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `width:90%; max-width:280px;`;
  let stage = 0;
  function render() {
    if (stage === 0) {
      wrap.innerHTML = `
        <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#f87171;">— DANGER ZONE</div>
        <div style="font-size:12px; line-height:1.5; margin:6px 0 10px; color:#ddd;">
          Permanently delete this workspace and all its data.
        </div>
        <button style="all:unset; cursor:pointer; padding:8px 14px; background:transparent;
          border:1px solid #f87171; color:#f87171; font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">DELETE WORKSPACE</button>`;
      wrap.querySelector('button').addEventListener('click', () => { stage = 1; render(); });
    } else {
      wrap.innerHTML = `
        <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#f87171;">— TYPE TO CONFIRM</div>
        <div style="font-size:11px; color:#bbb; margin:6px 0;">Type <b style="color:#fff;">DELETE</b> to proceed.</div>
        <input class="conf" placeholder="DELETE" style="width:100%; box-sizing:border-box; background:#280f0f;
          border:1px solid #4a1a1a; color:#fff; font:500 12px/1 'JetBrains Mono', monospace;
          padding:8px; outline:none; letter-spacing:.06em;" />
        <button class="go" disabled style="all:unset; cursor:not-allowed; opacity:.4;
          margin-top:8px; padding:8px 14px; background:#f87171; color:#000;
          font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">CONFIRM DELETE</button>`;
      const conf = wrap.querySelector('.conf'), go = wrap.querySelector('.go');
      conf.addEventListener('input', () => {
        const ok = conf.value.trim() === 'DELETE';
        go.disabled = !ok;
        go.style.opacity = ok ? '1' : '.4';
        go.style.cursor = ok ? 'pointer' : 'not-allowed';
      });
      go.addEventListener('click', () => {
        wrap.innerHTML = `<div style="text-align:center; font-size:13px; color:#f87171;">✓ Workspace deleted.</div>`;
      });
    }
  }
  render();
  root.appendChild(wrap);
});

  /* ============================================================
     OVERLAYS — 20 cells. Drawers, popovers, menus, dialogs, sheets,
     dropdowns. Each demoes itself in-cell.
     ============================================================ */

  R('overlays', 'ov-drawer-r', 'Drawer · right slide',
`Right-side drawer in a mock window. Click "Open" to slide a panel in
from the right with a backdrop. ESC or X closes. Body shifts slightly
under the backdrop.`,
(root) => {
  root.style.cssText += `background:#f3f1ec; color:#222;
    font-family: ui-sans-serif, system-ui; position:relative; overflow:hidden;
    display:flex; align-items:center;`;
  root.innerHTML = `
    <div style="padding:14px; flex:1;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#888;">— DRAWER</div>
      <div style="font-size:12px; margin:6px 0 10px;">A side panel for editing details.</div>
      <button class="open" style="all:unset; cursor:pointer; padding:7px 12px; background:#1a1a1a; color:#fff;
        font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">OPEN ↗</button>
    </div>
    <div class="bd" style="position:absolute; inset:0; background:rgba(0,0,0,.4); opacity:0; pointer-events:none; transition:opacity .25s;"></div>
    <div class="dr" style="position:absolute; top:0; right:0; bottom:0; width:62%; background:#fff; padding:12px;
      transform: translateX(100%); transition: transform .25s cubic-bezier(.6,.1,.4,1); box-shadow:-8px 0 24px rgba(0,0,0,.2);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-weight:600; font-size:12px;">Edit item</div>
        <button class="x" style="all:unset; cursor:pointer; font-size:14px; color:#888;">✕</button>
      </div>
      <div style="font-size:10px; color:#888; margin-top:8px; line-height:1.5;">Form fields, settings, etc.</div>
    </div>`;
  const open = root.querySelector('.open'), bd = root.querySelector('.bd'), dr = root.querySelector('.dr'), x = root.querySelector('.x');
  function show(b) {
    bd.style.opacity = b ? '1' : '0';
    bd.style.pointerEvents = b ? 'auto' : 'none';
    dr.style.transform = b ? 'translateX(0)' : 'translateX(100%)';
  }
  open.addEventListener('click', () => show(true));
  bd.addEventListener('click', () => show(false));
  x.addEventListener('click', () => show(false));
});

  R('overlays', 'ov-modal', 'Modal · centered',
`Centered modal dialog. Click "Open modal" to fade in a backdrop and
pop the dialog with a small scale + fade. Header, body text, and a
"Cancel" + "Confirm" pair.`,
(root) => {
  root.style.cssText += `background:#13161c; color:#eee;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center; position:relative; overflow:hidden;`;
  root.innerHTML = `
    <button class="open" style="all:unset; cursor:pointer; padding:8px 14px; background:#3a8eff; color:#000;
      font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em; white-space:nowrap;">OPEN MODAL</button>
    <div class="bd" style="position:absolute; inset:0; background:rgba(0,0,0,.6); opacity:0; pointer-events:none; transition:opacity .2s;"></div>
    <div class="md" style="position:absolute; left:50%; top:50%; width:78%; max-width:280px;
      transform: translate(-50%,-50%) scale(.96); opacity:0; transition: opacity .2s, transform .2s; pointer-events:none;
      background:#1c2030; border:1px solid #2a3140; padding:14px;">
      <div style="font-weight:600; font-size:13px;">Confirm action</div>
      <div style="font-size:11px; color:#9aa; margin:6px 0 12px; line-height:1.5;">This will replace the current document.</div>
      <div style="display:flex; gap:6px; justify-content:flex-end;">
        <button class="cancel" style="all:unset; cursor:pointer; padding:6px 12px; border:1px solid #2a3140;
          font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">CANCEL</button>
        <button class="ok" style="all:unset; cursor:pointer; padding:6px 12px; background:#3a8eff; color:#000;
          font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">CONFIRM</button>
      </div>
    </div>`;
  function show(b) {
    const bd = root.querySelector('.bd'), md = root.querySelector('.md');
    bd.style.opacity = b ? '1' : '0';
    bd.style.pointerEvents = b ? 'auto' : 'none';
    md.style.opacity = b ? '1' : '0';
    md.style.transform = `translate(-50%,-50%) scale(${b?1:0.96})`;
    md.style.pointerEvents = b ? 'auto' : 'none';
  }
  root.querySelector('.open').addEventListener('click', () => show(true));
  root.querySelector('.bd').addEventListener('click', () => show(false));
  root.querySelector('.cancel').addEventListener('click', () => show(false));
  root.querySelector('.ok').addEventListener('click', () => show(false));
});

  R('overlays', 'ov-popover', 'Popover · anchored',
`Hover the trigger word to show a small popover above it with arrow,
title, and a 1-line definition. Smooth fade + 4px lift.`,
(root) => {
  root.style.cssText += `background:#fafaf6; color:#222; padding:14px;
    font-family: 'Times New Roman', serif; display:grid; place-items:center; position:relative;`;
  root.innerHTML = `
    <div style="font: 400 13px/1.5 Georgia, serif; max-width:84%;">
      "The first principle is that you must not <span class="trig" style="position:relative; cursor:help; border-bottom: 1px dashed #a44; color:#a44;">deceive
        <span class="pop" style="position:absolute; left:50%; bottom:120%; transform: translate(-50%, 4px);
          background:#1a1a1a; color:#fff; padding:6px 9px; font: 400 11px/1.4 ui-sans-serif;
          width:160px; opacity:0; pointer-events:none; transition: opacity .18s, transform .18s; z-index:10;">
          <b style="font-size:9px; letter-spacing:.16em; color:#ffd166;">DECEIVE (V.)</b><br/>
          to give a false impression
          <span style="position:absolute; left:50%; bottom:-5px; transform:translateX(-50%) rotate(45deg); width:8px; height:8px; background:#1a1a1a;"></span>
        </span>
      </span> yourself — and you are the easiest person to fool."
    </div>`;
  const t = root.querySelector('.trig');
  t.addEventListener('mouseenter', () => {
    const p = t.querySelector('.pop');
    p.style.opacity = '1'; p.style.transform = 'translate(-50%, 0)';
  });
  t.addEventListener('mouseleave', () => {
    const p = t.querySelector('.pop');
    p.style.opacity = '0'; p.style.transform = 'translate(-50%, 4px)';
  });
});

  R('overlays', 'ov-context', 'Context menu · right-click',
`Right-click anywhere in the cell to show a contextual menu at the
cursor. Items: Edit, Duplicate, Move, Delete (red). Menu disappears
on outside click or ESC.`,
(root) => {
  root.style.cssText += `background:#0e1117; color:#fff; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center; position:relative; user-select:none;`;
  root.innerHTML = `
    <div style="text-align:center; color:#788;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#9bf;">— RIGHT-CLICK ANYWHERE</div>
      <div style="font-size:11px; margin-top:8px;">Try right-clicking inside this cell.</div>
    </div>
    <div class="menu" style="position:absolute; display:none; background:#1c2030; border:1px solid #2a3140;
      padding:4px 0; box-shadow: 0 8px 24px rgba(0,0,0,.6); min-width:140px; z-index:10;">
      ${[
        ['Edit',     'edit'],
        ['Duplicate','dup'],
        ['Move…',    'move'],
        ['---',      ''],
        ['Delete',   'del'],
      ].map(([l,a]) => l === '---'
        ? `<div style="height:1px; background:#2a3140; margin:4px 0;"></div>`
        : `<div data-a="${a}" style="padding:6px 12px; cursor:pointer; font-size:11px; color:${a==='del'?'#f87171':'#fff'};"
              onmouseover="this.style.background='#2a3140'" onmouseout="this.style.background='transparent'">${l}</div>`
      ).join('')}
    </div>`;
  const menu = root.querySelector('.menu');
  root.addEventListener('contextmenu', e => {
    e.preventDefault();
    const r = root.getBoundingClientRect();
    menu.style.display = 'block';
    menu.style.left = Math.min(e.clientX - r.left, r.width - 150) + 'px';
    menu.style.top  = Math.min(e.clientY - r.top, r.height - 160) + 'px';
  });
  document.addEventListener('click', () => menu.style.display = 'none');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') menu.style.display = 'none'; });
});

  R('overlays', 'ov-dropdown', 'Dropdown · select',
`Custom select. Click trigger to open the menu, click an option to set
it. Selected option has a check. Keyboard arrows + Enter work.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center; position:relative;`;
  let open = false, idx = 0;
  const opts = ['Recent','Most popular','Alphabetical','Newest first','Oldest first'];
  const wrap = document.createElement('div');
  wrap.style.cssText = `width:80%; max-width:200px; position:relative;`;
  function render() {
    wrap.innerHTML = `
      <button class="trig" style="all:unset; cursor:pointer; width:100%; box-sizing:border-box;
        padding:8px 10px; background:#fafaf6; border:1px solid #d8d4c8;
        font:400 11px/1 ui-sans-serif; display:flex; justify-content:space-between; align-items:center;">
        <span>${opts[idx]}</span>
        <span style="color:#888; font-size:10px; transform: rotate(${open?180:0}deg); transition: transform .15s;">▼</span>
      </button>
      ${open ? `
        <div class="menu" style="position:absolute; top:calc(100% + 4px); left:0; right:0;
          background:#fff; border:1px solid #d8d4c8; box-shadow:0 4px 16px rgba(0,0,0,.08); z-index:10;">
          ${opts.map((o,i) => `
            <div data-i="${i}" style="padding:7px 10px; font-size:11px; cursor:pointer;
              ${i===idx?'background:#fff8e8;':''}"
              onmouseover="this.style.background='#fff8e8'"
              onmouseout="this.style.background='${i===idx?'#fff8e8':'transparent'}'">
              <span style="display:inline-block; width:16px; color:#a44;">${i===idx?'✓':''}</span>${o}
            </div>`).join('')}
        </div>` : ''}`;
    wrap.querySelector('.trig').addEventListener('click', () => { open = !open; render(); });
    wrap.querySelectorAll('[data-i]').forEach(el => el.addEventListener('click', () => {
      idx = parseInt(el.dataset.i); open = false; render();
    }));
  }
  render();
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) { open = false; render(); }});
  root.appendChild(wrap);
});

  R('overlays', 'ov-toast', 'Toast · stacking notifs',
`Click "Notify" to spawn a toast at the bottom-right. Toasts stack
upward, auto-dismiss after 3s, can be hand-dismissed. Each toast has
icon, title, optional sub-message.`,
(root) => {
  root.style.cssText += `background:#0a0a0a; color:#fff;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center; position:relative;`;
  root.innerHTML = `
    <button class="spawn" style="all:unset; cursor:pointer; padding:7px 14px; background:#3a8eff; color:#000;
      font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em; white-space:nowrap;">+ NOTIFY</button>
    <div class="stack" style="position:absolute; right:12px; bottom:12px; display:flex; flex-direction:column-reverse; gap:6px; pointer-events:none;"></div>`;
  const stack = root.querySelector('.stack');
  const types = [
    ['✓','#0a8a3a','Saved successfully','Your changes are live.'],
    ['!','#d68a00','Hold on','Connection slow.'],
    ['↻','#3a8eff','Syncing…','Almost done.'],
  ];
  let n = 0;
  root.querySelector('.spawn').addEventListener('click', () => {
    const [g,c,t,s] = types[n++ % types.length];
    const tt = document.createElement('div');
    tt.style.cssText = `background:#1a1a1a; border-left: 3px solid ${c}; padding:7px 26px 7px 9px;
      min-width:160px; max-width:200px; pointer-events:auto; cursor:pointer; position:relative;
      transform: translateX(20px); opacity:0; transition: transform .25s, opacity .25s;`;
    tt.innerHTML = `
      <span style="color:${c}; font-size:13px; margin-right:6px;">${g}</span>
      <span style="font-size:11px; font-weight:600;">${t}</span>
      <div style="font-size:9px; color:#888; margin-top:2px; padding-left:18px;">${s}</div>
      <span style="position:absolute; top:5px; right:7px; font-size:10px; color:#666;">✕</span>`;
    stack.appendChild(tt);
    requestAnimationFrame(() => { tt.style.transform = 'translateX(0)'; tt.style.opacity = '1'; });
    const dismiss = () => {
      tt.style.transform = 'translateX(20px)'; tt.style.opacity = '0';
      setTimeout(() => tt.remove(), 250);
    };
    tt.addEventListener('click', dismiss);
    setTimeout(dismiss, 3000);
  });
});

  R('overlays', 'ov-tooltip', 'Tooltip · hover',
`Hover any of the 4 toolbar icons to show a small dark tooltip below.
Tooltip has a small upward triangle. ~80ms delay on show, instant on
hide.`,
(root) => {
  root.style.cssText += `background:#fafaf6; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `display:flex; gap:0; background:#fff; padding:5px; border:1px solid #d8d4c8;`;
  const icons = [
    ['B','Bold (⌘B)'],
    ['I','Italic (⌘I)'],
    ['U','Underline (⌘U)'],
    ['/','Strikethrough'],
  ];
  wrap.innerHTML = icons.map(([g,t]) => `
    <button class="ic" data-tt="${t}" style="all:unset; cursor:pointer; width:30px; height:30px;
      display:grid; place-items:center; font: 500 12px/1 'JetBrains Mono', monospace; color:#222;
      transition: background .15s;"
      onmouseover="this.style.background='#f0eee8'" onmouseout="this.style.background='transparent'">${g}</button>
  `).join('');
  const tip = document.createElement('div');
  tip.style.cssText = `position:absolute; background:#1a1a1a; color:#fff;
    font:500 10px/1 'JetBrains Mono', monospace; padding:5px 8px; pointer-events:none;
    opacity:0; transform: translateY(-2px); transition: opacity .15s, transform .15s; z-index:10;
    white-space:nowrap;`;
  root.style.position = 'relative';
  root.appendChild(tip);
  let timer;
  wrap.querySelectorAll('.ic').forEach(b => {
    b.addEventListener('mouseenter', () => {
      timer = setTimeout(() => {
        const r = b.getBoundingClientRect();
        const rr = root.getBoundingClientRect();
        tip.textContent = b.dataset.tt;
        tip.style.left = (r.left - rr.left + r.width/2) + 'px';
        tip.style.top  = (r.bottom - rr.top + 6) + 'px';
        tip.style.transform = 'translate(-50%, 0)';
        tip.style.opacity = '1';
      }, 80);
    });
    b.addEventListener('mouseleave', () => { clearTimeout(timer); tip.style.opacity = '0'; tip.style.transform = 'translate(-50%, -2px)'; });
  });
  root.appendChild(wrap);
});

  R('overlays', 'ov-sheet', 'Bottom sheet · mobile',
`Mobile-style bottom sheet. Click the grab-handle area to slide a
sheet up from the bottom. Sheet has a drag-handle at top and a list
of options. Drag-down or backdrop tap to dismiss.`,
(root) => {
  root.style.cssText += `background:#13161c; color:#fff;
    font-family: ui-sans-serif, system-ui; position:relative; overflow:hidden;
    display:flex; align-items:center;`;
  root.innerHTML = `
    <div style="padding:14px; flex:1;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#9bf;">— SHEET</div>
      <div style="font-size:12px; margin:6px 0 10px;">Tap to bring up the bottom sheet.</div>
      <button class="open" style="all:unset; cursor:pointer; padding:7px 12px; background:#3a8eff; color:#000;
        font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">SHOW SHEET ↑</button>
    </div>
    <div class="bd" style="position:absolute; inset:0; background:rgba(0,0,0,.5); opacity:0; pointer-events:none; transition: opacity .25s;"></div>
    <div class="sh" style="position:absolute; left:0; right:0; bottom:0; background:#1c2030; border-top-left-radius:10px;
      border-top-right-radius:10px; padding:10px 14px 14px; transform: translateY(100%);
      transition: transform .3s cubic-bezier(.6,.1,.4,1);">
      <div style="width:36px; height:3px; background:#2a3140; border-radius:99px; margin:0 auto 10px;"></div>
      ${['Share','Edit','Move to…','Delete'].map((x,i) => `
        <div style="padding:9px 0; ${i<3?'border-bottom:1px solid #2a3140;':''} font-size:12px; cursor:pointer;
          ${x==='Delete'?'color:#f87171;':''}">${x}</div>`).join('')}
    </div>`;
  const open = root.querySelector('.open'), bd = root.querySelector('.bd'), sh = root.querySelector('.sh');
  function show(b) {
    bd.style.opacity = b ? '1' : '0';
    bd.style.pointerEvents = b ? 'auto' : 'none';
    sh.style.transform = b ? 'translateY(0)' : 'translateY(100%)';
  }
  open.addEventListener('click', () => show(true));
  bd.addEventListener('click', () => show(false));
});

  R('overlays', 'ov-cmdk', 'Command palette · ⌘K',
`A ⌘K-style command palette. Searchable list with kbd hints, grouped
sections, arrow-key navigation. Enter "runs" the highlighted command
(visual feedback only).`,
(root) => {
  root.style.cssText += `background:#0a0a0a; color:#fff; padding:0;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center; position:relative;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `width:88%; max-width:300px; background:#161a22; border:1px solid #2a3140;
    box-shadow: 0 16px 40px rgba(0,0,0,.6);`;
  wrap.innerHTML = `
    <input class="q" placeholder="Type a command..." style="width:100%; box-sizing:border-box; padding:10px 12px;
      background:transparent; border:0; border-bottom:1px solid #2a3140; color:#fff; outline:none;
      font:400 12px/1 ui-sans-serif;" />
    <div class="list" style="max-height:160px; overflow:auto; padding:4px 0;"></div>
    <div style="display:flex; gap:10px; padding:7px 12px; border-top:1px solid #2a3140; font:500 9px/1 'JetBrains Mono', monospace; color:#788;">
      <span>↑↓ NAVIGATE</span><span>↵ RUN</span><span>ESC CLOSE</span>
    </div>`;
  const cmds = [
    {g:'Actions', items:[['◆','New file','⌘N'],['▣','New folder','⌘⇧N'],['↻','Reload','⌘R']]},
    {g:'Go to',  items:[['→','Settings','⌘,'],['→','Projects','⌘P']]},
    {g:'Theme',  items:[['◐','Toggle dark','⌘⇧L']]},
  ];
  let idx = 0;
  function render(q='') {
    const flat = [];
    cmds.forEach(g => g.items.forEach(i => {
      if (!q || i[1].toLowerCase().includes(q.toLowerCase())) flat.push({g:g.g, i});
    }));
    if (idx >= flat.length) idx = 0;
    const list = wrap.querySelector('.list');
    if (!flat.length) { list.innerHTML = `<div style="padding:14px; text-align:center; color:#666; font-size:11px;">No matches.</div>`; return; }
    let html = '', lastG = '';
    flat.forEach((it, i) => {
      if (it.g !== lastG) {
        html += `<div style="padding:6px 12px 4px; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#666;">${it.g.toUpperCase()}</div>`;
        lastG = it.g;
      }
      html += `<div data-i="${i}" style="display:flex; align-items:center; gap:8px; padding:6px 12px; cursor:pointer;
        background:${i===idx?'#2a3140':'transparent'};">
        <span style="width:14px; color:#9bf;">${it.i[0]}</span>
        <span style="flex:1; font-size:11px;">${it.i[1]}</span>
        <span style="font:500 9px/1 'JetBrains Mono', monospace; color:#788;">${it.i[2]}</span>
      </div>`;
    });
    list.innerHTML = html;
    list.querySelectorAll('[data-i]').forEach(el => el.addEventListener('mouseenter', () => { idx = parseInt(el.dataset.i); render(wrap.querySelector('.q').value); }));
  }
  const q = wrap.querySelector('.q');
  q.addEventListener('input', () => render(q.value));
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { idx++; render(q.value); }
    if (e.key === 'ArrowUp')   { idx = Math.max(0, idx-1); render(q.value); }
  });
  render('');
  root.appendChild(wrap);
});

  R('overlays', 'ov-banner', 'Banner · top alert',
`Persistent banner across the top: "We're updating our terms." with a
small "Read more" link and a × dismiss button. Subtle amber bg.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:0;
    font-family: ui-sans-serif, system-ui; display:flex; flex-direction:column;
    justify-content:center;`;
  const banner = document.createElement('div');
  banner.style.cssText = `background:#fff8e8; color:#7a4a00; padding:8px 12px;
    display:flex; gap:10px; align-items:center; font-size:11px; border-bottom:1px solid #f0e6c8;`;
  banner.innerHTML = `
    <span style="font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#a44;">NOTICE</span>
    <span style="flex:1;">We're updating our terms on May 15.</span>
    <a href="javascript:void(0)" style="color:#a44; text-decoration:underline;">Read more</a>
    <button class="x" style="all:unset; cursor:pointer; color:#888; font-size:14px; padding:0 4px;">✕</button>`;
  const main = document.createElement('div');
  main.style.cssText = `flex:1; padding:14px; color:#888; font-size:11px; display:flex; flex-direction:column; justify-content:center;`;
  main.innerHTML = `<div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em;">— APP CONTENT</div><div style="margin-top:6px; line-height:1.5;">Page content sits below the banner.</div>`;
  banner.querySelector('.x').addEventListener('click', () => banner.style.display = 'none');
  root.append(banner, main);
});

  R('overlays', 'ov-hovercard', 'Hover card · profile',
`Hover the @username pill to reveal a small profile card with avatar,
name, bio, follow button. Slight lift + fade. Card has a small arrow
pointing to the trigger.`,
(root) => {
  root.style.cssText += `background:#fafaf6; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center; position:relative;`;
  root.innerHTML = `
    <div style="font: 400 13px/1.7 ui-sans-serif;">
      Mentioned in this thread by
      <span class="trig" style="position:relative; color:#3a8eff; cursor:pointer; padding:2px 5px; background:#eaf2ff; border-radius:3px;">@mara
        <div class="card" style="position:absolute; left:50%; top:120%; transform: translate(-50%, 4px);
          background:#fff; border:1px solid #d8d4c8; padding:9px; width:200px; opacity:0; pointer-events:none;
          transition: opacity .18s, transform .18s; z-index:10; box-shadow: 0 8px 18px rgba(0,0,0,.08); text-align:left;">
          <div style="display:flex; gap:8px; align-items:center;">
            <div style="width:32px; height:32px; border-radius:50%; background:#ff7a59; color:#fff; display:grid; place-items:center; font:600 13px/1 ui-sans-serif;">M</div>
            <div>
              <div style="font-size:12px; font-weight:600;">Mara Köhler</div>
              <div style="font-size:9px; color:#888;">@mara · Berlin</div>
            </div>
          </div>
          <div style="font-size:10px; line-height:1.5; color:#444; margin-top:6px;">Designer at Studio. Writes about quiet things.</div>
          <button style="all:unset; cursor:pointer; margin-top:6px; padding:5px 10px; background:#1a1a1a; color:#fff;
            font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; display:block; text-align:center;">+ FOLLOW</button>
        </div>
      </span>.
    </div>`;
  const t = root.querySelector('.trig'), card = root.querySelector('.card');
  let timer;
  t.addEventListener('mouseenter', () => { clearTimeout(timer); card.style.opacity = '1'; card.style.transform = 'translate(-50%, 0)'; card.style.pointerEvents = 'auto'; });
  t.addEventListener('mouseleave', () => { timer = setTimeout(() => { card.style.opacity = '0'; card.style.transform = 'translate(-50%, 4px)'; card.style.pointerEvents = 'none'; }, 120); });
});

  R('overlays', 'ov-confirm-pop', 'Confirm popover · inline',
`Click "Delete" and a small popover anchors to it: "Sure?" with
Cancel / Confirm. Outside click cancels. No full-screen modal needed.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center; position:relative;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:relative;`;
  wrap.innerHTML = `
    <button class="trig" style="all:unset; cursor:pointer; padding:8px 14px; background:#fff;
      border:1px solid #c0382f; color:#c0382f; font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">DELETE</button>
    <div class="pop" style="position:absolute; top:calc(100% + 8px); left:50%; transform: translate(-50%, 4px);
      opacity:0; pointer-events:none; transition: opacity .18s, transform .18s; z-index:10;
      background:#1a1a1a; color:#fff; padding:10px 12px; min-width:180px; box-shadow:0 8px 16px rgba(0,0,0,.2);">
      <div style="font-size:11px; margin-bottom:8px;">Delete this item?</div>
      <div style="display:flex; gap:6px; justify-content:flex-end;">
        <button class="cancel" style="all:unset; cursor:pointer; padding:5px 10px; border:1px solid #444; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">CANCEL</button>
        <button class="ok" style="all:unset; cursor:pointer; padding:5px 10px; background:#c0382f; color:#fff; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">DELETE</button>
      </div>
      <span style="position:absolute; top:-5px; left:50%; transform:translateX(-50%) rotate(45deg); width:8px; height:8px; background:#1a1a1a;"></span>
    </div>`;
  function show(b) {
    const p = wrap.querySelector('.pop');
    p.style.opacity = b ? '1' : '0';
    p.style.transform = `translate(-50%, ${b?0:4}px)`;
    p.style.pointerEvents = b ? 'auto' : 'none';
  }
  wrap.querySelector('.trig').addEventListener('click', e => { e.stopPropagation(); show(true); });
  wrap.querySelector('.cancel').addEventListener('click', e => { e.stopPropagation(); show(false); });
  wrap.querySelector('.ok').addEventListener('click', e => { e.stopPropagation(); show(false); wrap.querySelector('.trig').textContent = '✓ DELETED'; wrap.querySelector('.trig').style.opacity = '.4'; });
  document.addEventListener('click', () => show(false));
  root.appendChild(wrap);
});

  R('overlays', 'ov-mega', 'Mega menu · nav',
`Top nav with a "Products" link that, on hover, opens a wide menu
panel below — multiple columns of links, each column with a heading.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222; padding:0;
    font-family: ui-sans-serif, system-ui; position:relative; overflow:hidden;
    display:flex; flex-direction:column;`;
  root.innerHTML = `
    <nav style="display:flex; gap:16px; padding:10px 14px; border-bottom:1px solid #eee; font-size:11px;">
      <span style="color:#888;">◆ Studio</span>
      <span class="trig" style="cursor:pointer; font-weight:600;">Products ▾</span>
      <span style="color:#444;">Pricing</span>
      <span style="color:#444;">Docs</span>
    </nav>
    <div class="mega" style="position:absolute; top:36px; left:0; right:0; background:#fff;
      border-bottom:1px solid #eee; padding:14px; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;
      transform: translateY(-8px); opacity:0; pointer-events:none; transition:opacity .2s, transform .2s; z-index:5;
      box-shadow: 0 12px 18px rgba(0,0,0,.05);">
      ${[
        ['Build',['Editor','Canvas','Plugins']],
        ['Ship',['Exports','Hosting','Domains']],
        ['Track',['Analytics','A/B','Realtime']],
      ].map(([h,xs])=>`
        <div>
          <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#888; margin-bottom:6px;">${h.toUpperCase()}</div>
          ${xs.map(x=>`<div style="font-size:11px; padding:3px 0;">${x}</div>`).join('')}
        </div>`).join('')}
    </div>
    <div style="padding:14px; color:#888; font-size:11px; flex:1; display:flex; align-items:center;">Hover "Products" above.</div>`;
  const t = root.querySelector('.trig'), mega = root.querySelector('.mega');
  let timer;
  function show(b) {
    mega.style.opacity = b?'1':'0';
    mega.style.transform = `translateY(${b?0:-8}px)`;
    mega.style.pointerEvents = b?'auto':'none';
  }
  t.addEventListener('mouseenter', () => { clearTimeout(timer); show(true); });
  t.addEventListener('mouseleave', () => { timer = setTimeout(() => show(false), 120); });
  mega.addEventListener('mouseenter', () => clearTimeout(timer));
  mega.addEventListener('mouseleave', () => show(false));
});

  R('overlays', 'ov-loader', 'Loading dialog',
`Modal with an animated indeterminate progress bar and "Loading…"
caption. Used during long async operations. Cannot be dismissed.`,
(root) => {
  root.style.cssText += `background:#0a0a0a; color:#fff; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center;`;
  root.innerHTML = `
    <div style="background:#161a22; border:1px solid #2a3140; padding:14px 16px; width:80%; max-width:240px; text-align:center;">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#9bf;">— PROCESSING</div>
      <div style="font-size:12px; margin:8px 0 12px;">Generating exports…</div>
      <div style="height:3px; background:#2a3140; overflow:hidden; position:relative;">
        <div style="position:absolute; top:0; left:-30%; height:100%; width:40%;
          background:linear-gradient(to right, transparent, #3a8eff, transparent);
          animation: indet 1.4s linear infinite;"></div>
      </div>
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#788; margin-top:10px;">DO NOT CLOSE</div>
    </div>`;
  if (!document.getElementById('__indet')) {
    const st = document.createElement('style'); st.id = '__indet';
    st.textContent = `@keyframes indet { from { left: -40%; } to { left: 110%; } }`;
    document.head.appendChild(st);
  }
});

  R('overlays', 'ov-coachmark', 'Coachmark · feature spotlight',
`Coachmark / onboarding spotlight. A circular hole in a dark overlay
focuses on a UI element, with a callout balloon explaining it. Skip /
Next buttons.`,
(root) => {
  root.style.cssText += `background:#fafaf6; color:#222;
    font-family: ui-sans-serif, system-ui; position:relative; overflow:hidden;
    display:flex; align-items:center;`;
  root.innerHTML = `
    <div style="padding:14px; flex:1; display:flex; flex-direction:column; justify-content:center;">
      <div style="font-size:12px; font-weight:600; margin-bottom:10px;">Workspace</div>
      <button class="trg" style="all:unset; padding:8px 12px; background:#1a1a1a; color:#fff;
        font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em; cursor:pointer; align-self:flex-start; white-space:nowrap;">+ NEW PROJECT</button>
      <div style="font-size:10px; color:#888; margin-top:14px;">Other UI…</div>
    </div>
    <div class="ov" style="position:absolute; inset:0; pointer-events:auto;
      background: radial-gradient(circle at 70px 50% , transparent 0, transparent 28px, rgba(0,0,0,.78) 36px);"></div>
    <div class="bal" style="position:absolute; top:50%; left:14px; transform: translate(0, 30px); background:#1a1a1a; color:#fff; padding:10px 12px;
      max-width:200px; font-size:11px; line-height:1.4; box-shadow:0 8px 18px rgba(0,0,0,.3);">
      <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.16em; color:#ffd166; margin-bottom:4px;">— TIP 1 / 3</div>
      Click here to create your first project.
      <div style="display:flex; gap:6px; justify-content:flex-end; margin-top:8px;">
        <button class="skip" style="all:unset; cursor:pointer; padding:4px 8px; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#888;">SKIP</button>
        <button class="next" style="all:unset; cursor:pointer; padding:4px 10px; background:#ffd166; color:#000; font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">NEXT →</button>
      </div>
      <span style="position:absolute; top:-4px; left:30px; width:8px; height:8px; background:#1a1a1a; transform:rotate(45deg);"></span>
    </div>`;
  function close() {
    root.querySelector('.ov').style.display = 'none';
    root.querySelector('.bal').style.display = 'none';
  }
  root.querySelector('.skip').addEventListener('click', close);
  root.querySelector('.next').addEventListener('click', close);
});

  R('overlays', 'ov-side-panel', 'Side panel · settings tabs',
`A right-anchored panel with vertical tabs on the left edge and content
on the right. Tabs: General, Appearance, Notifications, Advanced.
Static, but tabs switch.`,
(root) => {
  root.style.cssText += `background:#1a1d24; color:#eee; padding:0;
    font-family: ui-sans-serif, system-ui; display:grid; grid-template-columns: 100px 1fr; height:100%;`;
  const tabs = [
    ['General','Theme, language and locale settings.'],
    ['Appearance','Light, dark, system. Accent color.'],
    ['Notifications','Email, push, in-app preferences.'],
    ['Advanced','Beta flags and developer options.'],
  ];
  let act = 1;
  function render() {
    root.innerHTML = `
      <aside style="background:#13161c; padding:8px 0; display:flex; flex-direction:column;">
        ${tabs.map((t,i)=>`<button data-i="${i}" style="all:unset; cursor:pointer; padding:9px 12px; font-size:11px;
          color:${i===act?'#fff':'#788'}; border-left:2px solid ${i===act?'#3a8eff':'transparent'};
          ${i===act?'background:#1a1d24;':''}">${t[0]}</button>`).join('')}
      </aside>
      <main style="padding:14px;">
        <div style="font:500 9px/1 'JetBrains Mono', monospace; letter-spacing:.18em; color:#9bf;">— ${tabs[act][0].toUpperCase()}</div>
        <div style="font-size:14px; font-weight:600; margin:5px 0 8px;">${tabs[act][0]}</div>
        <div style="font-size:11px; color:#9aa; line-height:1.5;">${tabs[act][1]}</div>
      </main>`;
    root.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { act = parseInt(b.dataset.i); render(); }));
  }
  render();
});

  R('overlays', 'ov-portal-actions', 'Quick actions · floating',
`Floating action button (FAB) bottom-right. Click expands to reveal
3 sub-actions in an arc. Click again or outside to collapse. Smooth
spring-y animation.`,
(root) => {
  root.style.cssText += `background:#fff; color:#222;
    font-family: ui-sans-serif, system-ui; position:relative; overflow:hidden;
    display:flex; align-items:center; justify-content:center;`;
  root.innerHTML = `
    <div style="color:#888; font-size:11px; text-align:center;">Click the + button.</div>
    ${['◆','✦','▣'].map((g,i) => `
      <button data-i="${i}" class="sub" style="all:unset; cursor:pointer; position:absolute; right:14px; bottom:14px;
        width:36px; height:36px; background:#1a1a1a; color:#fff; border-radius:50%; display:grid; place-items:center;
        font-size:14px; transform: translate(0, 0) scale(0); opacity:0; transition: transform .25s cubic-bezier(.5,1.4,.5,1), opacity .2s;
        box-shadow: 0 6px 14px rgba(0,0,0,.2);">${g}</button>`).join('')}
    <button class="fab" style="all:unset; cursor:pointer; position:absolute; right:14px; bottom:14px;
      width:42px; height:42px; background:#a44; color:#fff; border-radius:50%; display:grid; place-items:center;
      font-size:18px; box-shadow: 0 6px 14px rgba(0,0,0,.25); transition: transform .2s; z-index:2;">+</button>`;
  let open = false;
  const fab = root.querySelector('.fab');
  const subs = root.querySelectorAll('.sub');
  function update() {
    fab.style.transform = open ? 'rotate(45deg)' : 'rotate(0)';
    subs.forEach((s,i) => {
      const off = (i+1) * 50;
      s.style.transform = open ? `translate(0, -${off}px) scale(1)` : 'translate(0,0) scale(0)';
      s.style.opacity = open ? '1' : '0';
    });
  }
  fab.addEventListener('click', () => { open = !open; update(); });
});

  R('overlays', 'ov-empty', 'Empty state',
`Empty state with a centered illustrative SVG glyph (geometric
construction), a heading, a 1-line subhead, and a primary CTA. Soft,
optimistic.`,
(root) => {
  root.style.cssText += `background:#fafaf6; color:#222; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center; text-align:center;`;
  root.innerHTML = `
    <div>
      <svg viewBox="0 0 64 64" width="48" height="48" style="margin-bottom:6px;">
        <rect x="8" y="20" width="48" height="36" fill="none" stroke="#a44" stroke-width="1.5"/>
        <line x1="8" y1="32" x2="56" y2="32" stroke="#a44" stroke-width="1.5"/>
        <circle cx="14" cy="26" r="2" fill="#a44"/>
        <circle cx="20" cy="26" r="2" fill="#ffd166"/>
        <circle cx="26" cy="26" r="2" fill="#5ad27a"/>
        <path d="M 20 14 L 32 4 L 44 14" fill="none" stroke="#a44" stroke-width="1.5"/>
      </svg>
      <div style="font-size:14px; font-weight:600; letter-spacing:-.01em; margin-bottom:4px;">No projects yet</div>
      <div style="font-size:11px; color:#888; margin-bottom:10px;">Create your first to get going.</div>
      <button style="all:unset; cursor:pointer; padding:7px 14px; background:#1a1a1a; color:#fff;
        font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em;">+ NEW PROJECT</button>
    </div>`;
});

  R('overlays', 'ov-action-sheet', 'Action sheet · iOS-style',
`iOS-style action sheet: stacked white buttons separated by 1px gray
gaps, last button red ("Delete"), and a separated "Cancel" button at
the bottom. Slides up from below.`,
(root) => {
  root.style.cssText += `background:#13161c;
    font-family: -apple-system, ui-sans-serif; display:grid; place-items:end center; padding-bottom:8px;`;
  const sheet = document.createElement('div');
  sheet.style.cssText = `width:88%; max-width:260px; display:flex; flex-direction:column; gap:8px;`;
  sheet.innerHTML = `
    <div style="background:rgba(240,240,245,.8); backdrop-filter: blur(20px); border-radius:13px; overflow:hidden;">
      <div style="padding:9px 14px 6px; font-size:11px; color:#888; text-align:center;">More actions</div>
      ${[
        ['Save to library','#007aff'],
        ['Share', '#007aff'],
        ['Add to favorites', '#007aff'],
        ['Delete', '#ff3b30'],
      ].map((x,i)=>`
        <div style="border-top:1px solid #d1d1d6; padding:11px; text-align:center; font-size:14px;
          color:${x[1]}; ${i===3?'font-weight:600;':''} cursor:pointer;">${x[0]}</div>`).join('')}
    </div>
    <div style="background:rgba(240,240,245,.85); backdrop-filter: blur(20px); border-radius:13px;
      padding:11px; text-align:center; font-size:14px; color:#007aff; font-weight:600; cursor:pointer;">Cancel</div>`;
  root.appendChild(sheet);
});

  R('overlays', 'ov-status-pill', 'Status pill · expandable',
`A small pill in the corner showing live system status ("● All
systems normal"). Click expands to a card listing each service with
its status (operational / degraded / outage).`,
(root) => {
  root.style.cssText += `background:#0e1117; color:#eee; padding:14px;
    font-family: ui-sans-serif, system-ui; display:grid; place-items:center start;`;
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:relative; max-width: 90%;`;
  let open = false;
  function render() {
    wrap.innerHTML = `
      <button class="pill" style="all:unset; cursor:pointer; display:inline-flex; align-items:center; gap:6px;
        padding:6px 12px; background:#161a22; border:1px solid #2a3140; border-radius:99px;
        font:500 10px/1 'JetBrains Mono', monospace; letter-spacing:.14em; color:#5ad27a;">
        <span style="width:6px; height:6px; border-radius:50%; background:#5ad27a;
          box-shadow: 0 0 6px #5ad27a;"></span>
        ALL SYSTEMS NORMAL
        <span style="margin-left:4px; transform: rotate(${open?180:0}deg); transition: transform .2s; color:#788;">▾</span>
      </button>
      ${open ? `
        <div style="margin-top:6px; background:#161a22; border:1px solid #2a3140; padding:8px 10px;">
          ${[
            ['API',         'ok',     '99.99%'],
            ['Web app',     'ok',     '99.97%'],
            ['Storage',     'degraded','97.20%'],
            ['Auth',        'ok',     '100%'],
          ].map(([n,s,u])=>`
            <div style="display:flex; gap:6px; align-items:center; font-size:11px; padding:4px 0; ${s==='ok'?'':'color:#ffd166;'}">
              <span style="width:6px; height:6px; border-radius:50%; background:${s==='ok'?'#5ad27a':'#ffd166'};"></span>
              <span style="flex:1;">${n}</span>
              <span style="font:500 9px/1 'JetBrains Mono', monospace; color:#788;">${u}</span>
            </div>`).join('')}
        </div>` : ''}`;
    wrap.querySelector('.pill').addEventListener('click', () => { open = !open; render(); });
  }
  render();
  root.appendChild(wrap);
});

})();
