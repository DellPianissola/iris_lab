import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/app.css'
import './styles/preview.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root não existe no index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
