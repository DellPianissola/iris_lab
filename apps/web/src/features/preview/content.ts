/**
 * Texto do mockup. É conteúdo, não código — existe para você julgar legibilidade e peso da
 * cor, então cada bloco exercita um token diferente.
 */

export const siteContent = {
  nav: ['Produto', 'Preços', 'Docs', 'Blog'],
  navActions: { secondary: 'Entrar', primary: 'Começar' },
  pill: '● Novo — versão 2.0',
  headline: 'Um título que mostra ',
  headlineAccent: 'como sua marca soa',
  headlineTail: ' na primeira dobra.',
  lead:
    'Este texto existe só pra você julgar legibilidade, contraste e o peso da cor principal ' +
    'contra o fundo. Troque a paleta no painel ao lado e veja tudo mudar.',
  actions: { primary: 'Criar conta grátis', secondary: 'Ver demonstração', accent: 'Acento' },
  stats: [
    { value: '12.480', label: 'usuários ativos' },
    { value: '99,9%', label: 'uptime' },
    { value: '4,8★', label: 'avaliação' },
  ],
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
  footer: '© 2026 — todos os direitos reservados',
} as const

export const lockupBackdrops = [
  { id: 'bg', label: 'no fundo' },
  { id: 'surface', label: 'na superfície' },
  { id: 'brand', label: 'sobre a marca' },
  { id: 'mono', label: 'monocromático' },
] as const

export const faviconTabLabel = 'início'
