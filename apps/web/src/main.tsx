import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { detectLocale, I18nProvider } from './i18n'
import './styles/app.css'
import './styles/preview.css'

// Antes da primeira pintura: o `lang` do documento governa hifenização, corretor e leitor
// de tela, e o index.html não tem como saber o idioma de quem abriu.
document.documentElement.lang = detectLocale()

const container = document.getElementById('root')
if (!container) throw new Error('#root não existe no index.html')

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
