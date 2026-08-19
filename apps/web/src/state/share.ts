import { PALETTE_KEYS, type Palette, type ThemeMode } from '@nomai/theme'

/**
 * Paleta ↔ hash da URL. É o que transforma "olha essa paleta" num link — e, sem servidor,
 * custa zero: o estado inteiro cabe no fragmento, que o navegador nunca envia a lugar nenhum.
 *
 * **O símbolo fica de fora de propósito.** Arquivo enviado nunca sai do navegador de quem
 * enviou, então uma referência a ele no link chegaria quebrada do outro lado — e apontar
 * para um arquivo local contradiria a promessa que sustenta o produto.
 *
 * Parâmetros nomeados em vez de posicionais: dá para ler o link, e um valor corrompido
 * descarta só aquele token em vez de deslocar todos os outros.
 */

const MODE_PARAM = 'mode'
const HEX = /^[0-9a-f]{6}$/i

export interface SharedState {
  readonly palette: Partial<Palette>
  readonly mode?: ThemeMode
}

export function encodeShare(palette: Palette, mode: ThemeMode): string {
  const params = new URLSearchParams()

  for (const key of PALETTE_KEYS) {
    // Sem o `#`: dentro de um fragmento ele só confunde quem lê, e economiza sete caracteres.
    params.set(key, palette[key].replace('#', '').toLowerCase())
  }
  params.set(MODE_PARAM, mode)

  return params.toString()
}

export function decodeShare(hash: string): SharedState {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const palette: Partial<Palette> = {}

  for (const key of PALETTE_KEYS) {
    const value = params.get(key)
    if (value && HEX.test(value)) palette[key] = `#${value.toLowerCase()}`
  }

  const mode = params.get(MODE_PARAM)
  return mode === 'light' || mode === 'dark' ? { palette, mode } : { palette }
}

/** Um link só é útil se trouxer a paleta inteira; token faltando cai no padrão da app. */
export function isCompletePalette(palette: Partial<Palette>): palette is Palette {
  return PALETTE_KEYS.every((key) => Boolean(palette[key]))
}
