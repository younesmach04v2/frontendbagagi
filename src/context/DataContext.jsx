import { createContext, useContext, useState, useEffect } from 'react'
import { getApiBase, getApiOrigin } from '../apiConfig'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${getApiBase()}/data`)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '4px solid rgba(0,104,79,0.2)', borderTopColor: 'var(--emerald)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--mid-grey)', fontFamily: 'var(--font-display)' }}>Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '120px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', color: '#ff6b6b', marginBottom: 16 }}>⚠</div>
        <strong style={{ color: '#ff6b6b' }}>Impossible de charger les données.</strong>
        <br />
        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          {import.meta.env.PROD && !getApiOrigin()
            ? <>Configurez <code>VITE_API_BASE_URL</code> sur Vercel (URL du backend Flask).</>
            : <>Vérifiez que le serveur Python tourne : <code>python server.py</code></>}
        </span>
      </div>
    )
  }

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
