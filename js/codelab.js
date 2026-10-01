/* Code lab engine: write a few lines of real Python, run tests, and watch YOUR code animate.
     NIC.codelab(root, life, {
       who, intro,
       brief:   "html shown above the editor",
       starter: "def solve(x):\n    # YOUR CODE: …\n    pass",    // a comment containing YOUR CODE is highlighted as a blank
       entry:   "solve",                                              // the Python function the tests call
       tests:   [{ name, desc, args:[…], expect, cmp?(got, want)->bool, view? }],   // view: anything the scene needs for this test
       hints:   ["nudge 1", "bigger nudge 2"],
       solution:"full working source",
       scene:   { build(stage, test) -> handle, frame(handle, f, {i, animate, frames, test}), reset(handle, test), caption?(f, {i, frames, test}) -> html },
       watch:   true,          // add a final mission: play a passing run's trace to the end
       missions: [...]         // optional extra missions; tests automatically give one mission each (ids t0, t1, …)
     })
   The learner's code may call trace({...}) with a Python dict (any plain dict, optionally with a `cap` caption) to record a frame. The trace for the
   selected test is replayed on the stage with play / step / scrub controls; scene.frame() redraws from the frame (idempotent).
   Python is real CPython (Pyodide, vendor/pyodide) in a Web Worker: 2 s limit per test, so an infinite loop can't freeze the page.
   Results come back as JS: dict -> object, list/tuple -> array, set -> Set, float('inf') -> Infinity. Needs http(s), not file://.
   The editor behaves like an IDE: auto-closing pairs, indent after a colon, Tab = 4 spaces, Ctrl+/ comments, autocomplete.
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

  // ---------- syntax highlight (tiny, good enough for short Python) ----------
  const TOK = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(def|return|if|elif|else|for|while|in|not|and|or|is|break|continue|pass|import|from|as|class|lambda|None|True|False|with|try|except|finally|raise|yield|global|nonlocal|del|assert)\b|\b(\d+(?:\.\d+)?)\b/g;
  function highlight(src) {
    return esc(src).replace(TOK, (m, c, s, k, n) => c ? `<i class="${/YOUR CODE/.test(c) ? "t" : "c"}">${c}</i>` : s ? `<i class="s">${s}</i>` : k ? `<i class="k">${k}</i>` : `<i class="n">${n}</i>`) + "\n";
  }

  // ---------- Python: real CPython (Pyodide, vendored in vendor/pyodide) running in a Web Worker ----------
  // One worker is shared by every code lab and starts loading as soon as a lab opens. An infinite loop is stopped after 2 s
  // by terminating the worker (it restarts in the background). Python values come back as plain JS: dict -> object,
  // list/tuple -> array, set -> Set, float("inf") -> Infinity.
  const PY_WORKER = `
    let py = null;
    const conv = (x) => (x && x.toJs ? x.toJs({ dict_converter: Object.fromEntries, create_pyproxies: false }) : x);
    const frames = () => { try { return conv(py.globals.get("_frames")); } catch (e) { return []; } };
    const nice = (err) => {
      const msg = String((err && err.message) || err), lines = msg.trim().split("\\n"), last = lines[lines.length - 1] || msg;
      const at = [...msg.matchAll(/File "<exec>", line (\\d+)/g)].pop();
      return (at ? "Line " + at[1] + ": " : "") + last;
    };
    onmessage = async (e) => {
      const m = e.data;
      try {
        if (m.type === "init") {
          const mod = await import(m.base + "pyodide.mjs");
          py = await mod.loadPyodide({ indexURL: m.base });
          py.runPython("_frames = []\\ndef trace(f):\\n    if len(_frames) < 4000:\\n        _frames.append(f)\\n");
          postMessage({ type: "ready" }); return;
        }
        py.runPython("_frames.clear()");
        const ns = py.globals.get("dict")();
        ns.set("trace", py.globals.get("trace"));
        py.runPython(m.code, { globals: ns });
        const fn = ns.get(m.entry);
        if (!fn) { postMessage({ type: "done", ok: false, error: "Couldn't find a function called " + m.entry + ". Keep its name as it is.", frames: [] }); return; }
        const out = conv(fn(...m.args.map((a) => py.toPy(a))));
        postMessage({ type: "done", ok: true, out: out === undefined ? null : out, frames: frames() });
      } catch (err) {
        if (m.type === "init") postMessage({ type: "fail", error: String(err && err.message || err) });
        else postMessage({ type: "done", ok: false, error: nice(err), frames: frames() });
      }
    };`;
  const PY = { w: null, ready: null, loaded: false, error: "" };
  let blobUrl = null;
  function pyBoot() {
    if (PY.ready) return PY.ready;
    PY.ready = new Promise((resolve) => {
      let w = null;
      try { blobUrl = blobUrl || URL.createObjectURL(new Blob([PY_WORKER], { type: "text/javascript" })); w = new Worker(blobUrl, { type: "module" }); } catch (e) { PY.error = "this browser couldn't start a worker"; return resolve(null); }
      PY.w = w;
      w.onmessage = (e) => { if (e.data.type === "ready") { PY.loaded = true; resolve(w); } else if (e.data.type === "fail") { PY.error = e.data.error; resolve(null); } };
      w.onerror = () => { PY.error = "the Python files couldn't be loaded"; resolve(null); };
      try { w.postMessage({ type: "init", base: new URL("vendor/pyodide/", document.baseURI).href }); } catch (e) { PY.error = String(e); resolve(null); }
    });
    return PY.ready;
  }
  function pyReset() { try { PY.w && PY.w.terminate(); } catch (e) { /* already gone */ } PY.w = null; PY.ready = null; PY.loaded = false; }
  async function runOne(code, entry, args, limit = 2000) {
    const w = await pyBoot();
    if (!w) { pyReset(); return { ok: false, error: `Python couldn't start (${PY.error || "unknown reason"}). The code labs need the site opened over http(s), not as a file.`, frames: [], noPy: true }; }
    return new Promise((resolve) => {
      const t = setTimeout(() => { pyReset(); pyBoot(); resolve({ ok: false, error: "Took longer than 2 seconds. Is there a loop that never ends?", frames: [], slow: true }); }, limit);
      w.onmessage = (e) => { if (e.data.type === "done") { clearTimeout(t); resolve(e.data); } };
      w.onerror = (e) => { clearTimeout(t); resolve({ ok: false, error: e.message || "Python stopped unexpectedly.", frames: [] }); };
      try { w.postMessage({ type: "run", code, entry, args }); } catch (e) { clearTimeout(t); resolve({ ok: false, error: "Those test inputs couldn't be sent to Python.", frames: [] }); }
    });
  }

  // ---------- autocomplete ----------
  const KW = ["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "is", "break", "continue", "pass", "import", "from", "as", "lambda", "None", "True", "False", "try", "except", "raise"];
  const GLOBALS = ["len", "range", "min", "max", "sum", "sorted", "reversed", "enumerate", "zip", "map", "filter", "abs", "round", "int", "float", "str", "list", "dict", "set", "tuple", "print", "isinstance", "any", "all", "math", "heapq", "trace"];
  const MEMBERS = {
    math: [["sqrt", "m"], ["exp", "m"], ["log", "m"], ["floor", "m"], ["ceil", "m"], ["fabs", "m"], ["isclose", "m"], ["inf", "p"], ["pi", "p"], ["e", "p"]],
    heapq: [["heappush", "m"], ["heappop", "m"], ["heapify", "m"], ["nsmallest", "m"]],
    _: [["append", "m"], ["pop", "m"], ["extend", "m"], ["insert", "m"], ["remove", "m"], ["sort", "m"], ["reverse", "m"], ["index", "m"], ["count", "m"], ["copy", "m"], ["clear", "m"],
        ["get", "m"], ["items", "m"], ["keys", "m"], ["values", "m"], ["update", "m"], ["setdefault", "m"], ["add", "m"], ["discard", "m"], ["union", "m"], ["intersection", "m"],
        ["join", "m"], ["split", "m"], ["strip", "m"], ["format", "m"], ["lower", "m"], ["upper", "m"], ["startswith", "m"], ["endswith", "m"]],
  };
  const SNIPPETS = [
    ["for", "for item in items:\n    |", "snippet"], ["fori", "for i in range(n):\n    |", "snippet"], ["forenum", "for i, x in enumerate(items):\n    |", "snippet"],
    ["if", "if cond:\n    |", "snippet"], ["ifelse", "if cond:\n    |\nelse:\n    ", "snippet"], ["while", "while cond:\n    |", "snippet"], ["def", "def name(args):\n    |", "snippet"],
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

  /** IDE-style typing for the Python code box: auto-closing pairs, type-over, wrap selection, smart Enter (indent after ":"),
      indent/outdent by 4 spaces, comment toggle (Ctrl/Cmd + /), backspace over a whole indent, auto-dedent for else/elif/except,
      and pair-aware Backspace. Uses execCommand so undo (Ctrl+Z) still works. */
  function editorKeys(ta, run, ac) {
    const IND = "    ";
    const OPEN = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" }, CLOSERS = new Set([")", "]", "}", '"', "'"]);
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

      if (mod && e.key === "/") { // toggle # comments on every selected line
        e.preventDefault();
        const [s0, e0] = blockOf(), lines = v.slice(s0, e0).split("\n"), live = lines.filter((l) => l.trim());
        const off = live.length && live.every((l) => /^\s*#/.test(l));
        const ind = Math.min(...live.map((l) => l.match(/^\s*/)[0].length), 1e9);
        const out = lines.map((l) => (!l.trim() ? l : off ? l.replace(/^(\s*)# ?/, "$1") : l.slice(0, ind) + "# " + l.slice(ind))).join("\n");
        put(s0, e0, out); caret(s0, s0 + out.length); return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const multi = v.slice(a, b).includes("\n");
        if (multi || e.shiftKey) { // indent or outdent whole lines
          const [s0, e0] = blockOf(), lines = v.slice(s0, e0).split("\n");
          const out = lines.map((l) => (e.shiftKey ? l.replace(/^ {1,4}/, "") : l.trim() ? IND + l : l)).join("\n");
          put(s0, e0, out); caret(s0, s0 + out.length);
        } else put(a, b, IND);
        return;
      }

      if (e.key === "Enter" && !e.shiftKey && !mod) { // keep indent; indent after ":"; open a block between ( ) [ ] { }
        e.preventDefault();
        const line = v.slice(lineStart(a), a), code = line.replace(/#.*$/, "").trimEnd();
        let ind = line.match(/^\s*/)[0];
        const prev = v[a - 1], next = v[b];
        if (prev && OPEN[prev] && OPEN[prev] === next && prev !== '"' && prev !== "'") { put(a, b, "\n" + ind + IND + "\n" + ind); caret(a + 1 + ind.length + IND.length); return; }
        if (/:$/.test(code)) ind += IND;
        else if (/^\s*(return|break|continue|pass|raise)\b/.test(line) && ind.length >= 4) ind = ind.slice(4);
        put(a, b, "\n" + ind); return;
      }

      if (e.key === "Backspace" && a === b && a > 0) {
        if (OPEN[v[a - 1]] && OPEN[v[a - 1]] === v[a]) { e.preventDefault(); put(a - 1, a + 1, ""); return; } // delete an empty pair together
        const before = v.slice(lineStart(a), a);
        if (before && !before.trim()) { e.preventDefault(); const n = before.length % 4 || 4; put(a - n, a, ""); return; } // back over one indent level
      }

      if (mod || e.altKey || e.key.length !== 1) return;
      const k = e.key;

      if (a === b && CLOSERS.has(k) && v[a] === k) { e.preventDefault(); caret(a + 1); return; } // type over a closer

      if (k === ":" && a === b) { // else / elif / except / finally line up with their if / try
        const ls = lineStart(a), before = v.slice(ls, a);
        if (/^ {4,}(else|elif\b.*|except\b.*|finally)$/.test(before)) { e.preventDefault(); put(ls, a, before.slice(4) + ":"); return; }
      }

      if (OPEN[k]) {
        const close = OPEN[k];
        if (a !== b) { e.preventDefault(); const inner = v.slice(a, b); put(a, b, k + inner + close); caret(a + 1, a + 1 + inner.length); return; } // wrap the selection
        const quote = k === '"' || k === "'";
        if (quote && (word(v[a - 1]) || word(v[a]) || v[a - 1] === k)) return;       // an apostrophe in a word, or closing a string
        if (!quote && v[a] && !/[\s)\]};,.:]/.test(v[a])) return;                      // only pair before whitespace or a closer
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
          <div class="wk-row cl-bar"><button class="btn primary" data-run>Run tests</button><button class="btn" data-hint>Hint</button><span class="cl-hintn faint"></span><span class="cl-pystat" data-py>Python: loading…</span><span class="wk-sp" style="flex:1"></span><details class="cl-sol"><summary class="btn small ghost">Show solution</summary><pre class="cl-solpre"></pre><button class="btn small" data-use>Use it</button></details></div>
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
        const params = (((cfg.starter.match(/def\s+\w+\s*\(([^)]*)\)/) || [])[1]) || "").split(",").map((x) => x.trim().split(/[=:]/)[0].trim()).filter(Boolean);
        const pyChip = qs("[data-py]", card), pyState = (ok) => { if (!pyChip.isConnected) return; pyChip.textContent = ok ? "Python ready" : "Python unavailable"; pyChip.classList.toggle("ok", !!ok); pyChip.classList.toggle("bad", !ok); };
        if (PY.loaded) pyState(true); pyBoot().then((w) => pyState(!!w));
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
          const btn = qs("[data-run]", card); btn.disabled = true; btn.textContent = PY.loaded ? "Running…" : "Loading Python…";
          const code = ta.value; let pass = 0;
          for (let i = 0; i < tests.length; i++) {
            const t = tests[i], r = await runOne(code, cfg.entry, t.args); btn.textContent = "Running…";
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
