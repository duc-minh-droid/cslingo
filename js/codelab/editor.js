(function () {
  const lab = (NIC.shared.engineCodelab = NIC.shared.engineCodelab || {});

  /** IDE-style typing for the Python code box: auto-closing pairs, type-over, wrap selection, smart Enter (indent after ":"),
      indent/outdent by 4 spaces, comment toggle (Ctrl/Cmd + /), backspace over a whole indent, auto-dedent for else/elif/except,
      and pair-aware Backspace. Uses execCommand so undo (Ctrl+Z) still works.
      Keyboard exit: Tab indents, so Escape blurs the editor (see the Escape branch) and is not passed on to the player. */
  function editorKeys(ta, run, ac) {
    const IND = "    ";
    const OPEN = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" },
      CLOSERS = new Set([")", "]", "}", '"', "'"]);
    const word = (c) => !!c && /[A-Za-z0-9_$]/.test(c);
    const put = (from, to, text) => {
      ta.focus();
      ta.setSelectionRange(from, to);
      let ok;
      try {
        ok = text === "" ? document.execCommand("delete") : document.execCommand("insertText", false, text);
      } catch {
        ok = false;
      }
      if (!ok) {
        ta.setRangeText(text, from, to, "end");
        ta.dispatchEvent(new Event("input"));
      }
    };
    const caret = (a, b = a) => ta.setSelectionRange(a, b);
    const lineStart = (i) => ta.value.lastIndexOf("\n", i - 1) + 1;
    const lineEnd = (i) => {
      const k = ta.value.indexOf("\n", i);
      return k < 0 ? ta.value.length : k;
    };
    const blockOf = () => {
      const v = ta.value,
        a = ta.selectionStart,
        b = ta.selectionEnd;
      return [lineStart(a), lineEnd(b > a && v[b - 1] === "\n" ? b - 1 : b)];
    };

    ta.addEventListener("keydown", (e) => {
      if (e.isComposing) return;
      if (ac && ac.key(e)) return;
      if (e.key === "Escape") {
        // Tab indents in here, so Esc is the way out: it blurs the editor (Esc, then Tab, carries on to the next control).
        // The press is consumed (preventDefault + stopPropagation, and e.clEsc = true for any listener that runs earlier) so
        // the lesson player's own Esc ("Wait, don't go!") only fires from outside the editor, e.g. on the second press.
        e.preventDefault();
        e.stopPropagation();
        e.clEsc = true;
        ta.blur();
        return;
      }
      const v = ta.value,
        a = ta.selectionStart,
        b = ta.selectionEnd,
        mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === "Enter") {
        e.preventDefault();
        run();
        return;
      }

      if (mod && e.key === "/") {
        // toggle # comments on every selected line
        e.preventDefault();
        const [s0, e0] = blockOf(),
          lines = v.slice(s0, e0).split("\n"),
          live = lines.filter((l) => l.trim());
        const off = live.length && live.every((l) => /^\s*#/.test(l));
        const ind = Math.min(...live.map((l) => l.match(/^\s*/)[0].length), 1e9);
        const out = lines
          .map((l) => (!l.trim() ? l : off ? l.replace(/^(\s*)# ?/, "$1") : l.slice(0, ind) + "# " + l.slice(ind)))
          .join("\n");
        put(s0, e0, out);
        caret(s0, s0 + out.length);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const multi = v.slice(a, b).includes("\n");
        if (multi || e.shiftKey) {
          // indent or outdent whole lines
          const [s0, e0] = blockOf(),
            lines = v.slice(s0, e0).split("\n");
          const out = lines.map((l) => (e.shiftKey ? l.replace(/^ {1,4}/, "") : l.trim() ? IND + l : l)).join("\n");
          put(s0, e0, out);
          caret(s0, s0 + out.length);
        } else put(a, b, IND);
        return;
      }

      if (e.key === "Enter" && !e.shiftKey && !mod) {
        // keep indent; indent after ":"; open a block between ( ) [ ] { }
        e.preventDefault();
        const line = v.slice(lineStart(a), a),
          code = line.replace(/#.*$/, "").trimEnd();
        let ind = line.match(/^\s*/)[0];
        const prev = v[a - 1],
          next = v[b];
        if (prev && OPEN[prev] && OPEN[prev] === next && prev !== '"' && prev !== "'") {
          put(a, b, "\n" + ind + IND + "\n" + ind);
          caret(a + 1 + ind.length + IND.length);
          return;
        }
        if (/:$/.test(code)) ind += IND;
        else if (/^\s*(return|break|continue|pass|raise)\b/.test(line) && ind.length >= 4) ind = ind.slice(4);
        put(a, b, "\n" + ind);
        return;
      }

      if (e.key === "Backspace" && a === b && a > 0) {
        if (OPEN[v[a - 1]] && OPEN[v[a - 1]] === v[a]) {
          e.preventDefault();
          put(a - 1, a + 1, "");
          return;
        } // delete an empty pair together
        const before = v.slice(lineStart(a), a);
        if (before && !before.trim()) {
          e.preventDefault();
          const n = before.length % 4 || 4;
          put(a - n, a, "");
          return;
        } // back over one indent level
      }

      if (mod || e.altKey || e.key.length !== 1) return;
      const k = e.key;

      if (a === b && CLOSERS.has(k) && v[a] === k) {
        e.preventDefault();
        caret(a + 1);
        return;
      } // type over a closer

      if (k === ":" && a === b) {
        // else / elif / except / finally line up with their if / try
        const ls = lineStart(a),
          before = v.slice(ls, a);
        if (/^ {4,}(else|elif\b.*|except\b.*|finally)$/.test(before)) {
          e.preventDefault();
          put(ls, a, before.slice(4) + ":");
          return;
        }
      }

      if (OPEN[k]) {
        const close = OPEN[k];
        if (a !== b) {
          e.preventDefault();
          const inner = v.slice(a, b);
          put(a, b, k + inner + close);
          caret(a + 1, a + 1 + inner.length);
          return;
        } // wrap the selection
        const quote = k === '"' || k === "'";
        if (quote && (word(v[a - 1]) || word(v[a]) || v[a - 1] === k)) return; // an apostrophe in a word, or closing a string
        if (!quote && v[a] && !/[\s)\]};,.:]/.test(v[a])) return; // only pair before whitespace or a closer
        e.preventDefault();
        put(a, a, k + close);
        caret(a + 1);
      }
    });
    if (ac) {
      ta.addEventListener("input", (e) => {
        if (!e.inputType || /^(insert|delete)/.test(e.inputType)) ac.update();
      });
      ta.addEventListener("click", ac.close);
    }
  }
  Object.assign(lab, { editorKeys });
})();
