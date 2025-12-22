const base = `${import.meta.env.BASE_URL || ""}`;

// Tipos para mejorar el type safety
interface SearchPost {
  title: string;
  description: string;
  categories?: string[];
  slug: string;
  date: string;
}

// Cache de elementos DOM
const DOM = {
  get hamburgerToggle() { return document.getElementById("hamburger-toggle") as HTMLElement; },
  get mainNavigation() { return document.getElementById("main-navigation") as HTMLElement; },
  get closeMenu() { return document.getElementById("close-menu") as HTMLElement; },
  get searchOverlay() { return document.getElementById("search-overlay") as HTMLElement; },
  get searchInput() { return document.getElementById("search-input") as HTMLInputElement; },
  get searchResults() { return document.getElementById("search-results") as HTMLElement; },
  get searchToggle() { return document.getElementById("search-toggle"); },
  get searchClose() { return document.getElementById("search-close"); },
  get fontSize() { return document.getElementById("font-size"); },
  get body() { return document.body; },
  get html() { return document.documentElement; }
};

// Estado global
let searchData: SearchPost[] = [];

// Utilidad: Trap focus para accesibilidad
let currentTrapHandler: ((event: KeyboardEvent) => void) | null = null;
let currentTrapElement: HTMLElement | null = null;

function trapFocus(element: HTMLElement, moveFocused: boolean = false): void {
  // Remover el handler anterior si existe
  if (currentTrapHandler && currentTrapElement) {
    currentTrapElement.removeEventListener("keydown", currentTrapHandler);
  }

  const focusableEls = element.querySelectorAll<HTMLElement>(
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
  );
  
  if (focusableEls.length === 0) return;
  
  const firstFocusableEl = focusableEls[0];
  const lastFocusableEl = focusableEls[focusableEls.length - 1];

  if (moveFocused && focusableEls[1]) {
    focusableEls[1].focus();
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    // Actualizar elementos focusables en cada Tab para capturar cambios dinámicos
    const currentFocusable = element.querySelectorAll<HTMLElement>(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
    );
    
    if (currentFocusable.length === 0) return;
    
    const first = currentFocusable[0];
    const last = currentFocusable[currentFocusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }
  };

  // Guardar referencias para poder remover el handler después
  currentTrapHandler = handleKeydown;
  currentTrapElement = element;
  
  element.addEventListener("keydown", handleKeydown);
}

// Hamburger menu
function initHamburgerMenu(): void {
  const { hamburgerToggle, mainNavigation, closeMenu, body } = DOM;
  
  if (!hamburgerToggle || !mainNavigation) return;

  // Manejar resize con debounce visual
  const mediaQuery = window.matchMedia("(width <= 768px)");
  mediaQuery.addEventListener("change", () => {
    body.classList.add("is-resizing");
    setTimeout(() => body.classList.remove("is-resizing"), 300);
  });

  const toggleMenu = (open: boolean) => {
    mainNavigation.classList.toggle("active", open);
    hamburgerToggle.setAttribute("aria-expanded", String(open));
    body.style.overflow = open ? "hidden" : "";
    
    if (open) {
      trapFocus(mainNavigation, true);
    }
  };

  hamburgerToggle.addEventListener("click", () => {
    toggleMenu(!mainNavigation.classList.contains("active"));
  });

  closeMenu?.addEventListener("click", () => toggleMenu(false));

  // Cerrar al hacer clic en un link
  mainNavigation.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNavigation.classList.contains("active")) {
      toggleMenu(false);
    }
  });
}

// Search functionality
async function initSearch(): Promise<void> {
  const { searchOverlay, searchInput, searchToggle, searchClose, fontSize } = DOM;
  
  // Cargar datos de búsqueda
  try {
    const response = await fetch(`${base}search.json`);
    searchData = await response.json();
  } catch (error) {
    console.error("Failed to load search data:", error);
  }

  // Event listeners
  searchToggle?.addEventListener("click", openSearch);
  searchClose?.addEventListener("click", closeSearch);
  searchInput?.addEventListener("input", debounce(handleSearch, 150));
  fontSize?.addEventListener("click", handleFontSize);

  // Cerrar con Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchOverlay?.classList.contains("active")) {
      closeSearch();
    }
  });

  // Cerrar al hacer clic fuera
  searchOverlay?.addEventListener("click", (event) => {
    if (event.target === searchOverlay) {
      closeSearch();
    }
  });
}

function openSearch(): void {
  const { searchOverlay, searchInput, body } = DOM;
  
  searchOverlay?.classList.add("active");
  body.style.overflow = "hidden";
  trapFocus(searchOverlay);
  setTimeout(() => searchInput?.focus(), 100);
}

function closeSearch(): void {
  const { searchOverlay, searchInput, searchResults, body } = DOM;
  
  searchOverlay?.classList.remove("active");
  body.style.overflow = "";
  if (searchInput) searchInput.value = "";
  if (searchResults) searchResults.innerHTML = "";
}

function handleSearch(event: Event): void {
  const { searchResults, searchOverlay } = DOM;
  const target = event.target as HTMLInputElement;
  const query = target.value.toLowerCase().trim();

  if (query.length < 2) {
    if (searchResults) searchResults.innerHTML = "";
    trapFocus(searchOverlay);
    return;
  }

  const results = searchData
    .filter((post) => 
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.categories?.some((cat) => cat.toLowerCase().includes(query))
    )
    .slice(0, 10);

  displayResults(results, query);
  trapFocus(searchOverlay);
}

function displayResults(results: SearchPost[], query: string): void {
  const { searchResults } = DOM;
  if (!searchResults) return;

  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="search-no-results">
        <p>No se han encontrado artículos para la búsqueda "${escapeHtml(query)}"</p>
      </div>
    `;
    return;
  }

  const resultsHTML = results.map((post) => `
    <article class="search-result">
      <h3 class="search-result-title">
        <a href="${base}blog/${post.slug}">${escapeHtml(post.title)}</a>
      </h3>
      <time class="search-result-date">${formatDate(post.date)}</time>
      ${post.description ? `<p class="search-result-excerpt">${escapeHtml(post.description)}</p>` : ""}
      ${post.categories ? `
        <div class="search-result-categories">
          ${post.categories.map((cat) => 
            `<a href="${base}categorias/${cat}"><span class="visually-hidden">Ver publicaciones sobre </span>${escapeHtml(cat)}</a>`
          ).join(" ")}
        </div>
      ` : ""}
    </article>
  `).join("");

  searchResults.innerHTML = `
    <div class="search-results-header">
      <p>Encontrado${results.length === 1 ? "" : "s"} ${results.length} artículo${results.length === 1 ? "" : "s"} para la búsqueda "${escapeHtml(query)}"</p>
    </div>
    ${resultsHTML}
  `;
}

// Font size (zoom)
function initZoomed(): void {
  if (getZoomedPreference()) {
    DOM.html.classList.add("zoomed");
  }
}

function getZoomedPreference(): boolean {
  try {
    return localStorage.getItem("zoomed") === "true";
  } catch {
    return false;
  }
}

function handleFontSize(): void {
  const { html } = DOM;
  html.classList.toggle("zoomed");
  
  try {
    localStorage.setItem("zoomed", html.classList.contains("zoomed") ? "true" : "false");
  } catch (error) {
    console.warn("Could not save zoom preference:", error);
  }
}

// Utilidades
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Inicialización
function init(): void {
  initHamburgerMenu();
  initSearch();
  initZoomed();
}

// Eventos de Astro
document.addEventListener("astro:after-swap", init);
document.addEventListener("astro:page-load", init, { once: true });
