/// <reference types="astro/client" />

// Declaraciones globales para window
interface Window {
  __tokenEditor?: () => any;
  __tokenManager?: () => any;
  clearTokenStyles?: () => boolean;
  jsyaml?: any;
}

// Declarar jsyaml como variable global
declare const jsyaml: any;
