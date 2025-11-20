import pluginCSS from "@cobalt-ui/plugin-css";
import pluginJS from "@cobalt-ui/plugin-js";

/** @type {import("@cobalt-ui/core").Config} */
export default {
  tokens: ["./tokens/colors.yaml", "./tokens/space.yaml", "./tokens/border.yaml", "./tokens/transition.yaml", "./tokens/typography.yaml"],
  outDir: "./src/styles/tokens/",
  plugins: [
    pluginCSS({
      modeSelectors: [
        { mode: "dark", selectors: ["@media (prefers-color-scheme: dark)", '[data-theme="dark"]'] },
        { mode: "reducedMotion", selectors: ["@media (prefers-reduced-motion: reduce)"] }
      ],
    }),
    pluginJS()
  ],
};
