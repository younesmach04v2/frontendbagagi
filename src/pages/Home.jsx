import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import bagagiDarkCar from '../../ressources/bagagidarkcar.png'
import bagagiLightCar from '../../ressources/bagagilightcar.png'
import LuggageOutlinedIcon      from '@mui/icons-material/LuggageOutlined'
import SchoolOutlinedIcon        from '@mui/icons-material/SchoolOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import RocketLaunchOutlinedIcon  from '@mui/icons-material/RocketLaunchOutlined'
import DynIcon from '../components/DynIcon'

export default function Home() {
  const data = useData()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const heroCarImage = theme === 'dark' ? bagagiDarkCar : bagagiLightCar

  return (
    <div className="page">

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', paddingTop: 60, overflow: 'hidden' }}>
        <div className="hero-mesh" />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 780, flex: '1 1 480px' }}>
            <div className="section-tag" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <LuggageOutlinedIcon style={{ fontSize: '0.9rem' }} />
              Transport de bagages étudiant · Marrakech
            </div>
            <h1 style={{ marginBottom: 20, lineHeight: 1.1 }}>
              Envoyez vos<br />bagages partout<br />
              <span style={{ color: 'var(--emerald)' }}>au Maroc</span>
            </h1>
            <p style={{ fontSize: '1.15rem', maxWidth: 520, marginBottom: 12, color: 'var(--text-muted)' }}>
              La plateforme créée <em style={{ color: 'var(--emerald-light)' }}>par ceux qui galèrent,<br />pour ceux qui galèrent.</em>
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--mid-grey)', marginBottom: 40 }}>
              Mets en relation les étudiants avec des conducteurs vérifiés. Prix flexibles selon la distance et le poids.
            </p>
            <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/student')}>
                <SchoolOutlinedIcon style={{ fontSize: '1.2rem' }} /> J'envoie mon bagage
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/driver')}>
                <DirectionsCarOutlinedIcon style={{ fontSize: '1.2rem' }} /> Je suis conducteur
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--mid-grey)', marginBottom: 18, maxWidth: 520 }}>
              Résultats issus de notre formulaire étudiant (échantillon interrogé).
            </p>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {data.STATS.map((s, i) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.55rem', color: 'var(--text)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--mid-grey)', maxWidth: 200, lineHeight: 1.35 }}>{s.label}</div>
                  </div>
                  {i < data.STATS.length - 1 && (
                    <div style={{ width: 1, height: 40, background: 'var(--stat-line)', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
            </div>

            <div style={{
              flex: '1.7 1 560px',
              minWidth: 360,
              width: '100%',
              maxWidth: 'min(98vw, 1200px)',
            }}>
              <img
                src={heroCarImage}
                alt="Bagagi car"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 'min(88vh, 980px)',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: 'var(--surface-1)' }}>
        <div className="container">
          <div className="section-header text-center">
            <div className="section-tag">Comment ça marche</div>
            <h2>Simple comme bonjour</h2>
          </div>
          <div className="grid-4">
            {data.HOW_IT_WORKS.map(s => (
              <div key={s.step} style={{ textAlign: 'center', padding: 8 }}>
                <div style={{ marginBottom: 16, color: 'var(--emerald)' }}>
                  <DynIcon name={s.icon} style={{ fontSize: '2.5rem' }} />
                </div>
                <div className="step-dot" style={{ margin: '0 auto 12px' }}>{s.step}</div>
                <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.85rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKS */}
      {data.PACKS && data.PACK_PREMIUM_COMING && (
        <section className="section">
          <div className="container">
            <div className="section-header text-center">
              <div className="section-tag">Offres</div>
              <h2>Nos packs</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--mid-grey)', maxWidth: 560, margin: '12px auto 0' }}>
                Tarifs indicatifs selon distance et disponibilité — les conducteurs affinent le prix sur la plateforme.
              </p>
            </div>

            <div style={{ overflowX: 'auto', marginTop: 28, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
              <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--stat-line)', background: 'var(--surface-1)' }}>
                    <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600 }}>Pack</th>
                    <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 600 }}>Contenu</th>
                    <th style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 600 }}>Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {data.PACKS.map((p) => (
                    <tr key={p.name} style={{ borderBottom: '1px solid var(--stat-line)' }}>
                      <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: p.accent || 'var(--emerald)', display: 'flex' }}>
                            <DynIcon name={p.icon} style={{ fontSize: '1.75rem' }} />
                          </span>
                          <strong style={{ fontFamily: 'var(--font-display)' }}>{p.name}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--mid-grey)', verticalAlign: 'middle' }}>{p.content}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        {p.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="card pack-premium-soon"
              style={{
                marginTop: 24,
                position: 'relative',
                borderStyle: 'dashed',
                opacity: 0.95,
                background: 'var(--surface-1)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'rgba(230, 194, 0, 0.15)',
                  color: '#e6c200',
                  border: '1px solid rgba(230, 194, 0, 0.35)',
                }}
              >
                Bientôt disponible
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingRight: 120, flexWrap: 'wrap' }}>
                <span style={{ color: data.PACK_PREMIUM_COMING.accent || '#e6c200', display: 'flex' }}>
                  <DynIcon name={data.PACK_PREMIUM_COMING.icon} style={{ fontSize: '2rem' }} />
                </span>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontFamily: 'var(--font-display)' }}>
                    {data.PACK_PREMIUM_COMING.title}
                  </h3>
                  <p style={{ margin: '0 0 14px', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    {data.PACK_PREMIUM_COMING.subtitle}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.88rem', color: 'var(--mid-grey)', lineHeight: 1.6 }}>
                    {data.PACK_PREMIUM_COMING.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Fonctionnalités</div>
            <h2>Tout pour voyager<br /><span className="emerald">en toute sérénité</span></h2>
          </div>
          <div className="grid-3">
            {data.FEATURES.map(f => (
              <div key={f.title} className="card">
                <div style={{ marginBottom: 14, color: 'var(--emerald)' }}>
                  <DynIcon name={f.icon} style={{ fontSize: '2rem' }} />
                </div>
                <h3 style={{ marginBottom: 8, fontSize: '1.05rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ marginBottom: 20 }}>
            <RocketLaunchOutlinedIcon style={{ fontSize: '3rem', color: 'var(--emerald)' }} />
          </div>
          <h2 style={{ marginBottom: 16 }}>Prêt à envoyer ton bagage ?</h2>
          <p style={{ marginBottom: 32 }}>Rejoins des milliers d'étudiants qui font confiance à Bagagi pour transporter leurs affaires à travers le Maroc.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/student')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <LuggageOutlinedIcon style={{ fontSize: '1.2rem' }} />
            Créer ma première demande — c'est gratuit
          </button>
        </div>
      </section>
    </div>
  )
}
