// ==========================================
// theme-toggle.js
// Sistema completo de gestión de tema oscuro/claro
// ==========================================

// Verificar si hay tokens personalizados
const hasCustomTokens = () => {
  try {
    const stored = localStorage.getItem('user-color-tokens');
    return stored !== null && stored !== 'null';
  } catch {
    return false;
  }
};

// Descargar tokens actuales antes de eliminarlos
const downloadCurrentTokens = () => {
  try {
    const stored = localStorage.getItem('user-color-tokens');
    if (!stored) return false;

    const tokens = JSON.parse(stored);
    const yamlString = jsyaml.dump(tokens);
    const blob = new Blob([yamlString], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `custom-tokens-backup-${timestamp}.yaml`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading tokens:', error);
    return false;
  }
};

// Crear modal de confirmación
const createConfirmationModal = () => {
  const modal = document.createElement('div');
  modal.id = 'theme-conflict-modal';
  modal.innerHTML = `
    <div class="theme-modal-overlay">
      <div class="theme-modal-content">
        <div class="theme-modal-header">
          <h3>⚠️ Colores personalizados detectados</h3>
        </div>
        <div class="theme-modal-body">
          <p>Tienes colores personalizados activos que pueden entrar en conflicto con el modo oscuro.</p>
          <p><strong>Para activar el modo oscuro correctamente, necesitas eliminar los colores personalizados.</strong></p>
          <p class="theme-modal-info">💡 Puedes descargar tus colores personalizados antes de eliminarlos para restaurarlos después.</p>
        </div>
        <div class="theme-modal-actions">
          <button id="theme-modal-cancel" class="theme-btn theme-btn-secondary">
            Cancelar
          </button>
          <button id="theme-modal-clear" class="theme-btn theme-btn-warning">
            Eliminar colores
          </button>
          <button id="theme-modal-backup" class="theme-btn theme-btn-primary">
            📥 Descargar y eliminar
          </button>
        </div>
      </div>
    </div>
  `;

  // Estilos del modal (inline para no requerir CSS externo)
  const style = document.createElement('style');
  style.textContent = `
    .theme-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    .theme-modal-content {
      background: white;
      border-radius: 1rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    .theme-modal-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .theme-modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .theme-modal-body {
      padding: 1.5rem;
    }

    .theme-modal-body p {
      margin: 0 0 1rem;
      color: #475569;
      line-height: 1.6;
    }

    .theme-modal-body p:last-child {
      margin-bottom: 0;
    }

    .theme-modal-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      margin-top: 1rem !important;
    }

    .theme-modal-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem 1.5rem;
      flex-wrap: wrap;
    }

    .theme-btn {
      flex: 1;
      min-width: 120px;
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .theme-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .theme-btn:active {
      transform: translateY(0);
    }

    .theme-btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .theme-btn-secondary:hover {
      background: #e2e8f0;
    }

    .theme-btn-warning {
      background: #f59e0b;
      color: white;
    }

    .theme-btn-warning:hover {
      background: #d97706;
    }

    .theme-btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .theme-btn-primary:hover {
      background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
    }

    @media (max-width: 640px) {
      .theme-modal-actions {
        flex-direction: column;
      }

      .theme-btn {
        width: 100%;
      }
    }

    @media (prefers-color-scheme: dark) {
      .theme-modal-content {
        background: #1e293b;
      }

      .theme-modal-header {
        border-bottom-color: #334155;
      }

      .theme-modal-header h3 {
        color: #f1f5f9;
      }

      .theme-modal-body p {
        color: #cbd5e1;
      }

      .theme-btn-secondary {
        background: #334155;
        color: #f1f5f9;
      }

      .theme-btn-secondary:hover {
        background: #475569;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(modal);

  return new Promise((resolve) => {
    const overlay = modal.querySelector('.theme-modal-overlay');
    const cancelBtn = modal.querySelector('#theme-modal-cancel');
    const clearBtn = modal.querySelector('#theme-modal-clear');
    const backupBtn = modal.querySelector('#theme-modal-backup');

    const cleanup = () => {
      modal.remove();
      style.remove();
    };

    cancelBtn.addEventListener('click', () => {
      cleanup();
      resolve('cancel');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve('cancel');
      }
    });

    clearBtn.addEventListener('click', () => {
      cleanup();
      resolve('clear');
    });

    backupBtn.addEventListener('click', () => {
      cleanup();
      resolve('backup');
    });

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        resolve('cancel');
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
};

// Mostrar toast informativo
const showEditorToast = () => {
  const toast = document.createElement('div');
  toast.className = 'theme-toast';
  toast.innerHTML = `
    <div class="theme-toast-content">
      <strong>💡 Tip:</strong> Usa los botones del editor para gestionar los colores. El cambio de tema está deshabilitado en esta página.
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    .theme-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      max-width: 350px;
      pointer-events: none;
    }
    
    .theme-toast-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      font-size: 0.95rem;
      animation: toastSlideIn 0.3s ease-out forwards;
    }
    
    .theme-toast.hiding .theme-toast-content {
      animation: toastSlideOut 0.3s ease-out forwards;
    }
    
    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes toastSlideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
    
    @media (max-width: 640px) {
      .theme-toast {
        left: 20px;
        right: 20px;
        max-width: none;
      }
      
      @keyframes toastSlideIn {
        from {
          opacity: 0;
          transform: translateY(-100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes toastSlideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-100%);
        }
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  
  // Remover después de 4 segundos con animación suave
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 300);
  }, 4000);
};

