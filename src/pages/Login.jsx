import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useData } from '../context/DataContext'
import { api } from '../api'

import SchoolOutlinedIcon        from '@mui/icons-material/SchoolOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PhoneAndroidOutlinedIcon  from '@mui/icons-material/PhoneAndroidOutlined'
import EmailOutlinedIcon         from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon          from '@mui/icons-material/LockOutlined'
import BadgeOutlinedIcon         from '@mui/icons-material/BadgeOutlined'
import ArticleOutlinedIcon       from '@mui/icons-material/ArticleOutlined'
import TagOutlinedIcon           from '@mui/icons-material/TagOutlined'
import RocketLaunchOutlinedIcon  from '@mui/icons-material/RocketLaunchOutlined'
import LoginOutlinedIcon         from '@mui/icons-material/LoginOutlined'

const ROLES = [
  { id: 'etudiant',  Icon: SchoolOutlinedIcon,        label: 'Étudiant',   desc: 'Envoyer mes bagages' },
  { id: 'chauffeur', Icon: DirectionsCarOutlinedIcon,  label: 'Conducteur', desc: 'Transporter des bagages' },
]

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const data = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [mode, setMode]       = useState('login')
  const [role, setRole]       = useState('etudiant')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', phone: '', password: '',
    vehicule: '', permis: '', carte_grise: '', matricule: '',
  })

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await api.post('/auth/login', { email: form.email, password: form.password })
      } else {
        res = await api.post('/auth/register', { ...form, role })
      }
      login(res.user, res.token)
      toast(`Bienvenue ${res.user.prenom} !`, 'success')
      navigate(from, { replace: true })
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ paddingTop: 96, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 520 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="logo" style={{ fontSize: '2rem', marginBottom: 8 }}>bag<span>agi</span></div>
          <p style={{ color: 'var(--mid-grey)' }}>Créé par ceux qui galèrent, pour ceux qui galèrent.</p>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <div className="tab-bar" style={{ marginBottom: 28 }}>
            <button className={`tab-btn${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>Connexion</button>
            <button className={`tab-btn${mode === 'register' ? ' active' : ''}`} onClick={() => setMode('register')}>Inscription</button>
          </div>

          <form onSubmit={submit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Je suis…</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {ROLES.map(r => (
                      <div key={r.id} onClick={() => setRole(r.id)} className="card"
                        style={{ padding: 14, cursor: 'pointer', textAlign: 'center',
                          border: `1.5px solid ${role === r.id ? 'var(--emerald)' : 'var(--border-subtle)'}`,
                          background: role === r.id ? 'var(--emerald-glow)' : 'var(--surface-1)',
                        }}>
                        <r.Icon style={{ fontSize: '1.4rem', color: 'var(--emerald)', marginBottom: 4 }} />
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{r.label}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--mid-grey)', marginTop: 4 }}>{r.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nom</label>
                    <input className="form-input" type="text" placeholder="Bennani" value={form.nom} onChange={e => set('nom', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Prénom</label>
                    <input className="form-input" type="text" placeholder="Youssef" value={form.prenom} onChange={e => set('prenom', e.target.value)} required />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <PhoneAndroidOutlinedIcon style={{ fontSize: '0.95rem' }} /> WhatsApp
                  </label>
                  <input className="form-input" type="tel" placeholder="+212 6XX XXX XXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <EmailOutlinedIcon style={{ fontSize: '0.95rem' }} /> Email
                </label>
                <input className="form-input" type="email" placeholder="vous@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <LockOutlinedIcon style={{ fontSize: '0.95rem' }} /> Mot de passe
                </label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
              </div>

              {mode === 'register' && role === 'chauffeur' && (
                <>
                  <div style={{ background: 'var(--emerald-glow)', border: '1px solid var(--emerald-glow)', borderRadius: 'var(--radius-md)', padding: 12, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <DirectionsCarOutlinedIcon style={{ fontSize: '1rem', flexShrink: 0 }} />
                    Documents du véhicule — votre dossier sera vérifié par l'équipe Bagagi sous 24h.
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <DirectionsCarOutlinedIcon style={{ fontSize: '0.95rem' }} /> Type de véhicule
                    </label>
                    <select className="form-select" value={form.vehicule} onChange={e => set('vehicule', e.target.value)}>
                      <option value="" disabled>Choisir...</option>
                      <option value="Citadine">Citadine (Clio, Logan…)</option>
                      <option value="Berline">Berline (301, Sandero…)</option>
                      <option value="Break">Break / Familiale</option>
                      <option value="SUV">SUV / 4x4</option>
                      <option value="Utilitaire">Utilitaire / Camionnette</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <BadgeOutlinedIcon style={{ fontSize: '0.95rem' }} /> Permis
                      </label>
                      <input className="form-input" type="text" placeholder="M12345678" value={form.permis} onChange={e => set('permis', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ArticleOutlinedIcon style={{ fontSize: '0.95rem' }} /> Carte grise
                      </label>
                      <input className="form-input" type="text" placeholder="12345-A-12" value={form.carte_grise} onChange={e => set('carte_grise', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <TagOutlinedIcon style={{ fontSize: '0.95rem' }} /> Matricule
                    </label>
                    <input className="form-input" type="text" placeholder="12345-A-3" value={form.matricule} onChange={e => set('matricule', e.target.value)} />
                  </div>
                </>
              )}

              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? 'Chargement...' : mode === 'login'
                  ? <><LoginOutlinedIcon style={{ fontSize: '1.1rem' }} /> Se connecter</>
                  : <><RocketLaunchOutlinedIcon style={{ fontSize: '1.1rem' }} /> Créer mon compte</>
                }
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: 'var(--mid-grey)' }}>
            Comptes démo · <code>admin@bagagi.ma</code> · <code>etudiant@test.ma</code> · <code>chauffeur@test.ma</code>
            <br />Mot de passe : <code>admin123</code> ou <code>test123</code>
          </div>
        </div>
      </div>
    </div>
  )
}
