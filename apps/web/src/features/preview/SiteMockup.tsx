import type { ThemeTokens } from '@nomai/theme'
import type { Mark } from '../../marks/types'
import { lockupScale } from '../../state/config'
import type { Controls } from '../../state/useBrandLab'
import { Glyph } from './Glyph'
import { Lockup } from './Lockup'
import { siteContent } from './content'

interface SiteMockupProps {
  readonly tokens: ThemeTokens
  readonly mark: Mark | undefined
  readonly controls: Controls
}

export function SiteMockup({ tokens, mark, controls }: SiteMockupProps) {
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
          {siteContent.nav.map((item, index) => (
            <li key={item} className={index === 0 ? 'current' : undefined}>
              {item}
            </li>
          ))}
        </ul>
        <span className="spacer" />
        <button type="button" className="btn-secondary btn-compact">
          {siteContent.navActions.secondary}
        </button>
        <button type="button" className="btn-primary btn-compact">
          {siteContent.navActions.primary}
        </button>
      </nav>

      <header className="site-hero">
        <div>
          <span className="pill">{siteContent.pill}</span>
          <h2>
            {siteContent.headline}
            <em>{siteContent.headlineAccent}</em>
            {siteContent.headlineTail}
          </h2>
          <p className="lead">{siteContent.lead}</p>
          <div className="cta">
            <button type="button" className="btn-primary">{siteContent.actions.primary}</button>
            <button type="button" className="btn-secondary">{siteContent.actions.secondary}</button>
            <button type="button" className="btn-accent">{siteContent.actions.accent}</button>
          </div>
        </div>

        <aside className="hero-art">
          <span className="bar bar-brand" />
          <span className="bar bar-wide" />
          <span className="bar bar-accent" />
          <span className="bar bar-narrow" />
          <div className="stats">
            {siteContent.stats.map((stat) => (
              <div key={stat.label} className="stat">
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </header>

      <div className="features">
        {siteContent.features.map((feature) => (
          <article key={feature.title} className="feature">
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
        <small>{siteContent.footer}</small>
      </footer>
    </div>
  )
}
