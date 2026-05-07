import CheckIcon                from '@mui/icons-material/Check'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ScaleIcon                from '@mui/icons-material/Scale'
import ArrowForwardIcon         from '@mui/icons-material/ArrowForward'
import SyncAltIcon              from '@mui/icons-material/SyncAlt'
import RoundTripPicker          from './RoundTripPicker'

export default function ReturnCard({ trip, onBook }) {
  const o = trip.outbound
  const r = trip.return

  return (
    <div className="card" style={{ padding: 22 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar avatar-sm">{trip.initials}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{trip.driver}</div>
            {trip.is_verified && (
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                <CheckIcon style={{ fontSize: '0.75rem' }} /> Vérifié
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--mid-grey)', maxWidth: 200 }}>
          Aller : <strong style={{ color: 'var(--emerald)' }}>{o?.price_per_10kg ?? '—'}</strong> DH/10 kg
          <br />
          Retour : <strong style={{ color: 'var(--emerald)' }}>{r?.price_per_10kg ?? '—'}</strong> DH/10 kg
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', padding: '14px 20px',
        marginBottom: 12,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{trip.from_city}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--mid-grey)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
            <CalendarTodayOutlinedIcon style={{ fontSize: '0.75rem' }} /> Aller · {trip.depart_date}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <ArrowForwardIcon style={{ color: 'var(--emerald)', fontSize: '1.1rem' }} />
          <SyncAltIcon style={{ color: 'var(--mid-grey)', fontSize: '0.85rem' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{trip.to_city}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--mid-grey)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
            <CalendarTodayOutlinedIcon style={{ fontSize: '0.75rem' }} /> Retour · {trip.return_date}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--mid-grey)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <ScaleIcon style={{ fontSize: '0.95rem' }} />
        Capacité — <strong style={{ color: 'var(--text)' }}>Aller {o?.kg_remaining ?? 0} kg</strong>
        <span style={{ opacity: 0.4 }}>·</span>
        <strong style={{ color: 'var(--text)' }}>Retour {r?.kg_remaining ?? 0} kg</strong>
        {trip.notes && (
          <span style={{ fontStyle: 'italic', color: 'var(--text-dim)', marginLeft: 4 }}>— "{trip.notes}"</span>
        )}
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.45 }}>
        Chaque segment (aller / retour) se paie séparément selon le poids choisi par tranches de 10 kg.
      </div>

      <RoundTripPicker trip={trip} leg="outbound" variant="compact" showSchedule={false} onBook={onBook} />
      <RoundTripPicker trip={trip} leg="return"   variant="compact" showSchedule={false} onBook={onBook} />

    </div>
  )
}
