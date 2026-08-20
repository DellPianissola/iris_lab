import type { Dictionary } from './pt-BR'

/** Typed as `Dictionary`: a key missing here fails `tsc`, not runtime. */
export const en: Dictionary = {
  locale: {
    label: 'Language',
    names: { 'pt-BR': 'Português', en: 'English', es: 'Español' },
  },

  app: {
    modes: { light: 'Light', dark: 'Dark' },
    shortcutHint: (key: string) => `Tip: press ${key} for a random palette`,
    help: (about: string) => `Help about ${about}`,
    company: 'Nomai Code',
    tools: 'Tools',
    closeTool: 'Close panel',
    cards: {
      lockups: 'Logo in context',
      site: 'Site',
      favicon: 'Favicon / app icon',
    },
  },

  palette: {
    title: 'Palette',
    tokens: {
      brand: 'Brand',
      accent: 'Accent',
      bg: 'Background',
      surface: 'Surface',
      text: 'Text',
      muted: 'Muted text',
      line: 'Borders',
    },
    randomize: 'Random',
    harmonize: 'Derive from brand',
    invert: 'Flip light/dark',
    undo: 'Undo',
    redo: 'Redo',
    share: 'Copy link',
    shared: 'Link copied',
    shareNote:
      'The link carries the palette and the mode — not your logo, which never leaves this browser.',
    note: '“Derive from brand” recalculates background, surface, text and accent from the brand colour.',
  },

  presets: {
    title: 'Presets',
    names: {
      'iris-framboesa': 'Iris raspberry',
      'iris-indigo': 'Iris indigo',
      'iris-ambar': 'Iris amber',
      'iris-escuro': 'Iris after dark',
      'indigo-puro': 'Pure indigo',
      floresta: 'Forest',
      'carvao-neon': 'Neon charcoal',
      terracota: 'Terracotta',
      'tinta-coral': 'Ink and coral',
      'ciano-noturno': 'Night cyan',
      'malva-suave': 'Soft mauve',
      'vermelho-seco': 'Dry red',
    },
  },

  symbol: {
    title: 'Symbol',
    dropzone: { line1: 'Drop your SVG / PNG here', line2: 'or click to choose' },
    remove: (name: string) => `Remove ${name}`,
    select: (name: string) => `Use ${name}`,
    selectBuiltin: (position: number) => `Use symbol ${position}`,
    plate: 'Symbol inside a plate (brand-coloured background)',
    size: 'Size',
    corners: 'Corners',
    note: 'When you upload a file we analyse it: we count the real colours — including the ones hidden in internal CSS — and decide whether it should follow the theme or keep its own. The switch above only exists for when you disagree.',
    failures: {
      'too-large': (name: string, limit: string) =>
        `“${name}” is over ${limit}. Please export a smaller file.`,
      unreadable: (name: string) => `I couldn’t read “${name}”. The file looks corrupted.`,
    },
    kinds: {
      mono: {
        title: 'Single-colour logo',
        body: 'It can safely take on the site’s colour.',
      },
      duo: {
        title: 'Two-colour logo',
        body: 'The dominant colour becomes the brand; the second becomes the accent.',
      },
      multi: {
        title: 'Multicoloured logo',
        body: 'Recolouring would break the brand — we kept the original colours.',
      },
      raster: {
        title: 'Embedded image',
        body: 'It’s a bitmap inside an SVG: the colours aren’t in the drawing.',
      },
      'raster-opaque': {
        title: 'Image without transparency',
        body: 'The background is solid, so it can only be used as is.',
      },
    },
    warnings: {
      'embedded-raster':
        'It contains an embedded raster image — a PNG inside an SVG, which can’t be recoloured.',
      gradient: 'It contains a gradient — the gradient parts stay as they are.',
      'missing-viewbox': 'No viewBox: the drawing may not scale properly.',
      'opaque-raster':
        'No transparent background: colouring it would produce a solid rectangle. Export with a transparent background to change its colour.',
    },
    modes: { theme: 'Follow the site theme', original: 'Keep the logo’s colours' },
  },

  typography: {
    title: 'Name / typography',
    name: 'Name',
    display: 'Display',
    body: 'Body',
    tracking: 'Tracking',
    buttons: 'Buttons',
    note: (separator: string) =>
      `Use ${separator} in the name to highlight the second part in the brand colour.`,
    fonts: {
      grotesk: 'System (grotesk)',
      serif: 'Serif',
      mono: 'Monospace',
      geometric: 'Geometric',
      condensed: 'Condensed',
    },
  },

  contrast: {
    title: 'Contrast (WCAG)',
    checks: {
      textOnBg: 'Text / background',
      mutedOnBg: 'Muted text / background',
      brandOnBg: 'Brand / background',
      onBrand: 'Button (text/brand)',
      accentOnBg: 'Accent / background',
      inkOnSoft: 'Brand as text (pill)',
    },
    grades: { aaa: 'AAA', aa: 'AA', large: 'AA large', fail: 'fail' },
    summary: (passing: number, total: number) => `${passing} of ${total} pass`,
  },

  saved: {
    title: 'Saved combinations',
    save: 'Save current',
    download: 'Download CSS',
    empty: 'Nothing saved yet.',
    remove: (index: number) => `Remove combination ${index}`,
    note: 'Saved palettes stay in this browser. The downloaded CSS carries all eleven tokens — including the derived ones — so it reproduces exactly what you are seeing.',
  },

  mockup: {
    nav: ['Product', 'Pricing', 'Docs', 'Blog'],
    signIn: 'Sign in',
    getStarted: 'Get started',
    pill: 'New — version 2.0',
    headline: 'A headline that shows ',
    headlineAccent: 'how your brand sounds',
    headlineTail: ' above the fold.',
    lead: 'This text exists so you can judge legibility, contrast and how heavy the brand colour feels against the background. Change the palette in the bar below and watch everything follow.',
    primary: 'Create free account',
    secondary: 'See the demo',
    accent: 'Accent',
    stats: { users: 'active users', uptime: 'uptime', rating: 'rating' },
    features: [
      {
        title: 'Genuinely fast',
        body: 'Every block here exists to test how the muted text behaves on top of the surface.',
      },
      {
        title: 'Built to scale',
        body: 'Change the brand colour and watch what happens to icons, pills and secondary buttons.',
      },
      {
        title: 'Simple to use',
        body: 'If any text becomes hard to read, the contrast panel will tell you.',
      },
    ],
    footer: (year: string) => `© ${year} — all rights reserved`,
    backdrops: {
      bg: 'on background',
      surface: 'on surface',
      brand: 'on the brand',
      mono: 'monochrome',
    },
    tabTitle: 'home',
  },
}
