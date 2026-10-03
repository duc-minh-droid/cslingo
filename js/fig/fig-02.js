(function () {
  const fig = (NIC.shared.engineFig = NIC.shared.engineFig || {});
  const { bars, cells, compare, cycle, flow, frames, graph, plot, surfaceCanvas, term } = fig;

  /**
   * Interactive 3-D surface. Draws at once with the canvas renderer above, then upgrades to a lit three.js mesh
   * (lazy-loaded) when WebGL is available. Same options and return value either way.
   */
  function surface3d(container, life, opts) {
    const holder = document.createElement("div");
    holder.className = "surface-box";
    container.appendChild(holder);
    let impl = surfaceCanvas(holder, life, opts),
      dead = false;
    life.onCleanup(() => (dead = true));
    const api = {
      setPoints(p) {
        opts = { ...opts, points: p };
        impl.setPoints(p);
      },
      setPath(p) {
        opts = { ...opts, path: p };
        impl.setPath(p);
      },
      redraw: () => impl.redraw(),
    };
    const gl = (() => {
      try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch (e) {
        return false;
      }
    })();
    // swap in the GL version once three.js is here, but never mid-drag (the canvas would vanish under the pointer)
    const upgrade = () => {
      if (dead || !holder.isConnected || !window.THREE) return;
      const v = impl.view ? impl.view() : null;
      if (v && v.dragging) {
        setTimeout(upgrade, 120);
        return;
      }
      const next = surfaceGL(holder, life, opts, v);
      if (next) impl = next;
    };
    if (gl && NIC.lazy)
      NIC.lazy("vendor/three.min.js")
        .then(upgrade)
        .catch(() => {});
    return api;
  }

  /** `view` = the canvas version's camera ({yaw, pitch, auto}); the GL mesh fades in over it from the same angle. */
  function surfaceGL(holder, life, opts, view) {
    const T = window.THREE,
      o = { height: 320, x: [0, 1], y: [0, 1], ...opts, n: Math.max(48, opts.n || 0) };
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return null;
    }
    const old = [...holder.children];
    const wrap = document.createElement("div");
    wrap.className = "viz surface3d surface-gl";
    wrap.style.height = o.height + "px";
    wrap.setAttribute("aria-label", opts.label || "3D surface: drag to rotate");
    // lay the GL box over the canvas one until it has faded in (see the crossfade after the first render)
    const oldCv = old.find((c) => c.tagName === "CANVAS");
    if (oldCv)
      wrap.style.cssText += `;position:absolute;left:${oldCv.offsetLeft}px;top:${oldCv.offsetTop}px;width:${oldCv.offsetWidth}px;opacity:0`;
    holder.appendChild(wrap);
    old.filter((c) => c !== oldCv).forEach((c) => c.remove()); // the old hint; the new one takes its place in the flow
    const hint = document.createElement("div");
    hint.className = "surface-hint";
    hint.textContent = "drag to rotate";
    holder.appendChild(hint);
    const labels = document.createElement("div");
    labels.className = "surface-labels";
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    wrap.appendChild(renderer.domElement);
    wrap.appendChild(labels);
    const scene = new T.Scene(),
      cam = new T.PerspectiveCamera(38, 1, 0.05, 20);
    scene.add(new T.HemisphereLight(0xffffff, 0x9aa7b0, 1.1));
    const sun = new T.DirectionalLight(0xffffff, 1.4);
    sun.position.set(1.2, 2.2, 0.8);
    scene.add(sun);

    // height field → mesh, with the same blue → green → gold ramp as the canvas version
    const n = o.n,
      H = 0.55,
      geo = new T.PlaneGeometry(1, 1, n, n);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position,
      Z = [];
    let zmin = Infinity,
      zmax = -Infinity;
    for (let k = 0; k < pos.count; k++) {
      const u = pos.getX(k) + 0.5,
        v = pos.getZ(k) + 0.5;
      const z = o.f(o.x[0] + (o.x[1] - o.x[0]) * u, o.y[0] + (o.y[1] - o.y[0]) * v);
      Z.push(z);
      zmin = Math.min(zmin, z);
      zmax = Math.max(zmax, z);
    }
    const nz = (z) => (z - zmin) / (zmax - zmin || 1);
    const cols = new Float32Array(pos.count * 3),
      lerp = (a, b, t) => a + (b - a) * t;
    const ramp = (t) =>
      (t < 0.6
        ? [lerp(110, 120, t / 0.6), lerp(190, 214, t / 0.6), lerp(245, 70, t / 0.6)]
        : [lerp(120, 255, (t - 0.6) / 0.4), lerp(214, 196, (t - 0.6) / 0.4), lerp(70, 0, (t - 0.6) / 0.4)]
      ).map((c) => c / 255);
    for (let k = 0; k < pos.count; k++) {
      const t = nz(Z[k]);
      pos.setY(k, t * H);
      const c = ramp(t);
      cols[k * 3] = c[0];
      cols[k * 3 + 1] = c[1];
      cols[k * 3 + 2] = c[2];
    }
    geo.setAttribute("color", new T.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    const mesh = new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide }));
    const wire = new T.LineSegments(
      new T.WireframeGeometry(geo),
      new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }),
    );
    const base = new T.Mesh(
      new T.PlaneGeometry(1.08, 1.08).rotateX(-Math.PI / 2),
      new T.MeshBasicMaterial({ color: new T.Color(NIC.colors().panel_2), transparent: true, opacity: 0.7 }),
    );
    base.position.y = -0.004;
    scene.add(base, mesh, wire);

    // points + path live in their own group so they can be swapped
    const extra = new T.Group();
    scene.add(extra);
    const toW = (xv, yv, lift = 0) =>
      new T.Vector3(
        (xv - o.x[0]) / (o.x[1] - o.x[0]) - 0.5,
        nz(o.f(xv, yv)) * H + lift,
        (yv - o.y[0]) / (o.y[1] - o.y[0]) - 0.5,
      );
    let pts = o.points || [],
      path = o.path || [],
      tags = [];
    let yaw = view ? view.yaw : -0.7,
      pitch = view ? Math.max(0.12, Math.min(1.4, view.pitch)) : 0.62,
      auto = view ? view.auto : !NIC.fx.reduce(),
      drag = null,
      dirty = true,
      W = 0;
    if (!auto) hint.style.opacity = "0";
    const disposeGroup = () => {
      extra.children.slice().forEach((c) => {
        extra.remove(c);
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    };
    function rebuild() {
      disposeGroup();
      labels.innerHTML = "";
      tags = [];
      if (path.length > 1) {
        const curve = new T.CatmullRomCurve3(path.map(([xv, yv]) => toW(xv, yv, 0.012)));
        extra.add(
          new T.Mesh(
            new T.TubeGeometry(curve, Math.max(16, path.length * 6), 0.006, 6, false),
            new T.MeshBasicMaterial({ color: new T.Color(NIC.colors().text) }),
          ),
        );
      }
      pts.forEach((p) => {
        const w = toW(p.x, p.y, 0.02),
          r = ((p.r || 6) / 6) * 0.022;
        const ball = new T.Mesh(
          new T.SphereGeometry(r, 20, 14),
          new T.MeshLambertMaterial({ color: new T.Color(p.c || "#ffffff") }),
        );
        ball.position.copy(w);
        extra.add(ball);
        const ring = new T.Mesh(
          new T.SphereGeometry(r * 1.4, 20, 14),
          new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: T.BackSide }),
        );
        ring.position.copy(w);
        extra.add(ring);
        const stem = new T.BufferGeometry().setFromPoints([new T.Vector3(w.x, 0, w.z), w]);
        extra.add(
          new T.Line(
            stem,
            new T.LineBasicMaterial({ color: new T.Color(NIC.colors().text), transparent: true, opacity: 0.35 }),
          ),
        );
        if (p.label) {
          const d = document.createElement("span");
          d.textContent = p.label;
          labels.appendChild(d);
          tags.push([d, w.clone().add(new T.Vector3(0, r + 0.03, 0))]);
        }
      });
      dirty = true;
    }

    // orbit by dragging; auto-rotates until touched
    const stopAuto = () => {
      if (auto) {
        auto = false;
        hint.style.opacity = "0";
      }
    };
    const cv = renderer.domElement;
    cv.style.touchAction = "pan-y";
    cv.addEventListener("pointerdown", (e) => {
      stopAuto();
      drag = { x: e.clientX, y: e.clientY, yaw, pitch };
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener("pointermove", (e) => {
      if (!drag) return;
      yaw = drag.yaw - (e.clientX - drag.x) * 0.01;
      pitch = Math.max(0.12, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008));
      dirty = true;
    });
    const end = () => (drag = null);
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    function size() {
      W = wrap.clientWidth || 480;
      renderer.setSize(W, o.height, false);
      cv.style.width = "100%";
      cv.style.height = o.height + "px";
      cam.aspect = W / o.height;
      cam.updateProjectionMatrix();
      dirty = true;
    }
    function render() {
      const R = 1.6 / Math.min(1, cam.aspect * 0.75);
      cam.position.set(
        Math.sin(yaw) * Math.cos(pitch) * R,
        0.1 + Math.sin(pitch) * R,
        Math.cos(yaw) * Math.cos(pitch) * R,
      );
      cam.lookAt(0, 0.1, 0);
      renderer.render(scene, cam);
      tags.forEach(([d, w]) => {
        const v = w.clone().project(cam);
        d.style.transform = `translate(${((v.x + 1) / 2) * W}px, ${((1 - v.y) / 2) * o.height}px) translate(-50%, -100%)`;
      });
      dirty = false;
    }
    const loop = () => {
      if (!wrap.isConnected) return;
      if (auto) {
        yaw += 0.0035;
        dirty = true;
      }
      if (dirty) render();
      life.frame(loop);
    };
    size();
    rebuild();
    render();
    life.frame(loop);
    life.onResize(size);
    // crossfade: the GL box (already drawn from the same angle) fades in over the canvas, then takes its place in the flow
    if (oldCv) {
      const settle = () => {
        oldCv.remove();
        ["position", "left", "top", "width", "opacity"].forEach((p) => (wrap.style[p] = ""));
        size();
      };
      const fx = NIC.fx,
        a =
          fx && fx.ok
            ? fx.clean(wrap, fx.animate(wrap, { opacity: [0, 1] }, { duration: fx.DUR.m, ease: fx.EASE }), ["opacity"])
            : null;
      a ? a.finished.then(settle, settle) : settle();
    }
    life.onCleanup(() => {
      disposeGroup();
      geo.dispose();
      mesh.material.dispose();
      wire.geometry.dispose();
      wire.material.dispose();
      base.geometry.dispose();
      base.material.dispose();
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
    });
    return {
      setPoints(p) {
        pts = p || [];
        rebuild();
      },
      setPath(p) {
        path = p || [];
        rebuild();
      },
      redraw: () => (dirty = true),
    };
  }

  NIC.fig = { graph, flow, cycle, bars, compare, cells, plot, frames, surface3d };
  NIC.term = term;
})();
