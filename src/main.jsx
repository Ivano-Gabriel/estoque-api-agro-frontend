import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DialogProvider } from './components/DialogProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DialogProvider><App /></DialogProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // O sistema continua funcionando no navegador se a instalação não for suportada.
    })
  })
}
