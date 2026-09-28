/* Theme: "system" (default), "light" or "dark". Stored per device as csl.theme (outside nic.*, so it is neither synced
   nor wiped by Reset). index.html applies the stored choice before first paint; this file keeps html[data-theme-now]
   = the resolved theme, updates the browser's theme-color, and tells the app to redraw canvases when it changes. */
(function () {
  const root = document.documentElement;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const KEY = "csl.theme";
  // Theme reveal: the circle grows over this long. A full-screen wipe, so it runs longer than UI motion (--dur-* tops out at 420ms).
  const REVEAL_MS = 480, REVEAL_EASE = "cubic-bezier(0.23, 1, 0.32, 1)"; // --ease-out
  const get = () => { try { const t = localStorage.getItem(KEY); return t === "light" || t === "dark" ? t : "system"; } catch { return "system"; } };
  const resolved = () => (get() === "system" ? (mq.matches ? "dark" : "light") : get());
  const listeners = [];

  function apply() {
    const t = get(), now = resolved();
    if (t === "system") delete root.dataset.theme; else root.dataset.theme = t;
    const changed = root.dataset.themeNow !== now;
    root.dataset.themeNow = now;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = now === "dark" ? "#131f24" : "#58cc02";
    if (changed) listeners.forEach((f) => { try { f(now); } catch (e) { console.error(e); } });
  }

  /** Switch theme. With `from` (the button pressed) the new theme grows out of it as a circle, where supported. */
  function set(t, { from } = {}) {
    try { if (t === "system") localStorage.removeItem(KEY); else localStorage.setItem(KEY, t); } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flips = resolved() !== root.dataset.themeNow;
    if (!flips || reduce || !document.startViewTransition || !from) { apply(); return; }
    const r = from.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add("theme-vt");
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: REVEAL_EASE, pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
    vt.finished.finally(() => root.classList.remove("theme-vt"));
  }

  mq.addEventListener ? mq.addEventListener("change", apply) : mq.addListener(apply);
  apply();
  window.NIC = window.NIC || {};
  NIC.theme = { get, set, now: resolved, onChange: (f) => listeners.push(f) };
})();
