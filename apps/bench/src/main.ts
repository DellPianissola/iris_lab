import { createDomFromGlobals, importSvg, type ImportedSvg } from '@nomai/svg-kit'
import {
  backdrops,
  kindLabels,
  modeLabels,
  toneDefaults,
  warningLabels,
  type BackdropId,
} from './config'
import { samples } from './samples'

const dom = createDomFromGlobals()

interface BenchState {
  source: string
  label: string
  tone0: string
  tone1: string
  backdrop: BackdropId
}

const state: BenchState = {
  source: samples[0]?.markup ?? '',
  label: samples[0]?.name ?? '',
  tone0: toneDefaults.tone0,
  tone1: toneDefaults.tone1,
  backdrop: 'light',
}

const el = {
  samples: mustFind('samples'),
  drop: mustFind('drop'),
  file: mustFind('file') as HTMLInputElement,
  tone0: mustFind('tone0') as HTMLInputElement,
  tone1: mustFind('tone1') as HTMLInputElement,
  backdrop: mustFind('backdrop'),
  report: mustFind('report'),
  artOriginal: mustFind('artOriginal'),
  artThemed: mustFind('artThemed'),
  capThemed: mustFind('capThemed'),
  markup: mustFind('markup'),
}

function mustFind(id: string): HTMLElement {
  const node = document.getElementById(id)
  if (!node) throw new Error(`element #${id} is missing from index.html`)
  return node
}

function renderSampleList(): void {
  el.samples.innerHTML = ''

  for (const sample of samples) {
    const item = document.createElement('li')
    const button = document.createElement('button')
    button.textContent = sample.name
    button.setAttribute('aria-current', String(sample.name === state.label))
    button.addEventListener('click', () => select(sample.markup, sample.name))
    item.append(button)
    el.samples.append(item)
  }
}

function renderBackdropSwitch(): void {
  el.backdrop.innerHTML = ''

  for (const option of backdrops) {
    const button = document.createElement('button')
    button.textContent = option.label
    button.setAttribute('aria-pressed', String(option.id === state.backdrop))
    button.addEventListener('click', () => {
      state.backdrop = option.id
      renderStructure()
      render()
    })
    el.backdrop.append(button)
  }
}

function currentBackground(): string {
  const found = backdrops.find((option) => option.id === state.backdrop)
  return found ? found.background : backdrops[0].background
}

function renderReport(result: ImportedSvg | null): void {
  if (!result) {
    el.report.innerHTML =
      '<div class="title fail">Não é um SVG legível</div>' +
      '<div class="meta">O parser recusou o arquivo, ou não havia elemento &lt;svg&gt;.</div>'
    return
  }

  const { analysis } = result
  const swatches = analysis.palette
    .map((hex) => `<i style="background:${hex}" title="${hex}"></i>`)
    .join('')

  const warnings = analysis.warnings
    .map((warning) => `<div class="warn">⚠ ${warningLabels[warning.code] ?? warning.code}</div>`)
    .join('')

  el.report.innerHTML = `
    <div class="title">
      ${kindLabels[analysis.kind] ?? analysis.kind}
      <span class="swatches">${swatches}</span>
      <span class="mode">${modeLabels[result.mode] ?? result.mode}</span>
    </div>
    <div class="meta">
      <code>${analysis.kind}</code> ·
      ${analysis.palette.length} cor(es) detectada(s) ·
      proporção ${analysis.aspect.toFixed(2)}
    </div>
    ${warnings}
  `
}

function renderArt(target: HTMLElement, markup: string, themed: boolean): void {
  target.style.background = currentBackground()
  target.style.color = state.tone0
  target.style.setProperty('--tone-0', themed ? state.tone0 : '')
  target.style.setProperty('--tone-1', themed ? state.tone1 : '')
  target.innerHTML = markup
}

/** Only what reflects the selection — rebuilding this on every colour drag would destroy focus. */
function renderStructure(): void {
  renderSampleList()
  renderBackdropSwitch()
}

function render(): void {
  const result = importSvg(state.source, dom)

  renderReport(result)

  if (!result) {
    el.artOriginal.innerHTML = ''
    el.artThemed.innerHTML = ''
    el.markup.textContent = ''
    return
  }

  renderArt(el.artOriginal, result.original, false)
  renderArt(el.artThemed, result.themed, true)
  // The bench always shows the recoloured version, even when the default is to keep the
  // original colours — the point is seeing what the swap would do. Without this note the
  // pane contradicts the report.
  el.capThemed.textContent =
    result.mode === 'original' ? 'não é o padrão para este arquivo' : 'tons injetados'
  el.markup.textContent = result.themed
}

function select(markup: string, label: string): void {
  state.source = markup
  state.label = label
  renderStructure()
  render()
}

function readDroppedFile(file: File): void {
  const reader = new FileReader()
  reader.addEventListener('load', () => select(String(reader.result), file.name))
  reader.readAsText(file)
}

function bindFileInput(): void {
  el.drop.addEventListener('click', () => el.file.click())
  el.file.addEventListener('change', () => {
    const file = el.file.files?.[0]
    if (file) readDroppedFile(file)
    el.file.value = ''
  })

  for (const event of ['dragenter', 'dragover'] as const) {
    el.drop.addEventListener(event, (e) => {
      e.preventDefault()
      el.drop.classList.add('over')
    })
  }

  for (const event of ['dragleave', 'drop'] as const) {
    el.drop.addEventListener(event, (e) => {
      e.preventDefault()
      el.drop.classList.remove('over')
    })
  }

  el.drop.addEventListener('drop', (e) => {
    const file = (e as DragEvent).dataTransfer?.files?.[0]
    if (file) readDroppedFile(file)
  })
}

function bindToneInputs(): void {
  el.tone0.value = state.tone0
  el.tone1.value = state.tone1

  el.tone0.addEventListener('input', () => {
    state.tone0 = el.tone0.value
    render()
  })
  el.tone1.addEventListener('input', () => {
    state.tone1 = el.tone1.value
    render()
  })
}

bindFileInput()
bindToneInputs()
renderStructure()
render()
