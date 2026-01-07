import pluginCSS from "@cobalt-ui/plugin-css";
import pluginJS from "@cobalt-ui/plugin-js";

/** @type {import("@cobalt-ui/core").Config} */
export default {
  tokens: [
    // Capa 1: Primitivos (valores base, no usar directamente)
    "./tokens/primitives/colors.yaml",
    "./tokens/primitives/space.yaml",
    "./tokens/primitives/border.yaml",
    // Capa 2: Semánticos (tokens con significado contextual)
    "./tokens/semantic/colors.yaml",
    "./tokens/semantic/space.yaml",
    "./tokens/semantic/border.yaml",
    "./tokens/semantic/transition.yaml",
    "./tokens/semantic/width.yaml",
    "./tokens/semantic/typography.yaml",
    // Capa 3: Componentes (tokens específicos de UI)
    "./tokens/components/button.yaml",
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
