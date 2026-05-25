# ivanalbizu.eu — sitio personal

## Resumen
Sitio personal y blog en español de Iván Albizu, construido con Astro 5. Originalmente partía del theme `volks-typo`, pero hoy es un proyecto propio con un sistema de design tokens basado en Cobalt, modo oscuro, MDX y tests con Playwright. Despliega en `https://ivanalbizu.eu/`.

Contenido del blog: html, css, sass, javascript, astro, webgl, php, android, java.

## Stack
- **Framework**: Astro 5.x con `@astrojs/mdx` y `@astrojs/sitemap`
- **Lenguaje**: TypeScript
- **Estilos**: SCSS (`src/styles/global.scss`) consumiendo CSS custom properties generadas por Cobalt
- **Design tokens**: `@cobalt-ui/cli` con plugins CSS y JS (build YAML → CSS/JS en cada `dev`/`build`)
- **Resaltado de código**: Shiki, tema `github-dark`
- **Tipografía**: Atkinson Hyperlegible (self-hosted en `public/fonts/`)
- **Tests**: Playwright (visual + features)
- **Linter / formatter**: ESLint + Prettier (con `prettier-plugin-astro`)

## Sistema de design tokens (Cobalt)
La paleta, espaciado, tipografía y resto de variables visuales no están hardcoded: se definen en YAML en `tokens/` y Cobalt los compila a `src/styles/tokens/` (CSS + JS + d.ts). **Toda CSS variable** que veas (`--color-*`, `--space-*`, `--typography-*`, `--transition-*`, `--width-*`, `--border-*`) viene de ahí.

### Capas
1. **Primitives** (`tokens/primitives/`) — valores crudos (`colors.yaml`, `space.yaml`, `border.yaml`). **No usar directamente** en componentes.
2. **Semantic** (`tokens/semantic/`) — roles de UI (`brand.primary`, `text.default`, `surface.page`, …). Es lo que se usa en CSS.
3. **Components** (`tokens/components/`) — tokens específicos de componente (hoy solo `button.yaml`).

Config: [tokens.config.mjs](tokens.config.mjs). Output: [src/styles/tokens/](src/styles/tokens/).

### Modos generados por Cobalt
Definidos en `modeSelectors` de la config:
- **dark** → `@media (prefers-color-scheme: dark)` y `[data-theme="dark"]`
- **reducedMotion** → `@media (prefers-reduced-motion: reduce)`
- **zoomed** → `.zoomed`

El switch de tema se inicializa con [public/theme-init.js](public/theme-init.js) (sin FOUC).

### Tokens semánticos clave
- Marca: `--color-brand-primary` (= `red.600` = `#a20000`), `--color-brand-primary-hover`, `--color-brand-accent`
- Superficies: `--color-surface-page`, `--color-surface-elevated`, `--color-surface-overlay`, `--color-surface-inverse`
- Texto: `--color-text-default`, `--color-text-link`, …
- Tipografía: `--typography-font-family-primary|body|mono`, `--typography-font-size-heading-{1..6}`, `--typography-font-size-paragraph-{1,2}`, `--typography-line-height-*`, `--typography-letter-spacing-*`
- Espaciado: `--space-*` (escala basada en 8pt)

Si añades una variable nueva, edítala en el YAML correspondiente y vuelve a ejecutar `npm run tokens:build` (o usa `npm run tokens:watch` en dev).

## Estructura del proyecto

