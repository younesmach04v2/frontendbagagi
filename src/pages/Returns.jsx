import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import ReturnCard from '../components/ReturnCard'
import { getApiBase } from '../apiConfig'

import SyncAltIcon            from '@mui/icons-material/SyncAlt'
import LightbulbOutlinedIcon  from '@mui/icons-material/LightbulbOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import SearchOutlinedIcon     from '@mui/icons-material/SearchOutlined'

export default function Returns() {
  const data = useData()
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [allTrips, setAllTrips]   = useState([])
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo,   setFilterTo]   = useState('')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    fetch(`${getApiBase()}/roundtrips`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setAllTrips(d); setLoadingTrips(false) })
      .catch(() => setLoadingTrips(false))
  }, [])

  const trips = allTrips.filter(t => {
    if (filterFrom && t.from_city !== filterFrom) return false
    if (filterTo   && t.to_city   !== filterTo)   return false
    if (filterDate && t.depart_date < filterDate)  return false
    return true
  })

  async function handleBookRoundTrip({ trip: tr, leg, kg, total }) {
    if (!user || (user.role !== 'etudiant' && user.role !== 'admin')) {
      toast('Connectez-vous en tant qu’étudiant pour réserver.', 'error')
      navigate('/login')
      return
    }
    try {
      const updated = await api.post(`/student/roundtrips/${tr.id}/reserve`, { kg, leg })
      const o = updated.outbound?.kg_remaining ?? 0
      const rr = updated.return?.kg_remaining ?? 0
      const legLabel = leg === 'outbound' ? 'aller' : 'retour'
      toast(
        `Réservé (${legLabel}) : ${kg} kg · ${total} DH. Reste — aller : ${o} kg · retour : ${rr} kg.`,
        'success',
      )
      const res = await fetch(`${getApiBase()}/roundtrips`)
      const d = res.ok ? await res.json() : []
      setAllTrips(d)
    } catch (e) {
      toast(e.message || 'Réservation impossible', 'error')
    }
  }

  function handleSearch() {
    const msg = trips.length === allTrips.length
      ? 'Affichage de tous les trajets disponibles'
      : `${trips.length} trajet(s) trouvé(s)`
    toast(msg, 'info')
  }

  return (
    <div className="page" style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 900 }}>

        <div style={{ marginBottom: 36 }}>
          <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SyncAltIcon style={{ fontSize: '0.9rem' }} /> Trajets Aller-Retour
          </div>
          <h2 style={{ marginTop: 8 }}>Conducteurs disponibles pour un A/R</h2>
          <p style={{ maxWidth: 560, marginTop: 8 }}>
            Des conducteurs Bagagi planifient des allers-retours entre les villes du Maroc.
            Réservez l'espace disponible dans leur véhicule à prix réduit.
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="card" style={{ padding: 20, marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Depuis</label>
              <select className="form-select" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}>
                <option value="">Toutes les villes</option>
                {data.CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Vers</label>
              <select className="form-select" value={filterTo} onChange={e => setFilterTo(e.target.value)}>
                <option value="">Toutes les villes</option>
                {data.CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">À partir du</label>
              <input className="form-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleSearch}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SearchOutlinedIcon style={{ fontSize: '1.1rem' }} /> Filtrer
            </button>
          </div>
        </div>

        {/* RESULTS */}
        {loadingTrips ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--mid-grey)' }}>Chargement...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {trips.length > 0
              ? trips.map(t => (
                  <ReturnCard
                    key={t.id}
                    trip={t}
                    onBook={handleBookRoundTrip}
                  />
                ))
              : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid-grey)' }}>
                    Aucun trajet disponible pour ce filtre.
                  </div>
                )
            }
          </div>
        )}

        {/* INFO BLOCK */}
        <div style={{ marginTop: 36, background: 'var(--emerald-glow)', border: '1px solid var(--emerald-glow)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
          <LightbulbOutlinedIcon style={{ fontSize: '1.5rem', color: 'var(--emerald)', marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>Comment fonctionne le système aller-retour ?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {[
              'Un conducteur planifie un aller-retour avec une capacité et un prix pour l\'aller, et une capacité et un prix pour le retour',
              'Vous réservez et payez chaque segment séparément (par tranches de 10 kg)',
              'Chaque tarif / 10 kg reste inférieur au tarif standard Bagagi sur la même route',
              'Les conducteurs voient leur capacité mise à jour après chaque réservation',
            ].map((line, i) => (
              <div key={i} className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--emerald)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--emerald-glow)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--emerald-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircleOutlineIcon style={{ fontSize: '1rem' }} />
            Impact positif : Chaque trajet optimisé réduit l'empreinte carbone (conforme ISO 26000)
          </div>
        </div>

      </div>
    </div>
  )
}
