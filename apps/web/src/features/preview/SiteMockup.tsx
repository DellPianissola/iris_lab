import type { ThemeTokens } from '@nomai/theme'
import { useI18n } from '../../i18n'
import type { Mark } from '../../marks/types'
import { lockupScale } from '../../state/config'
import type { Controls } from '../../state/useBrandLab'
import { Glyph } from './Glyph'
import { Lockup } from './Lockup'
import { mockupStats } from './mockup-data'

/** O ano não muda durante a sessão; ler o relógio a cada repintura seria desperdício. */
const CURRENT_YEAR = String(new Date().getFullYear())

interface SiteMockupProps {
  readonly tokens: ThemeTokens
  readonly mark: Mark | undefined
  readonly controls: Controls
}

export function SiteMockup({ tokens, mark, controls }: SiteMockupProps) {
  const { t, format } = useI18n()
  const copy = t.mockup

  const stats = [
    { key: 'users', value: format.integer(mockupStats.users), label: copy.stats.users },
    { key: 'uptime', value: format.percent(mockupStats.uptime), label: copy.stats.uptime },
    { key: 'rating', value: `${format.decimal(mockupStats.rating)}★`, label: copy.stats.rating },
  ]

  return (
    <div className="site">
      <nav className="site-nav">
        <Lockup
          mark={mark}
          wordmark={controls.wordmark}
          markSize={controls.markSize}
          wordSize={Math.round(controls.markSize * lockupScale.navWord)}
        />
        <ul className="site-links">
          {copy.nav.map((item, index) => (
            <li key={index} className={index === 0 ? 'current' : undefined}>
              {item}
            </li>
          ))}
        </ul>
        <span className="spacer" />
        <button type="button" className="btn-secondary btn-compact">{copy.signIn}</button>
        <button type="button" className="btn-primary btn-compact">{copy.getStarted}</button>
      </nav>

      <header className="site-hero">
        <div>
          <span className="pill">● {copy.pill}</span>
          <h2>
            {copy.headline}
            <em>{copy.headlineAccent}</em>
            {copy.headlineTail}
          </h2>
          <p className="lead">{copy.lead}</p>
          <div className="cta">
            <button type="button" className="btn-primary">{copy.primary}</button>
            <button type="button" className="btn-secondary">{copy.secondary}</button>
            <button type="button" className="btn-accent">{copy.accent}</button>
          </div>
        </div>

        <aside className="hero-art">
          <span className="bar bar-brand" />
          <span className="bar bar-wide" />
          <span className="bar bar-accent" />
          <span className="bar bar-narrow" />
          <div className="stats">
            {stats.map((stat) => (
              <div key={stat.key} className="stat">
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </header>

      <div className="features">
        {copy.features.map((feature, index) => (
          <article key={index} className="feature">
            <span className="feature-icon" style={{ color: tokens.brandInk }}>
              <Glyph mark={mark} />
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </div>

      <footer className="site-foot">
        <Lockup
          mark={mark}
          wordmark={controls.wordmark}
          markSize={Math.round(controls.markSize * lockupScale.footMark)}
          wordSize={Math.round(controls.markSize * lockupScale.footWord)}
        />
        <span className="spacer" />
        <small>{copy.footer(CURRENT_YEAR)}</small>
      </footer>
    </div>
  )
}
