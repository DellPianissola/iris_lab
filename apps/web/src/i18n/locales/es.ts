import type { Dictionary } from './pt-BR'

export const es: Dictionary = {
  locale: {
    label: 'Idioma',
    names: { 'pt-BR': 'Português', en: 'English', es: 'Español' },
  },

  app: {
    modes: { light: 'Claro', dark: 'Oscuro' },
    shortcutHint: (key: string) => `Consejo: pulsa ${key} para una paleta al azar`,
    help: (about: string) => `Ayuda sobre ${about}`,
    company: 'Nomai Code',
    tools: 'Herramientas',
    closeTool: 'Cerrar panel',
  },

  brand: {
    title: 'Marca',
    lockups: 'Logo en contexto',
    favicon: 'Favicon / icono de app',
  },

  palette: {
    title: 'Paleta',
    tokens: {
      brand: 'Principal',
      accent: 'Acento',
      bg: 'Fondo',
      surface: 'Superficie',
      text: 'Texto',
      muted: 'Texto atenuado',
      line: 'Bordes',
    },
    randomize: 'Aleatorio',
    harmonize: 'Derivar del principal',
    invert: 'Invertir claro/oscuro',
    undo: 'Deshacer',
    redo: 'Rehacer',
    share: 'Copiar enlace',
    shared: 'Enlace copiado',
    shareNote:
      'El enlace lleva la paleta y el modo — no tu logo, que nunca sale de este navegador.',
    note: '“Derivar del principal” recalcula fondo, superficie, texto y acento a partir del color principal.',
  },

  presets: {
    title: 'Presets',
    names: {
      'iris-framboesa': 'Íris frambuesa',
      'iris-indigo': 'Íris índigo',
      'iris-ambar': 'Íris ámbar',
      'iris-escuro': 'Íris en oscuro',
      'indigo-puro': 'Índigo puro',
      floresta: 'Bosque',
      'carvao-neon': 'Carbón neón',
      terracota: 'Terracota',
      'tinta-coral': 'Tinta y coral',
      'ciano-noturno': 'Cian nocturno',
      'malva-suave': 'Malva suave',
      'vermelho-seco': 'Rojo seco',
    },
  },

  symbol: {
    title: 'Símbolo',
    dropzone: { line1: 'Arrastra tus SVG / PNG aquí', line2: 'o haz clic para elegir' },
    remove: (name: string) => `Eliminar ${name}`,
    select: (name: string) => `Usar ${name}`,
    selectBuiltin: (position: number) => `Usar el símbolo ${position}`,
    plate: 'Símbolo dentro de una placa (fondo del color principal)',
    size: 'Tamaño',
    corners: 'Esquinas',
    note: 'Al subir un archivo lo analizamos: contamos los colores reales — incluidos los escondidos en CSS interno — y ya elegimos si debe seguir el tema o mantener los suyos. El botón de arriba solo existe para que discrepes.',
    failures: {
      'too-large': (name: string, limit: string) =>
        `“${name}” supera ${limit}. Exporta un archivo más pequeño.`,
      unreadable: (name: string) => `No pude leer “${name}”. El archivo parece dañado.`,
    },
    kinds: {
      mono: {
        title: 'Logo de un solo color',
        body: 'Puede tomar el color del sitio sin problema.',
      },
      duo: {
        title: 'Logo de dos colores',
        body: 'El color dominante pasa a ser el principal; el segundo, el acento.',
      },
      multi: {
        title: 'Logo a color',
        body: 'Recolorearlo desvirtuaría la marca — mantuvimos los colores originales.',
      },
      raster: {
        title: 'Imagen incrustada',
        body: 'Es un mapa de bits dentro de un SVG: los colores no están en el dibujo.',
      },
      'raster-opaque': {
        title: 'Imagen sin transparencia',
        body: 'El fondo es sólido, así que solo se puede usar tal cual.',
      },
    },
    warnings: {
      'embedded-raster':
        'Contiene una imagen rasterizada incrustada — un PNG dentro de un SVG, que no se puede recolorear.',
      gradient: 'Contiene un degradado — las partes con degradado quedan como están.',
      'missing-viewbox': 'Sin viewBox: el dibujo puede no escalar correctamente.',
      'opaque-raster':
        'Sin fondo transparente: colorearlo daría un rectángulo sólido. Expórtalo con fondo transparente para poder cambiar el color.',
    },
    modes: { theme: 'Seguir el tema del sitio', original: 'Usar los colores del logo' },
  },

  typography: {
    title: 'Nombre / tipografía',
    name: 'Nombre',
    display: 'Display',
    body: 'Texto',
    tracking: 'Espaciado',
    buttons: 'Botones',
    note: (separator: string) =>
      `Usa ${separator} en el nombre para destacar la segunda parte con el color de la marca.`,
    fonts: {
      grotesk: 'Sistema (grotesk)',
      serif: 'Con serifa',
      mono: 'Monoespaciada',
      geometric: 'Geométrica',
      condensed: 'Condensada',
    },
  },

  contrast: {
    title: 'Contraste (WCAG)',
    checks: {
      textOnBg: 'Texto / fondo',
      mutedOnBg: 'Texto atenuado / fondo',
      brandOnBg: 'Principal / fondo',
      onBrand: 'Botón (texto/principal)',
      accentOnBg: 'Acento / fondo',
      inkOnSoft: 'Principal como texto (píldora)',
    },
    grades: { aaa: 'AAA', aa: 'AA', large: 'AA grande', fail: 'falla' },
    summary: (passing: number, total: number) => `${passing} de ${total} aprueban`,
  },

  saved: {
    title: 'Combinaciones guardadas',
    save: 'Guardar actual',
    download: 'Descargar CSS',
    empty: 'Nada guardado todavía.',
    remove: (index: number) => `Eliminar combinación ${index}`,
    note: 'Las guardadas se quedan en este navegador. El CSS descargado incluye los once tokens — también los derivados — así que reproduce exactamente lo que estás viendo.',
  },

  mockup: {
    nav: ['Producto', 'Precios', 'Docs', 'Blog'],
    signIn: 'Entrar',
    getStarted: 'Empezar',
    pill: 'Nuevo — versión 2.0',
    headline: 'Un titular que muestra ',
    headlineAccent: 'cómo suena tu marca',
    headlineTail: ' en la primera pantalla.',
    lead: 'Este texto existe solo para que juzgues legibilidad, contraste y el peso del color principal contra el fondo. Cambia la paleta en la barra de abajo y mira cómo todo la sigue.',
    primary: 'Crear cuenta gratis',
    secondary: 'Ver demostración',
    accent: 'Acento',
    stats: { users: 'usuarios activos', uptime: 'uptime', rating: 'valoración' },
    features: [
      {
        title: 'Rápido de verdad',
        body: 'Cada bloque existe para probar cómo se comporta el texto atenuado sobre la superficie.',
      },
      {
        title: 'Hecho para escalar',
        body: 'Cambia el color principal y observa qué pasa con iconos, píldoras y botones secundarios.',
      },
      {
        title: 'Sencillo de usar',
        body: 'Si algún texto se vuelve difícil de leer, el panel de contraste te avisará.',
      },
    ],
    footer: (year: string) => `© ${year} — todos los derechos reservados`,
    backdrops: {
      bg: 'sobre el fondo',
      surface: 'sobre la superficie',
      brand: 'sobre la marca',
      mono: 'monocromo',
    },
    tabTitle: 'inicio',
  },
}
