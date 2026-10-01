/* Code lab engine: write a few lines of real JavaScript, run tests, and watch YOUR code animate.
     NIC.codelab(root, life, {
       who, intro,
       brief:   "html shown above the editor",
       starter: "function solve(x) {\n  // YOUR CODE: …\n}",          // a comment containing YOUR CODE is highlighted as a blank
       entry:   "solve",                                              // function the tests call
       tests:   [{ name, desc, args:[…], expect, cmp?(got, want)->bool, view? }],   // view: anything the scene needs for this test
       hints:   ["nudge 1", "bigger nudge 2"],
       solution:"full working source",
       scene:   { build(stage, test) -> handle, frame(handle, f, {i, animate, frames, test}), reset(handle, test), caption?(f, {i, frames, test}) -> html },
       watch:   true,          // add a final mission: play a passing run's trace to the end
       missions: [...]         // optional extra missions; tests automatically give one mission each (ids t0, t1, …)
     })
   The learner's code may call trace({...}) (any plain object, optionally with a `cap` caption) to record a frame. The trace for the
   selected test is replayed on the stage with play / step / scrub controls; scene.frame() redraws from the frame (idempotent).
   The editor behaves like an IDE: auto-closing brackets and quotes, smart Enter, indent/outdent, Ctrl+/ comments.
   Code runs in a Web Worker (2 s limit, so an infinite loop can't freeze the page) and falls back to the main thread.
   All classes are cl- prefixed (css/workshop.css). */
