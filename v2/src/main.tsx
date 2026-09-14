import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ContextHelp } from './features/help/ContextHelp'
import './styles.css'
import './features/portfolio/portfolioOverviewGrid.css'
import './features/analytics/drift.css'
import './features/analytics/monteCarlo.css'
import './features/board/boardShell.css'
import './features/settings/boardPersonalization.css'
import './final-shell.css'
import './ambientShell.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <ContextHelp />
  </React.StrictMode>,
)
