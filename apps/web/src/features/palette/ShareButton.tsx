import { useEffect, useRef, useState } from 'react'
import { CheckIcon, LinkIcon } from '../../components/icons'
import { useI18n } from '../../i18n'

/** Tempo que a confirmação fica na tela antes de o botão voltar ao rótulo normal. */
const CONFIRMATION_MS = 2000

export function ShareButton() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sem isto, copiar e desmontar em seguida deixa o timer disparando num componente morto.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS)
    } catch {
      // Área de transferência negada (permissão ou contexto inseguro). A URL continua na
      // barra do navegador, então o caminho manual existe — travar aqui não ajudaria.
    }
  }

  return (
    <>
      <button type="button" onClick={() => void copy()}>
        {copied ? (
          <CheckIcon className="icon" aria-hidden="true" />
        ) : (
          <LinkIcon className="icon" aria-hidden="true" />
        )}
        {t.palette.share}
      </button>

      {/* Região à parte em vez de `aria-live` no próprio botão: com o rótulo estável, o
          leitor de tela anuncia a confirmação uma vez, e não o botão inteiro duas — na
          troca e de novo quando ela expira. */}
      <span className="sr-only" role="status">
        {copied ? t.palette.shared : ''}
      </span>
    </>
  )
}
