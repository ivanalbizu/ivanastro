interface Social {
  label: string;
  name: string;
  href: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  author: {
    name: string;
    bio: string;
    avatar?: string;
  };
  social: Social[];
  siteUrl: string;
  pageSize: number;
}

export const config: SiteConfig = {
  title: "Iván Albizu",
  description: "Maquetador web que le gusta trastear e investigar diferentes \"cacharros\"",
  author: {
    name: "Iván Albizu",
    bio: "He estudiado FP Superior Aplicaciones móviles Android, desarrollado diferentes sitios con temas propios en Wordpress. Actualmente desarrollando una App Web con nodejs para integrar la Api de Mailjet en el diseño de Newsletter con MJML, usando Autenticación con JWT, base de datos Mongo para Login, Pug para las vistas de la aplicación, expressjs para manejar las rutas, gulp para tareas de la App y alguna otra cosa más.\nRecienteme estaba en departamento de Commerce maquetando diseños a medida de tiendas online construidas mediante Prestashop y Wordpress.",
    // avatar: "/images/avatar.jpg" // Uncomment and add your avatar image to public/images/
  },
  social: [
    {
      label: "Github",
      name: "github",
      href: "https://github.com/ivanalbizu"
    },
    {
      label: "Codepen",
      name: "codepen",
      href: "https://codepen.io/ivan_albizu",
    },
    {
      label: "Linkedin",
      name: "linkedin",
      href: "https://www.linkedin.com/in/ivanalbizu",
    },
    {
      label: "Twitter",
      name: "twitter",
      href: "https://x.com/ivan_albizu"
    }
  ],
  siteUrl: "https://ivanalbizu.eu/",
  pageSize: 10
};

// Export constants for SEO component
export const SITE_TITLE = config.title;
export const SITE_DESCRIPTION = config.description;
