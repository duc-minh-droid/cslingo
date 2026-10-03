(function () {
  const lab = (NIC.shared.engineCodelab = NIC.shared.engineCodelab || {});
  const { esc } = lab;

  // ---------- syntax highlight (tiny, good enough for short Python) ----------
  const TOK =
    /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(def|return|if|elif|else|for|while|in|not|and|or|is|break|continue|pass|import|from|as|class|lambda|None|True|False|with|try|except|finally|raise|yield|global|nonlocal|del|assert)\b|\b(\d+(?:\.\d+)?)\b/g;
  function highlight(src) {
    return (
      esc(src).replace(TOK, (m, c, s, k, n) =>
        c
          ? `<i class="${/YOUR CODE/.test(c) ? "t" : "c"}">${c}</i>`
          : s
            ? `<i class="s">${s}</i>`
            : k
              ? `<i class="k">${k}</i>`
              : `<i class="n">${n}</i>`,
      ) + "\n"
    );
  }
  Object.assign(lab, { highlight });
})();
