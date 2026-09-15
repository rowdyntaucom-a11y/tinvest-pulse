import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import './features/portfolio/portfolioOverviewGrid.css'
import './features/analytics/drift.css'
import './features/analytics/monteCarlo.css'
import './features/board/boardShell.css'
import './features/settings/boardPersonalization.css'
import './final-shell.css'
import './informationArchitecture.css'
import './ambientShell.css'
import './dataFillMotion.css'
import './workspaceMotion.css'
import './themeSurfaces.css'
import './drilldownMotion.css'
import './controlFeedback.css'
import './mobileReadability.css'
import './boardReadability.css'

const ContextHelp = lazy(() => import('./features/help/ContextHelp').then(module => ({ default: module.ContextHelp })))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Suspense fallback={null}><ContextHelp /></Suspense>
  </React.StrictMode>,
)