// Aplicar tema
const applyTheme = (isDark) => {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
  localStorage.setItem("theme", isDark ? "dark" : "light");
  console.log(`🎨 Theme changed to: ${isDark ? 'dark' : 'light'}`);
};

// Obtener preferencia de tema
const getThemePreference = () => {
  return (
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
};

// Inicializar tema
const initializeTheme = () => {
  const isDark = getThemePreference() === "dark";
  applyTheme(isDark);
};

// Manejar toggle con detección de tokens
const handleThemeToggle = async () => {
  // Verificar si estamos en la página del editor
  if (window.location.pathname.includes('token-editor')) {
    showEditorToast();
    console.log('⚠️ Theme toggle disabled in token editor page');
    return;
  }

  const currentIsDark = document.documentElement.classList.contains("dark");
  const targetIsDark = !currentIsDark;

  // Si vamos a cambiar a dark mode Y hay tokens personalizados
  if (targetIsDark && hasCustomTokens()) {
    console.warn('⚠️ Custom tokens detected, showing confirmation modal');
    
    // Verificar si js-yaml está disponible (necesario para descargar)
    const hasJsYaml = typeof jsyaml !== 'undefined';
    if (!hasJsYaml) {
      // Cargar js-yaml dinámicamente si no está disponible
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js';
      document.head.appendChild(script);
      await new Promise(resolve => {
        script.onload = resolve;
      });
    }

    const result = await createConfirmationModal();

    if (result === 'cancel') {
      console.log('❌ Theme change cancelled by user');
      return;
    }

    if (result === 'backup') {
      console.log('📥 Downloading tokens backup...');
      const downloaded = downloadCurrentTokens();
      if (downloaded) {
        console.log('✅ Tokens downloaded successfully');
      } else {
        console.error('❌ Failed to download tokens');
        alert('Error al descargar los tokens. ¿Deseas continuar de todos modos?');
        return;
      }
    }

    // Limpiar tokens personalizados
    console.log('🧹 Clearing custom tokens...');
    if (typeof window.clearTokenStyles === 'function') {
      window.clearTokenStyles();
    } else {
      localStorage.removeItem('user-color-tokens');
    }

    // Recargar el style manager si existe
    if (typeof window.__tokenManager === 'function') {
      const manager = window.__tokenManager();
      if (manager) {
        manager.refresh();
      }
    }

    // IMPORTANTE: Recargar el TokenEditor si existe
    if (typeof window.__tokenEditor === 'function') {
      const editor = window.__tokenEditor();
      if (editor && typeof editor.loadTokens === 'function') {
        console.log('🔄 Reloading TokenEditor...');
        await editor.loadTokens();
      }
    }

    // Disparar evento personalizado para que otros componentes se actualicen
    window.dispatchEvent(new CustomEvent('tokens-cleared', {
      detail: { timestamp: Date.now() }
    }));

    console.log('✅ Custom tokens cleared and UI updated');
  }

  // Aplicar el tema
  applyTheme(targetIsDark);
};

// Adjuntar el toggle al botón
const attachThemeToggle = () => {
  const toggleButton = document.getElementById("theme-toggle");
  if (!toggleButton) return;

  // Remover listeners anteriores clonando el botón
  const newButton = toggleButton.cloneNode(true);
  toggleButton.parentNode.replaceChild(newButton, toggleButton);

  // Agregar nuevo listener
  newButton.addEventListener("click", handleThemeToggle);
  
  console.log('🔘 Theme toggle button attached');
};

// Inicializar sistema
const initThemeSystem = () => {
  initializeTheme();
  attachThemeToggle();
};

// Auto-inicializar en carga
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeSystem);
} else {
  initThemeSystem();
}

// Manejar eventos de Astro View Transitions
document.addEventListener("astro:after-swap", initThemeSystem);
document.addEventListener("astro:page-load", attachThemeToggle);

// Exportar funciones para uso externo
export {
  hasCustomTokens,
  downloadCurrentTokens,
  applyTheme,
  getThemePreference,
  initializeTheme,
  handleThemeToggle,
  attachThemeToggle
};
