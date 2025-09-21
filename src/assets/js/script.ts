// TODO: actualizar el focus trap cuando cambian los resultados de búsqueda

const base = `${import.meta.env.BASE_URL || ""}`;

function trapFocus(element: HTMLElement, moveFocused: boolean) {
  const focusableEls: NodeListOf<HTMLElement> = element.querySelectorAll(
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])',
  );
  const firstFocusableEl: HTMLElement = focusableEls[0];
  const lastFocusableEl: HTMLElement = focusableEls[focusableEls.length - 1];
  const KEYCODE_TAB = 9;

  if (moveFocused) focusableEls[1].focus();

  element.addEventListener("keydown", function (e) {
    const isTabPressed = e.key === "Tab" || e.keyCode === KEYCODE_TAB;

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  });
}

// Hamburger menu functionality
function initHamburgerMenu() {
  const HAM_TOGGLE = document.getElementById(
    "hamburger-toggle",
  ) as HTMLElement;
  const MENU = document.getElementById("main-navigation") as HTMLElement;
  const HAM_CLOSE = document.getElementById("close-menu") as HTMLElement;
  const BODY = document.body;

  if (!HAM_TOGGLE || !MENU) return;

  window
    .matchMedia("(width <= 768px)")
    .addEventListener("change", function (event) {
      BODY.classList.add("is-resizing");
      setTimeout(() => {
        BODY.classList.remove("is-resizing");
      }, 300);
    });

  HAM_TOGGLE.addEventListener("click", () => {
    const isOpen = MENU.classList.contains("active");

    if (isOpen) {
      MENU.classList.remove("active");
      HAM_TOGGLE.setAttribute("aria-expanded", "false");
      BODY.style.overflow = "";
    } else {
      MENU.classList.add("active");
      HAM_TOGGLE.setAttribute("aria-expanded", "true");
      BODY.style.overflow = "hidden";
      trapFocus(MENU, true);
    }
  });

  HAM_CLOSE.addEventListener("click", () => {
    MENU.classList.remove("active");
    HAM_TOGGLE.setAttribute("aria-expanded", "false");
    BODY.style.overflow = "";
  });

  const mobileNavLinks = MENU.querySelectorAll(".nav-link");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      MENU.classList.remove("active");
      HAM_TOGGLE.setAttribute("aria-expanded", "false");
      BODY.style.overflow = "";
    });
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && MENU.classList.contains("active")) {
      MENU.classList.remove("active");
      HAM_TOGGLE.setAttribute("aria-expanded", "false");
      BODY.style.overflow = "";
    }
  });
}

// Search functionality
let searchData: any[] = [];
let searchOverlay: HTMLElement,
  searchInput: HTMLInputElement,
  searchResults: HTMLElement;

async function initSearch() {
  try {
    const response = await fetch(base + "search.json");
    searchData = await response.json();
  } catch (error) {
    console.error("Failed to load search data:", error);
  }

  searchOverlay = document.getElementById("search-overlay") as HTMLElement;
  searchInput = document.getElementById("search-input") as HTMLInputElement;
  searchResults = document.getElementById("search-results") as HTMLElement;

  // Event listeners
  document
    .getElementById("search-toggle")
    ?.addEventListener("click", openSearch);
  document
    .getElementById("search-close")
    ?.addEventListener("click", closeSearch);
  searchInput?.addEventListener("input", handleSearch);
  document.getElementById("font-size")?.addEventListener("click", handleFontSize);
  // Close on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchOverlay?.classList.contains("active")) {
      closeSearch();
    }
  });

  // Close on overlay click
  searchOverlay?.addEventListener("click", (e: Event) => {
    if (e.target === searchOverlay) {
      closeSearch();
    }
  });
}

function openSearch() {
  searchOverlay?.classList.add("active");
  document.body.style.overflow = "hidden";
  trapFocus(searchOverlay, false);
  setTimeout(() => searchInput?.focus(), 100);
}

function handleFontSize() {
  const htmlRoot = document.documentElement as HTMLElement;
  htmlRoot.classList.toggle("zoomed");
}

function closeSearch() {
  searchOverlay?.classList.remove("active");
  document.body.style.overflow = "";
  if (searchInput) searchInput.value = "";
  if (searchResults) searchResults.innerHTML = "";
}

function handleSearch(e: Event) {
  const target = e.target as HTMLInputElement;
  const query = target.value.toLowerCase().trim();

  if (query.length < 2) {
    if (searchResults) searchResults.innerHTML = "";
    return;
  }

  const results = searchData
    .filter(
      (post: any) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.categories &&
          post.categories.some((cat: string) =>
            cat.toLowerCase().includes(query),
          )),
    )
    .slice(0, 10);

  displayResults(results, query);
}

function displayResults(results: any[], query: string) {
  if (results.length === 0) {
    if (searchResults) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <p>No se han encontrado artículos para la búsqueda "${query}"</p>
        </div>
      `;
    }
    return;
  }

  const resultsHTML = results
    .map(
      (post: any) => `
    <article class="search-result">
      <h3 class="search-result-title">
        <a href="${base}blog/${post.slug.startsWith("/") ? post.slug.slice(1) : post.slug}">${post.title}</a>
      </h3>
      <time class="search-result-date">${new Date(
        post.date,
      ).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</time>
      ${post.description ? `<p class="search-result-excerpt">${post.description}</p>` : ""}
      ${post.categories
          ? `
        <div class="search-result-categories">
          ${post.categories.map((cat: string) => `<span class="btn search-category">${cat}</span>`).join(" ")}
        </div>
      `
          : ""
        }
    </article>
  `,
    )
    .join("");

  if (searchResults) {
    searchResults.innerHTML = `
      <div class="search-results-header">
        <p>Encontrado ${results.length} artículo${results.length === 1 ? "" : "s"} para la búsqueda "${query}"</p>
      </div>
      ${resultsHTML}
    `;
  }
}

// Initialize when DOM is loaded
function init() {
  initHamburgerMenu();
  initSearch();
}

document.addEventListener("astro:after-swap", () => {
  init();
});

document.addEventListener(
  "astro:page-load",
  () => {
    init();
  },
  { once: true },
);
