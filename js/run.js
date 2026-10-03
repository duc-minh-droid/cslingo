/* Figure runner: a step-through player for algorithm figures inside lesson steps.

   NIC.fig.run(box, life, {
     build(stage, api)  → scene       // make the figure once (SVG/HTML inside stage); keep handles in `scene`
     frames(scene)      → iterable    // the real algorithm yields one frame per step (a generator is fine):
                                      //   {cap, line?, ask?: {q, pick, a, why}, ...your state}
     draw(scene, f, c)                // show frame f. c = {tl, instant, prev, i}; use NIC.fig.rn helpers with c
     code: ["line 0", …],             // optional pseudocode; f.line highlights one line
     speed: 1, autoplay: false, who: "byte"
   })

   Frames are computed up front, so stepping back and scrubbing are exact. A frame with `ask` pauses before it is
   shown: the learner clicks an element matching `ask.pick` whose data-k equals `ask.a` (or one of them, if an array).
   Direct manipulation: api.drag(el, {move(x, y), end()}) and api.edit(el, {get, set, min, max, step}); call
   api.recompute() after changing the model, and the run restarts from frame 0.
   Tests: the root element carries __rn = {n(), i(), runAll()}; runAll() plays to the end, answering every ask. */
(function () {
  const N = NIC;
  const G = () => window.gsap;
  const regGsap = () => { if (window.gsap) window.gsap.registerPlugin(...[window.DrawSVGPlugin, window.MotionPathPlugin].filter(Boolean)); };
  regGsap();
  // GSAP (about 25 KB gzipped) loads after startup; the runner and the roulette wheel animate with it once it arrives
  if (!window.gsap) N.lazy("vendor/gsap/gsap.min.js", "vendor/gsap/DrawSVGPlugin.min.js", "vendor/gsap/MotionPathPlugin.min.js").then(regGsap, () => {});
  const reduce = () => N.fx && N.fx.reduce();
  const FX = () => (N.fx && N.fx.ok ? N.fx : null); // Motion helpers, or null without Motion
  const DUR = (N.fx && N.fx.DUR) || { xs: 0.09, s: 0.16, m: 0.24, l: 0.32 };
  const SVGNS = "http://www.w3.org/2000/svg";
  const I = {
    back: '<svg viewBox="0 0 24 24"><path d="M6 5v14M19 5.5v13L9 12z" fill="currentColor" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.4" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M18 5v14M5 5.5v13L15 12z" fill="currentColor" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    again: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const SPEEDS = [0.5, 1, 2];

  // ---------- tween helpers: animate on the frame's timeline, or set instantly when scrubbing ----------
  const rn = {
    /** Tween (or set) GSAP props on el: {attr:{…}, fill, opacity, x, y, scale…}. */
    to(c, el, props, at = 0, dur = 0.45) {
      if (!el) return;
      const g = G();
      if (!g) { applyPlain(el, props); return; }
      if (c.instant) g.set(el, props); else c.tl.to(el, { duration: dur, ease: "power2.out", ...props }, at);
    },
    /** Count a number up/down in el's text. Infinity shows as ∞. */
    num(c, el, to, at = 0) {
      if (!el) return;
      const show = (v) => (v === Infinity ? "∞" : Number.isInteger(to) ? String(Math.round(v)) : (+v).toFixed(1));
      const from = parseFloat(el.dataset.v);
      el.dataset.v = to;
      if (c.instant || !G() || !Number.isFinite(from) || !Number.isFinite(to) || from === to) { el.textContent = show(to); return; }
      const o = { v: from };
      c.tl.to(o, { v: to, duration: 0.5, ease: "power1.out", onUpdate: () => (el.textContent = show(o.v)), onComplete: () => (el.textContent = show(to)) }, at);
    },
    /** A quick scale bounce to draw the eye. */
    pulse(c, el, at = 0) {
      if (!el || c.instant || !G() || reduce()) return;
      c.tl.fromTo(el, { scale: 1 }, { scale: 1.22, duration: DUR.s, yoyo: true, repeat: 1, ease: "power1.inOut", transformOrigin: "50% 50%" }, at);
    },
    /** Show or hide a stroke by drawing it along its length. */
    stroke(c, el, on, at = 0) {
      if (!el) return;
      const g = G(), wasOn = el.dataset.on === "1";
      el.dataset.on = on ? "1" : "0";
      if (!g || !window.DrawSVGPlugin || c.instant || reduce() || wasOn === on) { el.style.strokeDasharray = ""; el.style.strokeDashoffset = ""; el.style.opacity = on ? 1 : 0; if (g) g.set(el, { drawSVG: "0% 100%", opacity: on ? 1 : 0 }); return; }
      if (on) c.tl.fromTo(el, { drawSVG: "0% 0%", opacity: 1 }, { drawSVG: "0% 100%", duration: 0.5, ease: "power2.inOut" }, at);
      else c.tl.to(el, { opacity: 0, duration: DUR.m }, at);
    },
    /** Swap text with a small fade. */
    text(c, el, s, at = 0) {
      if (!el || el.textContent === String(s)) return;
      if (c.instant || !G() || reduce()) { el.textContent = s; return; }
      c.tl.to(el, { opacity: 0, duration: DUR.xs }, at).call(() => (el.textContent = s), null, at + DUR.xs).to(el, { opacity: 1, duration: DUR.s }, at + DUR.xs);
    },
    /** Toggle a class at the frame's start (for CSS-driven states). */
    cls(c, el, name, on) { if (el) el.classList.toggle(name, !!on); },
  };
  function applyPlain(el, p) {
    Object.entries(p).forEach(([k, v]) => {
      if (k === "attr") Object.entries(v).forEach(([a, b]) => el.setAttribute(a, b));
      else if (k === "x" || k === "y") el.style.transform = `translate(${p.x || 0}px, ${p.y || 0}px)`;
      else el.style[k] = v;
    });
  }

  /** A labelled graph scene for runners: nodes {A:[x,y]}, edges [[a,b,w]]. Returns handles for each node/edge. */
  function graphScene(stage, { nodes, edges, w = 460, h = 280, r = 20, directed = false, editable = false }) {
    const key = (a, b) => (directed ? `${a}>${b}` : [a, b].sort().join("-"));
    const mid = (a, b) => [(nodes[a][0] + nodes[b][0]) / 2, (nodes[a][1] + nodes[b][1]) / 2];
    const trim = (a, b, d) => { const [x1, y1] = nodes[a], [x2, y2] = nodes[b], L = Math.hypot(x2 - x1, y2 - y1) || 1; return [x1 + ((x2 - x1) / L) * d, y1 + ((y2 - y1) / L) * d, x2 - ((x2 - x1) / L) * d, y2 - ((y2 - y1) / L) * d]; };
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.setAttribute("class", "fig rn-svg"); svg.style.maxHeight = h + "px";
    svg.innerHTML = `<defs><marker id="rn-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--line-2)"/></marker></defs>
      <g class="rn-edges">${edges.map(([a, b, wt]) => { const [x1, y1, x2, y2] = trim(a, b, r + 2), [mx, my] = mid(a, b);
        return `<g class="rn-edge" data-e="${key(a, b)}"><line class="rn-base" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${directed ? 'marker-end="url(#rn-arr)"' : ""}/><line class="rn-hot" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="opacity:0"/>
        <g class="rn-wt ${editable ? "rn-editable" : ""}" transform="translate(${mx} ${my})"><rect x="-13" y="-11" width="26" height="22" rx="7"/><text y="5" data-v="${wt}">${wt}</text></g></g>`; }).join("")}</g>
      <g class="rn-nodes">${Object.entries(nodes).map(([k, [x, y]]) => `<g class="rn-node" data-k="${k}" transform="translate(${x} ${y})"><g class="rn-nb"><circle class="rn-halo" r="${r + 7}"/><circle class="rn-c" r="${r}"/><text class="rn-l" y="6">${k}</text></g><g class="rn-tag" transform="translate(0 ${-r - 12})"><rect x="-17" y="-11" width="34" height="20" rx="8"/><text y="4" data-v="">·</text></g></g>`).join("")}</g>`;
    stage.appendChild(svg);
    const q = (s) => svg.querySelector(s);
    return {
      svg,
      node: (k) => { const g = q(`.rn-node[data-k="${k}"]`); return g && { g, body: g.querySelector(".rn-nb"), c: g.querySelector(".rn-c"), tag: g.querySelector(".rn-tag text"), tagBox: g.querySelector(".rn-tag") }; },
      edge: (a, b) => { const g = q(`.rn-edge[data-e="${key(a, b)}"]`); return g && { g, hot: g.querySelector(".rn-hot"), wt: g.querySelector(".rn-wt text"), wbox: g.querySelector(".rn-wt") }; },
      key,
    };
  }

  function run(box, life, o) {
    const who = o.who || (N.player && N.player.state && N.player.state().who) || "sprout";
    const root = N.el(`<div class="rn" tabindex="0" aria-label="Step-through figure. Arrow keys step, space plays.">
      <div class="rn-grid ${o.code ? "has-code" : ""}"><div class="rn-stage"></div>${o.code ? `<ol class="rn-code">${o.code.map((l, n) => `<li data-n="${n + 1}"><code>${N.esc(l)}</code></li>`).join("")}</ol>` : ""}</div>
      <div class="rn-dock"><div class="rn-cap">${N.mascot ? N.mascot({ who, size: 46, mood: "idle", cls: "rn-m" }) : ""}<div class="rn-bubble" aria-live="polite"><span class="rn-n"></span><span class="rn-t"></span></div></div>
      <div class="rn-ask" hidden></div>
      <div class="rn-bar">
        <button class="rn-b" data-a="back" aria-label="Step back">${I.back}</button>
        <button class="rn-b rn-play" data-a="play" aria-label="Play">${I.play}</button>
        <button class="rn-b" data-a="next" aria-label="Step forward">${I.next}</button>
        <input class="rn-scrub" type="range" min="0" max="1" value="0" aria-label="Scrub through the steps">
        <button class="rn-b rn-speed" data-a="speed" aria-label="Speed">1×</button>
        <button class="rn-b" data-a="again" aria-label="Restart">${I.again}</button>
      </div></div></div>`);
    box.appendChild(root);
    const $ = (s) => root.querySelector(s);
    const stage = $(".rn-stage"), cap = $(".rn-t"), num = $(".rn-n"), scrub = $(".rn-scrub"), askBox = $(".rn-ask"), playBtn = $(".rn-play");
    let frames = [], i = 0, playing = false, timer = 0, speed = o.speed || 1, tl = null, asking = null;
    const answered = new Set();

    const api = {
      root, stage,
      recompute(msg = "Recomputed. Replaying from the start.") { stop(); compute(); goto(0, true); if (N.fx && msg) N.fx.toast(msg, { tone: "blue", ms: 1500 }); },
      drag: (el, h) => dragger(el, h),
      edit: (el, h) => editor(el, h),
      get i() { return i; }, get frames() { return frames; },
    };
    const scene = o.build(stage, api);
    function compute() { frames = [...o.frames(scene)]; answered.clear(); scrub.max = Math.max(0, frames.length - 1); }

    function paint(k, instant) {
      if (tl) tl.progress(1).kill();
      const g = G(); tl = g ? g.timeline() : null;
      const f = frames[k], c = { tl, instant: instant || reduce() || !g, prev: frames[k - 1] || null, i: k };
      try { o.draw(scene, f, c); } catch (e) { console.error(e); }
      num.textContent = `${k + 1}/${frames.length}`;
      if (cap.innerHTML !== (f.cap || "")) { cap.innerHTML = f.cap || ""; const x = FX(); if (!c.instant && x) x.clean(cap, x.animate(cap, { opacity: [0, 1], transform: ["translateY(4px)", "translateY(0px)"] }, { duration: DUR.m, ease: x.EASE })); }
      root.querySelectorAll(".rn-code li").forEach((li, n) => li.classList.toggle("on", n === f.line));
      scrub.value = k; scrub.style.setProperty("--p", frames.length > 1 ? k / (frames.length - 1) : 1);
      $('[data-a="back"]').disabled = k === 0;
      $('[data-a="next"]').disabled = k === frames.length - 1;
      if (f.mood && root.querySelector(".rn-m") && N.mascotReact) N.mascotReact(root.querySelector(".rn-m"), f.mood);
    }
    function goto(k, instant) { i = Math.max(0, Math.min(frames.length - 1, k)); paint(i, instant); }

    /** Step forward; a frame with an unanswered `ask` pauses for the learner's guess first. */
    function forward() {
      if (asking) return false;
      if (i >= frames.length - 1) { stop(); return false; }
      const f = frames[i + 1];
      if (f.ask && !answered.has(i + 1)) { ask(i + 1); return false; }
      goto(i + 1);
      N.sfx && N.sfx.play("tick");
      if (i === frames.length - 1) { stop(); N.sfx && N.sfx.play("check"); }
      return true;
    }
    function tick() { if (!playing) return; if (forward()) timer = life.timeout(tick, 1300 / speed); }
    function play() { if (i >= frames.length - 1) goto(0, true); playing = true; playBtn.innerHTML = I.pause; playBtn.setAttribute("aria-label", "Pause"); tick(); }
    function stop() { playing = false; clearTimeout(timer); playBtn.innerHTML = I.play; playBtn.setAttribute("aria-label", "Play"); }

    function ask(k) {
      const A = frames[k].ask, wasPlaying = playing;
      clearTimeout(timer);
      asking = { k, A, wasPlaying };
      const picks = [...stage.querySelectorAll(A.pick)];
      picks.forEach((p) => p.classList.add("rn-pickable"));
      askBox.hidden = false; askBox.classList.remove("m-ghost");
      askBox.innerHTML = `<div class="rn-q"><span class="rn-qtag">Predict</span>${A.q}</div><button class="rn-skip">Show me</button>`;
      N.sfx && N.sfx.play("pop");
      const x = FX();
      if (x) x.clean(askBox, reduce() ? x.animate(askBox, { opacity: [0, 1] }, { duration: DUR.s })
        : x.animate(askBox, { opacity: [0, 1], transform: ["translateY(6px) scale(0.97)", "translateY(0px) scale(1)"] }, x.SPRING_UI));
      const m = root.querySelector(".rn-m"); if (m && N.mascotReact) N.mascotReact(m, "determined");
      askBox.querySelector(".rn-skip").onclick = () => resolve(null);
      asking.onPick = (e) => { const p = e.target.closest(A.pick); if (p && stage.contains(p)) resolve(p.dataset.k); };
      stage.addEventListener("click", asking.onPick);
    }
    function resolve(v) {
      if (!asking) return;
      const { k, A, wasPlaying } = asking, right = [].concat(A.a).map(String);
      stage.removeEventListener("click", asking.onPick);
      stage.querySelectorAll(".rn-pickable").forEach((p) => p.classList.remove("rn-pickable"));
      const ok = v !== null && right.includes(String(v)), skipped = v === null;
      answered.add(k); asking = null;
      const m = root.querySelector(".rn-m");
      if (!skipped) {
        N.sfx && N.sfx.play(ok ? "correct" : "wrong");
        if (m && N.mascotReact) N.mascotReact(m, ok ? "happy" : "surprised");
        if (ok && N.game) { N.game.award(1, "predict"); N.game.track("predict"); }
      }
      askBox.innerHTML = `<div class="rn-res ${skipped ? "" : ok ? "ok" : "no"}"><b>${skipped ? "Here's what happens." : ok ? "Spot on!" : `Not quite: it's ${right.join(" or ")}.`}</b> ${A.why || ""}</div>`;
      if (FX()) FX().reveal(askBox.firstElementChild);
      goto(k);
      life.timeout(() => { if (!asking) hideAsk(); if (wasPlaying && playing) timer = life.timeout(tick, 1300 / speed); }, ok || skipped ? 2200 : 3400);
    }
    /** Fade the ask/result box out, then hide it (unless a new ask took it over meanwhile). */
    function hideAsk() {
      if (askBox.hidden) return;
      const x = FX();
      if (!x) { askBox.hidden = true; return; }
      askBox.classList.add("m-ghost");
      x.exit(askBox, { y: 4, scale: 0.98 }).then(() => {
        askBox.classList.remove("m-ghost");
        if (asking) return;
        askBox.hidden = true;
        const clear = () => { if (asking) return; askBox.style.opacity = ""; askBox.style.transform = ""; };
        clear(); requestAnimationFrame(() => setTimeout(clear, 0)); // Motion can write its last frame a frame late
      });
    }

    // ---------- direct manipulation ----------
    function svgPoint(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
    function dragger(el, h) {
      el.classList.add("rn-drag");
      el.addEventListener("pointerdown", (e) => {
        if (asking) return;
        e.preventDefault(); stop(); el.setPointerCapture(e.pointerId); el.classList.add("rn-dragging");
        const svg = el.ownerSVGElement, vb = svg.viewBox.baseVal;
        const mv = (ev) => { const p = svgPoint(svg, ev); h.move(Math.max(4, Math.min(vb.width - 4, p.x)), Math.max(4, Math.min(vb.height - 4, p.y))); };
        const up = () => { el.removeEventListener("pointermove", mv); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); el.classList.remove("rn-dragging"); h.end && h.end(); };
        el.addEventListener("pointermove", mv); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
      });
    }
    let pop = null;
    const EDIT_BASE = "translate(-50%, -100%)"; // .rn-edit's CSS transform
    function editor(el, h) {
      el.classList.add("rn-editable");
      el.addEventListener("click", (e) => {
        if (asking) return;
        e.stopPropagation(); stop();
        closeEdit();
        const r = el.getBoundingClientRect(), rr = root.getBoundingClientRect();
        pop = N.el(`<div class="rn-edit" style="left:${r.left - rr.left + r.width / 2}px;top:${r.top - rr.top - 8}px"><button data-d="-1">−</button><b>${h.get()}</b><button data-d="1">+</button></div>`);
        root.appendChild(pop);
        // spring up out of the weight; the CSS transform (anchor above the weight) stays in every frame
        const x = FX();
        if (x) x.clean(pop, reduce() ? x.animate(pop, { opacity: [0, 1] }, { duration: DUR.s })
          : x.animate(pop, { opacity: [0, 1], transform: [`${EDIT_BASE} translateY(6px) scale(0.8)`, `${EDIT_BASE} translateY(0px) scale(1)`] }, x.SPRING_POP));
        const val = pop.querySelector("b");
        pop.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const b = ev.target.closest("button"); if (!b) return;
          const v = Math.max(h.min ?? -Infinity, Math.min(h.max ?? Infinity, h.get() + (+b.dataset.d) * (h.step || 1)));
          h.set(v); val.textContent = v; N.sfx && N.sfx.play("select");
          clearTimeout(pop._t); pop._t = setTimeout(() => api.recompute(), 450);
        });
      });
    }
    /** Close the weight editor with a short exit; a new one can open straight away. */
    function closeEdit() {
      if (!pop) return;
      const p = pop; pop = null;
      const x = FX();
      if (!x) { p.remove(); return; }
      p.classList.add("m-ghost");
      x.exit(p, { y: 4, scale: 0.9, base: EDIT_BASE }).then(() => p.remove());
    }
    const closePop = (e) => { if (pop && !pop.contains(e.target)) closeEdit(); };
    document.addEventListener("pointerdown", closePop);
    life.onCleanup(() => { document.removeEventListener("pointerdown", closePop); stop(); if (tl) tl.kill(); });

    // ---------- controls ----------
    root.querySelector(".rn-bar").addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      const a = b.dataset.a;
      if (a === "play") { playing ? stop() : play(); N.sfx && N.sfx.play("tap"); }
      else if (a === "next") { stop(); forward(); }
      else if (a === "back") { stop(); if (asking) return; goto(i - 1); N.sfx && N.sfx.play("back"); }
      else if (a === "again") { stop(); goto(0, true); N.sfx && N.sfx.play("back"); }
      else if (a === "speed") { speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; b.textContent = speed + "×"; N.sfx && N.sfx.play("select"); }
    });
    scrub.addEventListener("input", () => { stop(); if (!asking) goto(+scrub.value, true); });
    root.addEventListener("keydown", (e) => {
      if (e.target.closest("input")) return;
      const k = e.key;
      if (k === "ArrowRight") { stop(); forward(); }
      else if (k === "ArrowLeft") { stop(); if (!asking) goto(i - 1); }
      else if (k === " ") { playing ? stop() : play(); }
      else return;
      e.preventDefault(); e.stopPropagation();
    });

    root.__rn = {
      n: () => frames.length, i: () => i,
      /** For tools/smoke.js: play to the end, answering each ask correctly. */
      async runAll() {
        const errs = [];
        for (let g = 0; g < 400 && i < frames.length - 1; g++) {
          if (!forward() && asking) {
            const a = String([].concat(asking.A.a)[0]), t = [...stage.querySelectorAll(asking.A.pick)].find((p) => p.dataset.k === a);
            if (!t) { errs.push(`ask at frame ${asking.k}: no element for answer ${a}`); resolve(null); }
            else t.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }
          if (/NaN|undefined/.test(cap.textContent)) errs.push(`frame ${i}: "${cap.textContent}"`);
        }
        askBox.hidden = true;
        if (frames.length < 2) errs.push("runner has fewer than 2 frames");
        return errs;
      },
    };
    compute();
    goto(0, true);
    if (o.autoplay && !reduce()) life.timeout(play, 900);
    return api;
  }

  N.fig.run = run;
  N.fig.rn = rn;
  N.fig.graphScene = graphScene;
})();
