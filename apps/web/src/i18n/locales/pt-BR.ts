import type { FontId, PresetId } from '@nomai/theme'

/**
 * Fonte da verdade das traduções. Os outros idiomas são tipados como `typeof ptBR`, então
 * chave faltando em qualquer um deles é erro de compilação — não string crua na tela.
 *
 * Interpolação entra como função para que a assinatura também seja verificada: um idioma
 * que esqueça um argumento não compila.
 */
export const ptBR = {
  locale: {
    label: 'Idioma',
    names: { 'pt-BR': 'Português', en: 'English', es: 'Español' },
  },

  app: {
    tagline:
      'Suba seu logo, troque as cores e veja tudo aplicado num site de verdade. Nada é enviado pra lugar nenhum — roda 100% no seu navegador.',
    modes: { light: 'Claro', dark: 'Escuro' },
    shortcutHint: (key: string) => `Dica: aperte ${key} pra sortear uma paleta`,
    cards: {
      lockups: 'Logo em contexto',
      site: 'Site',
      favicon: 'Favicon / ícone de app',
    },
  },

  palette: {
    title: 'Paleta',
    tokens: {
      brand: 'Principal',
      accent: 'Acento',
      bg: 'Fundo',
      surface: 'Superfície',
      text: 'Texto',
      muted: 'Texto suave',
      line: 'Bordas',
    },
    randomize: 'Aleatório',
    harmonize: 'Derivar do principal',
    invert: 'Inverter claro/escuro',
    note: '“Derivar do principal” recalcula fundo, superfície, texto e acento a partir da cor principal.',
  },

  presets: {
    title: 'Presets',
    names: {
      'iris-framboesa': 'Íris framboesa',
      'iris-indigo': 'Íris índigo',
      'iris-ambar': 'Íris âmbar',
      'iris-escuro': 'Íris no escuro',
      'indigo-puro': 'Índigo puro',
      floresta: 'Floresta',
      'carvao-neon': 'Carvão néon',
      terracota: 'Terracota',
      'tinta-coral': 'Tinta e coral',
      'ciano-noturno': 'Ciano noturno',
      'malva-suave': 'Malva suave',
      'vermelho-seco': 'Vermelho seco',
      // `satisfies` obriga a cobrir exatamente os ids declarados em @nomai/theme: preset
      // novo sem tradução vira erro de compilação, que é a razão de o dicionário ser tipado.
    } satisfies Record<PresetId, string>,
  },

  symbol: {
    title: 'Símbolo',
    dropzone: { line1: 'Arraste seus SVG / PNG aqui', line2: 'ou clique pra escolher' },
    remove: (name: string) => `Remover ${name}`,
    plate: 'Símbolo dentro de uma plaquinha (fundo da cor principal)',
    size: 'Tamanho',
    corners: 'Cantos',
    note: 'Ao subir um arquivo, ele é analisado: contamos as cores reais (inclusive as escondidas em CSS interno) e já escolhemos se ele deve seguir o tema ou manter as próprias cores. O botão acima só existe pra você discordar.',
    failures: {
      'too-large': (name: string, limit: string) =>
        `“${name}” passa de ${limit}. Exporte um arquivo menor.`,
      unreadable: (name: string) => `Não consegui ler “${name}”. O arquivo parece corrompido.`,
    },
    kinds: {
      mono: {
        title: 'Logo de uma cor só',
        body: 'Pode assumir a cor do site com segurança.',
      },
      duo: {
        title: 'Logo de duas cores',
        body: 'A cor dominante vira a principal; a segunda vira o acento.',
      },
      multi: {
        title: 'Logo colorido',
        body: 'Recolorir descaracterizaria a marca — mantivemos as cores originais.',
      },
      raster: {
        title: 'Imagem embutida',
        body: 'É um bitmap dentro de um SVG: as cores não estão no desenho.',
      },
      'raster-opaque': {
        title: 'Imagem sem transparência',
        body: 'O fundo é sólido, então só dá pra usar como está.',
      },
    },
    warnings: {
      'embedded-raster':
        'Tem imagem rasterizada embutida — é um PNG dentro de um SVG, não dá pra recolorir.',
      gradient: 'Tem gradiente — as partes com gradiente ficam como estão.',
      'missing-viewbox': 'Sem viewBox: o desenho pode não escalar direito.',
      'opaque-raster':
        'Sem fundo transparente: colorir viraria um retângulo sólido. Exporte com fundo transparente pra poder trocar a cor.',
    },
    modes: { theme: 'Seguir o tema do site', original: 'Usar as cores do logo' },
  },

  typography: {
    title: 'Nome / tipografia',
    name: 'Nome',
    display: 'Display',
    body: 'Texto',
    tracking: 'Espaçamento',
    buttons: 'Botões',
    note: (separator: string) =>
      `Use ${separator} no nome pra destacar a segunda parte na cor da marca.`,
    fonts: {
      grotesk: 'Sistema (grotesk)',
      serif: 'Serifada',
      mono: 'Monoespaçada',
      geometric: 'Geométrica',
      condensed: 'Condensada',
    } satisfies Record<FontId, string>,
  },

  contrast: {
    title: 'Contraste (WCAG)',
    checks: {
      textOnBg: 'Texto / fundo',
      mutedOnBg: 'Texto suave / fundo',
      brandOnBg: 'Principal / fundo',
      onBrand: 'Botão (texto/principal)',
      accentOnBg: 'Acento / fundo',
      inkOnSoft: 'Principal como texto (pílula)',
    },
    // AAA e AA são termos da especificação e não se traduzem.
    grades: { aaa: 'AAA', aa: 'AA', large: 'AA grande', fail: 'falha' },
  },

  saved: {
    title: 'Combinações salvas',
    save: 'Salvar atual',
    download: 'Baixar CSS',
    empty: 'Nenhuma salva ainda.',
    remove: (index: number) => `Remover combinação ${index}`,
    note: 'As salvas ficam neste navegador. O CSS baixado traz os onze tokens — inclusive os derivados, então ele reproduz exatamente o que você está vendo.',
  },

  mockup: {
    nav: ['Produto', 'Preços', 'Docs', 'Blog'],
    signIn: 'Entrar',
    getStarted: 'Começar',
    pill: 'Novo — versão 2.0',
    headline: 'Um título que mostra ',
    headlineAccent: 'como sua marca soa',
    headlineTail: ' na primeira dobra.',
    lead: 'Este texto existe só pra você julgar legibilidade, contraste e o peso da cor principal contra o fundo. Troque a paleta no painel ao lado e veja tudo mudar.',
    primary: 'Criar conta grátis',
    secondary: 'Ver demonstração',
    accent: 'Acento',
    stats: { users: 'usuários ativos', uptime: 'uptime', rating: 'avaliação' },
    features: [
      {
        title: 'Rápido de verdade',
        body: 'Cada bloco aqui existe pra testar como o cinza do texto se comporta em cima da superfície.',
      },
      {
        title: 'Feito pra escalar',
        body: 'Troque a cor principal e observe o que acontece com ícones, pílulas e botões secundários.',
      },
      {
        title: 'Simples de usar',
        body: 'Se algum texto ficar difícil de ler, o painel de contraste ao lado vai te avisar.',
      },
    ],
    footer: (year: string) => `© ${year} — todos os direitos reservados`,
    backdrops: {
      bg: 'no fundo',
      surface: 'na superfície',
      brand: 'sobre a marca',
      mono: 'monocromático',
    },
    tabTitle: 'início',
  },
}

export type Dictionary = typeof ptBR
