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
   Keys: Ctrl/Cmd+Enter runs the tests. Tab indents, so Esc is the keyboard way out: it blurs the editor and the keydown is consumed
   (preventDefault, stopPropagation, `e.clEsc = true`), so the player's Esc ("Wait, don't go!") does not also open. A second Esc, now
   outside the editor, reaches the player as usual. The hint under the editor (.cl-kbd) says so.
   Python loading is watched (js/codelab/python.js): PY.bootMs (default 75 s, restarts on every worker message) after which a stalled
   start is abandoned and the run reports noPy; the first noPy stops the test loop.
   All classes are cl- prefixed (css/workshop/). */
(function () {
  const lab = (NIC.shared.engineCodelab = NIC.shared.engineCodelab || {});

  const N = NIC;
  const fx = () => N.fx;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---------- value formatting / comparison ----------
  function show(v, max = 140) {
    if (v === undefined) return "nothing (no return value)";
    let s;
    try {
      s = JSON.stringify(v, (k, x) =>
        x === Infinity
          ? "∞"
          : x === -Infinity
            ? "-∞"
            : typeof x === "number" && isNaN(x)
              ? "not a number"
              : x instanceof Set
                ? [...x]
                : x,
      );
    } catch {
      s = String(v);
    }
    if (s === undefined) s = String(v);
    return s.length > max ? s.slice(0, max - 3) + "…" : s;
  }
  function same(a, b) {
    if (typeof a === "number" && typeof b === "number")
      return a === b || (isNaN(a) && isNaN(b)) || Math.abs(a - b) < 1e-9;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
    if (a && b && typeof a === "object" && typeof b === "object") {
      const ka = Object.keys(a),
        kb = Object.keys(b);
      return ka.length === kb.length && ka.every((k) => k in b && same(a[k], b[k]));
    }
    return a === b;
  }
  Object.assign(lab, { esc, fx, same, show });
})();
