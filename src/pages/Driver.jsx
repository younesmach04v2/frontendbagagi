import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { getApiBase } from '../apiConfig'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Stars from '../components/Stars'

import ListAltOutlinedIcon        from '@mui/icons-material/ListAltOutlined'
import WorkOutlinedIcon    from '@mui/icons-material/WorkOutlined'
import PersonOutlinedIcon         from '@mui/icons-material/PersonOutlined'
import DirectionsCarOutlinedIcon  from '@mui/icons-material/DirectionsCarOutlined'
import WarningAmberOutlinedIcon   from '@mui/icons-material/WarningAmberOutlined'
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined'
import CalendarTodayOutlinedIcon  from '@mui/icons-material/CalendarTodayOutlined'
import LuggageOutlinedIcon        from '@mui/icons-material/LuggageOutlined'
import SchoolOutlinedIcon         from '@mui/icons-material/SchoolOutlined'
import CheckCircleOutlineIcon     from '@mui/icons-material/CheckCircleOutlined'
import ChatBubbleOutlineIcon      from '@mui/icons-material/ChatBubbleOutlined'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import PhoneAndroidOutlinedIcon   from '@mui/icons-material/PhoneAndroidOutlined'
import BadgeOutlinedIcon          from '@mui/icons-material/BadgeOutlined'
import ArticleOutlinedIcon        from '@mui/icons-material/ArticleOutlined'
import TagOutlinedIcon            from '@mui/icons-material/TagOutlined'
import BarChartOutlinedIcon       from '@mui/icons-material/BarChartOutlined'
import CheckIcon                  from '@mui/icons-material/Check'
import EmailOutlinedIcon          from '@mui/icons-material/EmailOutlined'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import SyncAltIcon                from '@mui/icons-material/SyncAlt'
import AddOutlinedIcon            from '@mui/icons-material/AddOutlined'
import DeleteOutlineIcon          from '@mui/icons-material/DeleteOutlined'
import ScaleOutlinedIcon          from '@mui/icons-material/Scale'
import EventRepeatOutlinedIcon    from '@mui/icons-material/EventRepeat'
import ArrowForwardIcon           from '@mui/icons-material/ArrowForward'
import ChatOutlinedIcon           from '@mui/icons-material/ChatOutlined'

const TABS = [
  { id: 'requests',   label: 'Demandes ouvertes', Icon: ListAltOutlinedIcon },
  { id: 'myoffers',   label: 'Mes offres',         Icon: WorkOutlinedIcon },
  { id: 'roundtrips', label: 'Trajets A/R',         Icon: SyncAltIcon },
  { id: 'profile',    label: 'Mon profil',          Icon: PersonOutlinedIcon },
]

const EMPTY_RT = {
  from_city: '', to_city: '', depart_date: '', return_date: '',
  kg_remaining_outbound: '', kg_remaining_return: '',
  price_per_10kg_outbound: '', price_per_10kg_return: '', notes: '',
}

const STATUS_LABEL = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée' }
const STATUS_COLOR  = { pending: '#F0A500', accepted: 'var(--emerald)', rejected: '#D94F3D' }

const RT_LEG_LABEL = { outbound: 'Aller', return: 'Retour' }

function whatsappLink(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  let n = digits
  if (n.startsWith('0')) n = `212${n.slice(1)}`
  return n.length >= 11 ? `https://wa.me/${n}` : null
}

function Meta({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--mid-grey)', marginTop: 3, flexWrap: 'wrap', rowGap: 2 }}>
      {children}
    </div>
  )
}

