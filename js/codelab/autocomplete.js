(function () {
  const lab = (NIC.shared.engineCodelab = NIC.shared.engineCodelab || {});
  const { esc } = lab;
  const N = NIC,
    { el, qsa } = N;

  // ---------- autocomplete ----------
  const KW = [
    "def",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "in",
    "not",
    "and",
    "or",
    "is",
    "break",
    "continue",
    "pass",
    "import",
    "from",
    "as",
    "lambda",
    "None",
    "True",
    "False",
    "try",
    "except",
    "raise",
  ];
  const GLOBALS = [
    "len",
    "range",
    "min",
    "max",
    "sum",
    "sorted",
    "reversed",
    "enumerate",
    "zip",
    "map",
    "filter",
    "abs",
    "round",
    "int",
    "float",
    "str",
    "list",
    "dict",
    "set",
    "tuple",
    "print",
    "isinstance",
    "any",
    "all",
    "math",
    "heapq",
    "trace",
  ];
  const MEMBERS = {
    math: [
      ["sqrt", "m"],
      ["exp", "m"],
      ["log", "m"],
      ["floor", "m"],
      ["ceil", "m"],
      ["fabs", "m"],
      ["isclose", "m"],
      ["inf", "p"],
      ["pi", "p"],
      ["e", "p"],
    ],
    heapq: [
      ["heappush", "m"],
      ["heappop", "m"],
      ["heapify", "m"],
      ["nsmallest", "m"],
    ],
    _: [
      ["append", "m"],
      ["pop", "m"],
      ["extend", "m"],
      ["insert", "m"],
      ["remove", "m"],
      ["sort", "m"],
      ["reverse", "m"],
      ["index", "m"],
      ["count", "m"],
      ["copy", "m"],
      ["clear", "m"],
      ["get", "m"],
      ["items", "m"],
      ["keys", "m"],
      ["values", "m"],
      ["update", "m"],
      ["setdefault", "m"],
      ["add", "m"],
      ["discard", "m"],
      ["union", "m"],
      ["intersection", "m"],
      ["join", "m"],
      ["split", "m"],
      ["strip", "m"],
      ["format", "m"],
      ["lower", "m"],
      ["upper", "m"],
      ["startswith", "m"],
      ["endswith", "m"],
    ],
  };
  const SNIPPETS = [
    ["for", "for item in items:\n    |", "snippet"],
    ["fori", "for i in range(n):\n    |", "snippet"],
    ["forenum", "for i, x in enumerate(items):\n    |", "snippet"],
    ["if", "if cond:\n    |", "snippet"],
    ["ifelse", "if cond:\n    |\nelse:\n    ", "snippet"],
    ["while", "while cond:\n    |", "snippet"],
    ["def", "def name(args):\n    |", "snippet"],
  ];

  /** Popup list of suggestions at the caret. Identifiers from the code, keywords, built-ins, `.` members and a few snippets. */
  function autocomplete(ta, wrap, extra = []) {
    const pop = el(`<div class="cl-ac" role="listbox" hidden></div>`);
    document.body.appendChild(pop);
    const probe = el(`<span class="cl-probe" aria-hidden="true">MMMMMMMMMM</span>`);
    wrap.appendChild(probe);
    let items = [],
      at = 0,
      from = 0,
      skip = false,
      moved = false;
    const close = () => {
      pop.hidden = true;
      items = [];
    };
    const cw = () => probe.getBoundingClientRect().width / 10 || 7.8;
    function candidates(force) {
      const v = ta.value,
        pos = ta.selectionStart,
        before = v.slice(0, pos);
      const m = before.match(/(?:([A-Za-z_$][\w$]*)\s*\.\s*)?([A-Za-z_$][\w$]*)?$/);
      if (!m || (!m[2] && !m[0].includes("."))) return null;
      const prefix = m[2] || "",
        pre = prefix.toLowerCase();
      const out = [];
      if (m[0].includes(".")) {
        // member access
        const list = MEMBERS[m[1]] || MEMBERS._;
        list.forEach(([n, k]) => {
          if (n.toLowerCase().startsWith(pre) && n !== prefix)
            out.push({ n, k, ins: k === "m" ? n + "()" : n, back: k === "m" ? 1 : 0 });
        });
        return { out: out.slice(0, 9), start: pos - prefix.length };
      }
      if (prefix.length < 2 && !force) return null;
      const seen = new Set();
      SNIPPETS.forEach(([n, body, k]) => {
        if (n.startsWith(pre)) {
          out.push({ n, k, snip: body });
          seen.add(n);
        }
      });
      const words = new Set();
      (v.match(/[A-Za-z_$][\w$]*/g) || []).forEach((w) => words.add(w));
      extra.forEach((w) => words.add(w));
      [...words].sort().forEach((w) => {
        if (
          !seen.has(w) &&
          w !== prefix &&
          w.toLowerCase().startsWith(pre) &&
          !KW.includes(w) &&
          !GLOBALS.includes(w)
        ) {
          out.push({ n: w, k: "var", ins: w });
          seen.add(w);
        }
      });
      [...KW, ...GLOBALS].forEach((w) => {
        if (!seen.has(w) && w !== prefix && w.toLowerCase().startsWith(pre)) {
          out.push({ n: w, k: KW.includes(w) ? "kw" : "api", ins: w });
          seen.add(w);
        }
      });
      // drop the word being typed if it is the only match of itself
      return out.length ? { out: out.slice(0, 9), start: pos - prefix.length } : null;
    }
    function place() {
      const v = ta.value,
        pos = ta.selectionStart,
        line = v.slice(0, pos).split("\n"),
        r = wrap.getBoundingClientRect();
      const x = r.left + 14 + (line[line.length - 1].length - (pos - from)) * cw() - ta.scrollLeft,
        y = r.top + 12 + line.length * 21 - ta.scrollTop;
      pop.style.left = `${Math.max(8, Math.min(x, innerWidth - 230))}px`;
      pop.style.top = `${Math.min(y + 4, innerHeight - 230)}px`;
    }
    function draw() {
      pop.innerHTML = items
        .map(
          (c, i) =>
            `<div class="cl-ai ${i === at ? "on" : ""}" role="option" data-i="${i}"><i class="k-${c.k}">${{ kw: "kw", var: "x", api: "ƒ", m: "ƒ", p: "•", snippet: "⌘" }[c.k]}</i><b>${esc(c.n)}</b>${c.k === "snippet" ? `<span>snippet</span>` : ""}</div>`,
        )
        .join("");
      qsa(".cl-ai", pop).forEach((d) => {
        d.onmousedown = (e) => {
          e.preventDefault();
          accept(+d.dataset.i);
        };
      });
    }
    function update(force) {
      if (skip) {
        skip = false;
        return close();
      }
      if (document.activeElement !== ta || ta.selectionStart !== ta.selectionEnd) return close();
      const c = candidates(force === true);
      if (!c) return close();
      items = c.out;
      at = 0;
      moved = false;
      from = c.start;
      draw();
      pop.hidden = false;
      place();
    }
    function accept(i) {
      const c = items[i];
      if (!c) return;
      const pos = ta.selectionStart;
      close();
      skip = true;
      ta.focus();
      ta.setSelectionRange(from, pos);
      if (c.snip) {
        const line = ta.value.slice(ta.value.lastIndexOf("\n", from - 1) + 1, from),
          ind = (line.match(/^\s*/) || [""])[0];
        const body = c.snip.replace(/\n/g, "\n" + ind),
          k = body.indexOf("|"),
          text = body.replace("|", "");
        let ok;
        try {
          ok = document.execCommand("insertText", false, text);
        } catch {
          ok = false;
        }
        if (!ok) {
          ta.setRangeText(text, from, pos, "end");
          ta.dispatchEvent(new Event("input"));
        }
        ta.setSelectionRange(from + k, from + k);
      } else {
        let ok;
        try {
          ok = document.execCommand("insertText", false, c.ins);
        } catch {
          ok = false;
        }
        if (!ok) {
          ta.setRangeText(c.ins, from, pos, "end");
          ta.dispatchEvent(new Event("input"));
        }
        ta.setSelectionRange(from + c.ins.length - (c.back || 0), from + c.ins.length - (c.back || 0));
      }
    }
    ta.addEventListener("blur", close);
    ta.addEventListener("scroll", close);
    return {
      update,
      open: () => !pop.hidden,
      key(e) {
        // true when the key was used by the popup
        if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
          e.preventDefault();
          update(true);
          return true;
        }
        if (pop.hidden) return false;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          at = (at + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
          moved = true;
          draw();
          return true;
        }
        if (e.key === "Tab" || (e.key === "Enter" && moved)) {
          e.preventDefault();
          accept(at);
          return true;
        } // Enter only accepts after you arrowed to a choice
        if (e.key === "Enter") {
          close();
          return false;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          close();
          return true;
        }
        return false;
      },
      close,
      destroy() {
        pop.remove();
        probe.remove();
      },
    };
  }
  Object.assign(lab, { autocomplete });
})();
