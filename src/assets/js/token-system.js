// ==========================================
// TokenStyleManager.js
// Maneja solo la aplicación de estilos CSS
// Usar en TODAS las páginas
// ==========================================

class TokenStyleManager {
  constructor() {
    this._dynamicSheet = null;
    this._STORAGE_KEY = 'user-color-tokens';
    
    // Singleton para evitar múltiples instancias
    if (TokenStyleManager._instance) {
      return TokenStyleManager._instance;
    }
    
    this._initializeStyleSheet();
    this.applyStoredTokens();
    
    TokenStyleManager._instance = this;
  }

  _initializeStyleSheet() {
    const existingSheet = [...document.adoptedStyleSheets].find(
      sheet => sheet._tokenManager === true
    );

    if (existingSheet) {
      this._dynamicSheet = existingSheet;
    } else {
      this._dynamicSheet = new CSSStyleSheet();
      this._dynamicSheet._tokenManager = true;
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, this._dynamicSheet];
    }
  }

  applyStoredTokens() {
    const storedTokens = this._loadStoredTokens();
    
    if (!storedTokens) {
      console.log('📦 No custom tokens found, using default styles');
      this._dynamicSheet.replaceSync('');
      return;
    }

    try {
      const cssRules = this._generateCssVariables(storedTokens);
      this._dynamicSheet.replaceSync(cssRules);
      console.log('✅ Custom tokens applied successfully');
    } catch (error) {
      console.error('❌ Error applying stored tokens:', error);
    }
  }

  _loadStoredTokens() {
    try {
      const stored = localStorage.getItem(this._STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
      return null;
    }
  }

  _generateCssVariables(tokens) {
    const rules = { root: [], dark: [] };
    this._processTokensRecursive(tokens, '', rules);
    return this._formatCssRules(rules);
  }

  _processTokensRecursive(obj, prefix, rules) {
    for (const [key, val] of Object.entries(obj)) {
      if (key === '$type' || key === '$extensions') continue;
      
      const currentPath = prefix ? `${prefix}-${key}` : key;

      if (this._isTokenValue(val)) {
        this._addCssVariable(currentPath, val, rules);
      } else if (this._isTokenGroup(val)) {
        this._processTokensRecursive(val, currentPath, rules);
      }
    }
  }

  _isTokenValue(value) {
    return value && typeof value === 'object' && value.$value !== undefined;
  }

  _isTokenGroup(value) {
    return value && typeof value === 'object';
  }

  _addCssVariable(path, token, rules) {
    const varName = `--${path.replace(/\./g, '-')}`;
    const lightColor = this._resolveReference(token.$value);
    rules.root.push(`  ${varName}: ${lightColor};`);

    if (token.$extensions?.mode?.dark) {
      const darkColor = this._resolveReference(token.$extensions.mode.dark);
      rules.dark.push(`    ${varName}: ${darkColor};`);
    }
  }

  _resolveReference(ref, visited = new Set()) {
    if (!this._isReference(ref)) return ref;
    
    if (visited.has(ref)) {
      console.warn('⚠️ Circular reference detected:', ref);
      return '#FF00FF';
    }
    
    visited.add(ref);
    const path = ref.slice(1, -1).split('.');
    const resolved = this._followReferencePath(path);
    
    if (!resolved) return '#FF00FF';
    
    return this._resolveReference(resolved.$value || resolved, visited);
  }

  _isReference(value) {
    return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
  }

  _followReferencePath(path) {
    const storedTokens = this._loadStoredTokens();
    if (!storedTokens) return null;

    let current = storedTokens;
    for (const key of path) {
      current = current?.[key];
      if (current === undefined) return null;
    }
    return current;
  }

  _formatCssRules(rules) {
    const rootBlock = `:root {\n${rules.root.join('\n')}\n}`;
    
    if (rules.dark.length === 0) return rootBlock;
    
    const darkBlock = `@media (prefers-color-scheme: dark) {\n  :root {\n${rules.dark.join('\n')}\n  }\n}`;
    return `${rootBlock}\n\n${darkBlock}`;
  }

  refresh() {
    this.applyStoredTokens();
  }

  // Método público para limpiar completamente los estilos
  clearCustomStyles() {
    try {
      localStorage.removeItem(this._STORAGE_KEY);
      this._dynamicSheet.replaceSync('');
      console.log('🧹 Custom styles cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing custom styles:', error);
      return false;
    }
  }
}


