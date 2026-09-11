import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import './features/analytics/drift.css'
import './features/analytics/monteCarlo.css'
import './final-shell.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
