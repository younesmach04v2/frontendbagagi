import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { getApiBase } from '../apiConfig'
import DynIcon from '../components/DynIcon'
import RoundTripPicker          from '../components/RoundTripPicker'

import AddOutlinedIcon            from '@mui/icons-material/AddOutlined'
import ListAltOutlinedIcon        from '@mui/icons-material/ListAltOutlined'
import LocationCityOutlinedIcon   from '@mui/icons-material/LocationCityOutlined'
import LocationOnOutlinedIcon     from '@mui/icons-material/LocationOnOutlined'
import CalendarTodayOutlinedIcon  from '@mui/icons-material/CalendarTodayOutlined'
import LuggageOutlinedIcon        from '@mui/icons-material/LuggageOutlined'
import AttachMoneyOutlinedIcon    from '@mui/icons-material/AttachMoneyOutlined'
import Inventory2OutlinedIcon     from '@mui/icons-material/Inventory2Outlined'
import SecurityOutlinedIcon       from '@mui/icons-material/SecurityOutlined'
import RocketLaunchOutlinedIcon   from '@mui/icons-material/RocketLaunchOutlined'
import InboxOutlinedIcon          from '@mui/icons-material/InboxOutlined'
import SchoolOutlinedIcon         from '@mui/icons-material/SchoolOutlined'
import CheckIcon                  from '@mui/icons-material/Check'
import RouteOutlinedIcon          from '@mui/icons-material/RouteOutlined'
import AutoAwesomeOutlinedIcon    from '@mui/icons-material/AutoAwesomeOutlined'
import LockOutlinedIcon           from '@mui/icons-material/LockOutlined'
import SyncAltIcon                from '@mui/icons-material/SyncAlt'
import OpenInNewOutlinedIcon      from '@mui/icons-material/OpenInNewOutlined'

import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'

const STATUS_LABEL = { open: 'Ouverte', accepted: 'Acceptée', delivered: 'Livrée', cancelled: 'Annulée' }
const STATUS_COLOR  = { open: 'var(--emerald)', accepted: '#F0A500', delivered: '#00a07a', cancelled: '#D94F3D' }

const SIZE_LABELS = { petit: 'Petit', moyen: 'Moyen', grand: 'Grand', colis: 'Colis' }

const LEG_LABEL = { outbound: 'Aller', return: 'Retour' }

function Meta({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--mid-grey)', marginTop: 3, flexWrap: 'wrap', rowGap: 2 }}>
      {children}
    </div>
  )
}

