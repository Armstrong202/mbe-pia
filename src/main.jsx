import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

/**
 * Configuration du client React Query
 * Optimisé pour une application financière / SaaS (Tontine)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Les données sont considérées fraîches pendant 5 min
      gcTime: 1000 * 60 * 30, // Conserve le cache en mémoire pendant 30 min
      retry: 2, // Re-tente 2 fois en cas de micro-coupure réseau (4G/Mobile)
      refetchOnWindowFocus: false, // Évite d'inonder le backend lors des changements d'onglets
    },
  },
})

/**
 * Composant de secours (Error Boundary)
 * Capture les erreurs non gérées dans React et affiche une UI propre au lieu d'une page blanche
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 [MBE-PIA Critical UI Error]:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '1.5rem'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f87171', marginBottom: '0.5rem' }}>
              Une erreur inattendue est survenue
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              L'application MBE-PIA a rencontré un problème. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Recharger l'application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Vérification stricte du point de montage DOM
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error("❌ Erreur critique : L'élément HTML #root est introuvable dans index.html")
}

// Rendu racine React 18+
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)