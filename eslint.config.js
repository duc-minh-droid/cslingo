import js from "@eslint/js";
import globals from "globals";

/* Lint rules for the app (browser scripts sharing one NIC namespace), the in-page test tools, and the Node scripts. */
const libs = {
  NIC: "writable",
  Motion: "readonly",
  Chart: "readonly",
  gsap: "readonly",
  confetti: "readonly",
  lottie: "readonly",
  supabase: "readonly",
  katex: "readonly",
  THREE: "readonly",
  loadPyodide: "readonly",
  DrawSVGPlugin: "readonly",
  MotionPathPlugin: "readonly",
  renderMathInElement: "readonly",
  FLUENT_EMOJI: "readonly",
  CSL_LOTTIE: "readonly",
};
/* functions the in-page test tools define for each other (and for the test runner) */
const toolGlobals = {
  answerCurrent: "readonly",
  smoke: "readonly",
  bossTest: "readonly",
  bankTest: "readonly",
  answerBias: "readonly",
  bankCoverage: "readonly",
  bankExisting: "readonly",
};

/* no source file grows past this many lines of code (blank lines and comments don't count): split it into parts instead */
const maxLines = ["error", { max: 500, skipBlankLines: true, skipComments: true }];

export default [
  { ignores: ["vendor/**", "node_modules/**", "trailer/**", "assets/**", "package-lock.json"] },
  js.configs.recommended,
  {
    files: [
      "js/**/*.js",
      "tools/answer.js",
      "tools/smoke.js",
      "tools/boss-test.js",
      "tools/bank-test.js",
      "tools/bank-coverage.js",
      "tools/answer-bias.js",
      "sw.js",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: { ...globals.browser, ...globals.serviceworker, ...libs },
    },
    rules: {
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      "no-empty": ["error", { allowEmptyCatch: false }],
      "max-lines": maxLines,
    },
  },
  {
    files: [
      "tools/answer.js",
      "tools/smoke.js",
      "tools/boss-test.js",
      "tools/bank-test.js",
      "tools/bank-coverage.js",
      "tools/answer-bias.js",
    ],
    languageOptions: { globals: toolGlobals },
    rules: { "no-unused-vars": "off", "no-redeclare": "off" }, // each tool defines a global function that the others (and the runner) call
  },
  {
    files: ["eslint.config.js", "tools/run-tests.js", "tools/check-structure.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser, ...libs, ...toolGlobals },
    }, // run-tests.js passes functions into the page
    rules: { "max-lines": maxLines },
  },
];