// ==========================================
// TokenEditor.js
// Editor completo con UI
// Usar SOLO en la página del editor
// ==========================================

class TokenEditor {
  constructor(containerSelector, downloadBtnSelector, resetBtnSelector, pipBtnSelector) {
    this._container = null;
    this._downloadBtn = null;
    this._resetBtn = null;
    this._pipBtn = null;
    this._initialTokens = null;
    this._currentTokens = null;
    this._STORAGE_KEY = 'user-color-tokens';
    this._pipWindow = null;
    this._styleManager = new TokenStyleManager();
    
    this._container = document.querySelector(containerSelector);
    this._downloadBtn = document.querySelector(downloadBtnSelector);
    this._resetBtn = document.querySelector(resetBtnSelector);
    this._pipBtn = document.querySelector(pipBtnSelector);

    if (!this._container) {
      throw new Error('TokenEditor: Container element not found');
    }

    this._setupEventListeners();
    this.loadTokens();
  }

  _setupEventListeners() {
    if (this._downloadBtn) {
      this._downloadBtn.addEventListener('click', () => this.downloadYaml());
    }
    
    if (this._resetBtn) {
      this._resetBtn.addEventListener('click', () => this.resetTokens());
    }

    if (this._pipBtn) {
      this._pipBtn.addEventListener('click', () => this.openPictureInPicture());
    }
  }

  async loadTokens() {
    try {
      const yamlText = await this._fetchTokensFile();
      this._initialTokens = jsyaml.load(yamlText);
      this._currentTokens = this._loadStoredTokens() || this._cloneTokens(this._initialTokens);
      
      this.render();
      this._styleManager.applyStoredTokens();
    } catch (error) {
      this._handleLoadError(error);
    }
  }

  async _fetchTokensFile() {
    const response = await fetch('/tokens/colors.yaml');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  }