(function () {
  const N = NIC, { el, qs, qsa } = N;
  const fx = () => N.fx;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---------- value formatting / comparison ----------
  function show(v, max = 140) {
    if (v === undefined) return "nothing (no return value)";
    let s; try { s = JSON.stringify(v, (k, x) => (x === Infinity ? "∞" : x === -Infinity ? "-∞" : typeof x === "number" && isNaN(x) ? "not a number" : x instanceof Set ? [...x] : x)); } catch { s = String(v); }
    if (s === undefined) s = String(v);
    return s.length > max ? s.slice(0, max - 3) + "…" : s;
  }
  function same(a, b) {
    if (typeof a === "number" && typeof b === "number") return a === b || (isNaN(a) && isNaN(b)) || Math.abs(a - b) < 1e-9;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
    if (a && b && typeof a === "object" && typeof b === "object") { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every((k) => k in b && same(a[k], b[k])); }
    return a === b;
  }

  // ---------- syntax highlight (tiny, good enough for short JS) ----------
  const TOK = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(function|return|const|let|var|for|while|if|else|of|in|break|continue|new|true|false|null|Infinity|undefined)\b|\b(\d+(?:\.\d+)?)\b/g;
  function highlight(src) {
    return esc(src).replace(TOK, (m, c, s, k, n) => c ? `<i class="${/YOUR CODE/.test(c) ? "t" : "c"}">${c}</i>` : s ? `<i class="s">${s}</i>` : k ? `<i class="k">${k}</i>` : `<i class="n">${n}</i>`) + "\n";
  }

  // ---------- sandboxed run ----------
  const WORKER_SRC = `onmessage = (e) => {
    const { code, entry, args } = e.data, frames = [];
    const trace = (f) => { if (frames.length < 4000) { try { frames.push(structuredClone(f)); } catch (x) { frames.push({ cap: String(f) }); } } };
    try {
      const fn = new Function("trace", code + "\\n;return typeof " + entry + " === 'function' ? " + entry + " : null;")(trace);
      if (!fn) { postMessage({ ok: false, error: "Couldn't find a function called " + entry + ". Keep its name as it is.", frames }); return; }
      const out = fn(...structuredClone(args));
      postMessage({ ok: true, out, frames });
    } catch (err) { postMessage({ ok: false, error: (err && err.name ? err.name + ": " : "") + (err && err.message ? err.message : String(err)), frames }); }
  };`;
  let blobUrl = null;
  function runOne(code, entry, args, limit = 2000) {
    return new Promise((resolve) => {
      let w = null;
      try { blobUrl = blobUrl || URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" })); w = new Worker(blobUrl); } catch { w = null; }
      if (!w) { // main-thread fallback (no guard against infinite loops)
        const frames = [], trace = (f) => { if (frames.length < 4000) frames.push(JSON.parse(JSON.stringify(f))); };
        try { const fn = new Function("trace", code + "\n;return typeof " + entry + " === 'function' ? " + entry + " : null;")(trace); if (!fn) return resolve({ ok: false, error: "Couldn't find a function called " + entry + ".", frames }); resolve({ ok: true, out: fn(...JSON.parse(JSON.stringify(args))), frames }); } catch (e) { resolve({ ok: false, error: String(e), frames }); }
        return;
      }
      const t = setTimeout(() => { w.terminate(); resolve({ ok: false, error: "Took longer than 2 seconds. Is there a loop that never ends?", frames: [], slow: true }); }, limit);
      w.onmessage = (e) => { clearTimeout(t); w.terminate(); resolve(e.data); };
      w.onerror = (e) => { clearTimeout(t); w.terminate(); resolve({ ok: false, error: e.message || "Your code couldn't be read. Check for a missing bracket or comma.", frames: [] }); };
      try { w.postMessage({ code, entry, args }); } catch { clearTimeout(t); w.terminate(); resolve({ ok: false, error: "Those test inputs couldn't be sent to your code.", frames: [] }); }
    });
  }

  // ---------- autocomplete ----------
  const KW = ["function", "return", "const", "let", "var", "for", "while", "if", "else", "break", "continue", "new", "of", "in", "true", "false", "null", "undefined", "Infinity", "typeof"];
  const GLOBALS = ["Math", "Object", "Array", "Number", "String", "JSON", "Set", "Map", "console", "isNaN", "parseInt", "parseFloat", "NaN", "trace"];
  const MEMBERS = {
    Math: [["abs", "m"], ["min", "m"], ["max", "m"], ["sqrt", "m"], ["exp", "m"], ["log", "m"], ["floor", "m"], ["ceil", "m"], ["round", "m"], ["pow", "m"], ["sign", "m"], ["hypot", "m"], ["PI", "p"], ["E", "p"]],
    Object: [["keys", "m"], ["values", "m"], ["entries", "m"], ["assign", "m"], ["fromEntries", "m"]],
    Array: [["from", "m"], ["isArray", "m"]], Number: [["isFinite", "m"], ["isInteger", "m"], ["MAX_SAFE_INTEGER", "p"]], JSON: [["stringify", "m"], ["parse", "m"]],
    _: [["length", "p"], ["size", "p"], ["push", "m"], ["pop", "m"], ["shift", "m"], ["unshift", "m"], ["map", "m"], ["filter", "m"], ["reduce", "m"], ["forEach", "m"], ["slice", "m"], ["splice", "m"], ["sort", "m"], ["reverse", "m"], ["includes", "m"], ["indexOf", "m"], ["join", "m"], ["concat", "m"], ["some", "m"], ["every", "m"], ["find", "m"], ["fill", "m"], ["keys", "m"], ["values", "m"], ["entries", "m"], ["add", "m"], ["has", "m"], ["delete", "m"], ["get", "m"], ["set", "m"], ["clear", "m"], ["toFixed", "m"], ["split", "m"], ["trim", "m"]],
  };
  const SNIPPETS = [
    ["for", "for (const x of items) {\n  |\n}", "snippet"], ["fori", "for (let i = 0; i < n; i++) {\n  |\n}", "snippet"], ["forin", "for (const k in obj) {\n  |\n}", "snippet"],
    ["if", "if (cond) {\n  |\n}", "snippet"], ["while", "while (cond) {\n  |\n}", "snippet"], ["function", "function name(args) {\n  |\n}", "snippet"],
  ];

  /** Popup list of suggestions at the caret. Identifiers from the code, keywords, built-ins, `.` members and a few snippets. */
  function autocomplete(ta, wrap, extra = []) {
    const pop = el(`<div class="cl-ac" role="listbox" hidden></div>`); document.body.appendChild(pop);
    const probe = el(`<span class="cl-probe" aria-hidden="true">MMMMMMMMMM</span>`); wrap.appendChild(probe);
    let items = [], at = 0, from = 0, skip = false, moved = false;
    const close = () => { pop.hidden = true; items = []; };
    const cw = () => probe.getBoundingClientRect().width / 10 || 7.8;
    function candidates(force) {
      const v = ta.value, pos = ta.selectionStart, before = v.slice(0, pos);
      const m = before.match(/(?:([A-Za-z_$][\w$]*)\s*\.\s*)?([A-Za-z_$][\w$]*)?$/); if (!m || (!m[2] && !m[0].includes("."))) return null;
      const prefix = m[2] || "", pre = prefix.toLowerCase();
      const out = [];
      if (m[0].includes(".")) { // member access
        const list = MEMBERS[m[1]] || MEMBERS._;
        list.forEach(([n, k]) => { if (n.toLowerCase().startsWith(pre) && n !== prefix) out.push({ n, k, ins: k === "m" ? n + "()" : n, back: k === "m" ? 1 : 0 }); });
        return { out: out.slice(0, 9), start: pos - prefix.length };
      }
      if (prefix.length < 2 && !force) return null;
      const seen = new Set();
      SNIPPETS.forEach(([n, body, k]) => { if (n.startsWith(pre)) { out.push({ n, k, snip: body }); seen.add(n); } });
      const words = new Set(); (v.match(/[A-Za-z_$][\w$]*/g) || []).forEach((w) => words.add(w));
      extra.forEach((w) => words.add(w));
      [...words].sort().forEach((w) => { if (!seen.has(w) && w !== prefix && w.toLowerCase().startsWith(pre) && !KW.includes(w) && !GLOBALS.includes(w)) { out.push({ n: w, k: "var", ins: w }); seen.add(w); } });
      [...KW, ...GLOBALS].forEach((w) => { if (!seen.has(w) && w !== prefix && w.toLowerCase().startsWith(pre)) { out.push({ n: w, k: KW.includes(w) ? "kw" : "api", ins: w }); seen.add(w); } });
      // drop the word being typed if it is the only match of itself
      return out.length ? { out: out.slice(0, 9), start: pos - prefix.length } : null;
    }
    function place() {
      const v = ta.value, pos = ta.selectionStart, line = v.slice(0, pos).split("\n"), r = wrap.getBoundingClientRect();
      const x = r.left + 14 + (line[line.length - 1].length - (pos - from)) * cw() - ta.scrollLeft, y = r.top + 12 + line.length * 21 - ta.scrollTop;
      pop.style.left = `${Math.max(8, Math.min(x, innerWidth - 230))}px`; pop.style.top = `${Math.min(y + 4, innerHeight - 230)}px`;
    }
    function draw() {
      pop.innerHTML = items.map((c, i) => `<div class="cl-ai ${i === at ? "on" : ""}" role="option" data-i="${i}"><i class="k-${c.k}">${{ kw: "kw", var: "x", api: "ƒ", m: "ƒ", p: "•", snippet: "⌘" }[c.k]}</i><b>${esc(c.n)}</b>${c.k === "snippet" ? `<span>snippet</span>` : ""}</div>`).join("");
      qsa(".cl-ai", pop).forEach((d) => { d.onmousedown = (e) => { e.preventDefault(); accept(+d.dataset.i); }; });
    }
    function update(force) {
      if (skip) { skip = false; return close(); }
      if (document.activeElement !== ta || ta.selectionStart !== ta.selectionEnd) return close();
      const c = candidates(force === true); if (!c) return close();
      items = c.out; at = 0; moved = false; from = c.start; draw(); pop.hidden = false; place();
    }
    function accept(i) {
      const c = items[i]; if (!c) return; const pos = ta.selectionStart; close(); skip = true;
      ta.focus(); ta.setSelectionRange(from, pos);
      if (c.snip) {
        const line = ta.value.slice(ta.value.lastIndexOf("\n", from - 1) + 1, from), ind = (line.match(/^\s*/) || [""])[0];
        const body = c.snip.replace(/\n/g, "\n" + ind), k = body.indexOf("|"), text = body.replace("|", "");
        let ok = false; try { ok = document.execCommand("insertText", false, text); } catch { ok = false; }
        if (!ok) { ta.setRangeText(text, from, pos, "end"); ta.dispatchEvent(new Event("input")); }
        ta.setSelectionRange(from + k, from + k);
      } else {
        let ok = false; try { ok = document.execCommand("insertText", false, c.ins); } catch { ok = false; }
        if (!ok) { ta.setRangeText(c.ins, from, pos, "end"); ta.dispatchEvent(new Event("input")); }
        ta.setSelectionRange(from + c.ins.length - (c.back || 0), from + c.ins.length - (c.back || 0));
      }
    }
    ta.addEventListener("blur", close); ta.addEventListener("scroll", close);
    return {
      update,
      open: () => !pop.hidden,
      key(e) { // true when the key was used by the popup
        if ((e.ctrlKey || e.metaKey) && e.code === "Space") { e.preventDefault(); update(true); return true; }
        if (pop.hidden) return false;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); at = (at + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length; moved = true; draw(); return true; }
        if (e.key === "Tab" || (e.key === "Enter" && moved)) { e.preventDefault(); accept(at); return true; } // Enter only accepts after you arrowed to a choice
        if (e.key === "Enter") { close(); return false; }
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return true; }
        return false;
      },
      close, destroy() { pop.remove(); probe.remove(); },
    };
  }

  /** IDE-style typing for the code box: auto-closing pairs, type-over, wrap selection, smart Enter, indent/outdent,
      comment toggle (Ctrl/Cmd + /), auto-dedent on "}", and pair-aware Backspace. Uses execCommand so undo (Ctrl+Z) still works. */
  function editorKeys(ta, run, ac) {
    const OPEN = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" }, CLOSERS = new Set([")", "]", "}", '"', "'", "`"]);
    const word = (c) => !!c && /[A-Za-z0-9_$]/.test(c);
    const put = (from, to, text) => {
      ta.focus(); ta.setSelectionRange(from, to);
      let ok = false;
      try { ok = text === "" ? document.execCommand("delete") : document.execCommand("insertText", false, text); } catch { ok = false; }
      if (!ok) { ta.setRangeText(text, from, to, "end"); ta.dispatchEvent(new Event("input")); }
    };
    const caret = (a, b = a) => ta.setSelectionRange(a, b);
    const lineStart = (i) => ta.value.lastIndexOf("\n", i - 1) + 1;
    const lineEnd = (i) => { const k = ta.value.indexOf("\n", i); return k < 0 ? ta.value.length : k; };
    const blockOf = () => { const v = ta.value, a = ta.selectionStart, b = ta.selectionEnd; return [lineStart(a), lineEnd(b > a && v[b - 1] === "\n" ? b - 1 : b)]; };

    ta.addEventListener("keydown", (e) => {
      if (e.isComposing) return;
      if (ac && ac.key(e)) return;
      const v = ta.value, a = ta.selectionStart, b = ta.selectionEnd, mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === "Enter") { e.preventDefault(); run(); return; }

      if (mod && e.key === "/") { // toggle line comments on every selected line
        e.preventDefault();
        const [s0, e0] = blockOf(), lines = v.slice(s0, e0).split("\n"), live = lines.filter((l) => l.trim());
        const off = live.length && live.every((l) => /^\s*\/\//.test(l));
        const ind = Math.min(...live.map((l) => l.match(/^\s*/)[0].length), 1e9);
        const out = lines.map((l) => (!l.trim() ? l : off ? l.replace(/^(\s*)\/\/ ?/, "$1") : l.slice(0, ind) + "// " + l.slice(ind))).join("\n");
        put(s0, e0, out); caret(s0, s0 + out.length); return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const multi = v.slice(a, b).includes("\n");
        if (multi || e.shiftKey) { // indent or outdent whole lines
          const [s0, e0] = blockOf(), lines = v.slice(s0, e0).split("\n");
          const out = lines.map((l) => (e.shiftKey ? l.replace(/^ {1,2}/, "") : l.trim() ? "  " + l : l)).join("\n");
          put(s0, e0, out); caret(s0, s0 + out.length);
        } else put(a, b, "  ");
        return;
      }

      if (e.key === "Enter" && !e.shiftKey && !mod) { // keep indent; open a block between { } ( ) [ ]
        e.preventDefault();
        const line = v.slice(lineStart(a), a), ind = line.match(/^\s*/)[0], prev = v[a - 1], next = v[b];
        if (prev && OPEN[prev] && OPEN[prev] === next && prev !== '"' && prev !== "'" && prev !== "`") {
          put(a, b, "\n" + ind + "  \n" + ind); caret(a + 1 + ind.length + 2);
        } else put(a, b, "\n" + ind + (/[{(\[]\s*$/.test(line) ? "  " : ""));
        return;
      }

      if (e.key === "Backspace" && a === b && a > 0 && OPEN[v[a - 1]] && OPEN[v[a - 1]] === v[a]) { // delete an empty pair together
        e.preventDefault(); put(a - 1, a + 1, ""); return;
      }

      if (mod || e.altKey || e.key.length !== 1) return;
      const k = e.key;

      if (a === b && CLOSERS.has(k) && v[a] === k) { e.preventDefault(); caret(a + 1); return; } // type over a closer

      if (k === "}" && a === b) { // dedent a line that holds only spaces
        const ls = lineStart(a), before = v.slice(ls, a);
        if (before && !before.trim() && before.length >= 2) { e.preventDefault(); put(a - 2, a, "}"); return; }
      }

      if (OPEN[k]) {
        const close = OPEN[k];
        if (a !== b) { e.preventDefault(); const inner = v.slice(a, b); put(a, b, k + inner + close); caret(a + 1, a + 1 + inner.length); return; } // wrap the selection
        const quote = k === '"' || k === "'" || k === "`";
        if (quote && (word(v[a - 1]) || word(v[a]) || v[a - 1] === k)) return;       // an apostrophe in a word, or closing a string
        if (!quote && v[a] && !/[\s)\]};,.]/.test(v[a])) return;                      // only pair before whitespace or a closer
        e.preventDefault(); put(a, a, k + close); caret(a + 1);
      }
    });
    if (ac) { ta.addEventListener("input", (e) => { if (!e.inputType || /^(insert|delete)/.test(e.inputType)) ac.update(); }); ta.addEventListener("click", ac.close); }
  }

  /** A draggable divider between the left column and the editor (like LeetCode). Drag, use the arrow keys, or double-click to reset.
      The width is remembered in localStorage (csl.split). Only shown where the two columns sit side by side. */
  function splitter(wk) {
    const KEY = "csl.split", DEF = 46, MIN = 25, MAX = 70;
    let pct = DEF; try { const v = parseFloat(localStorage.getItem(KEY)); if (v >= MIN && v <= MAX) pct = v; } catch { /* storage unavailable */ }
    const h = el(`<div class="cl-split" role="separator" aria-orientation="vertical" aria-label="Resize panels" tabindex="0" title="Drag to resize, double-click to reset"><i></i></div>`);
    wk.appendChild(h);
    const apply = (v, save) => {
      pct = Math.max(MIN, Math.min(MAX, v)); wk.style.setProperty("--cl-l", pct + "%");
      h.setAttribute("aria-valuenow", Math.round(pct));
      if (save) { try { localStorage.setItem(KEY, String(pct)); } catch { /* ignore */ } }
    };
    apply(pct, false);
    let drag = null, raf = 0;
    const ping = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => window.dispatchEvent(new Event("nic:resize"))); };
    h.addEventListener("pointerdown", (e) => { e.preventDefault(); h.setPointerCapture(e.pointerId); drag = { x: e.clientX, w: wk.getBoundingClientRect().width, p: pct }; document.body.classList.add("cl-dragging"); h.classList.add("on"); });
    h.addEventListener("pointermove", (e) => { if (!drag) return; apply(drag.p + ((e.clientX - drag.x) / drag.w) * 100, false); ping(); });
    const end = () => { if (!drag) return; drag = null; document.body.classList.remove("cl-dragging"); h.classList.remove("on"); apply(pct, true); ping(); };
    h.addEventListener("pointerup", end); h.addEventListener("pointercancel", end);
    h.addEventListener("dblclick", () => { apply(DEF, true); ping(); });
    h.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); apply(pct + (e.key === "ArrowRight" ? 2 : -2), true); ping(); } else if (e.key === "Home") { apply(DEF, true); ping(); } });
  }

  function codelab(root, life, cfg) {
    const tests = cfg.tests, results = tests.map(() => null);
    let sel = 0, playing = false, pos = 0, tick = 0, hintN = 0, busy = false, watched = false;
    const missions = [...tests.map((t, i) => ({ id: "t" + i, t: "Pass: " + t.name, d: t.desc || "", hint: t.hint })), ...(cfg.watch ? [{ id: "watch", t: "Watch your code run", d: "Once a test passes, press <b>Play</b> under the picture and watch it to the end." }] : []), ...(cfg.missions || [])];

    return N.workshop(root, life, {
      who: cfg.who, intro: cfg.intro, missions,
      build(stage, api) {
        const card = el(`<div class="wk-card cl cl-edcard">
          <h3>Your code<span class="wk-sp"></span><button class="btn small ghost" data-reset>Reset</button></h3>
          ${cfg.brief ? `<div class="wk-note cl-brief">${cfg.brief}</div>` : ""}
          <div class="cl-ed"><div class="cl-gut" aria-hidden="true"></div><div class="cl-wrap"><pre class="cl-hl" aria-hidden="true"></pre><textarea class="cl-ta" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code editor"></textarea></div></div>
          <div class="wk-row cl-bar"><button class="btn primary" data-run>Run tests</button><button class="btn" data-hint>Hint</button><span class="cl-hintn faint"></span><span class="wk-sp" style="flex:1"></span><details class="cl-sol"><summary class="btn small ghost">Show solution</summary><pre class="cl-solpre"></pre><button class="btn small" data-use>Use it</button></details></div>
          <div class="cl-hint" data-hintbox></div>
          <div class="cl-ex" data-ex></div>
          </div>`);
        const testCard = el(`<div class="wk-card cl-testcard"><h3>Tests<span class="wk-sp"></span><span class="faint cl-tsum" data-tsum></span></h3><div class="cl-tests" data-tests></div></div>`);
        const vis = el(`<div class="wk-card cl-vis"><h3>Watch it run<span class="wk-sp"></span><span class="faint cl-tname" data-tname></span></h3>
          <div class="cl-stage" data-stage></div>
          <div class="cl-cap wk-note" data-cap>Run your code, then watch each step here.</div>
          <div class="cl-ctl"><button class="btn small" data-first aria-label="First step">⏮</button><button class="btn small" data-prev aria-label="Step back">◀</button><button class="btn small primary" data-play>Play</button><button class="btn small" data-next aria-label="Step forward">▶</button><input type="range" min="0" max="0" value="0" data-scrub aria-label="Scrub through the run"><span class="mono faint" data-step>0 / 0</span></div></div>`);
        stage.append(testCard, vis, card);
        const wkNode = stage.closest(".wk"); if (wkNode) { wkNode.classList.add("wk-code"); splitter(wkNode); }

        const ta = qs(".cl-ta", card), pre = qs(".cl-hl", card), gut = qs(".cl-gut", card), wrap = qs(".cl-wrap", card), sandbox = qs("[data-stage]", vis);
        const paint = () => {
          pre.innerHTML = highlight(ta.value);
          const n = ta.value.split("\n").length;
          gut.innerHTML = Array.from({ length: n }, (_, i) => `<span>${i + 1}</span>`).join("");
          wrap.style.height = gut.style.height = `${Math.max(300, n * 21 + 24)}px`;
        };
        const sync = () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; gut.scrollTop = ta.scrollTop; };
        ta.value = cfg.starter; qs(".cl-solpre", card).textContent = cfg.solution || "";
        ta.addEventListener("input", paint); ta.addEventListener("scroll", sync);
        const params = ((cfg.starter.match(/function\s+\w+\s*\(([^)]*)\)/) || [])[1] || "").split(",").map((x) => x.trim()).filter(Boolean);
        const ac = autocomplete(ta, wrap, [...params, cfg.entry, ...(cfg.complete || [])]);
        life.onCleanup(() => ac.destroy());
        editorKeys(ta, () => run(), ac);
        paint();
        if (!cfg.solution) qs(".cl-sol", card).hidden = true;

        // ----- the picture -----
        let handle = cfg.scene.build(sandbox, tests[sel]);
        const cap = qs("[data-cap]", vis), scrub = qs("[data-scrub]", vis), stepEl = qs("[data-step]", vis), playBtn = qs("[data-play]", vis);
        const frames = () => (results[sel] && results[sel].frames) || [];
        function showFrame(i, animate) {
          const fr = frames();
          pos = Math.max(0, Math.min(fr.length, i));
          scrub.max = fr.length; scrub.value = pos; stepEl.textContent = `${pos} / ${fr.length}`;
          if (!pos) { cfg.scene.reset ? cfg.scene.reset(handle, tests[sel]) : cfg.scene.frame(handle, null, { i: 0, animate: false, frames: fr, test: tests[sel] }); cap.innerHTML = fr.length ? "Press <b>Play</b> or step forward." : "Run your code, then watch each step here."; return; }
          const f = fr[pos - 1];
          cfg.scene.frame(handle, f, { i: pos - 1, animate: !!animate, frames: fr, test: tests[sel] });
          cap.innerHTML = (cfg.scene.caption ? cfg.scene.caption(f, { i: pos - 1, frames: fr, test: tests[sel] }) : f && f.cap) || "";
        }
        function stop() { playing = false; clearTimeout(tick); playBtn.textContent = pos >= frames().length && frames().length ? "Replay" : "Play"; }
        function step() {
          if (!playing) return;
          if (pos >= frames().length) { stop(); if (results[sel] && results[sel].pass && !watched && cfg.watch) { watched = true; api.done("watch"); } return; }
          showFrame(pos + 1, true);
          tick = life.timeout(step, (fx() && fx().ok ? 480 : 120) * (frames()[pos - 1] && frames()[pos - 1].slow ? 1.6 : 1));
        }
        playBtn.onclick = () => {
          if (!frames().length) { api.say("Nothing to play yet. Press <b>Run tests</b> first, and make sure your code calls <code>trace</code> (the starter already does).", "think"); return; }
          if (playing) { stop(); return; }
          if (pos >= frames().length) showFrame(0);
          playing = true; playBtn.textContent = "Pause"; step();
        };
        qs("[data-next]", vis).onclick = () => { stop(); showFrame(pos + 1, true); if (pos >= frames().length && results[sel] && results[sel].pass && !watched && cfg.watch) { watched = true; api.done("watch"); } };
        qs("[data-prev]", vis).onclick = () => { stop(); showFrame(pos - 1, false); };
        qs("[data-first]", vis).onclick = () => { stop(); showFrame(0); };
        scrub.oninput = () => { stop(); showFrame(+scrub.value, false); };

        // ----- tests -----
        const testsEl = qs("[data-tests]", testCard);
        // ----- example input and output (the selected test; after a run, what your code returned too) -----
        const exEl = qs("[data-ex]", card);
        function drawExample() {
          const t = tests[sel], r = results[sel];
          const code = (v) => `<code>${esc(show(v, 700))}</code>`;
          const inputs = t.args.map((a, i) => `<div class="cl-exrow"><span>${esc(params[i] || "arg" + (i + 1))}</span>${code(a)}</div>`).join("");
          exEl.innerHTML = `<div class="cl-exh"><b>Example</b><span class="cl-extabs">${tests.map((x, i) => `<button class="cl-extab ${i === sel ? "on" : ""}" data-x="${i}" title="${esc(x.name)}">${i + 1}</button>`).join("")}</span><span class="faint">${esc(t.name)}</span></div>
            <div class="cl-exbody"><div class="cl-excol"><small>Input</small>${inputs}</div><div class="cl-excol"><small>Expected output</small><div class="cl-exrow out">${code(t.expect)}</div>${r ? `<small>Your code returned</small><div class="cl-exrow ${r.pass ? "okk" : "bad"}">${r.error ? `<code>${esc(r.error)}</code>` : code(r.out)}</div>` : ""}</div></div>`;
          qsa("[data-x]", exEl).forEach((b) => (b.onclick = () => select(+b.dataset.x)));
        }
        function drawTests() {
          testsEl.innerHTML = tests.map((t, i) => {
            const r = results[i], st = !r ? "idle" : r.pass ? "ok" : "no";
            return `<button class="cl-test ${st} ${i === sel ? "sel" : ""}" data-i="${i}"><span class="cl-dot">${st === "ok" ? "✓" : st === "no" ? "✗" : i + 1}</span><span class="cl-tt"><b>${t.name}</b>${!r ? `<span>${t.desc || ""}</span>` : r.pass ? `<span>got <code>${esc(show(r.out))}</code></span>` : r.error ? `<span class="bad">${esc(r.error)}</span>` : `<span class="bad">got <code>${esc(show(r.out))}</code>, wanted <code>${esc(show(t.expect))}</code></span>`}</span></button>`;
          }).join("");
          qsa("[data-i]", testsEl).forEach((b) => (b.onclick = () => select(+b.dataset.i)));
          const ok = results.filter((r) => r && r.pass).length; qs("[data-tsum]", testCard).textContent = results.some(Boolean) ? `${ok} of ${tests.length} pass` : "";
        }
        function select(i) {
          stop(); sel = i;
          qs("[data-tname]", vis).textContent = tests[i].name;
          sandbox.innerHTML = ""; handle = cfg.scene.build(sandbox, tests[i]);
          drawTests(); drawExample(); showFrame(0);
        }
        async function run() {
          if (busy) return; busy = true; stop();
          const btn = qs("[data-run]", card); btn.disabled = true; btn.textContent = "Running…";
          const code = ta.value; let pass = 0;
          for (let i = 0; i < tests.length; i++) {
            const t = tests[i], r = await runOne(code, cfg.entry, t.args);
            if (!card.isConnected) return;
            r.pass = r.ok && (t.cmp ? t.cmp(r.out, t.expect) : same(r.out, t.expect));
            if (r.pass) pass++;
            results[i] = r;
            if (r.pass) api.done("t" + i);
          }
          busy = false; btn.disabled = false; btn.textContent = "Run tests";
          const firstBad = results.findIndex((r) => !r.pass);
          sel = firstBad >= 0 ? firstBad : sel; select(sel);
          if (frames().length) { playing = true; playBtn.textContent = "Pause"; showFrame(0); step(); }
          if (pass === tests.length) api.say(`<b>All ${tests.length} tests pass!</b> That's a working ${cfg.noun || "algorithm"} you wrote yourself.`, "love");
          else if (results.some((r) => r && r.slow)) api.say("One run never finished. Check that every loop gets closer to stopping.", "think");
          else if (results[firstBad].error) api.say(`Your code hit an error: <b>${esc(results[firstBad].error)}</b>`, "sad");
          else api.say(`${pass} of ${tests.length} pass. Look at the failing test: what did your code return, and what was wanted?`, pass ? "think" : "sad");
          if (fx() && fx().ok && pass === tests.length) fx().celebrate(btn, { silent: true });
          if (N.sfx) N.sfx.play(pass === tests.length ? "correct" : "wrong");
        }
        qs("[data-run]", card).onclick = run;
        qs("[data-reset]", card).onclick = () => { ta.value = cfg.starter; paint(); api.say("Code reset to the starter.", "idle"); };
        qs("[data-use]", card).onclick = () => { ta.value = cfg.solution; paint(); qs(".cl-sol", card).open = false; api.say("Solution loaded. Press <b>Run tests</b>, then step through it and work out why each line is there.", "happy"); };
        qs("[data-hint]", card).onclick = () => {
          const hs = cfg.hints || []; if (!hs.length) return;
          const box = qs("[data-hintbox]", card); box.innerHTML = `<b>Hint ${hintN % hs.length + 1} of ${hs.length}:</b> ${hs[hintN % hs.length]}`; hintN++;
          fx() && fx().ok && fx().enter(box, { y: 6, dur: 0.2 });
        };
        if (!(cfg.hints || []).length) qs("[data-hint]", card).hidden = true;
        select(0);
      },
    });
  }

  N.codelab = codelab;
  N.codelab.show = show;
})();
