import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { useToast } from '../context/ToastContext'

import BarChartOutlinedIcon       from '@mui/icons-material/BarChartOutlined'
import GroupOutlinedIcon          from '@mui/icons-material/GroupOutlined'
import Inventory2OutlinedIcon     from '@mui/icons-material/Inventory2Outlined'
import CampaignOutlinedIcon       from '@mui/icons-material/CampaignOutlined'
import SettingsOutlinedIcon       from '@mui/icons-material/SettingsOutlined'
import SchoolOutlinedIcon         from '@mui/icons-material/SchoolOutlined'
import DirectionsCarOutlinedIcon  from '@mui/icons-material/DirectionsCarOutlined'
import VerifiedUserOutlinedIcon   from '@mui/icons-material/VerifiedUserOutlined'
import CheckCircleOutlinedIcon    from '@mui/icons-material/CheckCircleOutlined'
import WorkOutlinedIcon           from '@mui/icons-material/WorkOutlined'
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined'
import CheckIcon                  from '@mui/icons-material/Check'
import BadgeOutlinedIcon          from '@mui/icons-material/BadgeOutlined'
import ArticleOutlinedIcon        from '@mui/icons-material/ArticleOutlined'
import TagOutlinedIcon            from '@mui/icons-material/TagOutlined'
import SendOutlinedIcon           from '@mui/icons-material/SendOutlined'
import LuggageOutlinedIcon        from '@mui/icons-material/LuggageOutlined'
import EditOutlinedIcon           from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon         from '@mui/icons-material/DeleteOutlined'
import SyncAltIcon                from '@mui/icons-material/SyncAlt'
import EventSeatOutlinedIcon      from '@mui/icons-material/EventSeatOutlined'

const TABS = [
  { id: 'stats',     label: 'Tableau de bord', Icon: BarChartOutlinedIcon },
  { id: 'users',     label: 'Utilisateurs',    Icon: GroupOutlinedIcon },
  { id: 'requests',  label: 'Demandes',        Icon: Inventory2OutlinedIcon },
  { id: 'entities',  label: 'Offres & trajets', Icon: SyncAltIcon },
  { id: 'notify',    label: 'Notifications', Icon: CampaignOutlinedIcon },
]

const STATUS_COLORS = { open: 'var(--emerald)', accepted: '#F0A500', delivered: '#00a07a', cancelled: '#D94F3D' }

const REQ_STATUS = ['open', 'accepted', 'delivered', 'cancelled']
const OFFER_STATUS = ['pending', 'accepted', 'rejected']

