import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { detectLocale, I18nProvider } from './i18n'
import './styles/app.css'
import './styles/preview.css'

// Before the first paint: the document `lang` governs hyphenation, spellcheck and screen
// readers, and index.html has no way to know the language of whoever opened it.
document.documentElement.lang = detectLocale()

const container = document.getElementById('root')
if (!container) throw new Error('#root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
