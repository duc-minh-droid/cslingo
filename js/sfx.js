/* Sound effects — synthesised with the Web Audio API, so there are no audio files and it works offline.
   NIC.sfx.play(name) · NIC.sfx.on() / NIC.sfx.set(bool). Muted state persists in localStorage ("csl.sound").
   The AudioContext is created lazily inside the first user gesture (browsers block autoplay otherwise). */
(function () {
  const KEY = "csl.sound"; // outside nic.*, so it is a per-device setting and never syncs (an old synced "nic.sound = off" had muted every device)
  let ctx = null, master = null;
  const enabled = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };

  function ac() {
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ctx = new A();
      master = ctx.createGain(); master.gain.value = 0.22;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp); comp.connect(ctx.destination);
      // a small "room": a filtered feedback delay mixed in quietly gives the synth voices some air
      const dl = ctx.createDelay(0.5), fb = ctx.createGain(), lp = ctx.createBiquadFilter(), wet = ctx.createGain();
      dl.delayTime.value = 0.085; fb.gain.value = 0.28; lp.type = "lowpass"; lp.frequency.value = 2600; wet.gain.value = 0.16;
      master.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(comp);
    }
    if (ctx.state !== "running") ctx.resume().catch(() => {}); // suspended, or "interrupted" on Safari after a call, a tab switch or a device change
    return ctx;
  }
  // Browsers only let audio start from a real tap, key press or click, and they switch it off again when the tab is hidden for a while
  // or the output device changes. Wake it on every gesture, and when the tab comes back, so a sound never finds a sleeping context.
  const wake = () => { if (!enabled()) return; const A = window.AudioContext || window.webkitAudioContext; if (!A) return; if (ctx && ctx.state === "closed") { ctx = null; master = null; } const c = ac(); if (c && !wake.done && c.state === "running") { wake.done = true; try { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch { /* unlock tick only */ } } };
  ["pointerdown", "touchend", "keydown", "click"].forEach((ev) => document.addEventListener(ev, wake, { capture: true, passive: true }));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && ctx && ctx.state !== "running") ctx.resume().catch(() => {}); });
  window.addEventListener("focus", () => { if (ctx && ctx.state !== "running") ctx.resume().catch(() => {}); });

  // Every play() sets a pitch multiplier (PM, a step of the pentatonic scale so repeats still sound musical) and a fatigue gain (GM,
  // quieter when the same sound fires many times in a row), so UI sounds never repeat identically.
  let PM = 1, GM = 1;
  /** One enveloped oscillator note. f = start Hz, f2 = end Hz (slide), t = offset s, d = length s. */
  function tone({ f, f2, t = 0, d = 0.12, type = "sine", v = 1, a = 0.005, lp }) {
    f *= PM; if (f2) f2 *= PM; v *= GM;
    const c = ctx, t0 = c.currentTime + t;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    let out = g;
    if (lp) { const fl = c.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = lp; g.connect(fl); out = fl; }
    o.connect(g); out.connect(master);
    o.start(t0); o.stop(t0 + d + 0.02);
  }

  /** Short filtered noise burst (whoosh / soft pop). */
  function noise({ t = 0, d = 0.12, v = 0.4, from = 2000, to = 400 }) {
    const c = ctx, t0 = c.currentTime + t, n = Math.floor(c.sampleRate * d);
    const buf = c.createBuffer(1, n, c.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf; fl.type = "bandpass"; fl.Q.value = 1.2;
    fl.frequency.setValueAtTime(from, t0); fl.frequency.exponentialRampToValueAtTime(to, t0 + d);
    g.gain.value = v * GM;
    src.connect(fl); fl.connect(g); g.connect(master); src.start(t0);
  }

  /** A struck bell: fundamental plus inharmonic partials that die away faster, and a detuned twin for shimmer. */
  function bell(f, { t = 0, v = 0.5, d = 0.5 } = {}) {
    tone({ f, t, d, v, type: "sine", a: 0.003 });
    tone({ f: f * 1.003, t, d: d * 0.9, v: v * 0.5, type: "sine", a: 0.003 });
    tone({ f: f * 2.76, t, d: d * 0.35, v: v * 0.22, type: "sine", a: 0.002 });
    tone({ f: f * 5.4, t, d: d * 0.16, v: v * 0.1, type: "sine", a: 0.002 });
  }
  /** A tactile click: a tiny bright transient over a soft low thump. */
  function click({ t = 0, v = 0.35, pitch = 1 } = {}) {
    noise({ t, d: 0.018, v: v * 0.9, from: 6000 * pitch, to: 3500 * pitch });
    tone({ f: 190 * pitch, f2: 90 * pitch, t, d: 0.06, v: v * 0.8, type: "sine", a: 0.002 });
  }

  const notes = (fs, step, o = {}) => fs.forEach((f, i) => tone({ f, t: (o.t || 0) + i * step, d: o.d || 0.16, type: o.type || "triangle", v: o.v || 0.7 }));

  const SOUNDS = {
    tap: () => { click({ v: 0.32 }); tone({ f: 520, f2: 430, d: 0.045, type: "triangle", v: 0.22 }); },
    step: () => { tone({ f: 540, f2: 820, d: 0.08, v: 0.4 }); noise({ d: 0.09, v: 0.12, from: 1200, to: 3000 }); },
    back: () => { tone({ f: 820, f2: 540, d: 0.08, v: 0.35 }); noise({ d: 0.09, v: 0.1, from: 3000, to: 1200 }); },
    correct: () => { tone({ f: 880, d: 0.1, type: "triangle", v: 0.55 }); bell(1318.5, { t: 0.075, v: 0.55, d: 0.5 }); tone({ f: 2637, t: 0.08, d: 0.16, v: 0.1 }); },
    wrong: () => { tone({ f: 196, f2: 150, d: 0.22, type: "square", v: 0.28, lp: 900 }); tone({ f: 185, f2: 140, t: 0.02, d: 0.2, type: "sawtooth", v: 0.12, lp: 700 }); },
    retry: () => tone({ f: 330, f2: 262, d: 0.16, type: "triangle", v: 0.4 }),
    check: () => { tone({ f: 990, f2: 1480, d: 0.07, v: 0.45 }); noise({ d: 0.04, v: 0.1, from: 4000, to: 2000 }); },
    uncheck: () => tone({ f: 700, f2: 500, d: 0.06, v: 0.3 }),
    pop: () => tone({ f: 380, f2: 900, d: 0.07, v: 0.4 }),
    complete: () => { notes([523.25, 659.25, 783.99, 1046.5], 0.075, { d: 0.22 }); [1046.5, 1318.5, 1568].forEach((f, i) => bell(f, { t: 0.3 + i * 0.02, v: 0.28, d: 0.9 })); },
    streak: () => notes([659.25, 830.61, 987.77, 1318.5, 1661.2], 0.06, { d: 0.18, v: 0.55 }),
    fanfare: () => { notes([523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5], 0.09, { d: 0.24 }); tone({ f: 1568, t: 0.63, d: 0.7, v: 0.3 }); },
    tick: () => tone({ f: 1400, d: 0.025, type: "square", v: 0.08, lp: 3000 }),
    whoosh: () => { noise({ d: 0.28, v: 0.22, from: 400, to: 3200 }); tone({ f: 300, f2: 700, d: 0.22, v: 0.15 }); },
    select: () => tone({ f: 660, d: 0.04, type: "triangle", v: 0.3 }),
    flame: () => { noise({ d: 0.5, v: 0.3, from: 300, to: 2400 }); tone({ f: 220, f2: 880, d: 0.45, type: "sawtooth", v: 0.12, lp: 1800 }); },
    chest: () => { click({ v: 0.45, pitch: 0.7 }); tone({ f: 300, f2: 250, d: 0.08, type: "square", v: 0.12, lp: 900 }); [784, 988, 1175, 1568].forEach((f, i) => bell(f, { t: 0.1 + i * 0.06, v: 0.34, d: 0.45 })); noise({ t: 0.12, d: 0.35, v: 0.12, from: 5000, to: 9000 }); },
    achieve: () => { notes([659.25, 987.77, 1318.5], 0.1, { d: 0.3, v: 0.5 }); tone({ f: 2637, t: 0.3, d: 0.4, v: 0.1 }); },
    sad: () => notes([392, 349.2, 311.1, 261.6], 0.14, { d: 0.22, v: 0.35 }),
    squeak: () => tone({ f: 900 + Math.random() * 500, f2: 1800 + Math.random() * 600, d: 0.09, v: 0.35 }),
    hover: (o) => { tone({ f: o.note, d: 0.09, type: "sine", v: 0.1, a: 0.012, lp: 2600 }); tone({ f: o.note * 2, t: 0.01, d: 0.05, type: "sine", v: 0.03, a: 0.01 }); },
    key: (o) => { click({ v: 0.12, pitch: 1.3 + o.r * 0.5 }); },
    slide: (o) => { tone({ f: o.note, d: 0.07, type: "triangle", v: 0.18, a: 0.006, lp: 3200 }); },
    open: () => { noise({ d: 0.16, v: 0.1, from: 600, to: 2600 }); tone({ f: 523.25, d: 0.1, type: "triangle", v: 0.22, a: 0.01 }); tone({ f: 783.99, t: 0.06, d: 0.14, type: "sine", v: 0.2, a: 0.01 }); },
    close: () => { noise({ d: 0.12, v: 0.07, from: 2400, to: 700 }); tone({ f: 783.99, d: 0.08, type: "triangle", v: 0.18, a: 0.008 }); tone({ f: 523.25, t: 0.05, d: 0.12, type: "sine", v: 0.18, a: 0.008 }); },
    fold: () => { tone({ f: 600, f2: 760, d: 0.06, type: "triangle", v: 0.2, lp: 2800 }); },
    unfold: () => { tone({ f: 760, f2: 600, d: 0.06, type: "triangle", v: 0.17, lp: 2800 }); },
    notify: () => { bell(1174.7, { v: 0.3, d: 0.4 }); bell(1568, { t: 0.09, v: 0.26, d: 0.5 }); },
    coin: () => { tone({ f: 1318.5, d: 0.07, type: "square", v: 0.12, lp: 3500 }); tone({ f: 1760, t: 0.06, d: 0.2, type: "square", v: 0.12, lp: 3500 }); },
    run: () => { tone({ f: 330, f2: 660, d: 0.1, type: "triangle", v: 0.3, lp: 2500 }); noise({ d: 0.1, v: 0.08, from: 1500, to: 4000 }); },
    dizzy: () => { for (let i = 0; i < 5; i++) tone({ f: 800 - i * 90, f2: 900 - i * 90, t: i * 0.07, d: 0.08, v: 0.25 }); },
  };

  // ---------- variety: scale notes, per-sound cooldowns, fatigue ----------
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5, 1568]; // C major pentatonic, two octaves
  const STEPS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];                                        // pitch multipliers that stay in the scale
  const VARY = new Set(["tap", "select", "pop", "check", "uncheck", "step", "back", "tick", "retry", "fold", "unfold", "open", "close", "coin"]);
  const COOL = { hover: 45, tap: 50, select: 55, tick: 40, key: 32, slide: 38, squeak: 180, whoosh: 120, open: 120, close: 120, notify: 400, fold: 70, unfold: 70 };
  const last = {}, run = {}, lastStep = {};
  let walk = 2, gesture = 0;
  /** The next scale note: a random walk of 1 to 2 steps (never the same note twice), so a run of hovers sounds like a little tune. */
  const nextNote = () => {
    walk += (Math.random() < 0.5 ? -1 : 1) * (1 + (Math.random() < 0.4 ? 1 : 0));
    if (walk < 0 || walk > SCALE.length - 1) walk = 3 + Math.floor(Math.random() * 3);
    return SCALE[walk];
  };
  document.addEventListener("pointerdown", () => { gesture = performance.now(); }, true);
  document.addEventListener("keydown", () => { gesture = performance.now(); }, true);
  const recent = () => performance.now() - gesture < 2500; // observer sounds only follow something the learner just did

  function play(name, o = {}) {
    if (!enabled() || !SOUNDS[name]) return;
    const c = ac();
    if (!c) return;
    if (c.state === "closed") { ctx = null; master = null; return play(name, o); }
    const now = performance.now();
    if (COOL[name] && now - (last[name] || 0) < COOL[name]) return;
    last[name] = now;
    // fatigue: the same sound again within 1.4 s gets quieter (down to 45%), then recovers once it has rested
    const r = run[name] && now - run[name].t < 1400 ? run[name] : (run[name] = { n: 0, t: now });
    r.n++; r.t = now;
    GM = Math.max(0.45, 1 - 0.1 * (r.n - 1));
    if (VARY.has(name)) { let k; do { k = Math.floor(Math.random() * STEPS.length); } while (k === lastStep[name]); lastStep[name] = k; PM = STEPS[k]; } else PM = 1 + (Math.random() - 0.5) * 0.02;
    try { SOUNDS[name]({ note: o.note || nextNote(), r: Math.random(), ...o }); } catch { /* audio is a nicety; never break the page */ }
    PM = 1; GM = 1;
  }

  function set(on) {
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
    document.documentElement.classList.toggle("muted", !on);
    if (on) play("pop");
  }

  // ---------- UI sounds, wired once for the whole page ----------
  const OWN = "[data-nav], .opt, .guide-item, #soundToggle, .pl-go, .pl-back, .p-node, .mascot, .ob-c, .pf-sw";
  // Generic tap for controls that don't have their own sound (answers, lesson nav and checklists do).
  document.addEventListener("pointerdown", (e) => {
    const t = e.target.closest(".btn, .seg button, .tabs button, [role=tab], .tb-btn, .dock button, .pl-x, .pl-ref, .modal-x, .si-eye, .td-main, .td-chip, .pc-row, .menu-row, .np-restart, .sy-out, .boss-dots button, .gene.click, .city, .chip-btn, summary, .rv-sess, .gb-mod, .ach, .shelf-spot");
    if (!t || t.disabled || t.matches(OWN)) return;
    play("tap");
  }, true);

  // Hover: a soft note from the scale for anything pressable. Real pointers only (no false hovers on touch), never right after a press.
  const HOVERABLE = ".btn, .opt, .qm-t, .chip-btn, .pl-ref, .menu-row, .seg button, .dock button, .tb-btn, .p-node, .pc-row, .gb-mod, .rv-sess, .guide-item, .ob-c, .boss-dots button, .pf-sw, .tabs button, [role=tab], .ach, .shelf-spot, summary, .td-main, .city, .gene.click, .q-claim";
  const fine = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)") : { matches: false };
  let pressedAt = 0;
  document.addEventListener("pointerdown", () => { pressedAt = performance.now(); }, true);
  document.addEventListener("mouseover", (e) => {
    if (!fine.matches || !enabled() || performance.now() - pressedAt < 350) return;
    const t = e.target.closest && e.target.closest(HOVERABLE);
    if (!t || t.disabled || t.getAttribute("aria-disabled") === "true" || (e.relatedTarget && t.contains(e.relatedTarget))) return;
    play("hover");
  }, true);

  // Sliders tick up and down the scale as they move
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t && t.type === "range") {
      const min = +t.min || 0, max = +t.max || 100, f = max > min ? (t.value - min) / (max - min) : 0;
      play("slide", { note: SCALE[Math.round(f * (SCALE.length - 1))] });
    }
  }, true);

  // Dropdowns (details) open and close with their own soft pair
  document.addEventListener("toggle", (e) => { if (e.target.tagName === "DETAILS" && recent()) play(e.target.open ? "unfold" : "fold"); }, true);

  // Typing in the code editor
  document.addEventListener("keydown", (e) => {
    if (!e.target.classList || !e.target.classList.contains("cl-ta") || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter" || e.key === "Tab") play("key");
  }, true);

  // Things that appear after a tap: dialogs, popovers, toasts, floating XP
  new MutationObserver((list) => {
    if (!recent()) return;
    for (const m of list) m.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      const c = n.classList;
      if (c.contains("modal-back") || c.contains("pop-card") || (n.id === "pop" && n.firstElementChild)) play("open");
      else if (c.contains("toast")) play("notify");
      else if (c.contains("float-xp")) play("coin");
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  document.documentElement.classList.toggle("muted", !enabled());
  NIC.sfx = { play, set, on: enabled };
})();
