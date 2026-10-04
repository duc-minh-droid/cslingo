(function () {
  const lab = (NIC.shared.engineCodelab = NIC.shared.engineCodelab || {});

  // ---------- Python: real CPython (Pyodide, vendored in vendor/pyodide) running in a Web Worker ----------
  // One worker is shared by every code lab and starts loading as soon as a lab opens. An infinite loop is stopped after 2 s
  // by terminating the worker (it restarts in the background). Python values come back as plain JS: dict -> object,
  // list/tuple -> array, set -> Set, float("inf") -> Infinity.
  // Loading Python is watched: the worker posts a "stage" message at each step (started, module fetched) and "ready" at the end, and
  // every message restarts a PY.bootMs clock. If the clock runs out the boot is abandoned (PY.ready is cleared, so the next run starts
  // a fresh one) and runOne() answers with noPy, so a stalled download can never leave "Loading Python…" on screen for ever.
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
          postMessage({ type: "stage" });
          const mod = await import(m.base + "pyodide.mjs");
          postMessage({ type: "stage" });
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
  const PY = { w: null, ready: null, loaded: false, error: "", bootMs: 75000 };
  let blobUrl = null;
  function pyBoot() {
    if (PY.ready) return PY.ready;
    PY.ready = new Promise((resolve) => {
      let w = null,
        timer = 0,
        over = false;
      const arm = () => {
        clearTimeout(timer);
        timer = setTimeout(() => fail("it took too long to load"), PY.bootMs);
      };
      const fail = (why) => {
        if (over) return;
        over = true;
        clearTimeout(timer);
        PY.error = why;
        if (PY.w === w) pyReset(); // stops this worker and clears PY.ready, so the next run starts a fresh boot
        resolve(null);
      };
      try {
        blobUrl = blobUrl || URL.createObjectURL(new Blob([PY_WORKER], { type: "text/javascript" }));
        w = new Worker(blobUrl, { type: "module" });
      } catch (e) {
        PY.error = "this browser couldn't start a worker";
        return resolve(null);
      }
      PY.w = w;
      w.onmessage = (e) => {
        if (over) return;
        arm(); // any message from the worker means it is alive and moving: restart the clock
        if (e.data.type === "ready") {
          over = true;
          clearTimeout(timer);
          PY.loaded = true;
          resolve(w);
        } else if (e.data.type === "fail") fail(e.data.error);
      };
      w.onerror = () => fail("the Python files couldn't be loaded");
      try {
        w.postMessage({ type: "init", base: new URL("vendor/pyodide/", document.baseURI).href });
        arm();
      } catch (e) {
        fail(String(e));
      }
    });
    return PY.ready;
  }
  function pyReset() {
    try {
      PY.w && PY.w.terminate();
    } catch (e) {
      /* already gone */
    }
    PY.w = null;
    PY.ready = null;
    PY.loaded = false;
  }
  async function runOne(code, entry, args, limit = 2000) {
    const w = await pyBoot();
    if (!w) {
      pyReset();
      return {
        ok: false,
        error: `Python couldn't start (${PY.error || "unknown reason"}). ${
          location.protocol === "file:"
            ? "The code labs need the site opened over http(s), not as a file."
            : "Check your connection, then press Run tests to try again."
        }`,
        frames: [],
        noPy: true,
      };
    }
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        pyReset();
        pyBoot();
        resolve({
          ok: false,
          error: "Took longer than 2 seconds. Is there a loop that never ends?",
          frames: [],
          slow: true,
        });
      }, limit);
      w.onmessage = (e) => {
        if (e.data.type === "done") {
          clearTimeout(t);
          resolve(e.data);
        }
      };
      w.onerror = (e) => {
        clearTimeout(t);
        resolve({ ok: false, error: e.message || "Python stopped unexpectedly.", frames: [] });
      };
      try {
        w.postMessage({ type: "run", code, entry, args });
      } catch (e) {
        clearTimeout(t);
        resolve({ ok: false, error: "Those test inputs couldn't be sent to Python.", frames: [] });
      }
    });
  }
  Object.assign(lab, { PY, pyBoot, runOne });
})();
