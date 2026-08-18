/**
 * Conversões entre representações de cor. Aritmética pura, sem opinião de produto.
 * Saturação e luminosidade circulam sempre em 0..1 — converter para 0..100 é problema de
 * quem exibe.
 */

export type Rgb = readonly [number, number, number]
export type Hsl = readonly [number, number, number]

export function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(channelToHex).join('')
}

function channelToHex(n: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(n)))
  return clamped.toString(16).padStart(2, '0')
}

export function hexToRgb(hex: string): Rgb {
  let digits = hex.replace('#', '')
  if (digits.length === 3) digits = digits.split('').map((d) => d + d).join('')

  return [
    parseInt(digits.slice(0, 2), 16) || 0,
    parseInt(digits.slice(2, 4), 16) || 0,
    parseInt(digits.slice(4, 6), 16) || 0,
  ]
}

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const red = r / 255
  const green = g / 255
  const blue = b / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2

  if (delta === 0) return [0, 0, lightness]

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue: number
  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0)
  else if (max === green) hue = (blue - red) / delta + 2
  else hue = (red - green) / delta + 4

  return [hue * 60, saturation, lightness]
}

export function hexToHsl(hex: string): Hsl {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHsl(r, g, b)
}

export function hslToHex(hueDeg: number, saturation: number, lightness: number): string {
  const hue = ((hueDeg % 360) + 360) % 360
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const lift = lightness - chroma / 2

  const [r, g, b] = huePlane(hue, chroma, second)
  return toHex((r + lift) * 255, (g + lift) * 255, (b + lift) * 255)
}

function huePlane(hue: number, chroma: number, second: number): [number, number, number] {
  if (hue < 60) return [chroma, second, 0]
  if (hue < 120) return [second, chroma, 0]
  if (hue < 180) return [0, chroma, second]
  if (hue < 240) return [0, second, chroma]
  if (hue < 300) return [second, 0, chroma]
  return [chroma, 0, second]
}

/** Interpola linearmente em RGB. `amount` 0 devolve `from`; 1 devolve `to`. */
export function mix(from: string, to: string, amount: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  return toHex(
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  )
}
