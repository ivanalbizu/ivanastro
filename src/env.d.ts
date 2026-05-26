/// <reference types="astro/client" />

// Declaraciones globales para window
interface Window {
  __tokenEditor?: () => any;
  __tokenManager?: () => any;
  clearTokenStyles?: () => boolean;
}