  _loadStoredTokens() {
    try {
      const stored = localStorage.getItem(this._STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading tokens:', error);
      return null;
    }
  }

  _cloneTokens(tokens) {
    return JSON.parse(JSON.stringify(tokens));
  }

  _handleLoadError(error) {
    console.error("Error loading or parsing colors.yaml:", error);
    this._container.innerHTML = `
      <div style="color: #dc3545; padding: 20px; background: #fee; border-radius: 8px; border: 1px solid #fecaca;">
        <strong>Error:</strong> Could not load tokens. Check the console for details and ensure 
        <code>/tokens/colors.yaml</code> exists.
      </div>
    `;
  }

  render() {
    if (!this._currentTokens?.color) {
      console.error('No color tokens found');
      return;
    }
    
    this._container.innerHTML = '';
    this._traverseTokens(this._currentTokens.color, 'color', this._container);
  }

  _traverseTokens(obj, path, parentElement) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$type') continue;

      const currentPath = `${path}.${key}`;

      if (this._isTokenValue(value)) {
        const card = this._createColorCard(currentPath, value);
        parentElement.appendChild(card);
      } else if (this._isTokenGroup(value)) {
        const section = this._createTokenSection(key, currentPath, value);
        parentElement.appendChild(section);
      }
    }
  }

  _isTokenValue(value) {
    return value && typeof value === 'object' && value.$value !== undefined;
  }

  _isTokenGroup(value) {
    return value && typeof value === 'object';
  }

  _createTokenSection(key, currentPath, value) {
    const section = document.createElement('div');
    section.className = 'token-section';
    
    const title = this._createSectionTitle(key);
    const groupContainer = this._createGroupContainer();
    
    section.append(title, groupContainer);
    this._traverseTokens(value, currentPath, groupContainer);
    
    return section;
  }

  _createSectionTitle(key) {
    const title = document.createElement('h3');
    title.textContent = this._capitalize(key);
    title.className = 'token-section__title';
    return title;
  }

  _createGroupContainer() {
    const container = document.createElement('div');
    container.className = 'token-group';
    return container;
  }

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  _createColorCard(path, tokenData) {
    const card = document.createElement('div');
    card.className = 'token-card';
    
    const lightControl = this._renderColorControl(path, 'light', tokenData.$value);
    const darkControl = tokenData.$extensions?.mode?.dark
      ? this._renderColorControl(path, 'dark', tokenData.$extensions.mode.dark)
      : '';

    card.innerHTML = `
      <div class="token-card__header">
        <span class="token-card__path">${path}</span>
      </div>
      <div class="token-card__body">
        ${lightControl}
        ${darkControl}
      </div>
    `;

    this._attachColorInputListeners(card);
    return card;
  }

  _renderColorControl(path, mode, value) {
    const id = `${path.replace(/\./g, '-')}-${mode}`;
    const isRef = this._isReference(value);
    const isTransparent = value === 'transparent';
    
    let labelContent = mode;
    let inputHtml;

    if (isRef) {
      const resolvedColor = this._resolveReferenceForEditor(value);
      labelContent += ` <div class="token-card__ref-swatch" style="background-color: ${resolvedColor};"></div>`;
      inputHtml = `
        <div class="token-card__reference">
          <span class="token-card__ref-path">${value}</span>
        </div>
      `;
    } else if (isTransparent) {
      inputHtml = `
        <div class="token-card__reference">
          <span class="token-card__ref-path">transparent</span>
        </div>
      `;
    } else {
      inputHtml = `
        <input type="color" 
               id="${id}" 
               value="${value}" 
               data-path="${path}" 
               data-mode="${mode}"
               aria-label="${mode} mode color for ${path}">
      `;
    }

    return `
      <div class="token-card__control">
        <label for="${id}" class="token-card__label-group">${labelContent}</label>
        ${inputHtml}
      </div>
    `;
  }

  _attachColorInputListeners(card) {
    card.querySelectorAll('input[type="color"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const { path, mode } = e.target.dataset;
        this.updateTokenValue(path, mode, e.target.value);
      });
    });
  }

  _isReference(value) {
    return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
  }

  updateTokenValue(path, mode, newValue) {
    const token = this._getTokenByPath(path);
    
    if (mode === 'light') {
      token.$value = newValue;
    } else if (mode === 'dark') {
      this._ensureExtensions(token);
      token.$extensions.mode.dark = newValue;
    }

    this._saveToStorage();
    this._styleManager.applyStoredTokens();
    
    // Notificar a ventanas PiP abiertas
    this._notifyPipWindows();
    
    this.render();
  }

  _getTokenByPath(path) {
    const keys = path.split('.').slice(1);
    return keys.reduce((obj, key) => obj[key], this._currentTokens.color);
  }

  _ensureExtensions(token) {
    if (!token.$extensions) token.$extensions = {};
    if (!token.$extensions.mode) token.$extensions.mode = {};
  }

  _saveToStorage() {
    try {
      localStorage.setItem(this._STORAGE_KEY, JSON.stringify(this._currentTokens));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  _resolveReferenceForEditor(ref, visited = new Set()) {
    if (!this._isReference(ref)) return ref;
    
    if (visited.has(ref)) return '#FF00FF';
    
    visited.add(ref);
    const path = ref.slice(1, -1).split('.');
    let current = this._currentTokens;
    
    for (const key of path) {
      current = current?.[key];
      if (current === undefined) return '#FF00FF';
    }
    
    return this._resolveReferenceForEditor(current.$value || current, visited);
  }

  downloadYaml() {
    try {
      const yamlString = jsyaml.dump(this._currentTokens);
      const blob = new Blob([yamlString], { type: 'text/yaml' });
      this._triggerDownload(blob, 'colors.yaml');
      console.log('✅ YAML downloaded successfully');
    } catch (error) {
      console.error('❌ Error downloading YAML:', error);
    }
  }

  _triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  resetTokens() {
    const confirmed = confirm(
      '¿Estás seguro de que quieres descartar todos los cambios y volver a los valores originales?'
    );
    
    if (!confirmed) return;
    
    // Usar el método de limpieza del style manager
    this._styleManager.clearCustomStyles();
    
    // Restaurar tokens originales
    this._currentTokens = this._cloneTokens(this._initialTokens);
    
    // Aplicar estilos actualizados (vacío)
    this._styleManager.applyStoredTokens();
    
    // Re-renderizar el editor
    this.render();
    
    // Notificar a ventanas PiP
    this._notifyPipWindows();
    
    console.log('✅ Tokens restaurados a valores originales');
  }

  async openPictureInPicture() {
    if (!('documentPictureInPicture' in window)) {
      alert('Picture-in-Picture no está soportado en tu navegador. Prueba con Chrome 116+');
      return;
    }

    try {
      // Cerrar ventana anterior si existe
      if (this._pipWindow && !this._pipWindow.closed) {
        this._pipWindow.close();
      }

      // Crear nueva ventana PiP
      this._pipWindow = await documentPictureInPicture.requestWindow({
        width: 800,
        height: 600,
      });

      // Copiar estilos al PiP
      this._copyStylesToPip(this._pipWindow);

      // Crear contenido del editor en PiP
      this._createPipContent(this._pipWindow);

      console.log('✅ Picture-in-Picture opened');

      // Limpiar referencia cuando se cierre
      this._pipWindow.addEventListener('pagehide', () => {
        this._pipWindow = null;
      });

    } catch (error) {
      console.error('❌ Error opening Picture-in-Picture:', error);
      alert('No se pudo abrir el editor en Picture-in-Picture');
    }
  }

  _copyStylesToPip(pipWindow) {
    // Copiar todas las hojas de estilo
    [...document.styleSheets].forEach(styleSheet => {
      try {
        const cssText = [...styleSheet.cssRules]
          .map(rule => rule.cssText)
          .join('\n');
        const style = pipWindow.document.createElement('style');
        style.textContent = cssText;
        pipWindow.document.head.appendChild(style);
      } catch (e) {
        // Ignorar hojas de estilo de otros orígenes
        const link = pipWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = styleSheet.href;
        pipWindow.document.head.appendChild(link);
      }
    });
  }

  _createPipContent(pipWindow) {
    pipWindow.document.body.innerHTML = `
      <div class="pip-editor">
        <div class="pip-header">
          <h2>🎨 Token Editor (PiP)</h2>
          <button class="pip-close" aria-label="Cerrar">✕</button>
        </div>
        <div id="pip-token-container"></div>
      </div>
    `;

    // Estilos específicos para PiP
    const style = pipWindow.document.createElement('style');
    style.textContent = `
      body {
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
        overflow: hidden;
      }
      .pip-editor {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f8f9fa;
      }
      .pip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: white;
        border-bottom: 2px solid #e2e8f0;
      }
      .pip-header h2 {
        margin: 0;
        font-size: 1.2rem;
      }
      .pip-close {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 1rem;
      }
      .pip-close:hover {
        background: #c82333;
      }
      #pip-token-container {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
      }
    `;
    pipWindow.document.head.appendChild(style);

    // Botón de cerrar
    const closeBtn = pipWindow.document.querySelector('.pip-close');
    closeBtn.addEventListener('click', () => pipWindow.close());

    // Renderizar tokens en PiP
    const pipContainer = pipWindow.document.getElementById('pip-token-container');
    if (this._currentTokens?.color) {
      this._traverseTokens(this._currentTokens.color, 'color', pipContainer);
    }
  }

  _notifyPipWindows() {
    // Si hay una ventana PiP abierta, re-renderizarla
    if (this._pipWindow && !this._pipWindow.closed) {
      const pipContainer = this._pipWindow.document.getElementById('pip-token-container');
      if (pipContainer) {
        pipContainer.innerHTML = '';
        if (this._currentTokens?.color) {
          this._traverseTokens(this._currentTokens.color, 'color', pipContainer);
        }
      }
    }
  }
}


// ==========================================
// API PÚBLICA GLOBAL
// ==========================================

// Función global para limpiar estilos desde cualquier script
window.clearTokenStyles = function() {
  const manager = new TokenStyleManager();
  return manager.clearCustomStyles();
};


// ==========================================
// EXPORTACIONES ES6
// ==========================================
export { TokenStyleManager, TokenEditor };
