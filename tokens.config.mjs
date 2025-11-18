import pluginCSS from "@cobalt-ui/plugin-css";
import pluginJS from "@cobalt-ui/plugin-js";

/** @type {import("@cobalt-ui/core").Config} */
export default {
  tokens: ["./tokens/colors.yaml", "./tokens/border.yaml", "./tokens/transition.yaml", "./tokens/typography.yaml"],
  outDir: "./src/styles/tokens/",
  plugins: [
    pluginCSS({
      modeSelectors: [
        { mode: "light", selectors: ["@media (prefers-color-scheme: light)", '[data-color-mode="light"]'] },
        { mode: "lightHighContrast", selectors: ["@media (prefers-color-scheme: light) and (prefers-contrast: more)", '[data-color-mode="lightHighContrast"]'] },
        { mode: "dark", selectors: ["@media (prefers-color-scheme: dark)", '[data-theme="dark"]'] },
        { mode: "darkHighContrast", selectors: ["@media (prefers-color-scheme: dark) and (prefers-contrast: more)", '[data-color-mode="darkHighContrast"]'] },
        { mode: "reducedMotion", selectors: ["@media (prefers-reduced-motion: reduce)"] }
      ],
    }),
    pluginJS()
  ],
};
