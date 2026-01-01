import pluginCSS from "@cobalt-ui/plugin-css";
import pluginJS from "@cobalt-ui/plugin-js";

/** @type {import("@cobalt-ui/core").Config} */
export default {
  tokens: [
    // Capa 1: Primitivos (valores base, no usar directamente)
    "./tokens/primitives/colors.yaml",
    // Capa 2: Semánticos (tokens con significado contextual)
    "./tokens/semantic/colors.yaml",
    // Capa 3: Componentes (tokens específicos de UI)
    "./tokens/components/button.yaml",
    // Otros tokens
    "./tokens/space.yaml",
    "./tokens/border.yaml",
    "./tokens/width.yaml",
    "./tokens/transition.yaml",
    "./tokens/typography.yaml",
  ],
  outDir: "./src/styles/tokens/",
  plugins: [
    pluginCSS({
      modeSelectors: [
        { mode: "dark", selectors: ["@media (prefers-color-scheme: dark)", '[data-theme="dark"]'] },
        { mode: "reducedMotion", selectors: ["@media (prefers-reduced-motion: reduce)"] },
        { mode: "zoomed", selectors: [".zoomed"] }
      ],
    }),
    pluginJS()
  ],
};