```
src/
├── components/        # 16 componentes Astro (ver lista abajo)
├── layouts/
│   └── Layout.astro   # Wrapper principal (header + main + footer)
├── pages/
│   ├── index.astro
│   ├── 404.astro
│   ├── sobre-mi.astro
│   ├── curriculum.astro
│   ├── token-editor.astro     # Editor en vivo de tokens
│   ├── rss.xml.js
│   ├── search.json.js         # Endpoint estático que alimenta la búsqueda
│   ├── blog/
│   │   ├── [...page].astro    # Listado paginado
│   │   └── [...slug].astro    # Entrada de blog
│   └── categorias/
│       ├── index.astro
│       └── [categoria]/...
├── content/
│   ├── config.ts              # Colección "blog" (Astro Content Collections, glob loader)
│   └── blog/                  # ~95 entradas .md/.mdx
├── styles/
│   ├── global.scss            # @use './tokens/tokens'
│   └── tokens/                # Generado por Cobalt (NO editar a mano)
├── utils/
│   ├── deSlugify.ts
│   ├── generateBreadcrumbs.ts
│   ├── reading-time.ts
│   └── table-of-contents.ts
├── assets/                    # Imágenes y JS de las entradas
└── config.ts                  # Config del sitio (título, autor, social, pageSize)

tokens/                        # Fuentes YAML de Cobalt
public/                        # favicon, fonts, theme-init.js, og-image, robots.txt, CV
tests/                         # Specs Playwright
```

### Componentes (`src/components/`)
- **Layout / chrome**: `Header`, `Footer`, `Sidebar`, `PageHeader`, `Hero`, `Breadcrumbs`, `Pagination`
- **Blog**: `PostMeta`, `Categories`, `TableOfContents`, `BlogEntryJSONLD`
- **UI**: `Button`, `SocialLinks`, `Skills`
- **Embeds / SEO**: `Codepen`, `SEO`

## Schema de contenido (blog)
Definido en [src/content/config.ts](src/content/config.ts). Campos:

| Campo         | Tipo                | Requerido | Notas |
|---------------|---------------------|-----------|-------|
| `title`       | string              | sí        | |
| `date`        | date (coerce)       | sí        | |
| `slug`        | string              | no        | |
| `description` | string              | no        | |
| `excerpt`     | string              | no        | |
| `categories`  | string[]            | no        | default `[]` |
| `tags`        | string[]            | no        | default `[]` |
| `author`      | string              | no        | default `'Anonymous'` |
| `image`       | image()             | no        | usa el helper de Astro |

## Configuración del sitio
[src/config.ts](src/config.ts) centraliza título, descripción, autor, `siteUrl`, `pageSize` y enlaces sociales. Redes configuradas hoy: **GitHub, Codepen, LinkedIn, Twitter/X**.

URL final y base path se controlan vía env en [astro.config.mjs](astro.config.mjs):
- `SITE` (default `https://ivanalbizu.eu`)
- `BASE_PATH` (vacío para dominio raíz, `/repo/` para GitHub Pages)

## Comandos

```bash
npm install
npm run dev              # tokens:build + astro dev
npm run build            # tokens:build + astro build
npm run preview          # astro preview

npm run tokens:build     # YAML → src/styles/tokens/
npm run tokens:watch     # watch mode para iterar tokens

npm run check            # astro check (TypeScript)
npm run lint             # ESLint (.js, .ts, .astro)
npm run format           # Prettier sobre todo el repo

npm run test:features    # Playwright (tests/*.spec.js)
npm run generate-screenshots
npm run matter           # script local en .scripts/matter.cjs
```

## Convenciones para Claude
- **No editar nada bajo `src/styles/tokens/`**: se regenera desde `tokens/*.yaml`.
- **Usar tokens semánticos** (`--color-*`, `--space-*`, …) en SCSS y estilos scoped. Evitar valores hex/px sueltos.
- **Idioma**: contenido y UI están en español. Mantener el tono al escribir copy o frontmatter.
- **Markdown vs MDX**: ambos están soportados en `src/content/blog/`. Usa `.mdx` si necesitas componentes/JSX.
- **Dark mode**: cualquier color nuevo debe declararse en el token semántico con su variante `mode.dark`; no añadas overrides ad-hoc con `[data-theme="dark"]` en SCSS.
- **Accesibilidad**: la tipografía base es Atkinson Hyperlegible por legibilidad; respeta `--target-size` (44px) para áreas táctiles y los modos `reducedMotion` / `zoomed`.