function Modal({ title, children, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 24 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{title}</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Fermer</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Admin() {
  const { toast } = useToast()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [requests, setReqs] = useState([])
  const [offers, setOffers] = useState([])
  const [trips, setTrips] = useState([])
  const [bookings, setBookings] = useState([])
  const [roleFilter, setRoleFilter] = useState('')
  const [notifForm, setNotifForm] = useState({ title: '', message: '', role: '', user_id: '' })

  const [userModal, setUserModal] = useState(null)
  const [reqModal, setReqModal] = useState(null)
  const [offerModal, setOfferModal] = useState(null)
  const [tripModal, setTripModal] = useState(null)
  const [bookingModal, setBookingModal] = useState(null)

  const load = useCallback(async () => {
    try {
      if (tab === 'stats') setStats(await api.get('/admin/stats'))
      if (tab === 'users') setUsers(await api.get(`/admin/users${roleFilter ? `?role=${roleFilter}` : ''}`))
      if (tab === 'requests') setReqs(await api.get('/admin/requests'))
      if (tab === 'entities') {
        const [o, t, b] = await Promise.all([
          api.get('/admin/offers'),
          api.get('/admin/roundtrips'),
          api.get('/admin/bookings'),
        ])
        setOffers(o)
        setTrips(t)
        setBookings(b)
      }
    } catch (err) { toast(err.message, 'error') }
  }, [tab, roleFilter, toast])

  useEffect(() => { load() }, [load])

  async function toggleVerify(user) {
    try {
      const res = await api.put(`/admin/users/${user.id}/verify`)
      toast(res.verified ? `${user.prenom} vérifié` : `Vérification de ${user.prenom} suspendue`, 'success')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function saveUser(e) {
    e.preventDefault()
    if (!userModal) return
    const { id, password, ...rest } = userModal
    try {
      const body = { ...rest }
      if (password && String(password).trim()) body.password = password
      else delete body.password
      await api.put(`/admin/users/${id}`, body)
      toast('Utilisateur mis à jour', 'success')
      setUserModal(null)
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function deleteUser(u) {
    if (!window.confirm(`Supprimer définitivement ${u.prenom} ${u.nom} ? Toutes les données liées seront effacées.`)) return
    try {
      await api.delete(`/admin/users/${u.id}`)
      toast('Utilisateur supprimé', 'success')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function saveRequest(e) {
    e.preventDefault()
    if (!reqModal) return
    const { id, price, etudiant_id, ...rest } = reqModal
    try {
      await api.put(`/admin/requests/${id}`, {
        ...rest,
        price: parseFloat(price),
        etudiant_id: parseInt(etudiant_id, 10),
        groupage: !!rest.groupage,
        insurance: !!rest.insurance,
      })
      toast('Demande mise à jour', 'success')
      setReqModal(null)
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function deleteRequest(r) {
    if (!window.confirm(`Supprimer la demande #${r.id} (${r.from_city} → ${r.to_city}) et toutes ses offres ?`)) return
    try {
      await api.delete(`/admin/requests/${r.id}`)
      toast('Demande supprimée', 'success')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function saveOffer(e) {
    e.preventDefault()
    if (!offerModal) return
    const { id, price, request_id, chauffeur_id, ...rest } = offerModal
    try {
      await api.put(`/admin/offers/${id}`, {
        ...rest,
        price: parseFloat(price),
        request_id: parseInt(request_id, 10),
        chauffeur_id: parseInt(chauffeur_id, 10),
      })
      toast('Offre mise à jour', 'success')
      setOfferModal(null)
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function deleteOffer(o) {
    if (!window.confirm(`Supprimer l’offre #${o.id} ?`)) return
    try {
      await api.delete(`/admin/offers/${o.id}`)
      toast('Offre supprimée', 'success')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function saveTrip(e) {
    e.preventDefault()
    if (!tripModal) return
    const t = tripModal
    try {
      await api.put(`/admin/roundtrips/${t.id}`, {
        chauffeur_id: parseInt(t.chauffeur_id, 10),
        from_city: t.from_city,
        to_city: t.to_city,
        depart_date: t.depart_date,
        return_date: t.return_date,
        notes: t.notes,
        status: t.status,
        kg_remaining_outbound: parseFloat(t.kg_remaining_outbound),
        kg_remaining_return: parseFloat(t.kg_remaining_return),
        price_per_10kg_outbound: parseFloat(t.price_per_10kg_outbound),
        price_per_10kg_return: parseFloat(t.price_per_10kg_return),
      })
      toast('Trajet mis à jour', 'success')
      setTripModal(null)
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function deleteTrip(tr) {
    if (!window.confirm(`Supprimer le trajet A/R #${tr.id} et ses réservations ?`)) return
    try {
      await api.delete(`/admin/roundtrips/${tr.id}`)
      toast('Trajet supprimé', 'success')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function saveBooking(e) {
    e.preventDefault()
    if (!bookingModal) return
    const b = bookingModal
    try {
      await api.put(`/admin/bookings/${b.id}`, {
        round_trip_id: parseInt(b.round_trip_id || b.trip_id, 10),
        etudiant_id: parseInt(b.etudiant_id, 10),
        leg: b.leg,
        kg: parseFloat(b.kg),
        total_dh: parseFloat(b.total_dh),
      })
      toast('Réservation mise à jour', 'success')
      setBookingModal(null)
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function deleteBooking(b) {
    if (!window.confirm(`Supprimer la réservation #${b.id} ?`)) return
    try {
      await api.delete(`/admin/bookings/${b.id}`)
      toast('Réservation supprimée', 'success')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  async function sendNotif(e) {
    e.preventDefault()
    if (!notifForm.message) return toast('Message requis', 'error')
    try {
      const payload = {
        title:   notifForm.title || 'Message de l\'équipe Bagagi',
        message: notifForm.message,
        ...(notifForm.user_id  ? { user_id: Number(notifForm.user_id) } : {}),
        ...(notifForm.role && !notifForm.user_id ? { role: notifForm.role } : {}),
      }
      const res = await api.post('/admin/notify', payload)
      toast(`Notification envoyée à ${res.sent} utilisateur(s)`, 'success')
      setNotifForm({ title: '', message: '', role: '', user_id: '' })
    } catch (err) { toast(err.message, 'error') }
  }

  return (
    <div className="page" style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 1100 }}>

        <div style={{ marginBottom: 32 }}>
          <div className="section-tag">Administration</div>
          <h2 style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingsOutlinedIcon style={{ fontSize: '1.8rem', color: 'var(--emerald)' }} />
            Tableau de bord Admin
          </h2>
          <p>Modifier ou supprimer les entités. La suppression utilisateur efface messages, notifications, demandes, offres, trajets et réservations liés.</p>
        </div>

        <div className="tab-bar" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className={`tab-btn${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <Icon style={{ fontSize: '1rem' }} /> {label}
            </button>
          ))}
        </div>

        {tab === 'stats' && stats && (
          <div>
            <div className="grid-4" style={{ marginBottom: 28 }}>
              {[
                [SchoolOutlinedIcon,        'Étudiants',    stats.total_etudiants,     'var(--emerald)'],
                [DirectionsCarOutlinedIcon, 'Conducteurs', stats.total_chauffeurs,    '#F0A500'],
                [VerifiedUserOutlinedIcon,  'Vérifiés',    stats.verified_chauffeurs, 'var(--emerald-light)'],
                [Inventory2OutlinedIcon,  'Demandes',    stats.total_requests,      'var(--text)'],
              ].map(([Icon, lbl, val, color]) => (
                <div key={lbl} className="card" style={{ textAlign: 'center', padding: 24 }}>
                  <Icon style={{ fontSize: '1.8rem', color, marginBottom: 8 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color }}>{val}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--mid-grey)' }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div className="grid-3">
              {[
                [MarkEmailUnreadOutlinedIcon, 'Demandes ouvertes',   stats.open_requests,     'var(--emerald)'],
                [CheckCircleOutlinedIcon,      'Demandes acceptées', stats.accepted_requests, '#F0A500'],
                [WorkOutlinedIcon,            'Total offres',       stats.total_offers,      'var(--text)'],
                [SyncAltIcon,                 'Trajets A/R',        stats.total_roundtrips,  'var(--emerald)'],
                [EventSeatOutlinedIcon,       'Réservations A/R', stats.total_rt_bookings, '#F0A500'],
              ].map(([Icon, lbl, val, color]) => (
                <div key={lbl} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
                  <Icon style={{ fontSize: '1.5rem', color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color }}>{val}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--mid-grey)' }}>{lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                ['', 'Tous', null],
                ['etudiant', 'Étudiants', SchoolOutlinedIcon],
                ['chauffeur', 'Conducteurs', DirectionsCarOutlinedIcon],
              ].map(([r, label, Icon]) => (
                <button key={r} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setRoleFilter(r)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {Icon && <Icon style={{ fontSize: '0.95rem' }} />} {label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {users.map(u => (
                <div key={u.id} className="card" style={{ padding: 18 }}>
                  <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                    <div className="flex items-center gap-2">
                      <div className="avatar avatar-sm">{u.prenom?.[0]}{u.nom?.[0]}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{u.prenom} {u.nom}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--mid-grey)' }}>{u.email} · {u.phone}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>ID {u.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{u.role}</span>
                      {u.is_verified
                        ? <span className="badge badge-emerald" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            <CheckIcon style={{ fontSize: '0.75rem' }} /> Vérifié
                          </span>
                        : <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>En attente</span>
                      }
                      {u.role === 'chauffeur' && (
                        <button className={`btn btn-sm ${u.is_verified ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleVerify(u)}>
                          {u.is_verified ? 'Suspendre' : 'Vérifier'}
                        </button>
                      )}
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUserModal({
                        id: u.id, nom: u.nom, prenom: u.prenom, email: u.email, phone: u.phone || '',
                        role: u.role, is_verified: u.is_verified, vehicule: u.vehicule || '', permis: u.permis || '',
                        carte_grise: u.carte_grise || '', matricule: u.matricule || '', password: '',
                      })} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <EditOutlinedIcon style={{ fontSize: '0.95rem' }} /> Modifier
                      </button>
                      {u.role !== 'admin' && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteUser(u)}
                          style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DeleteOutlinedIcon style={{ fontSize: '0.95rem' }} /> Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                  {u.role === 'chauffeur' && u.vehicule && (
                    <div style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--mid-grey)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {[
                        [DirectionsCarOutlinedIcon, u.vehicule],
                        [BadgeOutlinedIcon, u.permis],
                        [ArticleOutlinedIcon, u.carte_grise],
                        [TagOutlinedIcon, u.matricule],
                      ].map(([Icon, val]) => val && (
                        <span key={String(val)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon style={{ fontSize: '0.95rem' }} /> {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--mid-grey)' }}>Aucun utilisateur</div>}
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.map(r => (
              <div key={r.id} className="card" style={{ padding: 18 }}>
                <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      #{r.id} · {r.from_city} → {r.to_city} · {r.date}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--mid-grey)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                      <SchoolOutlinedIcon style={{ fontSize: '0.85rem' }} />{r.etudiant} (étud. #{r.etudiant_id})
                      <span style={{ opacity: 0.4 }}>·</span>
                      <LuggageOutlinedIcon style={{ fontSize: '0.85rem' }} />{r.size}
                      <span style={{ opacity: 0.4 }}>·</span>
                      {r.offers_count} offre(s)
                    </div>
                  </div>
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--emerald)' }}>{r.price} DH</span>
                    <span className="badge" style={{ background: 'var(--emerald-glow)', color: STATUS_COLORS[r.status] || 'var(--text)', fontSize: '0.72rem' }}>
                      {r.status}
                    </span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReqModal({
                      id: r.id, from_city: r.from_city, to_city: r.to_city, date: r.date, size: r.size,
                      price: r.price, status: r.status, groupage: r.groupage, insurance: r.insurance,
                      etudiant_id: r.etudiant_id,
                    })} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <EditOutlinedIcon style={{ fontSize: '0.95rem' }} /> Modifier
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteRequest(r)}
                      style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DeleteOutlinedIcon style={{ fontSize: '0.95rem' }} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {requests.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--mid-grey)' }}>Aucune demande</div>}
          </div>
        )}

        {tab === 'entities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <section>
              <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <WorkOutlinedIcon style={{ color: 'var(--emerald)' }} /> Offres
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {offers.slice(0, 80).map(o => (
                  <div key={o.id} className="card" style={{ padding: 14 }}>
                    <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: '0.88rem' }}>
                        <strong>#{o.id}</strong> · {o.chauffeur} → demande #{o.request_id} · {o.status} · {o.price} DH
                        {o.request && (
                          <div style={{ color: 'var(--mid-grey)', marginTop: 4 }}>
                            {o.request.from_city} → {o.request.to_city} · {o.request.date}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOfferModal({
                          id: o.id, request_id: o.request_id, chauffeur_id: o.chauffeur_id,
                          price: o.price, message: o.message || '', status: o.status,
                        })}>
                          <EditOutlinedIcon style={{ fontSize: '0.9rem' }} />
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteOffer(o)} style={{ color: 'var(--danger)' }}>
                          <DeleteOutlinedIcon style={{ fontSize: '0.9rem' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {offers.length === 0 && <div style={{ color: 'var(--mid-grey)' }}>Aucune offre</div>}
              </div>
            </section>

            <section>
              <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <SyncAltIcon style={{ color: 'var(--emerald)' }} /> Trajets aller-retour
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trips.slice(0, 60).map(t => (
                  <div key={t.id} className="card" style={{ padding: 14 }}>
                    <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: '0.88rem' }}>
                        <strong>#{t.id}</strong> · {t.driver} · {t.from_city} ↔ {t.to_city} · {t.status}
                        <div style={{ color: 'var(--mid-grey)', marginTop: 4 }}>
                          {t.depart_date} / {t.return_date} · kg A {t.outbound?.kg_remaining} / R {t.return?.kg_remaining}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTripModal({
                          id: t.id, chauffeur_id: t.chauffeur_id, from_city: t.from_city, to_city: t.to_city,
                          depart_date: t.depart_date, return_date: t.return_date, notes: t.notes || '', status: t.status,
                          kg_remaining_outbound: t.outbound?.kg_remaining ?? 0,
                          kg_remaining_return: t.return?.kg_remaining ?? 0,
                          price_per_10kg_outbound: t.outbound?.price_per_10kg ?? 0,
                          price_per_10kg_return: t.return?.price_per_10kg ?? 0,
                        })}>
                          <EditOutlinedIcon style={{ fontSize: '0.9rem' }} />
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteTrip(t)} style={{ color: 'var(--danger)' }}>
                          <DeleteOutlinedIcon style={{ fontSize: '0.9rem' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {trips.length === 0 && <div style={{ color: 'var(--mid-grey)' }}>Aucun trajet</div>}
              </div>
            </section>

            <section>
              <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <EventSeatOutlinedIcon style={{ color: 'var(--emerald)' }} /> Réservations A/R
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bookings.slice(0, 80).map(b => (
                  <div key={b.id} className="card" style={{ padding: 14 }}>
                    <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: '0.88rem' }}>
                        <strong>#{b.id}</strong> · {b.etudiant} · trajet #{b.trip_id} · {b.leg} · {b.kg} kg · {b.total_dh} DH
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBookingModal({
                          id: b.id, trip_id: b.trip_id, round_trip_id: b.trip_id,
                          etudiant_id: b.etudiant_id, leg: b.leg, kg: b.kg, total_dh: b.total_dh,
                        })}>
                          <EditOutlinedIcon style={{ fontSize: '0.9rem' }} />
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteBooking(b)} style={{ color: 'var(--danger)' }}>
                          <DeleteOutlinedIcon style={{ fontSize: '0.9rem' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <div style={{ color: 'var(--mid-grey)' }}>Aucune réservation</div>}
              </div>
            </section>
          </div>
        )}

        {tab === 'notify' && (
          <div className="card" style={{ maxWidth: 600, padding: 32 }}>
            <div style={{ marginBottom: 12 }}>
              <CampaignOutlinedIcon style={{ fontSize: '2rem', color: 'var(--emerald)' }} />
            </div>
            <h3 style={{ marginBottom: 20 }}>Envoyer une notification</h3>
            <form onSubmit={sendNotif}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Destinataires</label>
                  <select className="form-select" value={notifForm.role} onChange={e => setNotifForm(p => ({ ...p, role: e.target.value, user_id: '' }))}>
                    <option value="">Tous les utilisateurs</option>
                    <option value="etudiant">Tous les étudiants</option>
                    <option value="chauffeur">Tous les conducteurs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ID utilisateur spécifique (optionnel)</label>
                  <input className="form-input" type="number" placeholder="Ex : 3" value={notifForm.user_id} onChange={e => setNotifForm(p => ({ ...p, user_id: e.target.value, role: '' }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Titre</label>
                  <input className="form-input" type="text" placeholder="Message de l'équipe Bagagi" value={notifForm.title} onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-input" rows={4} style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }} placeholder="Votre message..." value={notifForm.message} onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))} required />
                </div>
                <button className="btn btn-primary btn-full" type="submit"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <SendOutlinedIcon style={{ fontSize: '1rem' }} /> Envoyer
                </button>
              </div>
            </form>
          </div>
        )}

        {userModal && (
          <Modal title="Modifier l’utilisateur" onClose={() => setUserModal(null)}>
            <form onSubmit={saveUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Prénom</label>
                  <input className="form-input" value={userModal.prenom} onChange={e => setUserModal(p => ({ ...p, prenom: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Nom</label>
                  <input className="form-input" value={userModal.nom} onChange={e => setUserModal(p => ({ ...p, nom: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={userModal.email} onChange={e => setUserModal(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Téléphone</label>
                <input className="form-input" value={userModal.phone} onChange={e => setUserModal(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Rôle</label>
                <select className="form-select" value={userModal.role} onChange={e => setUserModal(p => ({ ...p, role: e.target.value }))}>
                  <option value="etudiant">etudiant</option>
                  <option value="chauffeur">chauffeur</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!userModal.is_verified} onChange={e => setUserModal(p => ({ ...p, is_verified: e.target.checked }))} />
                <span style={{ fontSize: '0.9rem' }}>Compte vérifié</span>
              </label>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nouveau mot de passe (optionnel)</label>
                <input className="form-input" type="password" autoComplete="new-password" value={userModal.password} placeholder="Laisser vide pour ne pas changer"
                  onChange={e => setUserModal(p => ({ ...p, password: e.target.value }))} />
              </div>
              {(userModal.role === 'chauffeur' || userModal.vehicule) && (
                <>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Véhicule</label>
                    <input className="form-input" value={userModal.vehicule} onChange={e => setUserModal(p => ({ ...p, vehicule: e.target.value }))} />
                  </div>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Permis</label>
                      <input className="form-input" value={userModal.permis} onChange={e => setUserModal(p => ({ ...p, permis: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Carte grise</label>
                      <input className="form-input" value={userModal.carte_grise} onChange={e => setUserModal(p => ({ ...p, carte_grise: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Matricule</label>
                    <input className="form-input" value={userModal.matricule} onChange={e => setUserModal(p => ({ ...p, matricule: e.target.value }))} />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary btn-full">Enregistrer</button>
            </form>
          </Modal>
        )}

        {reqModal && (
          <Modal title="Modifier la demande" onClose={() => setReqModal(null)}>
            <form onSubmit={saveRequest} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">ID étudiant</label>
                <input className="form-input" type="number" required value={reqModal.etudiant_id} onChange={e => setReqModal(p => ({ ...p, etudiant_id: e.target.value }))} />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Départ</label>
                  <input className="form-input" value={reqModal.from_city} onChange={e => setReqModal(p => ({ ...p, from_city: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Arrivée</label>
                  <input className="form-input" value={reqModal.to_city} onChange={e => setReqModal(p => ({ ...p, to_city: e.target.value }))} required />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date</label>
                  <input className="form-input" value={reqModal.date} onChange={e => setReqModal(p => ({ ...p, date: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Taille</label>
                  <input className="form-input" value={reqModal.size} onChange={e => setReqModal(p => ({ ...p, size: e.target.value }))} required />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Prix (DH)</label>
                  <input className="form-input" type="number" step="0.01" value={reqModal.price} onChange={e => setReqModal(p => ({ ...p, price: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Statut</label>
                  <select className="form-select" value={reqModal.status} onChange={e => setReqModal(p => ({ ...p, status: e.target.value }))}>
                    {REQ_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={!!reqModal.groupage} onChange={e => setReqModal(p => ({ ...p, groupage: e.target.checked }))} /> Groupage
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={!!reqModal.insurance} onChange={e => setReqModal(p => ({ ...p, insurance: e.target.checked }))} /> Assurance
              </label>
              <button type="submit" className="btn btn-primary btn-full">Enregistrer</button>
            </form>
          </Modal>
        )}

        {offerModal && (
          <Modal title="Modifier l’offre" onClose={() => setOfferModal(null)}>
            <form onSubmit={saveOffer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">ID demande</label>
                <input className="form-input" type="number" required value={offerModal.request_id} onChange={e => setOfferModal(p => ({ ...p, request_id: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">ID conducteur</label>
                <input className="form-input" type="number" required value={offerModal.chauffeur_id} onChange={e => setOfferModal(p => ({ ...p, chauffeur_id: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Prix (DH)</label>
                <input className="form-input" type="number" step="0.01" value={offerModal.price} onChange={e => setOfferModal(p => ({ ...p, price: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message</label>
                <input className="form-input" value={offerModal.message} onChange={e => setOfferModal(p => ({ ...p, message: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Statut</label>
                <select className="form-select" value={offerModal.status} onChange={e => setOfferModal(p => ({ ...p, status: e.target.value }))}>
                  {OFFER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Enregistrer</button>
            </form>
          </Modal>
        )}

        {tripModal && (
          <Modal title="Modifier le trajet A/R" onClose={() => setTripModal(null)}>
            <form onSubmit={saveTrip} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">ID conducteur</label>
                <input className="form-input" type="number" required value={tripModal.chauffeur_id} onChange={e => setTripModal(p => ({ ...p, chauffeur_id: e.target.value }))} />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Départ</label>
                  <input className="form-input" value={tripModal.from_city} onChange={e => setTripModal(p => ({ ...p, from_city: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Arrivée</label>
                  <input className="form-input" value={tripModal.to_city} onChange={e => setTripModal(p => ({ ...p, to_city: e.target.value }))} required />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date aller</label>
                  <input className="form-input" value={tripModal.depart_date} onChange={e => setTripModal(p => ({ ...p, depart_date: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date retour</label>
                  <input className="form-input" value={tripModal.return_date} onChange={e => setTripModal(p => ({ ...p, return_date: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Statut</label>
                <input className="form-input" value={tripModal.status} onChange={e => setTripModal(p => ({ ...p, status: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Notes</label>
                <input className="form-input" value={tripModal.notes} onChange={e => setTripModal(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Kg restants aller</label>
                  <input className="form-input" type="number" step="0.1" value={tripModal.kg_remaining_outbound} onChange={e => setTripModal(p => ({ ...p, kg_remaining_outbound: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Kg restants retour</label>
                  <input className="form-input" type="number" step="0.1" value={tripModal.kg_remaining_return} onChange={e => setTripModal(p => ({ ...p, kg_remaining_return: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Prix / 10 kg aller</label>
                  <input className="form-input" type="number" step="0.01" value={tripModal.price_per_10kg_outbound} onChange={e => setTripModal(p => ({ ...p, price_per_10kg_outbound: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Prix / 10 kg retour</label>
                  <input className="form-input" type="number" step="0.01" value={tripModal.price_per_10kg_return} onChange={e => setTripModal(p => ({ ...p, price_per_10kg_return: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Enregistrer</button>
            </form>
          </Modal>
        )}

        {bookingModal && (
          <Modal title="Modifier la réservation" onClose={() => setBookingModal(null)}>
            <form onSubmit={saveBooking} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">ID trajet A/R</label>
                <input className="form-input" type="number" required value={bookingModal.round_trip_id} onChange={e => setBookingModal(p => ({ ...p, round_trip_id: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">ID étudiant</label>
                <input className="form-input" type="number" required value={bookingModal.etudiant_id} onChange={e => setBookingModal(p => ({ ...p, etudiant_id: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Segment</label>
                <select className="form-select" value={bookingModal.leg} onChange={e => setBookingModal(p => ({ ...p, leg: e.target.value }))}>
                  <option value="outbound">outbound (aller)</option>
                  <option value="return">return (retour)</option>
                </select>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Kg</label>
                  <input className="form-input" type="number" step="0.1" value={bookingModal.kg} onChange={e => setBookingModal(p => ({ ...p, kg: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Total DH</label>
                  <input className="form-input" type="number" step="0.01" value={bookingModal.total_dh} onChange={e => setBookingModal(p => ({ ...p, total_dh: e.target.value }))} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Enregistrer</button>
            </form>
          </Modal>
        )}

      </div>
    </div>
  )
}