export default function Student() {
  const navigate = useNavigate()
  const data   = useData()
  const { toast } = useToast()
  const { user } = useAuth()
  const today  = new Date().toISOString().split('T')[0]

  const [tab, setTab]               = useState('new')
  const [myRequests, setMyRequests] = useState([])
  const [offersMap, setOffersMap]   = useState({})
  const [loadingReqs, setLoadingReqs] = useState(false)
  const [rtBookings, setRtBookings] = useState([])
  const [loadingRt, setLoadingRt] = useState(false)

  const [form, setForm] = useState({ from: 'Marrakech', to: '', date: '', price: '', groupage: false, insurance: false })
  const [selectedSize, setSelectedSize] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Pricing state
  const [routePricing, setRoutePricing] = useState(null)  // { km, petit, moyen, grand, colis }
  const [loadingPrice, setLoadingPrice] = useState(false)

  // Available round trips for this route
  const [availableTrips, setAvailableTrips] = useState([])

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })) }

  // ── Fetch pricing + available round trips whenever from/to changes ──────────
  useEffect(() => {
    if (!form.from || !form.to || form.from === form.to) {
      setRoutePricing(null)
      setAvailableTrips([])
      return
    }
    setLoadingPrice(true)
    fetch(`${getApiBase()}/pricing/${encodeURIComponent(form.from)}/${encodeURIComponent(form.to)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setRoutePricing(d); setLoadingPrice(false) })
      .catch(() => setLoadingPrice(false))

    fetch(`${getApiBase()}/roundtrips`)
      .then(r => r.ok ? r.json() : [])
      .then(all => setAvailableTrips(
        all.filter(t =>
          (t.from_city === form.from && t.to_city === form.to) ||
          (t.from_city === form.to && t.to_city === form.from)
        )
      ))
      .catch(() => setAvailableTrips([]))
  }, [form.from, form.to])

  // ── Auto-set price whenever size or route changes (locked — not editable) ──
  useEffect(() => {
    if (routePricing && selectedSize && routePricing[selectedSize]) {
      const base = routePricing[selectedSize]
      setF('price', String(form.insurance ? base + 5 : base))
    } else if (!routePricing || !selectedSize) {
      setF('price', '')
    }
  }, [selectedSize, routePricing, form.insurance])

  function handleSizeSelect(sizeId) { setSelectedSize(sizeId) }

  const loadRoundTripBookings = useCallback(async () => {
    setLoadingRt(true)
    try {
      const rows = await api.get('/student/roundtrip-bookings')
      setRtBookings(rows)
    } catch (err) { toast(err.message, 'error') }
    finally { setLoadingRt(false) }
  }, [])

  async function reserveRoundTrip({ trip: tr, leg, kg, total }) {
    try {
      const updated = await api.post(`/student/roundtrips/${tr.id}/reserve`, { kg, leg })
      const o = updated.outbound?.kg_remaining ?? 0
      const rr = updated.return?.kg_remaining ?? 0
      const legLabel = leg === 'outbound' ? 'aller' : 'retour'
      toast(`Réservé (${legLabel}) : ${kg} kg · ${total} DH. Reste — aller : ${o} kg · retour : ${rr} kg.`, 'success')
      const r = await fetch(`${getApiBase()}/roundtrips`)
      const all = r.ok ? await r.json() : []
      setAvailableTrips(all.filter(t =>
        (t.from_city === form.from && t.to_city === form.to) ||
        (t.from_city === form.to && t.to_city === form.from)
      ))
      loadRoundTripBookings()
    } catch (e) {
      toast(e.message || 'Réservation impossible', 'error')
    }
  }

  // ── Data loading ───────────────────────────────────────────────────────────
  const loadRequests = useCallback(async () => {
    setLoadingReqs(true)
    try {
      const reqs = await api.get('/student/requests')
      setMyRequests(reqs)
    } catch (err) { toast(err.message, 'error') }
    finally { setLoadingReqs(false) }
  }, [])

  useEffect(() => { if (tab === 'requests') loadRequests() }, [tab, loadRequests])
  useEffect(() => { if (tab === 'rt_bookings') loadRoundTripBookings() }, [tab, loadRoundTripBookings])

  async function loadOffers(reqId) {
    try {
      const offers = await api.get(`/student/requests/${reqId}/offers`)
      setOffersMap(p => ({ ...p, [reqId]: offers }))
    } catch (err) { toast(err.message, 'error') }
  }

  async function submitRequest() {
    if (!form.to)       return toast('Choisissez une ville de destination', 'error')
    if (!form.date)     return toast('Choisissez une date', 'error')
    if (!selectedSize)  return toast('Sélectionnez la taille de votre bagage', 'error')
    if (!form.price)    return toast('Sélectionnez d\'abord une ville de destination et une taille', 'error')

    setSubmitting(true)
    try {
      await api.post('/student/requests', {
        from_city: form.from,
        to_city:   form.to,
        date:      form.date,
        price:     form.price,
        size:      selectedSize,
        groupage:  form.groupage,
        insurance: form.insurance,
      })
      toast('Demande publiée ! Les conducteurs vont recevoir votre demande.', 'success')
      setForm({ from: 'Marrakech', to: '', date: '', price: '', groupage: false, insurance: false })
      setSelectedSize(null)
      setRoutePricing(null)
      setTab('requests')
    } catch (err) { toast(err.message, 'error') }
    finally { setSubmitting(false) }
  }

  async function acceptOffer(reqId, offerId) {
    try {
      await api.post(`/student/requests/${reqId}/offers/${offerId}/accept`)
      toast('Offre acceptée ! Le conducteur va vous contacter.', 'success')
      loadRequests()
      loadOffers(reqId)
    } catch (err) { toast(err.message, 'error') }
  }

  async function cancelRequest(reqId) {
    try {
      await api.post(`/student/requests/${reqId}/cancel`)
      toast('Demande annulée', 'info')
      loadRequests()
    } catch (err) { toast(err.message, 'error') }
  }

  return (
    <div className="page" style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 960 }}>

        <div style={{ marginBottom: 32 }}>
          <div className="section-tag">Interface Étudiant</div>
          <h2 style={{ marginTop: 8 }}>Bonjour {user?.prenom}</h2>
          <p>Publie une demande et reçois des offres de conducteurs vérifiés en quelques minutes.</p>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn${tab === 'new' ? ' active' : ''}`} onClick={() => setTab('new')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <AddOutlinedIcon style={{ fontSize: '1rem' }} /> Nouvelle demande
          </button>
          <button className={`tab-btn${tab === 'requests' ? ' active' : ''}`} onClick={() => setTab('requests')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ListAltOutlinedIcon style={{ fontSize: '1rem' }} /> Mes demandes
          </button>
          <button className={`tab-btn${tab === 'rt_bookings' ? ' active' : ''}`} onClick={() => setTab('rt_bookings')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ConfirmationNumberOutlinedIcon style={{ fontSize: '1rem' }} /> Réservations A/R
          </button>
        </div>

        {/* ── NEW REQUEST FORM ─────────────────────────────────────────────── */}
        {tab === 'new' && (
          <div style={{ display: 'grid', gridTemplateColumns: routePricing ? '1fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>

            {/* Left: form */}
            <div className="card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* From */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <LocationCityOutlinedIcon style={{ fontSize: '0.95rem' }} /> Ville de départ
                  </label>
                  <select className="form-select" value={form.from} onChange={e => setF('from', e.target.value)}>
                    <option value="Marrakech">Marrakech (par défaut)</option>
                    {data.CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* To */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <LocationOnOutlinedIcon style={{ fontSize: '0.95rem' }} /> Destination
                  </label>
                  <select className="form-select" value={form.to} onChange={e => setF('to', e.target.value)}>
                    <option value="" disabled>Choisir une ville...</option>
                    {data.CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Route loading indicator */}
                {loadingPrice && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--mid-grey)' }}>
                    <div style={{ width: 14, height: 14, border: '2px solid var(--emerald-glow)', borderTopColor: 'var(--emerald)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Calcul du tarif...
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {/* Date */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CalendarTodayOutlinedIcon style={{ fontSize: '0.95rem' }} /> Date souhaitée
                  </label>
                  <input className="form-input" type="date" min={today} value={form.date} onChange={e => setF('date', e.target.value)} />
                </div>

                {/* Size picker */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <LuggageOutlinedIcon style={{ fontSize: '0.95rem' }} /> Taille du bagage
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {data.SIZES.map(s => {
                      const hint = routePricing ? routePricing[s.id] : null
                      const active = selectedSize === s.id
                      return (
                        <div key={s.id} className="card" onClick={() => handleSizeSelect(s.id)}
                          style={{ padding: 14, cursor: 'pointer',
                            border: `1.5px solid ${active ? 'var(--emerald)' : 'var(--border-subtle)'}`,
                            background: active ? 'var(--emerald-glow)' : 'var(--surface-1)',
                            borderRadius: 'var(--radius-md)', transition: 'var(--transition)' }}
                        >
                          <div style={{ marginBottom: 6, color: active ? 'var(--emerald)' : 'var(--mid-grey)' }}>
                            <DynIcon name={s.icon} style={{ fontSize: '1.6rem' }} />
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{s.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--mid-grey)' }}>{s.desc}</div>
                          {hint ? (
                            <div style={{ fontSize: '0.78rem', color: 'var(--emerald)', fontWeight: 700, marginTop: 5 }}>
                              ~{hint} DH
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: 'var(--mid-grey)', marginTop: 4 }}>max {s.max_kg} kg</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Price display — locked, set by the system */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AttachMoneyOutlinedIcon style={{ fontSize: '0.95rem' }} /> Prix fixé par Bagagi
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: 'var(--mid-grey)', fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: 0 }}>
                      <LockOutlinedIcon style={{ fontSize: '0.8rem' }} /> Non modifiable
                    </span>
                  </label>

                  {form.price ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--emerald-glow)',
                      border: '1.5px solid var(--emerald)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AutoAwesomeOutlinedIcon style={{ color: 'var(--emerald)', fontSize: '1.1rem' }} />
                        <span style={{ fontSize: '0.88rem', color: 'var(--mid-grey)' }}>
                          {SIZE_LABELS[selectedSize]}
                          {form.insurance ? ' + assurance' : ''}
                          {routePricing ? ` · ~${routePricing.km} km` : ''}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--emerald)' }}>
                        {form.price} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>DH</span>
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-1)',
                      border: '1.5px dashed var(--border-subtle)',
                      fontSize: '0.88rem', color: 'var(--mid-grey)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <LockOutlinedIcon style={{ fontSize: '1rem' }} />
                      Sélectionnez une destination et une taille
                    </div>
                  )}

                  {form.insurance && routePricing && selectedSize && (
                    <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--mid-grey)' }}>
                      Détail : {routePricing[selectedSize]} DH + 5 DH assurance = <strong style={{ color: 'var(--emerald)' }}>{routePricing[selectedSize] + 5} DH</strong>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--emerald)', width: 16, height: 16 }} checked={form.groupage} onChange={e => setF('groupage', e.target.checked)} />
                    <Inventory2OutlinedIcon style={{ fontSize: '1rem', color: 'var(--mid-grey)' }} />
                    <span style={{ fontSize: '0.9rem' }}>Groupage</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--emerald)', width: 16, height: 16 }} checked={form.insurance} onChange={e => setF('insurance', e.target.checked)} />
                    <SecurityOutlinedIcon style={{ fontSize: '1rem', color: 'var(--mid-grey)' }} />
                    <span style={{ fontSize: '0.9rem' }}>Assurance bagage (+ 5 DH)</span>
                  </label>
                </div>

                <button className="btn btn-primary btn-full btn-lg" onClick={submitRequest} disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RocketLaunchOutlinedIcon style={{ fontSize: '1.1rem' }} />
                  {submitting ? 'Publication...' : 'Publier ma demande'}
                </button>
              </div>
            </div>

            {/* Right: pricing summary card (appears once route is known) */}
            {routePricing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Route header */}
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <RouteOutlinedIcon style={{ color: 'var(--emerald)', fontSize: '1.3rem' }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                        {form.from} → {form.to}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--mid-grey)', marginTop: 2 }}>
                        Distance estimée : ~{routePricing.km} km
                      </div>
                    </div>
                  </div>

                  {/* All-sizes pricing table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--mid-grey)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      Tarifs indicatifs
                    </div>
                    {data.SIZES.map(s => {
                      const active = selectedSize === s.id
                      return (
                        <div key={s.id}
                          onClick={() => handleSizeSelect(s.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: active ? 'var(--emerald-glow)' : 'var(--surface-1)',
                            border: `1px solid ${active ? 'var(--emerald)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer', transition: 'var(--transition)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <DynIcon name={s.icon} style={{ fontSize: '1.1rem', color: active ? 'var(--emerald)' : 'var(--mid-grey)' }} />
                            <div>
                              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem' }}>{s.label}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--mid-grey)' }}>max {s.max_kg} kg</div>
                            </div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: active ? 'var(--emerald)' : 'var(--text)' }}>
                            {routePricing[s.id]} DH
                          </div>
                        </div>
                      )
                    })}
                  </div>

                </div>

                {/* Available round trips for this route */}
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <SyncAltIcon style={{ color: 'var(--emerald)', fontSize: '1.1rem' }} />
                      Conducteurs A/R disponibles
                    </span>
                    <a href="/returns" target="_blank" rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--mid-grey)', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                      Voir tous <OpenInNewOutlinedIcon style={{ fontSize: '0.8rem' }} />
                    </a>
                  </div>

                  {availableTrips.length === 0 ? (
                    <div style={{ fontSize: '0.83rem', color: 'var(--mid-grey)', padding: '10px 0', textAlign: 'center' }}>
                      Aucun trajet A/R disponible sur cette route pour l'instant.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {availableTrips.slice(0, 3).map(t => (
                        <div key={t.id} style={{
                          padding: '14px 16px', borderRadius: 'var(--radius-md)',
                          background: 'var(--surface-1)', border: '1px solid var(--border-subtle)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem' }}>{t.initials}</div>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.driver}</span>
                              {t.is_verified && (
                                <CheckIcon style={{ fontSize: '0.8rem', color: 'var(--emerald)' }} />
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--mid-grey)', textAlign: 'right' }}>
                              A {t.outbound?.price_per_10kg} DH/10kg · R {t.return?.price_per_10kg} DH/10kg
                            </span>
                          </div>
                          {t.notes && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 8, fontStyle: 'italic' }}>"{t.notes}"</div>
                          )}
                          <RoundTripPicker trip={t} leg="outbound" variant="compact" showSchedule={false} onBook={reserveRoundTrip} />
                          <RoundTripPicker trip={t} leg="return" variant="compact" showSchedule={false} onBook={reserveRoundTrip} />
                        </div>
                      ))}
                      {availableTrips.length > 3 && (
                        <a href="/returns" target="_blank" rel="noreferrer"
                          style={{ fontSize: '0.8rem', color: 'var(--emerald)', textAlign: 'center', padding: '6px 0', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          +{availableTrips.length - 3} autres trajets disponibles <OpenInNewOutlinedIcon style={{ fontSize: '0.85rem' }} />
                        </a>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ── ROUND-TRIP RESERVATIONS ─────────────────────────────────────── */}
        {tab === 'rt_bookings' && (
          <div>
            {loadingRt && <div style={{ textAlign: 'center', padding: 32, color: 'var(--mid-grey)' }}>Chargement...</div>}
            {!loadingRt && rtBookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <ConfirmationNumberOutlinedIcon style={{ fontSize: '2.5rem', color: 'var(--mid-grey)', marginBottom: 12 }} />
                <p>Aucune réservation sur un trajet aller-retour.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('new')}>
                  Trouver un conducteur A/R
                </button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!loadingRt && rtBookings.map(b => {
                const tr = b.trip || {}
                const legFr = LEG_LABEL[b.leg] || b.leg
                return (
                  <div key={b.id} className="card" style={{ padding: 22 }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                          {tr.from_city} ↔ {tr.to_city}
                        </div>
                        <Meta>
                          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{legFr}</span>
                          <CalendarTodayOutlinedIcon style={{ fontSize: '0.85rem' }} />
                          Aller {tr.depart_date} · Retour {tr.return_date}
                        </Meta>
                        <Meta>
                          <span style={{ fontWeight: 600 }}>{tr.driver}</span>
                          {tr.is_verified && (
                            <span className="badge badge-emerald" style={{ fontSize: '0.65rem', marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                              <CheckIcon style={{ fontSize: '0.7rem' }} /> Vérifié
                            </span>
                          )}
                        </Meta>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--emerald)' }}>
                          {b.total_dh} <span style={{ fontSize: '0.85rem' }}>DH</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--mid-grey)' }}>{b.kg} kg réservés</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Réservé le {new Date(b.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    {tr.chauffeur_id != null && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => navigate(`/messages?with=${tr.chauffeur_id}`)}
                      >
                        <ChatOutlinedIcon style={{ fontSize: '1rem' }} /> Contacter le conducteur
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── MY REQUESTS ──────────────────────────────────────────────────── */}
        {tab === 'requests' && (
          <div>
            {loadingReqs && <div style={{ textAlign: 'center', padding: 32, color: 'var(--mid-grey)' }}>Chargement...</div>}
            {!loadingReqs && myRequests.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <InboxOutlinedIcon style={{ fontSize: '2.5rem', color: 'var(--mid-grey)', marginBottom: 12 }} />
                <p>Vous n'avez pas encore de demandes.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('new')}>Créer ma première demande</button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {myRequests.map(r => (
                <div key={r.id} className="card" style={{ padding: 22 }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                        {r.from_city} → {r.to_city}
                      </div>
                      <Meta>
                        <CalendarTodayOutlinedIcon style={{ fontSize: '0.85rem' }} />{r.date}
                        <span style={{ opacity: 0.4 }}>·</span>
                        <LuggageOutlinedIcon style={{ fontSize: '0.85rem' }} />{r.size}
                        <span style={{ opacity: 0.4 }}>·</span>
                        {r.offers_count} offre(s)
                      </Meta>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--emerald)' }}>{r.price} DH</span>
                      <span className="badge" style={{ background: 'var(--emerald-glow)', color: STATUS_COLOR[r.status], fontSize: '0.72rem' }}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {r.status === 'open' && r.offers_count > 0 && (
                      <button className="btn btn-primary btn-sm" onClick={() => loadOffers(r.id)}>
                        Voir les offres ({r.offers_count})
                      </button>
                    )}
                    {r.status === 'open' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => cancelRequest(r.id)}>Annuler</button>
                    )}
                  </div>

                  {offersMap[r.id] && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="divider" style={{ margin: '8px 0' }} />
                      {offersMap[r.id].map(o => (
                        <div key={o.id} style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="avatar avatar-sm">{o.chauffeur.split(' ').map(w => w[0]).join('')}</div>
                              <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{o.chauffeur}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--mid-grey)' }}>
                                  {o.vehicle}
                                  {o.is_verified && (
                                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem', marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                      <CheckIcon style={{ fontSize: '0.7rem' }} /> Vérifié
                                    </span>
                                  )}
                                </div>
                                {o.message && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{o.message}</div>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--emerald)', fontSize: '1.1rem' }}>{o.price} DH</span>
                              {(o.status === 'pending' || o.status === 'accepted') && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => navigate(`/messages?with=${o.chauffeur_id}`)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                >
                                  <ChatOutlinedIcon style={{ fontSize: '1rem' }} /> Chat
                                </button>
                              )}
                              {r.status === 'open' && o.status === 'pending' && (
                                <button className="btn btn-primary btn-sm" onClick={() => acceptOffer(r.id, o.id)}>Accepter</button>
                              )}
                              {o.status === 'accepted' && (
                                <span className="badge badge-emerald" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                  <CheckIcon style={{ fontSize: '0.75rem' }} /> Accepté
                                </span>
                              )}
                              {o.status === 'rejected' && <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Rejeté</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
