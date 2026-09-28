/* Sound effects — synthesised with the Web Audio API, so there are no audio files and it works offline.
   NIC.sfx.play(name) · NIC.sfx.on() / NIC.sfx.set(bool). Muted state persists in localStorage ("nic.sound").
   The AudioContext is created lazily inside the first user gesture (browsers block autoplay otherwise). */
(function () {
  const KEY = "nic.sound";
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
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /** One enveloped oscillator note. f = start Hz, f2 = end Hz (slide), t = offset s, d = length s. */
  function tone({ f, f2, t = 0, d = 0.12, type = "sine", v = 1, a = 0.005, lp }) {
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
    g.gain.value = v;
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
    dizzy: () => { for (let i = 0; i < 5; i++) tone({ f: 800 - i * 90, f2: 900 - i * 90, t: i * 0.07, d: 0.08, v: 0.25 }); },
  };

  let lastTap = 0;
  function play(name) {
    if (!enabled() || !SOUNDS[name]) return;
    if (!ac()) return;
    if (name === "tap") { const n = performance.now(); if (n - lastTap < 60) return; lastTap = n; }
    try { SOUNDS[name](); } catch { /* audio is a nicety; never break the page */ }
  }

  function set(on) {
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
    document.documentElement.classList.toggle("muted", !on);
    if (on) play("pop");
  }

  // Generic tap for controls that don't have their own sound (answers, lesson nav and checklists do).
  document.addEventListener("pointerdown", (e) => {
    const t = e.target.closest(".btn, .seg button, .tabs button, .tb-btn, .dock button, .pl-x, .boss-dots button, .gene.click, .city, .chip-btn");
    if (!t || t.disabled || t.matches("[data-nav], .opt, .guide-item, #soundToggle, .pl-go, .p-node, .mascot")) return;
    play("tap");
  }, true);

  document.documentElement.classList.toggle("muted", !enabled());
  NIC.sfx = { play, set, on: enabled };
})();
