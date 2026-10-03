/* Animated charts: swaps NIC.lineChart / NIC.barChart for Chart.js (vendor/chart.umd.js) versions.
   Same call signature as the canvas originals in core.js, so modules don't change.
   - First draw animates in (lines sweep left→right, bars grow with a stagger).
   - Later calls tween from the old values; rapid calls (simulations, < 250 ms apart) update instantly.
   - Hover shows a crosshair + tooltip; dataset names come from the .legend that follows the canvas.
   Falls back to the plain canvas drawing if Chart.js didn't load. */
(function () {
  // Chart.js (68 KB gzipped) loads after startup; charts drawn before it arrives use the plain canvas versions, later ones animate.
  const install = () => {
    const Chart = window.Chart;
    if (!Chart) return;
    const N = NIC,
      fx = () => N.fx;
    const plain = { line: N.lineChart, bar: N.barChart };
    const FAST = 250;

    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    Chart.defaults.font.family = css("--sans") || "Nunito, system-ui, sans-serif";
    Chart.defaults.font.weight = 700;
    Chart.defaults.font.size = 11.5;
    Chart.defaults.color = css("--text-faint") || "#a0a0a0";

    /** colour + alpha for hex (#rgb/#rrggbb) or rgb()/rgba() strings */
    function alpha(c, a) {
      c = String(c).trim();
      if (c.startsWith("#")) {
        let h = c.slice(1);
        if (h.length === 3) h = h.replace(/./g, (x) => x + x);
        const n = parseInt(h.slice(0, 6), 16);
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
      }
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const [r, g, b] = m[1].split(",").map((s) => s.trim());
        return `rgba(${r},${g},${b},${a})`;
      }
      return c;
    }

    // Vertical guide line under the hovered x (line charts only).
    const crosshair = {
      id: "nicCrosshair",
      afterDatasetsDraw(chart) {
        const act = chart.tooltip && chart.tooltip.getActiveElements();
        if (chart.config.type !== "line" || !act || !act.length) return;
        const { ctx, chartArea: a } = chart,
          x = act[0].element.x;
        ctx.save();
        ctx.strokeStyle = "rgba(75,75,75,0.25)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, a.top);
        ctx.lineTo(x, a.bottom);
        ctx.stroke();
        ctx.restore();
      },
    };

    // Dashed vertical markers: opts.markers = [{x, color, label}] (x in data units / category index, may be fractional).
    const markers = {
      id: "nicMarkers",
      afterDatasetsDraw(chart) {
        const list = chart.$nicMarkers;
        if (!list || !list.length) return;
        const {
          ctx,
          chartArea: a,
          scales: { x: sx },
        } = chart;
        ctx.save();
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 5]);
        ctx.font = `800 11px ${Chart.defaults.font.family}`;
        list.forEach((m) => {
          const x = sx.getPixelForValue(m.x);
          if (!Number.isFinite(x)) return;
          ctx.strokeStyle = m.color || "#ff9600";
          ctx.beginPath();
          ctx.moveTo(x, a.top);
          ctx.lineTo(x, a.bottom);
          ctx.stroke();
          if (m.label) {
            ctx.fillStyle = m.color || "#ff9600";
            ctx.textAlign = x > a.right - 60 ? "right" : "left";
            ctx.fillText(m.label, x + (ctx.textAlign === "left" ? 5 : -5), a.top + 10);
          }
        });
        ctx.restore();
      },
    };

    const tooltip = {
      get backgroundColor() {
        return css("--panel");
      },
      get borderColor() {
        return css("--line");
      },
      borderWidth: 2,
      cornerRadius: 12,
      padding: 10,
      get titleColor() {
        return css("--ink");
      },
      get bodyColor() {
        return css("--text");
      },
      titleFont: { weight: 900 },
      bodyFont: { weight: 700 },
      boxPadding: 5,
      usePointStyle: true,
      caretSize: 6,
      displayColors: true,
    };

    /** Wrap the canvas in a sized box once, so Chart.js can be responsive without feedback loops. */
    function box(canvas, height) {
      let b = canvas.parentElement;
      if (!b.classList.contains("chart-box")) {
        b = document.createElement("div");
        b.className = "chart-box viz";
        if (canvas.style.marginTop) {
          b.style.marginTop = canvas.style.marginTop;
          canvas.style.marginTop = "";
        }
        canvas.replaceWith(b);
        b.appendChild(canvas);
      }
      b.style.height = height + "px";
      canvas.style.height = "";
      return b;
    }

    /** Legend labels written in the module HTML right after the chart (if the count matches). */
    function legendNames(b, n) {
      let s = b.nextElementSibling;
      while (s && !s.classList.contains("legend") && s.tagName !== "CANVAS" && !s.classList.contains("chart-box"))
        s = s.nextElementSibling;
      const txt = (el) => {
        const c = el.cloneNode(true);
        c.querySelectorAll("sup").forEach((u) => (u.textContent = "^" + u.textContent));
        c.querySelectorAll("sub").forEach((u) => (u.textContent = "_" + u.textContent));
        return c.textContent.trim();
      };
      const names = s && s.classList.contains("legend") ? Array.from(s.children).map(txt) : [];
      return names.length === n ? names : null;
    }

    let markerList = null;
    function upsert(canvas, type, build, patch, height, marks) {
      markerList = marks || null;
      const now = performance.now();
      const b = box(canvas, height);
      let ch = Chart.getChart(canvas);
      const fast = ch && now - (ch.$nicLast || 0) < FAST;
      const reduce = fx() && fx().reduce();
      if (!ch) {
        ch = new Chart(canvas, build(b, reduce));
        ch.$nicLast = now;
        ch.$nicMarkers = markerList;
        if (markerList) ch.draw();
        return ch;
      }
      patch(ch);
      ch.$nicLast = now;
      ch.$nicMarkers = markerList;
      ch.update(fast || reduce ? "none" : undefined);
      return ch;
    }

    N.lineChart = function (canvas, opts) {
      if (!canvas || !canvas.parentElement) return plain.line(canvas, opts);
      const series = opts.series;
      let n = Math.max(2, ...series.map((s) => s.data.length));
      if (opts.xMax) n = Math.max(n, opts.xMax);
      const clean = (v) => (Number.isFinite(v) ? v : null);
      const toSets = (names) =>
        series.map((s, k) => ({
          label: (names && names[k]) || `Series ${k + 1}`,
          data: s.data.map((v, i) => ({ x: i, y: clean(v) })),
          borderColor: s.color,
          backgroundColor: s.color,
          pointBackgroundColor: s.color,
          borderWidth: s.width || 3,
          borderDash: s.dash || [],
          borderCapStyle: "round",
          borderJoinStyle: "round",
          pointRadius: s.dots ? 3.5 : 0,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          pointHoverBorderColor: css("--panel"),
          tension: 0.25,
          spanGaps: false,
          fill: k === 0 && !s.dash && series.length <= 3 ? "origin" : false,
          ...(k === 0 && !s.dash
            ? {
                backgroundColor: (c) => {
                  const a = c.chart.chartArea;
                  if (!a) return alpha(s.color, 0.12);
                  const g = c.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
                  g.addColorStop(0, alpha(s.color, 0.28));
                  g.addColorStop(1, alpha(s.color, 0.02));
                  return g;
                },
              }
            : {}),
        }));
      const scales = () => ({
        x: {
          type: "linear",
          min: 0,
          max: n - 1,
          grid: { display: false },
          border: { display: false },
          ticks: { maxTicksLimit: 6, precision: 0 },
          title: { display: !!opts.xLabel, text: opts.xLabel || "", align: "start", font: { weight: 800 } },
        },
        y: {
          min: opts.yMin,
          max: opts.yMax,
          grid: { color: css("--line-soft"), lineWidth: 2 },
          border: { display: false },
          ticks: { maxTicksLimit: 5 },
        },
      });
      return upsert(
        canvas,
        "line",
        (b, reduce) => {
          const names = opts.names || legendNames(b, series.length);
          const count = Math.max(...series.map((s) => s.data.length), 1),
            step = 650 / count;
          return {
            type: "line",
            data: { datasets: toSets(names) },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              parsing: false,
              normalized: true,
              interaction: { mode: "index", intersect: false, axis: "x" },
              animation: reduce ? false : { duration: 500, easing: "easeOutQuart" },
              animations: reduce
                ? {}
                : {
                    // first draw: each point starts at its left neighbour's y, so the line sweeps in
                    x: {
                      type: "number",
                      easing: "linear",
                      duration: step,
                      from: NaN,
                      delay: (c) =>
                        c.type === "data" && c.mode === "default" && !c.xStarted
                          ? ((c.xStarted = true), c.index * step)
                          : 0,
                    },
                    y: {
                      type: "number",
                      easing: "linear",
                      duration: step,
                      from: (c) => {
                        const base = c.chart.scales.y.getPixelForValue(c.chart.scales.y.min ?? 0),
                          prev = c.index > 0 && c.chart.getDatasetMeta(c.datasetIndex).data[c.index - 1];
                        return prev ? prev.getProps(["y"], true).y : base;
                      },
                      delay: (c) =>
                        c.type === "data" && c.mode === "default" && !c.yStarted
                          ? ((c.yStarted = true), c.index * step)
                          : 0,
                    },
                  },
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...tooltip,
                  callbacks: {
                    title: (it) => `${opts.xLabel ? opts.xLabel.split(" ")[0] : "x"} = ${it[0].parsed.x}`,
                    label: (c) => ` ${c.dataset.label}: ${c.parsed.y == null ? "–" : +c.parsed.y.toFixed(3)}`,
                  },
                },
                decimation: { enabled: count > 400, algorithm: "lttb", samples: 300 },
              },
              scales: scales(),
            },
            plugins: [crosshair, markers],
          };
        },
        (ch) => {
          const names = ch.data.datasets.map((d) => d.label);
          const next = toSets(names);
          // keep the same dataset objects so Chart.js tweens instead of re-creating
          next.forEach((d, k) => {
            if (ch.data.datasets[k]) Object.assign(ch.data.datasets[k], d);
            else ch.data.datasets.push(d);
          });
          ch.data.datasets.length = next.length;
          ch.options.scales = scales();
          ch.options.animations = {};
          ch.options.animation = { duration: 450, easing: "easeOutCubic" };
        },
        opts.height || 220,
        opts.markers,
      );
    };

    N.barChart = function (canvas, opts) {
      if (!canvas || !canvas.parentElement) return plain.bar(canvas, opts);
      const groups = opts.groups,
        n = groups[0].values.length;
      const labels = opts.labels || Array.from({ length: n }, (_, i) => String(i + 1));
      const toSets = (names) =>
        groups.map((g, k) => {
          const cols = typeof g.color === "function" ? g.values.map((_, i) => g.color(i)) : g.color;
          return {
            label: (names && names[k]) || (groups.length > 1 ? `Group ${k + 1}` : "Value"),
            data: g.values.map((v) => (Number.isFinite(v) ? v : 0)),
            backgroundColor: cols,
            hoverBackgroundColor: Array.isArray(cols) ? cols.map((c) => alpha(c, 0.8)) : alpha(cols, 0.8),
            borderRadius: (c) => (c.raw ? 8 : 0),
            borderSkipped: false,
            maxBarThickness: 64,
            categoryPercentage: 0.8,
            barPercentage: 0.9,
          };
        });
      const dec = opts.decimals ?? 2;
      const scales = () => ({
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { autoSkip: !labels.some((l) => l === ""), maxRotation: 0 },
        },
        y: {
          min: 0,
          max: opts.yMax,
          grid: { color: css("--line-soft"), lineWidth: 2 },
          border: { display: false },
          ticks: { maxTicksLimit: 5, callback: (v) => (+v).toFixed(dec) },
        },
      });
      return upsert(
        canvas,
        "bar",
        (b, reduce) => ({
          type: "bar",
          data: { labels, datasets: toSets(opts.names || legendNames(b, groups.length)) },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            animation: reduce
              ? false
              : {
                  duration: 650,
                  easing: "easeOutBack",
                  delay: (c) =>
                    c.type === "data" && c.mode === "default" ? c.dataIndex * 45 + c.datasetIndex * 90 : 0,
                },
            plugins: {
              legend: { display: false },
              tooltip: {
                ...tooltip,
                callbacks: {
                  ...(opts.tipTitle ? { title: (it) => opts.tipTitle(it[0].dataIndex) } : {}),
                  label: (c) => ` ${c.dataset.label}: ${+(+c.parsed.y).toFixed(Math.max(dec, 2))}`,
                },
              },
            },
            scales: scales(),
          },
          plugins: [markers],
        }),
        (ch) => {
          const names = ch.data.datasets.map((d) => d.label);
          ch.data.labels = labels;
          const next = toSets(names);
          next.forEach((d, k) => {
            if (ch.data.datasets[k]) Object.assign(ch.data.datasets[k], d);
            else ch.data.datasets.push(d);
          });
          ch.data.datasets.length = next.length;
          ch.options.scales = scales();
          ch.options.animation = { duration: 450, easing: "easeOutCubic" };
        },
        opts.height || 200,
        opts.markers,
      );
    };
  };
  NIC.lazy("vendor/chart.umd.js").then(install, () => {});
})();
