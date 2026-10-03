(function () {
  const core = (NIC.shared.engineCore = NIC.shared.engineCore || {});
  const { el, qs, qsa } = core;

  /** Lifecycle helper: timers and rAF loops cleaned automatically when the route changes. */
  function lifecycle() {
    const timers = new Set(),
      frames = new Set(),
      cleanups = [];
    return {
      interval(fn, ms) {
        const id = setInterval(fn, ms);
        timers.add(id);
        return () => {
          clearInterval(id);
          timers.delete(id);
        };
      },
      timeout(fn, ms) {
        const id = setTimeout(fn, ms);
        timers.add(id);
        return id;
      },
      frame(fn) {
        const id = requestAnimationFrame((t) => {
          frames.delete(id);
          fn(t);
        });
        frames.add(id);
        return id;
      },
      onCleanup(fn) {
        cleanups.push(fn);
      },
      onResize(fn) {
        window.addEventListener("nic:resize", fn);
        cleanups.push(() => window.removeEventListener("nic:resize", fn));
      },
      dispose() {
        timers.forEach((id) => {
          clearInterval(id);
          clearTimeout(id);
        });
        frames.forEach(cancelAnimationFrame);
        cleanups.forEach((f) => f());
      },
    };
  }

  function slider(label, min, max, step, value, fmtFn = (v) => v) {
    const node = el(
      `<label class="field">${label}<input type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output>${fmtFn(value)}</output></label>`,
    );
    const input = qs("input", node),
      out = qs("output", node);
    input.addEventListener("input", () => (out.textContent = fmtFn(+input.value)));
    Object.defineProperty(node, "value", {
      get: () => +input.value,
      set: (v) => {
        input.value = v;
        out.textContent = fmtFn(+v);
      },
    });
    node.onInput = (fn) => input.addEventListener("input", () => fn(+input.value));
    return node;
  }

  function seg(options, value, onChange) {
    const node = el(
      `<div class="seg">${options.map(([v, l]) => `<button data-v="${v}" class="${v === value ? "on" : ""}">${l}</button>`).join("")}</div>`,
    );
    qsa("button", node).forEach((b) =>
      b.addEventListener("click", () => {
        qsa("button", node).forEach((x) => x.classList.toggle("on", x === b));
        onChange(b.dataset.v);
      }),
    );
    return node;
  }
  Object.assign(core, { lifecycle, seg, slider });
})();
