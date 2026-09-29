/* Boss-quiz engine. Content lives in boss-nic.js / boss-ds.js / boss-algo.js.
   Question types (Q.type, default "mcq"):
     mcq     {o:[...], a}                         pick one
     multi   {o:[...], a:[...]}                   select all that apply
     num     {ans, tol?, unit?}                   legacy: shown as tap-to-pick options (never typed)
     slider  {min, max, step, ans, tol, unit?, live?(v)->html}   estimate by dragging
     order   {items:[...correct order]}           tap items into the right order
     match   {pairs:[[left, right], ...]}         pair each left with a right
     cat     {buckets:[...], items:[[text, bucketIdx], ...]}   sort into buckets
     pick    {fig: svg with [data-pick], a: id | [ids]}        click on the diagram
     bug     {code:[...lines], a: lineIdx}        click the faulty line
   Every question: q (prompt), why (explanation), optional fig (html | fn(box)), hint. */
(function () {
  const N = NIC;
  const { el, qs, qsa, store, header, matrixHTML, esc } = N;

  // deterministic shuffle so a question looks the same when you come back to it
  function seeded(arr, seed) {
    const a = arr.map((x, i) => [x, i]); let s = 0;
    for (const c of String(seed)) s = (s * 31 + c.charCodeAt(0)) >>> 0;
    for (let i = a.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    if (a.every(([, i], k) => i === k) && a.length > 1) a.push(a.shift()); // never already solved
    return a;
  }
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  /* Display order for answer options, so the right answer isn't always in the same slot.
     True/False keeps its order, all-numeric options are shown ascending, "both / neither / all / none of…"
     stay last, and everything else is shuffled with a seed from the question text (stable on revisits).
     Buttons keep data-k = the ORIGINAL index, so grading and saved answers are unchanged. */
  const SUP = { "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9 };
  function asNum(h) {
    let s = String(h).replace(/<[^>]+>/g, "").replace(/^(about|roughly|≈|~)\s*/i, "").replace(/[,\s]/g, "").replace(/[−–]/g, "-").replace(/×$/, "").replace(/%$/, "");
    const sup = s.match(/^(-?\d+(?:\.\d+)?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
    if (sup) return Math.pow(+sup[1], +[...sup[2]].map((c) => SUP[c]).join(""));
    const sci = s.match(/^(-?\d+(?:\.\d+)?)×10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
    if (sci) return +sci[1] * Math.pow(10, +[...sci[2]].map((c) => SUP[c]).join(""));
    const fr = s.match(/^(-?\d+)\/(\d+)$/);
    if (fr) return +fr[1] / +fr[2];
    s = s.replace(/(Hz|ms|s|kg|km|bits?|days?|years?|seconds?|steps?|GB|MB)$/i, "");
    return /^-?\d+(\.\d+)?$/.test(s) ? +s : NaN;
  }
  const PIN = /^(both|neither|all of (the|them|these)|none of (the|them|these)|all the above|none of the above)\b/i;
  function optOrder(Q) {
    const o = Q.o, idx = o.map((_, k) => k);
    const plain = o.map((x) => String(x).replace(/<[^>]+>/g, "").trim());
    if (o.length <= 2 && plain.every((x) => /^(true|false|yes|no)$/i.test(x))) return idx;
    const nums = plain.map(asNum);
    if (nums.every((v) => Number.isFinite(v))) return idx.slice().sort((a, b) => nums[a] - nums[b] || a - b);
    const pinned = idx.filter((k) => PIN.test(plain[k])), free = idx.filter((k) => !PIN.test(plain[k]));
    let s = 0;
    for (const c of String(Q.q) + "|" + plain.join("|")) s = (s * 31 + c.charCodeAt(0)) >>> 0;
    for (let i = free.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [free[i], free[j]] = [free[j], free[i]]; }
    return free.concat(pinned);
  }
  N.optOrder = optOrder;
  const fmtNum = (v) => (Number.isInteger(v) ? String(v) : String(+(+v).toFixed(4)));
  /** The corrected answer under a graded question: appended, then revealed (fade + small drop). */
  const correct = (box, html) => { box.insertAdjacentHTML("beforeend", `<div class="q-correct">${html}</div>`); if (N.fx && N.fx.reveal) N.fx.reveal(box.lastElementChild); };

  const TYPES = {
    mcq: {
      label: "Choose one",
      render(Q, box, submit) {
        box.innerHTML = `<div class="opts" role="radiogroup">${optOrder(Q).map((k, pos) => `<button class="opt" role="radio" aria-checked="false" data-k="${k}"><span class="opt-l">${String.fromCharCode(65 + pos)}</span><span>${Q.o[k]}</span></button>`).join("")}</div>`;
        qsa(".opt", box).forEach((b) => (b.onclick = () => submit(+b.dataset.k)));
      },
      grade: (Q, v) => v === Q.a,
      reveal(Q, box, v, ok) { const at = (k) => qs(`.opt[data-k="${k}"]`, box); qsa(".opt", box).forEach((b) => { const k = +b.dataset.k; b.disabled = true; if (k === Q.a) b.classList.add("right"); else if (k === v) b.classList.add("wrong"); }); return ok ? at(Q.a) : at(v); },
      answer: (Q) => Q.o[Q.a],
    },
    multi: {
      label: "Select all that apply",
      render(Q, box, submit) {
        box.innerHTML = `<div class="opts">${optOrder(Q).map((k) => `<button class="opt multi" data-k="${k}" aria-pressed="false"><span class="opt-l opt-box"></span><span>${Q.o[k]}</span></button>`).join("")}</div><div class="q-actions"><button class="btn primary" data-check disabled>Check</button></div>`;
        const chk = qs("[data-check]", box);
        qsa(".opt", box).forEach((b) => (b.onclick = () => { b.classList.toggle("sel"); b.setAttribute("aria-pressed", b.classList.contains("sel")); chk.disabled = !qs(".opt.sel", box); }));
        chk.onclick = () => submit(qsa(".opt", box).filter((b) => b.classList.contains("sel")).map((b) => +b.dataset.k).sort((x, y) => x - y));
      },
      grade: (Q, v) => same([...v].sort(), [...Q.a].sort()),
      reveal(Q, box, v) {
        qsa(".opt", box).forEach((b) => { const k = +b.dataset.k; b.disabled = true; const should = Q.a.includes(k), did = v.includes(k); b.classList.toggle("sel", did); if (should && did) b.classList.add("right"); else if (did) b.classList.add("wrong"); else if (should) b.classList.add("missed"); });
        const c = qs("[data-check]", box); if (c) c.remove();
      },
      answer: (Q) => Q.a.map((k) => Q.o[k]).join(" · "),
    },
    // No typed answers, ever: a legacy num question is shown as tap-to-pick options far enough apart to choose by estimating.
    // Write new questions as mcq with hand-picked distractors instead (AGENTS.md).
    num: {
      label: "Choose one",
      opts(Q) {
        const a = +Q.ans, int = Number.isInteger(a), r = (v) => (int ? Math.round(v) : +v.toPrecision(3));
        const c = a === 0 ? [0, 1, 2, 10] : [a / 2, a, a * 2, a * 10].map(r);
        return [...new Set(c.map((v) => (v === r(a) ? a : v)))].sort((x, y) => x - y);
      },
      render(Q, box, submit) {
        box.innerHTML = `<div class="opts" role="radiogroup">${TYPES.num.opts(Q).map((v, pos) => `<button class="opt" role="radio" aria-checked="false" data-v="${v}"><span class="opt-l">${String.fromCharCode(65 + pos)}</span><span>${fmtNum(v)}${Q.unit ? " " + Q.unit : ""}</span></button>`).join("")}</div>`;
        qsa(".opt", box).forEach((b) => (b.onclick = () => submit(+b.dataset.v)));
      },
      grade: (Q, v) => Math.abs(v - Q.ans) <= (Q.tol ?? 1e-9),
      reveal(Q, box, v, ok) { let hit = null; qsa(".opt", box).forEach((b) => { const x = +b.dataset.v; b.disabled = true; if (Math.abs(x - Q.ans) <= (Q.tol ?? 1e-9)) b.classList.add("right"); else if (x === v) { b.classList.add("wrong"); hit = b; } }); return ok ? qs(".opt.right", box) : hit; },
      answer: (Q) => fmtNum(Q.ans) + (Q.unit ? " " + Q.unit : ""),
    },
    slider: {
      label: "Estimate — drag the slider",
      render(Q, box, submit) {
        const mid = Q.start ?? (Q.min + Q.max) / 2;
        box.innerHTML = `<div class="q-slider"><input type="range" min="${Q.min}" max="${Q.max}" step="${Q.step}" value="${mid}" aria-label="estimate"><output>${fmtNum(mid)}${Q.unit ? " " + Q.unit : ""}</output></div><div class="q-live"></div><div class="q-actions"><button class="btn primary" data-check>Lock it in</button></div>`;
        const r = qs("input", box), out = qs("output", box), live = qs(".q-live", box);
        const upd = () => { out.textContent = fmtNum(+r.value) + (Q.unit ? " " + Q.unit : ""); if (Q.live) live.innerHTML = Q.live(+r.value); };
        r.oninput = upd; upd();
        qs("[data-check]", box).onclick = () => submit(+r.value);
      },
      grade: (Q, v) => Math.abs(v - Q.ans) <= Q.tol,
      reveal(Q, box, v, ok) { const r = qs("input", box); r.value = v; r.disabled = true; r.dispatchEvent(new Event("input")); r.oninput = null; qs(".q-slider", box).classList.add(ok ? "right" : "wrong"); const c = qs("[data-check]", box); if (c) c.remove(); if (Q.live) qs(".q-live", box).innerHTML = Q.live(Q.ans); correct(box, `${ok ? "Within range." : "Not quite."} Target: <b>${fmtNum(Q.ans)}${Q.unit ? " " + Q.unit : ""}</b> <span class="faint">(±${fmtNum(Q.tol)})</span>`); return qs(".q-slider", box); },
      answer: (Q) => `≈ ${fmtNum(Q.ans)}${Q.unit ? " " + Q.unit : ""}`,
    },
    order: {
      label: "Put these in order",
      render(Q, box, submit, idKey) {
        const pool = seeded(Q.items, idKey);
        box.innerHTML = `<div class="q-order"><div class="qo-slots">${Q.items.map((_, k) => `<div class="qo-slot"><span class="qo-n">${k + 1}</span><span class="qo-v faint">tap an item below</span></div>`).join("")}</div>
          <div class="qo-pool">${pool.map(([t, i]) => `<button class="chip-btn" data-i="${i}">${t}</button>`).join("")}</div></div><div class="q-actions"><button class="btn ghost small" data-undo>Undo</button><button class="btn primary" data-check disabled>Check</button></div>`;
        const placed = [];
        const draw = () => {
          qsa(".qo-slot", box).forEach((s, k) => { const v = qs(".qo-v", s); if (placed[k] !== undefined) { v.innerHTML = Q.items[placed[k]]; v.classList.remove("faint"); s.classList.add("filled"); } else { v.textContent = k === placed.length ? "tap an item below" : ""; v.classList.add("faint"); s.classList.remove("filled"); } });
          qsa(".qo-pool .chip-btn", box).forEach((b) => (b.disabled = placed.includes(+b.dataset.i)));
          qs("[data-check]", box).disabled = placed.length !== Q.items.length;
        };
        qsa(".qo-pool .chip-btn", box).forEach((b) => (b.onclick = () => { placed.push(+b.dataset.i); draw(); if (N.fx) N.fx.pop(qsa(".qo-slot", box)[placed.length - 1]); }));
        qs("[data-undo]", box).onclick = () => { placed.pop(); draw(); };
        qs("[data-check]", box).onclick = () => submit(placed.slice());
        draw();
      },
      grade: (Q, v) => v.every((x, k) => x === k),
      reveal(Q, box, v) {
        qsa(".qo-slot", box).forEach((s, k) => { qs(".qo-v", s).innerHTML = Q.items[v[k]] + (v[k] === k ? "" : ` <span class="qo-fix">→ ${Q.items[k]}</span>`); qs(".qo-v", s).classList.remove("faint"); s.classList.add(v[k] === k ? "right" : "wrong"); });
        // the emptied pool fades away, then leaves the layout
        const pool = qs(".qo-pool", box);
        pool.classList.add("m-ghost");
        if (N.fx && N.fx.exit) N.fx.exit(pool, { scale: 0.98, dur: N.fx.DUR.s }).then(() => pool.remove()); else pool.remove();
        qsa(".q-actions", box).forEach((a) => a.remove());
      },
      answer: (Q) => Q.items.map((t, k) => `${k + 1}. ${t}`).join("  "),
    },
    match: {
      label: "Tap the matching pairs",
      /* Duolingo style: tap one tile on each side. A right pair flashes green and fades out; a wrong pair flashes red.
         Answer value: {pairs:[right index per left], miss: wrong tries}. Right = no wrong tries (an array of indices also grades). */
      render(Q, box, submit, idKey) {
        const rights = seeded(Q.pairs.map((p) => p[1]), idKey + "m");
        box.innerHTML = `<div class="q-match"><div class="qm-col">${Q.pairs.map(([l], k) => `<button class="qm-t qm-l" data-k="${k}">${l}</button>`).join("")}</div>
          <div class="qm-col">${rights.map(([r, i]) => `<button class="qm-t qm-r" data-i="${i}">${r}</button>`).join("")}</div></div><div class="q-actions"><button class="btn primary" data-check disabled>Check</button></div>`;
        const chk = qs("[data-check]", box);
        let pick = { l: null, r: null }, miss = 0, done = 0;
        const clear = () => qsa(".qm-t.sel", box).forEach((b) => { b.classList.remove("sel"); b.setAttribute("aria-pressed", "false"); });
        const tryPair = () => {
          if (!pick.l || !pick.r) return;
          const L = pick.l, R = pick.r; pick = { l: null, r: null };
          if (+L.dataset.k === +R.dataset.i) {
            [L, R].forEach((b) => { b.classList.remove("sel"); b.classList.add("good"); b.disabled = true; if (N.fx && N.fx.bounce) N.fx.bounce(b); });
            N.sfx && N.sfx.play("select");
            setTimeout(() => [L, R].forEach((b) => { b.classList.remove("good"); b.classList.add("gone"); }), 450);
            if (++done === Q.pairs.length) { chk.disabled = false; N.sfx && N.sfx.play("check"); }
          } else {
            miss++;
            [L, R].forEach((b) => { b.classList.remove("sel"); b.classList.add("bad"); if (N.fx) N.fx.shake(b); });
            N.sfx && N.sfx.play("retry");
            setTimeout(() => [L, R].forEach((b) => b.classList.remove("bad")), 320); // ends with the shake
          }
        };
        qsa(".qm-t", box).forEach((b) => (b.onclick = () => {
          if (b.disabled) return;
          const side = b.classList.contains("qm-l") ? "l" : "r";
          if (pick[side] === b) { pick[side] = null; b.classList.remove("sel"); return; }
          if (pick[side]) pick[side].classList.remove("sel");
          pick[side] = b; b.classList.add("sel"); b.setAttribute("aria-pressed", "true");
          if (!(pick.l && pick.r)) N.sfx && N.sfx.play("tap");
          tryPair();
        }));
        chk.onclick = () => submit({ pairs: Q.pairs.map((_, k) => k), miss });
      },
      grade: (Q, v) => (Array.isArray(v) ? v.every((x, k) => x === k) : v && v.miss === 0),
      reveal(Q, box, v, ok) {
        qsa(".qm-t", box).forEach((b) => { b.disabled = true; b.classList.remove("gone"); b.classList.add(ok ? "right" : "shown"); });
        if (!ok && v && v.miss) correct(box, `${v.miss} wrong pairing${v.miss === 1 ? "" : "s"} on the way. The pairs are:`);
        qsa(".q-actions", box).forEach((a) => a.remove());
      },
      answer: (Q) => Q.pairs.map(([l, r]) => `${String(l).replace(/<[^>]+>/g, "")} → ${String(r).replace(/<[^>]+>/g, "")}`).join(" · "),
    },
    cat: {
      label: "Sort into the right bucket",
      render(Q, box, submit) {
        box.innerHTML = `<div class="q-cat">${Q.items.map(([t], k) => `<div class="qc-row" data-k="${k}"><span class="qc-t">${t}</span><span class="seg qc-seg">${Q.buckets.map((b, j) => `<button data-j="${j}">${b}</button>`).join("")}</span></div>`).join("")}</div><div class="q-actions"><button class="btn primary" data-check disabled>Check</button></div>`;
        const val = Q.items.map(() => -1), chk = qs("[data-check]", box);
        qsa(".qc-row", box).forEach((r) => qsa("button", r).forEach((b) => (b.onclick = () => { val[+r.dataset.k] = +b.dataset.j; qsa("button", r).forEach((x) => x.classList.toggle("on", x === b)); chk.disabled = val.includes(-1); })));
        chk.onclick = () => submit(val.slice());
      },
      grade: (Q, v) => v.every((x, k) => x === Q.items[k][1]),
      reveal(Q, box, v) {
        qsa(".qc-row", box).forEach((r, k) => { qsa("button", r).forEach((b, j) => { b.disabled = true; b.classList.toggle("on", j === v[k]); if (j === Q.items[k][1]) b.classList.add("right"); else if (j === v[k]) b.classList.add("wrong"); }); r.classList.add(v[k] === Q.items[k][1] ? "right" : "wrong"); });
        qsa(".q-actions", box).forEach((a) => a.remove());
      },
      answer: (Q) => Q.buckets.map((b, j) => `${b}: ${Q.items.filter((i) => i[1] === j).map((i) => String(i[0]).replace(/<[^>]+>/g, "")).join(", ")}`).join(" · "),
    },
    pick: {
      label: "Click on the diagram",
      render(Q, box, submit) {
        const multi = Array.isArray(Q.a);
        box.innerHTML = `<div class="q-pick">${typeof Q.fig === "function" ? "" : Q.fig}</div>${multi ? `<div class="q-actions"><span class="faint" data-count></span><button class="btn primary" data-check disabled>Check</button></div>` : ""}`;
        if (typeof Q.fig === "function") Q.fig(qs(".q-pick", box));
        const els = qsa("[data-pick]", box), sel = new Set();
        els.forEach((e) => { e.classList.add("pickable"); e.setAttribute("tabindex", "0"); e.setAttribute("role", "button");
          const act = () => { if (!multi) return submit(e.dataset.pick); sel.has(e.dataset.pick) ? sel.delete(e.dataset.pick) : sel.add(e.dataset.pick); els.forEach((x) => x.classList.toggle("sel", sel.has(x.dataset.pick))); qs("[data-check]", box).disabled = !sel.size; qs("[data-count]", box).textContent = `${sel.size} selected`; };
          e.addEventListener("click", act); e.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); act(); } }); });
        if (multi) qs("[data-check]", box).onclick = () => submit([...sel].sort());
      },
      grade: (Q, v) => (Array.isArray(Q.a) ? same([...v].sort(), [...Q.a].sort()) : v === Q.a),
      reveal(Q, box, v) {
        const want = [].concat(Q.a), got = [].concat(v);
        qsa("[data-pick]", box).forEach((e) => { const p = e.dataset.pick; e.classList.remove("pickable", "sel"); e.removeAttribute("tabindex"); e.style.pointerEvents = "none"; if (want.includes(p) && got.includes(p)) e.classList.add("pk-right"); else if (got.includes(p)) e.classList.add("pk-wrong"); else if (want.includes(p)) e.classList.add("pk-missed"); });
        qsa(".q-actions", box).forEach((a) => a.remove());
      },
      answer: (Q) => [].concat(Q.a).join(", "),
    },
    bug: {
      label: "Click the faulty line",
      render(Q, box, submit) {
        box.innerHTML = `<div class="q-code">${Q.code.map((ln, k) => `<button class="qc-line" data-k="${k}"><span class="qc-n">${k + 1}</span><code>${esc(ln)}</code></button>`).join("")}</div>`;
        qsa(".qc-line", box).forEach((b) => (b.onclick = () => submit(+b.dataset.k)));
      },
      grade: (Q, v) => v === Q.a,
      reveal(Q, box, v) { qsa(".qc-line", box).forEach((b, k) => { b.disabled = true; if (k === Q.a) b.classList.add("right"); else if (k === v) b.classList.add("wrong"); }); },
      answer: (Q) => `line ${Q.a + 1}: ${Q.code[Q.a].trim()}`,
    },
  };

  /** Register a boss quiz. B = {id, subject?, lecture, title, blurb, lede, qs, matrix?, aside?} */
  const DEFS = {};
  N.__bossQ = (id, i) => DEFS[id].qs[i]; // used by tools/boss-test.js
  N.bossDef = (id) => DEFS[id]; // the lesson player runs boss quizzes from these definitions
  N.registerBoss = (B) => (DEFS[B.id] = B) && N.register({
    id: B.id, subject: B.subject, lecture: B.lecture, order: 99, num: "Boss", title: B.title, blurb: B.blurb, qCount: B.qs.length,
    render(root) {
      root.appendChild(header(this, B.lede));
      const n = B.qs.length, key = (i) => `${B.id}-${i}`;
      const get = () => {
        const s = store.get("nic.quiz", {});
        // drop answers saved by the old multiple-choice-only engine (plain numbers)
        let dirty = false; B.qs.forEach((_, i) => { if (key(i) in s && typeof s[key(i)] !== "object") { delete s[key(i)]; dirty = true; } });
        if (dirty) store.set("nic.quiz", s);
        return s;
      };
      const fx = N.fx || {};
      const kinds = [...new Set(B.qs.map((Q) => TYPES[Q.type || "mcq"].label))];
      const top = el(`<div class="card boss-top"><div class="boss-meta"><div><small>Score</small><b id="sc">0</b><span class="faint"> / ${n}</span></div>
          <div class="boss-bar"><span id="bar"></span></div><button class="btn ghost small" id="retry">Start over</button></div>
        <div class="boss-dots">${B.qs.map((Q, i) => `<button data-i="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`).join("")}</div>
        <div class="boss-kinds faint">${kinds.length} question styles: ${kinds.join(" · ")}</div></div>`);
      root.appendChild(top);
      if (B.matrix) root.appendChild(el(`<div class="card"><div class="card-head"><h3>Distance matrix (Lecture 3)</h3><span class="faint">keep this handy</span></div><div style="max-width:360px">${matrixHTML()}</div></div>`));
      if (B.aside) root.appendChild(el(`<div class="card boss-aside">${B.aside}</div>`));
      const stage = el(`<div class="boss-stage"></div>`);
      root.appendChild(stage);
      const firstOpen = () => { const s = get(); return B.qs.findIndex((_, i) => !(key(i) in s)); };
      let cur = Math.max(0, firstOpen()), swapTok = 0;
      const stats = () => { const s = get(); let c = 0, a = 0; B.qs.forEach((_, i) => { if (key(i) in s) { a++; if (s[key(i)].ok) c++; } }); return { c, a }; };
      function upd() {
        const { c, a } = stats(), s = get();
        fx.count ? fx.count(qs("#sc", top), c) : (qs("#sc", top).textContent = c);
        qs("#bar", top).style.transform = `scaleX(${a / n})`;
        qsa(".boss-dots button", top).forEach((b, i) => { b.className = key(i) in s ? (s[key(i)].ok ? "ok" : "no") : ""; if (i === cur && cur < n) b.classList.add("cur"); });
      }
      function showQ(i, dir) {
        cur = i;
        const Q = B.qs[i], T = TYPES[Q.type || "mcq"], s = get();
        const node = el(`<div class="card predict boss-q qt-${Q.type || "mcq"}"><div class="card-head"><span class="tag violet">Question ${i + 1} of ${n}</span><span class="tag">${T.label}</span></div>
          <div class="q">${Q.q}</div><div class="q-fig"></div><div class="q-body"></div>
          ${Q.hint ? `<div class="q-hint"><button class="btn ghost small" data-hint>Need a nudge?</button><div class="q-hint-t" hidden>${Q.hint}</div></div>` : ""}
          <div class="explain"></div>
          <div class="boss-nav"><button class="btn ghost small" data-go="-1" ${i === 0 ? "disabled" : ""}>Previous</button><button class="btn primary" data-go="1" style="display:none">${i === n - 1 ? "See results" : "Next question"}</button></div></div>`);
        const figBox = qs(".q-fig", node), body = qs(".q-body", node);
        if (Q.fig && Q.type !== "pick") typeof Q.fig === "function" ? Q.fig(figBox) : (figBox.innerHTML = Q.fig);
        const hb = qs("[data-hint]", node);
        if (hb) hb.onclick = () => { qs(".q-hint-t", node).hidden = false; hb.remove(); if (fx.reveal) fx.reveal(qs(".q-hint-t", node)); };
        const reveal = (v, ok, first) => {
          node.classList.add("answered");
          const focus = T.reveal(Q, body, v, ok);
          const h = qs(".q-hint", node); if (h) h.remove();
          const ex = qs(".explain", node);
          N.feedback(ex, ok ? "ok" : "no", `<span class="verdict ${ok ? "ok" : "no"}">${ok ? "Correct!" : "Not quite."}</span>${Q.why}`, first);
          qs('[data-go="1"]', node).style.display = "";
          if (first && fx.reveal) { fx.reveal(ex); if (focus) ok ? (fx.bounce || fx.pop)(focus) : fx.shake(focus); }
        };
        T.render(Q, body, (v) => { const ok = T.grade(Q, v); const st = get(); st[key(i)] = { v, ok }; store.set("nic.quiz", st); reveal(v, ok, true); upd(); window.dispatchEvent(new Event("nic:progress")); }, key(i));
        if (key(i) in s) reveal(s[key(i)].v, s[key(i)].ok, false);
        qsa("[data-go]", node).forEach((b) => b.addEventListener("click", () => { const g = +b.dataset.go; if (i + g >= n) results(); else showQ(i + g, g); }));
        // the old question leaves first, then the new one runs a single entrance (a slide; its figure draws itself)
        const tok = ++swapTok, old = stage.firstElementChild;
        const put = () => {
          if (tok !== swapTok) return;
          stage.innerHTML = ""; stage.appendChild(node);
          if (fx.play) fx.play(node);
          if (dir && fx.ok && fx.animate && fx.clean) {
            const r = fx.reduce && fx.reduce();
            fx.clean(node, fx.animate(node, r ? { opacity: [0, 1] } : { opacity: [0, 1], transform: [`translateX(${18 * dir}px)`, "translateX(0px)"] }, { duration: fx.DUR.m, ease: fx.EASE }));
          }
        };
        if (old && dir && fx.ok && fx.exit) { old.classList.add("m-ghost"); fx.exit(old, { x: -12 * dir, scale: 1, dur: fx.DUR.xs }).then(put); } else put();
        upd();
      }
      function results() {
        cur = n; swapTok++; // cancels a question swap still waiting on its exit
        const { c, a } = stats(), s = get(), pct = c / n;
        const missed = B.qs.map((Q, i) => [Q, i]).filter(([, i]) => key(i) in s && !s[key(i)].ok);
        const msg = a < n ? "Some questions are still unanswered. Use the numbers above to jump back." : pct === 1 ? "Perfect. This one is locked in." : pct >= 0.8 ? "Pass: solid grasp. Skim the misses below, then move on." : "Not yet. Revisit the modules behind the misses, then try again.";
        const mood = a < n ? "think" : pct >= 0.8 ? "happy" : "sad";
        const node = el(`<div class="card boss-result">${N.mascot ? N.mascot({ size: 120, mood: "idle", cls: "br-mascot" }) : ""}<div class="br-score"><b id="rs">0</b><span>/ ${n}</span></div><p class="lede" style="margin:6px 0 16px">${msg}</p>
          ${missed.length ? `<h3>Review what you missed</h3>${missed.map(([Q, i]) => `<div class="br-miss"><button class="btn small ghost" data-i="${i}">Q${i + 1}</button><div><div>${Q.q}</div><div class="faint" style="margin-top:4px">Answer: <b style="color:var(--teal-ink)">${TYPES[Q.type || "mcq"].answer(Q)}</b></div></div></div>`).join("")}` : ""}
          <div class="controls" style="margin-top:14px">${missed.length ? `<button class="btn primary" id="rm">Retry the ${missed.length} missed</button>` : ""}<button class="btn ghost" id="ra">Retry everything</button></div></div>`);
        stage.innerHTML = ""; stage.appendChild(node);
        if (fx.enter) fx.enter(node, { y: 10 });
        fx.count ? fx.count(qs("#rs", node), c, { from: 0, dur: 0.8 }) : (qs("#rs", node).textContent = c);
        if (N.mascotReact) setTimeout(() => N.mascotReact(node, mood), 350);
        if (pct === 1 && fx.celebrate) setTimeout(() => fx.celebrate(qs(".br-score", node), { big: true }), 500);
        qsa(".br-miss [data-i]", node).forEach((b) => (b.onclick = () => showQ(+b.dataset.i, -1)));
        const rm = qs("#rm", node);
        if (rm) rm.onclick = () => { const st = get(); missed.forEach(([, i]) => delete st[key(i)]); store.set("nic.quiz", st); showQ(missed[0][1], 1); };
        qs("#ra", node).onclick = reset;
        upd();
      }
      function reset() { const st = get(); B.qs.forEach((_, i) => delete st[key(i)]); store.set("nic.quiz", st); showQ(0, -1); }
      qsa(".boss-dots button", top).forEach((b) => (b.onclick = () => { const k = +b.dataset.i; if (k !== cur) showQ(k, k > cur ? 1 : -1); }));
      qs("#retry", top).onclick = reset;
      firstOpen() === -1 ? results() : showQ(cur, 0);
    },
  });
  N.QUIZ_TYPES = TYPES;

  /* ---------- figure helpers for "pick" questions (fresh diagrams, not the lesson ones) ---------- */
  const Qf = {};
  /** Graph. nodes {A:[x,y]}, edges [[a,b,w?]]. pick: "nodes" | "edges" | null. directed arrows optional. */
  Qf.graph = (nodes, edges, { pick = null, w = 460, h = 260, directed = false, r = 19, hl = {} } = {}) => {
    const id = "qg" + Math.random().toString(36).slice(2, 7);
    const ed = edges.map(([a, b, wt]) => {
      const [x1, y1] = nodes[a], [x2, y2] = nodes[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      const sx = x1 + dx / L * r, sy = y1 + dy / L * r, ex = x2 - dx / L * (r + (directed ? 5 : 0)), ey = y2 - dy / L * (r + (directed ? 5 : 0));
      const mx = (x1 + x2) / 2 - dy / L * 12, my = (y1 + y2) / 2 + dx / L * 12, c = hl[`${a}-${b}`] || "var(--line-2)";
      const vis = `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${c}" stroke-width="3" stroke-linecap="round" ${directed ? `marker-end="url(#${id})"` : ""}/>`;
      const lbl = wt !== undefined ? `<text x="${mx}" y="${my + 4}" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-dim)">${wt}</text>` : "";
      return pick === "edges" ? `<g data-pick="${a}-${b}">${vis}<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="transparent" stroke-width="18"/>${lbl}</g>` : vis + lbl;
    }).join("");
    const nd = Object.entries(nodes).map(([k, [x, y]]) => `<g ${pick === "nodes" ? `data-pick="${k}"` : ""}><circle cx="${x}" cy="${y}" r="${r}" fill="var(--panel)" stroke="${hl[k] || "var(--line-2)"}" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font:900 15px var(--sans);fill:var(--ink)">${k}</text></g>`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-2)"/></marker></defs>${ed}${nd}</svg>`;
  };
  /** Points on a grid (maths coordinates, y up). P = {A:[x,y]}; range [0..max]. */
  Qf.points = (P, { max = 8, w = 420, h = 320, pick = true, poly = null } = {}) => {
    const X = (x) => 30 + (x / max) * (w - 50), Y = (y) => h - 30 - (y / max) * (h - 50);
    const grid = Array.from({ length: max + 1 }, (_, i) => `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(max)}" stroke="var(--line)"/><line x1="${X(0)}" y1="${Y(i)}" x2="${X(max)}" y2="${Y(i)}" stroke="var(--line)"/><text x="${X(i)}" y="${Y(0) + 16}" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">${i}</text><text x="${X(0) - 10}" y="${Y(i) + 4}" text-anchor="end" style="font:700 11px var(--sans);fill:var(--text-faint)">${i}</text>`).join("");
    const pl = poly ? `<polygon points="${poly.map((n) => `${X(P[n][0])},${Y(P[n][1])}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2"/>` : "";
    const pts = Object.entries(P).map(([k, [x, y]]) => `<g ${pick ? `data-pick="${k}"` : ""}><circle cx="${X(x)}" cy="${Y(y)}" r="11" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${X(x)}" y="${Y(y) + 4}" text-anchor="middle" style="font:900 11px var(--sans);fill:var(--ink)">${k}</text></g>`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${grid}${pl}${pts}</svg>`;
  };
  /** 1-D landscape with clickable candidate spots. f(x) on [0,1]; spots [[x, id]]; start marker at sx. */
  Qf.curve = (f, spots, { sx = null, w = 560, h = 200, label = "" } = {}) => {
    let lo = Infinity, hi = -Infinity; for (let i = 0; i <= 200; i++) { const v = f(i / 200); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const X = (x) => 16 + x * (w - 32), Y = (v) => h - 24 - ((v - lo) / (hi - lo || 1)) * (h - 60);
    const d = Array.from({ length: 201 }, (_, i) => `${i ? "L" : "M"}${X(i / 200).toFixed(1)} ${Y(f(i / 200)).toFixed(1)}`).join(" ");
    const sp = spots.map(([x, id]) => `<g data-pick="${id}"><circle cx="${X(x)}" cy="${Y(f(x))}" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${X(x)}" y="${Y(f(x)) + 5}" text-anchor="middle" style="font:900 12px var(--sans);fill:var(--ink)">${id}</text></g>`).join("");
    const st = sx !== null ? `<g><circle cx="${X(sx)}" cy="${Y(f(sx))}" r="8" fill="var(--rose)"/><text x="${X(sx)}" y="${Y(f(sx)) + 24}" text-anchor="middle" style="font:800 12px var(--sans);fill:var(--rose-ink)">start</text></g>` : "";
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><path d="${d} L${X(1)} ${h - 24} L${X(0)} ${h - 24} Z" fill="var(--teal-dim)"/><path d="${d}" fill="none" stroke="var(--teal)" stroke-width="3"/>${st}${sp}${label ? `<text x="${w / 2}" y="${h - 4}" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">${label}</text>` : ""}</svg>`;
  };
  N.qfig = Qf;
})();