export default function Driver() {
  const navigate = useNavigate()
  const data = useData()
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('requests')

  const [openReqs, setOpenReqs]     = useState([])
  const [myOffers, setMyOffers]     = useState([])
  const [myTrips, setMyTrips]       = useState([])
  const [rtBookings, setRtBookings] = useState([])
  const [loading, setLoading]       = useState(false)
  const [offerForm, setOfferForm]   = useState({})

  // Round-trip form state
  const [rtForm, setRtForm]         = useState(EMPTY_RT)
  const [rtPriceRefOut, setRtPriceRefOut] = useState(null)
  const [rtPriceRefRet, setRtPriceRefRet] = useState(null)
  const [rtSaving, setRtSaving]     = useState(false)
  const [showRtForm, setShowRtForm] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'requests')   setOpenReqs(await api.get('/driver/requests'))
      if (activeTab === 'myoffers')   setMyOffers(await api.get('/driver/offers'))
      if (activeTab === 'roundtrips') {
        const [trips, books] = await Promise.all([
          api.get('/driver/roundtrips'),
          api.get('/driver/roundtrip-bookings'),
        ])
        setMyTrips(trips)
        setRtBookings(books)
      }
    } catch (err) { toast(err.message, 'error') }
    finally { setLoading(false) }
  }, [activeTab])

  useEffect(() => { loadData() }, [loadData])

  // Prix de référence petit bagage : aller (from→to) et retour (to→from)
  useEffect(() => {
    const { from_city, to_city } = rtForm
    if (from_city && to_city && from_city !== to_city) {
      fetch(`${getApiBase()}/pricing/${encodeURIComponent(from_city)}/${encodeURIComponent(to_city)}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => setRtPriceRefOut(d ? d.petit : null))
        .catch(() => setRtPriceRefOut(null))
      fetch(`${getApiBase()}/pricing/${encodeURIComponent(to_city)}/${encodeURIComponent(from_city)}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => setRtPriceRefRet(d ? d.petit : null))
        .catch(() => setRtPriceRefRet(null))
    } else {
      setRtPriceRefOut(null)
      setRtPriceRefRet(null)
    }
  }, [rtForm.from_city, rtForm.to_city])

  function setRT(k, v) { setRtForm(p => ({ ...p, [k]: v })) }

  async function submitRoundTrip() {
    const {
      from_city, to_city, depart_date, return_date,
      kg_remaining_outbound, kg_remaining_return,
      price_per_10kg_outbound, price_per_10kg_return,
    } = rtForm
    const ko = +kg_remaining_outbound || 0
    const kr = +kg_remaining_return || 0
    const po = +price_per_10kg_outbound || 0
    const pr = +price_per_10kg_return || 0

    if (!from_city || !to_city)       return toast('Villes requises', 'error')
    if (!depart_date || !return_date) return toast('Dates requises', 'error')
    if (depart_date >= return_date)   return toast('La date de retour doit être après le départ', 'error')
    if (ko < 10 && kr < 10)           return toast('Au moins un segment (aller ou retour) doit offrir 10 kg minimum', 'error')
    if (ko > 0 && ko < 10)            return toast('Aller : au moins 10 kg, ou laissez 0', 'error')
    if (kr > 0 && kr < 10)            return toast('Retour : au moins 10 kg, ou laissez 0', 'error')
    if (ko >= 10 && po <= 0)          return toast('Prix aller (par 10 kg) requis', 'error')
    if (kr >= 10 && pr <= 0)          return toast('Prix retour (par 10 kg) requis', 'error')
    if (rtPriceRefOut && ko >= 10 && po >= rtPriceRefOut) return toast(`Aller : prix /10 kg doit être &lt; ${rtPriceRefOut} DH (petit bagage)`, 'error')
    if (rtPriceRefRet && kr >= 10 && pr >= rtPriceRefRet) return toast(`Retour : prix /10 kg doit être &lt; ${rtPriceRefRet} DH (petit bagage)`, 'error')

    setRtSaving(true)
    try {
      await api.post('/driver/roundtrips', {
        from_city, to_city, depart_date, return_date, notes: rtForm.notes,
        kg_remaining_outbound: ko, kg_remaining_return: kr,
        price_per_10kg_outbound: po, price_per_10kg_return: pr,
      })
      toast('Trajet aller-retour publié !', 'success')
      setRtForm(EMPTY_RT)
      setShowRtForm(false)
      loadData()
    } catch (err) { toast(err.message, 'error') }
    finally { setRtSaving(false) }
  }

  async function cancelRoundTrip(id) {
    if (!window.confirm('Annuler ce trajet ?')) return
    try {
      await api.delete(`/driver/roundtrips/${id}`)
      toast('Trajet annulé', 'info')
      loadData()
    } catch (err) { toast(err.message, 'error') }
  }

  function setOF(reqId, k, v) {
    setOfferForm(p => ({ ...p, [reqId]: { ...(p[reqId] || {}), [k]: v } }))
  }

  async function acceptRequest(req) {
    if (!window.confirm(`Accepter la demande de ${req.etudiant} (${req.from_city} → ${req.to_city}) pour ${req.price} DH ?`)) return
    try {
      await api.post(`/driver/requests/${req.id}/accept`)
      toast(`Demande acceptée ! L'étudiant sera notifié.`, 'success')
      loadData()
    } catch (err) { toast(err.message, 'error') }
  }

  async function submitOffer(req) {
    const f = offerForm[req.id] || {}
    if (!f.price || +f.price < 1) return toast('Indiquez un prix valide', 'error')
    try {
      await api.post(`/driver/requests/${req.id}/offer`, { price: +f.price, message: f.message || '' })
      toast(`Offre soumise pour ${req.from_city} → ${req.to_city}`, 'success')
      setOfferForm(p => ({ ...p, [req.id]: null }))
      loadData()
    } catch (err) { toast(err.message, 'error') }
  }

  return (
    <div className="page" style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 1000 }}>

        <div style={{ marginBottom: 32 }}>
          <div className="section-tag">Interface Conducteur</div>
          <h2 style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <DirectionsCarOutlinedIcon style={{ fontSize: '1.8rem', color: 'var(--emerald)' }} />
            Bonjour {user?.prenom}
          </h2>
          <p>Consultez les demandes ouvertes et soumettez vos offres.</p>
          {!user?.is_verified && (
            <div style={{ marginTop: 12, background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.88rem', color: '#F0A500', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <WarningAmberOutlinedIcon style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }} />
              Votre profil est en cours de vérification. Vous pouvez parcourir les demandes mais vos offres seront marquées non-vérifiées.
            </div>
          )}
        </div>

        <div className="tab-bar">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className={`tab-btn${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon style={{ fontSize: '1rem' }} /> {label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 32, color: 'var(--mid-grey)' }}>Chargement...</div>}

        {/* ---- OPEN REQUESTS ---- */}
        {activeTab === 'requests' && !loading && (
          <div>
            <div style={{ marginBottom: 16, fontSize: '0.88rem', color: 'var(--mid-grey)' }}>
              {openReqs.length} demande(s) en attente d'un conducteur
            </div>
            {openReqs.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <SentimentSatisfiedAltOutlinedIcon style={{ fontSize: '2.5rem', color: 'var(--mid-grey)', marginBottom: 12 }} />
                <p>Aucune demande ouverte pour le moment.</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {openReqs.map(r => {
                const f = offerForm[r.id] || {}
                const expanded = f.price !== undefined
                return (
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
                          <SchoolOutlinedIcon style={{ fontSize: '0.85rem' }} />{r.etudiant}
                          {r.groupage && <><span style={{ opacity: 0.4 }}>·</span> Groupage</>}
                        </Meta>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--emerald)' }}>
                          Budget : {r.price} DH
                        </span>
                        <button className="btn btn-primary btn-sm" onClick={() => acceptRequest(r)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CheckCircleOutlineIcon style={{ fontSize: '1rem' }} /> Accepter
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setOF(r.id, 'price', expanded ? undefined : '')}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {expanded ? 'Annuler' : <><ChatBubbleOutlineIcon style={{ fontSize: '1rem' }} /> Négocier</>}
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ margin: 0, flex: '0 0 120px' }}>
                          <label className="form-label">Prix (DH)</label>
                          <div className="price-input-wrapper">
                            <input className="form-input" type="number" min="1" placeholder="Ex: 50" value={f.price || ''} onChange={e => setOF(r.id, 'price', e.target.value)} style={{ paddingRight: 44 }} />
                            <span className="currency">DH</span>
                          </div>
                        </div>
                        <div className="form-group" style={{ margin: 0, flex: 1 }}>
                          <label className="form-label">Message (optionnel)</label>
                          <input className="form-input" type="text" placeholder="Ex : Départ à 8h, véhicule spacieux" value={f.message || ''} onChange={e => setOF(r.id, 'message', e.target.value)} />
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => submitOffer(r)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CheckCircleOutlineIcon style={{ fontSize: '1rem' }} /> Soumettre
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ---- MY OFFERS ---- */}
        {activeTab === 'myoffers' && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myOffers.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <WorkOutlinedIcon style={{ fontSize: '2.5rem', color: 'var(--mid-grey)', marginBottom: 12 }} />
                <p>Vous n'avez encore soumis aucune offre.</p>
              </div>
            )}
            {myOffers.map(o => {
              const wa = whatsappLink(o.request?.etudiant_phone)
              return (
              <div key={o.id} className="card" style={{ padding: 20 }}>
                <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      {o.request.from_city} → {o.request.to_city}
                    </div>
                    <Meta>
                      <CalendarTodayOutlinedIcon style={{ fontSize: '0.85rem' }} />{o.request.date}
                      <span style={{ opacity: 0.4 }}>·</span>
                      <LuggageOutlinedIcon style={{ fontSize: '0.85rem' }} />{o.request.size}
                      <span style={{ opacity: 0.4 }}>·</span>
                      <SchoolOutlinedIcon style={{ fontSize: '0.85rem' }} />{o.request.etudiant}
                    </Meta>
                    {o.message && <div style={{ fontSize: '0.82rem', marginTop: 6, color: 'var(--text-muted)' }}>"{o.message}"</div>}
                    {(o.status === 'pending' || o.status === 'accepted') && o.request?.etudiant_id != null && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => navigate(`/messages?with=${o.request.etudiant_id}`)}
                      >
                        <ChatOutlinedIcon style={{ fontSize: '1rem' }} /> Chat avec l&apos;étudiant
                      </button>
                    )}
                    {(o.request.etudiant_email || o.request.etudiant_phone) && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem' }}>
                        {o.request.etudiant_email && (
                          <a href={`mailto:${o.request.etudiant_email}`} style={{ color: 'var(--emerald)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <EmailOutlinedIcon style={{ fontSize: '0.95rem' }} /> {o.request.etudiant_email}
                          </a>
                        )}
                        {o.request.etudiant_phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <PhoneAndroidOutlinedIcon style={{ fontSize: '0.95rem', color: 'var(--mid-grey)' }} />
                              {o.request.etudiant_phone}
                            </span>
                            {wa && (
                              <a href={wa} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--emerald)' }}>
                                WhatsApp
                              </a>
                            )}
                          </div>
                        ) : (
                          o.status === 'accepted' && <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Téléphone étudiant non renseigné</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--emerald)', fontSize: '1.1rem' }}>
                      {o.price} DH
                    </span>
                    <span className="badge" style={{ background: 'var(--emerald-glow)', color: STATUS_COLOR[o.status], fontSize: '0.72rem' }}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* ---- ROUND TRIPS (une section : réservations + trajets) ---- */}
        {activeTab === 'roundtrips' && !loading && (
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              marginBottom: 8,
            }}
          >
            {/* En-tête de section */}
            <div
              style={{
                padding: '18px 22px',
                background: 'var(--surface-1, rgba(255,255,255,0.03))',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <SyncAltIcon style={{ fontSize: '1.25rem', color: 'var(--emerald)' }} />
                Trajets aller-retour
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--mid-grey)', marginTop: 6 }}>
                Réservations des étudiants et vos trajets planifiés — deux blocs distincts ci-dessous.
              </div>
            </div>

            {/* ── Bloc 1 : Réservations étudiants ── */}
            <div
              style={{
                padding: '22px 22px 24px',
                borderBottom: '2px solid var(--border-subtle)',
                background: 'rgba(0,104,79,0.04)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--emerald-light, var(--emerald))',
                }}
              >
                <ConfirmationNumberOutlinedIcon style={{ color: 'var(--emerald)' }} />
                Réservations étudiants
                {rtBookings.length > 0 && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mid-grey)' }}>({rtBookings.length})</span>
                )}
              </div>
              {rtBookings.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--mid-grey)' }}>
                  Quand un étudiant réserve des kg sur l&apos;aller ou le retour, son nom et ses coordonnées s&apos;affichent ici.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {rtBookings.map(b => {
                    const legFr = RT_LEG_LABEL[b.leg] || b.leg
                    const waHref = whatsappLink(b.etudiant_phone)
                    return (
                      <div
                        key={b.id}
                        style={{
                          padding: 14,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--surface-1)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <SchoolOutlinedIcon style={{ fontSize: '1rem', color: 'var(--emerald)' }} />
                              {b.etudiant}
                              <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>{legFr}</span>
                            </div>
                            <Meta>
                              {b.from_city} → {b.to_city}
                              <span style={{ opacity: 0.4 }}>·</span>
                              Aller {b.depart_date}
                              <span style={{ opacity: 0.4 }}>·</span>
                              Trajet #{b.trip_id}
                            </Meta>
                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem' }}>
                              <a href={`mailto:${b.etudiant_email}`} style={{ color: 'var(--emerald)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <EmailOutlinedIcon style={{ fontSize: '0.95rem' }} /> {b.etudiant_email}
                              </a>
                              {b.etudiant_phone ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                    <PhoneAndroidOutlinedIcon style={{ fontSize: '0.95rem', color: 'var(--mid-grey)' }} />
                                    {b.etudiant_phone}
                                  </span>
                                  {waHref && (
                                    <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--emerald)' }}>
                                      WhatsApp
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Téléphone non renseigné</span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--emerald)' }}>
                              {b.total_dh} DH
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--mid-grey)' }}>{b.kg} kg</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
                              {new Date(b.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                            {b.etudiant_id != null && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                onClick={() => navigate(`/messages?with=${b.etudiant_id}`)}
                              >
                                <ChatOutlinedIcon style={{ fontSize: '0.95rem' }} /> Chat
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Bloc 2 : Mes trajets A/R (planification + liste) ── */}
            <div style={{ padding: '22px 22px 28px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <EventRepeatOutlinedIcon style={{ color: 'var(--emerald)' }} />
                Mes trajets A/R
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mid-grey)' }}>
                  ({myTrips.filter(t => t.status === 'active').length} actif(s) · {myTrips.length} au total)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--mid-grey)' }}>
                  Publiez un trajet ou gérez vos annonces (capacités, dates, prix).
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowRtForm(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AddOutlinedIcon style={{ fontSize: '1rem' }} />
                  {showRtForm ? 'Annuler' : 'Planifier un trajet A/R'}
                </button>
              </div>

            {/* Create form */}
            {showRtForm && (
              <div className="card" style={{ padding: 24, marginBottom: 24, border: '1.5px solid var(--emerald)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <EventRepeatOutlinedIcon style={{ color: 'var(--emerald)' }} /> Nouveau trajet aller-retour
                </div>

                {/* Cities row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Ville de départ</label>
                    <select className="form-select" value={rtForm.from_city} onChange={e => setRT('from_city', e.target.value)}>
                      <option value="">Choisir...</option>
                      {data.CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Destination</label>
                    <select className="form-select" value={rtForm.to_city} onChange={e => setRT('to_city', e.target.value)}>
                      <option value="">Choisir...</option>
                      {data.CITIES.filter(c => c !== rtForm.from_city).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Dates row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date de départ (aller)</label>
                    <input className="form-input" type="date" value={rtForm.depart_date} onChange={e => setRT('depart_date', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date de retour</label>
                    <input className="form-input" type="date" value={rtForm.return_date} onChange={e => setRT('return_date', e.target.value)} />
                  </div>
                </div>

                {/* Aller : capacité + prix */}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald)', marginBottom: 8 }}>Aller ({rtForm.from_city || '…'} → {rtForm.to_city || '…'})</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><ScaleOutlinedIcon style={{ fontSize: '0.9rem', verticalAlign: 'middle' }} /> Capacité aller (kg)</label>
                    <input className="form-input" type="number" min="0" step="10" placeholder="0 = non proposé"
                      value={rtForm.kg_remaining_outbound} onChange={e => setRT('kg_remaining_outbound', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Prix aller / 10 kg (DH){rtPriceRefOut && <span style={{ fontSize: '0.65rem', color: 'var(--mid-grey)', marginLeft: 6 }}>(ref. petit &lt; {rtPriceRefOut})</span>}</label>
                    <div className="price-input-wrapper">
                      <input className="form-input" type="number" min="1" step="1" placeholder="Ex : 25"
                        value={rtForm.price_per_10kg_outbound} onChange={e => setRT('price_per_10kg_outbound', e.target.value)}
                        style={{ borderColor: rtPriceRefOut && +rtForm.price_per_10kg_outbound >= rtPriceRefOut ? 'var(--danger)' : undefined }} />
                      <span className="currency">DH</span>
                    </div>
                  </div>
                </div>

                {/* Retour : capacité + prix */}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald)', marginBottom: 8 }}>Retour ({rtForm.to_city || '…'} → {rtForm.from_city || '…'})</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label"><ScaleOutlinedIcon style={{ fontSize: '0.9rem', verticalAlign: 'middle' }} /> Capacité retour (kg)</label>
                    <input className="form-input" type="number" min="0" step="10" placeholder="0 = non proposé"
                      value={rtForm.kg_remaining_return} onChange={e => setRT('kg_remaining_return', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Prix retour / 10 kg (DH){rtPriceRefRet && <span style={{ fontSize: '0.65rem', color: 'var(--mid-grey)', marginLeft: 6 }}>(ref. petit &lt; {rtPriceRefRet})</span>}</label>
                    <div className="price-input-wrapper">
                      <input className="form-input" type="number" min="1" step="1" placeholder="Ex : 24"
                        value={rtForm.price_per_10kg_return} onChange={e => setRT('price_per_10kg_return', e.target.value)}
                        style={{ borderColor: rtPriceRefRet && +rtForm.price_per_10kg_return >= rtPriceRefRet ? 'var(--danger)' : undefined }} />
                      <span className="currency">DH</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label">Notes (optionnel)</label>
                  <input className="form-input" type="text" placeholder="Ex : Départ à 7h, retour le soir"
                    value={rtForm.notes} onChange={e => setRT('notes', e.target.value)} />
                </div>

                <button className="btn btn-primary" onClick={submitRoundTrip} disabled={rtSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EventRepeatOutlinedIcon style={{ fontSize: '1rem' }} />
                  {rtSaving ? 'Publication...' : 'Publier le trajet'}
                </button>
              </div>
            )}

            {/* List trajets (sans réservations dupliquées — voir bloc 1) */}
            {myTrips.length === 0 && !showRtForm && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <SyncAltIcon style={{ fontSize: '2.5rem', color: 'var(--mid-grey)', marginBottom: 12 }} />
                <p>Aucun trajet aller-retour planifié.</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myTrips.map(t => (
                <div key={t.id} className="card" style={{ padding: 20, opacity: t.status !== 'active' ? 0.55 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {t.from_city}
                        <ArrowForwardIcon style={{ fontSize: '0.95rem', color: 'var(--emerald)' }} />
                        {t.to_city}
                        <ArrowForwardIcon style={{ fontSize: '0.95rem', color: 'var(--mid-grey)' }} />
                        {t.from_city}
                      </div>
                      <Meta>
                        <CalendarTodayOutlinedIcon style={{ fontSize: '0.85rem' }} /> Aller : {t.depart_date}
                        <span style={{ opacity: 0.4 }}>·</span>
                        <CalendarTodayOutlinedIcon style={{ fontSize: '0.85rem' }} /> Retour : {t.return_date}
                      </Meta>
                      <Meta>
                        <ScaleOutlinedIcon style={{ fontSize: '0.85rem' }} />
                        Aller {t.outbound?.kg_remaining ?? 0} kg @ {t.outbound?.price_per_10kg ?? '—'} DH/10kg
                        <span style={{ opacity: 0.4 }}>·</span>
                        Retour {t.return?.kg_remaining ?? 0} kg @ {t.return?.price_per_10kg ?? '—'} DH/10kg
                        {t.notes && <><span style={{ opacity: 0.4 }}>·</span> {t.notes}</>}
                      </Meta>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--emerald)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                        <span>A {t.outbound?.price_per_10kg ?? '—'} / R {t.return?.price_per_10kg ?? '—'}</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--mid-grey)' }}>DH / 10 kg</span>
                      </span>
                      <span className="badge" style={{ background: 'var(--emerald-glow)', color: t.status === 'active' ? 'var(--emerald)' : 'var(--mid-grey)', fontSize: '0.72rem' }}>
                        {t.status === 'active' ? 'Actif' : t.status === 'completed' ? 'Terminé' : 'Annulé'}
                      </span>
                      {t.status === 'active' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => cancelRoundTrip(t.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)' }}>
                          <DeleteOutlineIcon style={{ fontSize: '0.95rem' }} /> Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        )}

        {/* ---- PROFILE ---- */}
        {activeTab === 'profile' && !loading && (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div className="card" style={{ padding: 28 }}>
              <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
                <div className="avatar avatar-lg">{user?.prenom?.[0]}{user?.nom?.[0]}</div>
                <div>
                  <h3>{user?.prenom} {user?.nom}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--mid-grey)', marginTop: 4 }}>{user?.email}</div>
                  <div style={{ marginTop: 6 }}>
                    {user?.is_verified
                      ? <span className="badge badge-emerald" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <CheckIcon style={{ fontSize: '0.8rem' }} /> Profil vérifié
                        </span>
                      : <span className="badge badge-warning" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <HourglassEmptyOutlinedIcon style={{ fontSize: '0.8rem' }} /> Vérification en cours
                        </span>
                    }
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  [PhoneAndroidOutlinedIcon,  'WhatsApp',    user?.phone || '—'],
                  [DirectionsCarOutlinedIcon, 'Véhicule',    user?.vehicule || '—'],
                  [BadgeOutlinedIcon,         'Permis',      user?.permis || '—'],
                  [ArticleOutlinedIcon,       'Carte grise', user?.carte_grise || '—'],
                  [TagOutlinedIcon,           'Matricule',   user?.matricule || '—'],
                ].map(([Icon, lbl, val]) => (
                  <div key={lbl} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--mid-grey)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon style={{ fontSize: '1rem' }} /> {lbl}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ marginBottom: 20, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChartOutlinedIcon style={{ color: 'var(--emerald)' }} /> Mes statistiques
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  [myOffers.length || '—',                                            'Offres soumises', 'var(--emerald)'],
                  [myOffers.filter(o => o.status === 'accepted').length || '—', 'Acceptées',       '#F0A500'],
                ].map(([v, l, c]) => (
                  <div key={l} style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', padding: 18, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: c }}>{v}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--mid-grey)', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



