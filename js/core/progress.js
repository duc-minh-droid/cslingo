(function () {
  const core = (NIC.shared.engineCore = NIC.shared.engineCore || {});
  const { el, esc, qs, qsa } = core;

  // ---------- Progress (predictions + visited) ----------
  /* Every read and write of progress goes through `store`. When the browser blocks or has filled localStorage (private
     mode, quota), values fall back to an in-memory Map: the app keeps working and progress lasts until the tab closes. */
  const mem = new Map();
  const warn = () => {
    if (!store.warned && core.N_fx()) {
      store.warned = true;
      core
        .N_fx()
        .toast(
          "<b>Progress can't be saved</b><span>This browser is blocking storage (private mode or full), so it will only last until you close this tab.</span>",
          { tone: "rose", ms: 5000 },
        );
    }
  };
  const store = {
    /** The raw string stored under k (null when there is none). Never throws. */
    raw(k) {
      if (mem.has(k)) return mem.get(k);
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    /** Store a raw string. Returns false (and keeps it in memory) when the browser refuses. Never throws. */
    setRaw(k, v) {
      try {
        localStorage.setItem(k, v);
        mem.delete(k);
        return true;
      } catch {
        mem.set(k, String(v));
        warn();
        return false;
      }
    },
    removeRaw(k) {
      mem.delete(k);
      try {
        localStorage.removeItem(k);
      } catch {
        /* blocked: there is nothing stored to remove */
      }
    },
    /** Every key we hold, stored or in memory. */
    keys() {
      const out = new Set(mem.keys());
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) out.add(k);
        }
      } catch {
        /* blocked: only the in-memory keys */
      }
      return [...out];
    },
    get(k, d) {
      try {
        return JSON.parse(store.raw(k)) ?? d;
      } catch {
        return d;
      }
    },
    set(k, v) {
      store.setRaw(k, JSON.stringify(v));
    },
  };
  // Once there is something worth keeping, ask the browser not to clear our storage (Safari drops idle sites after 7 days).
  window.addEventListener("nic:progress", () => {
    try {
      if (localStorage.getItem("csl.persist") || !Object.keys(store.get("nic.lessonDone", {})).length) return;
      if (!navigator.storage || !navigator.storage.persist) return;
      // browsers often say no at first: ask again at a later lesson (at most once a day, four times), and stop once granted
      const [n, t] = (localStorage.getItem("csl.persistTry") || "0:0").split(":").map(Number);
      if (n >= 4 || Date.now() - t < 864e5) return;
      localStorage.setItem("csl.persistTry", `${n + 1}:${Date.now()}`); // outside nic.*, so these are neither synced nor reset
      navigator.storage
        .persist()
        .then((ok) => ok && localStorage.setItem("csl.persist", "1"))
        .catch(() => {});
    } catch {
      /* storage blocked: there is nothing to protect */
    }
  });
  function updateScore() {
    const s = store.get("nic.predict", {});
    const vals = Object.values(s);
    const node = qs("#scoreVal");
    if (!node) return;
    const right = vals.filter(Boolean).length;
    node.innerHTML = `<span id="scoreRight">${node.dataset.r ?? right}</span> / ${vals.length}`;
    if (window.NIC && NIC.fx) NIC.fx.count(qs("#scoreRight"), right, { from: +(node.dataset.r ?? right) });
    node.dataset.r = right;
  }

  /** Predict-first widget. opts: {id, q, opts:[...], a: index, why: html} */
  function predict(opts) {
    const node = el(`<div class="card predict">
      <div class="card-head"><span class="tag violet">Predict first</span></div>
      <div class="q">${opts.q}</div>
      <div class="opts">${opts.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="opt-l">${String.fromCharCode(65 + i)}</span><span>${o}</span></button>`).join("")}</div>
      <div class="explain"></div></div>`);
    const saved = store.get("nic.predict", {});
    const reveal = (pick, first) => {
      node.classList.add("answered");
      qsa(".opt", node).forEach((b, i) => {
        b.disabled = true;
        if (i === opts.a) b.classList.add("right");
        else if (i === pick) b.classList.add("wrong");
      });
      const ok = pick === opts.a;
      const ex = qs(".explain", node);
      NIC.feedback(
        ex,
        ok ? "ok" : "no",
        `<span class="verdict ${ok ? "ok" : "no"}">${ok ? "Correct!" : pick === -1 ? "Answer:" : "Not quite."}</span>${opts.why}`,
        first,
      );
      if (first) {
        const s = store.get("nic.predict", {});
        s[opts.id] = ok;
        store.set("nic.predict", s);
        updateScore();
        const fx = window.NIC && NIC.fx;
        if (fx) {
          fx.reveal(ex);
          ok ? fx.pop(qsa(".opt", node)[opts.a]) : fx.shake(qsa(".opt", node)[pick]);
        }
      }
    };
    if (opts.id in saved) reveal(saved[opts.id] ? opts.a : -1, false);
    qsa(".opt", node).forEach((b) => b.addEventListener("click", () => reveal(+b.dataset.i, true)));
    node.__opts = opts; // the lesson player lifts predicts out of the page and asks them as questions
    return node;
  }

  /**
   * Step-by-step lesson. def.steps = [{t, b, v?, c?}] where
   *   t = title, b = body html, v = visual (html string or fn(container, life)), c = {q, o:[...], a, why}
   * A step with a check needs an answer before "Next" unlocks.
   */
  function lesson(id, def, life, onFinish) {
    const steps = def.steps,
      pos = store.get("nic.lessonPos", {});
    const answered = {},
      tries = {};
    let i = Math.min(pos[id] || 0, steps.length - 1),
      seen = Math.max(i, store.get("nic.lessonSeen", {})[id] || 0);
    const node =
      el(`<div class="card lesson" id="learn"><div class="lesson-top"><span class="tag teal">Learn it step by step</span><button class="lesson-x" data-nav="restart" aria-label="Back to step 1" title="Back to step 1"><svg viewBox="0 0 16 16"><path d="M3 8a5 5 0 1 0 1.5-3.6M3 2.5v2.5h2.5"/></svg></button>
      <div class="lesson-dots">${steps.map((s, k) => `<button aria-label="Step ${k + 1}: ${esc(s.t.replace(/<[^>]+>/g, ""))}" data-k="${k}"><i></i></button>`).join("")}</div><span class="lesson-count"></span></div>
      <div class="lesson-stage" aria-live="polite"></div>
      <div class="lesson-nav"><button class="btn ghost" data-nav="back">Back</button><span class="lesson-kbd faint"><kbd>←</kbd> <kbd>→</kbd> keys work too</span><button class="btn primary" data-nav="next">Continue</button></div></div>`);
    const stage = qs(".lesson-stage", node),
      next = qs('[data-nav="next"]', node),
      back = qs('[data-nav="back"]', node);
    const fx = () => window.NIC && NIC.fx;
    function show(dir) {
      const s = steps[i];
      seen = Math.max(seen, i);
      pos[id] = i;
      store.set("nic.lessonPos", pos);
      const sn = store.get("nic.lessonSeen", {});
      sn[id] = Math.max(sn[id] || 0, seen);
      store.set("nic.lessonSeen", sn);
      if (i === steps.length - 1) {
        const d = store.get("nic.lessonDone", {});
        if (!d[id]) {
          d[id] = true;
          store.set("nic.lessonDone", d);
          window.dispatchEvent(new Event("nic:progress"));
        }
      }
      stage.innerHTML = `<div class="lesson-step-n">Step ${i + 1}</div><h2 class="lesson-title">${s.t}</h2><div class="lesson-body">${s.b}</div><div class="lesson-visual"></div>${s.c ? `<div class="lesson-check"><div class="q">${s.c.q}</div><div class="opts">${s.c.o.map((o, k) => `<button class="opt" data-k="${k}">${o}</button>`).join("")}</div><div class="why"></div></div>` : ""}`;
      const vis = qs(".lesson-visual", stage);
      if (typeof s.v === "function") s.v(vis, life);
      else if (s.v) vis.innerHTML = s.v;
      if (s.c) {
        const why = qs(".lesson-check .why", stage);
        const finish = (pick) => {
          qsa(".lesson-check .opt", stage).forEach((b, k) => {
            b.disabled = true;
            if (k === s.c.a) b.classList.add("right");
          });
          const ok = pick === s.c.a;
          NIC.feedback(
            why,
            ok ? "ok" : "no",
            `<b class="verdict ${ok ? "ok" : "no"}">${ok ? (tries[i] ? "Got it." : ["Yes!", "Nice!", "Spot on!", "Exactly!"][i % 4]) : "Here's the answer:"}</b> ${s.c.why}`,
          );
          answered[i] = true;
          updNav();
          if (fx()) {
            fx().reveal(why);
            if (pick === s.c.a) fx().pop(qsa(".lesson-check .opt", stage)[s.c.a]);
          }
        };
        qsa(".lesson-check .opt", stage).forEach((b) =>
          b.addEventListener("click", () => {
            const k = +b.dataset.k;
            if (k === s.c.a) return finish(k);
            // wrong: let them try once more before revealing — retrieval beats being told
            tries[i] = (tries[i] || 0) + 1;
            b.classList.add("wrong");
            b.disabled = true;
            if (fx()) fx().shake(b);
            if (tries[i] >= 2 || s.c.o.length <= 2) return finish(k);
            NIC.feedback(why, "retry", `<b class="verdict no">Not quite</b> — have another go.`);
            if (fx()) fx().reveal(why);
          }),
        );
      }
      qsa(".lesson-dots button", node).forEach((d, k) => {
        d.classList.toggle("cur", k === i);
        d.classList.toggle("seen", k <= seen && k !== i);
        d.disabled = k > seen;
      });
      qs(".lesson-count", node).textContent = `${i + 1} / ${steps.length}`;
      updNav();
      if (dir && fx()) fx().step(stage, dir);
      if (window.NIC && NIC.fx) NIC.fx.play(vis);
    }
    function updNav() {
      const locked = steps[i].c && !answered[i];
      back.disabled = i === 0;
      next.disabled = !!locked;
      next.classList.toggle("finish", !locked && i === steps.length - 1);
      next.textContent = locked ? "Answer to continue" : i === steps.length - 1 ? "Try it yourself" : "Continue";
    }
    const go = (d, animate = true) => {
      if (d > 0) {
        if (steps[i].c && !answered[i]) return;
        if (i < steps.length - 1) {
          i++;
          show(animate ? 1 : 0);
          if (NIC.sfx) NIC.sfx.play("step");
        } else {
          if (fx()) fx().celebrate(next, { big: true });
          if (onFinish) onFinish();
        }
      } else if (i > 0) {
        i--;
        show(animate ? -1 : 0);
        if (NIC.sfx) NIC.sfx.play("back");
      }
    };
    next.addEventListener("click", () => go(1));
    qs('[data-nav="restart"]', node).addEventListener("click", () => {
      if (i) {
        i = 0;
        show(-1);
      }
    });
    back.addEventListener("click", () => go(-1));
    qsa(".lesson-dots button", node).forEach((d) =>
      d.addEventListener("click", () => {
        const k = +d.dataset.k;
        if (k <= seen && k !== i) {
          const dir = k > i ? 1 : -1;
          i = k;
          show(dir);
        }
      }),
    );
    // Keyboard: ←/→ step through when the lesson is on screen. Keyboard actions never animate.
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(e.target.tagName || "")) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = node.getBoundingClientRect();
      if (r.bottom < 80 || r.top > window.innerHeight - 80) return;
      e.preventDefault();
      if (e.key === "ArrowRight" && i === steps.length - 1) return;
      go(e.key === "ArrowRight" ? 1 : -1, false);
    };
    document.addEventListener("keydown", onKey);
    if (life && life.onCleanup) life.onCleanup(() => document.removeEventListener("keydown", onKey));
    show(0);
    return node;
  }

  /** "What to do" checklist — tick each item off as you do it in the playground. */
  function guide(items) {
    const node =
      el(`<div class="card guide" id="try"><div class="card-head"><span class="tag amber">What to do</span><span class="faint guide-count"></span></div>
      <ol class="guide-list">${items.map((t, k) => `<li><button class="guide-item" data-k="${k}" aria-pressed="false"><span class="gi-box" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></span><span class="gi-n">${k + 1}</span><span class="gi-t">${t}</span></button></li>`).join("")}</ol></div>`);
    const upd = () => {
      const n = qsa(".guide-item.done", node).length;
      qs(".guide-count", node).textContent = n ? `${n} of ${items.length} done` : "tick them off as you go";
    };
    qsa(".guide-item", node).forEach((b) =>
      b.addEventListener("click", (e) => {
        if (e.target.closest("a, code")) return;
        const on = !b.classList.contains("done");
        b.classList.toggle("done", on);
        b.setAttribute("aria-pressed", on);
        if (on && window.NIC && NIC.fx) NIC.fx.pop(qs(".gi-box", b));
        if (NIC.sfx) NIC.sfx.play(on ? "check" : "uncheck");
        upd();
        if (on && qsa(".guide-item.done", node).length === items.length) {
          if (NIC.fx) NIC.fx.celebrate(qs(".guide-count", node));
          node.dispatchEvent(new CustomEvent("nic:guide-done", { bubbles: true }));
        }
      }),
    );
    upd();
    return node;
  }

  function takeaways(items, sayIt) {
    return el(`<div class="card takeaways" id="recap"><div class="card-head"><span class="tag teal">Takeaways</span></div>
      <ul class="tk-list">${items.map((t) => `<li>${t}</li>`).join("")}</ul>
      ${sayIt ? `<div class="say-it"><span class="say-lbl">Say it out loud</span><b>${sayIt}</b></div>` : ""}</div>`);
  }

  function header(mod, lede) {
    const unit = (window.NIC && NIC.unitName && NIC.unitName(mod)) || "Lecture";
    return el(
      `<header class="mod-head"><div class="kicker">${unit} ${mod.lecture} · ${mod.num}</div><h1>${mod.title}</h1><p class="lede">${lede}</p></header>`,
    );
  }
  Object.assign(core, { guide, header, lesson, predict, store, takeaways, updateScore });
})();
