import { useState, useEffect } from 'react'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ScaleIcon                from '@mui/icons-material/Scale'
import ArrowForwardIcon         from '@mui/icons-material/ArrowForward'
import { kgOptions, totalForKg } from '../utils/roundTripPricing'

/**
 * Réservation pour un segment (aller ou retour) d'un trajet A/R.
 * @param {object} trip — objet API (avec outbound / return)
 * @param {'outbound'|'return'} leg
 * @param {function} onBook — async ({ trip, leg, kg, total }) => void
 */
export default function RoundTripPicker({ trip, leg, onBook, variant = 'default', showSchedule = true }) {
  const segment = leg === 'outbound' ? trip?.outbound : trip?.return
  const kgRem = segment?.kg_remaining ?? 0
  const price = segment?.price_per_10kg ?? 0
  const title = leg === 'outbound' ? 'Aller' : 'Retour'
  const compact = variant === 'compact'

  const opts = kgOptions(kgRem)
  const [selKg, setSelKg] = useState(opts.length ? opts[0] : 10)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const o = kgOptions(kgRem)
    setSelKg(o.length ? o[0] : 10)
  }, [trip?.id, leg, kgRem])

  const total = totalForKg(price, selKg)
  const routeLabel = segment ? `${segment.from_city} → ${segment.to_city}` : ''

  async function handleBook() {
    setBusy(true)
    try {
      await Promise.resolve(onBook({ trip, leg, kg: selKg, total }))
    } finally {
      setBusy(false)
    }
  }

  if (!segment || kgRem < 10) {
    return (
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', padding: compact ? '4px 0' : '8px 0' }}>
        {title} : plus de capacité (ou moins de 10 kg).
      </div>
    )
  }

  if (opts.length === 0) {
    return (
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', padding: compact ? '4px 0' : '8px 0' }}>
        Moins de 10 kg disponibles pour le {title.toLowerCase()}.
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: compact ? 8 : 10,
      padding: compact ? 0 : '12px 0',
      borderTop: compact ? '1px solid var(--border-subtle)' : undefined,
      marginTop: compact ? 8 : 0,
    }}>
      <div style={{
        fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--emerald)',
        marginBottom: 2,
      }}>
        {title} — {routeLabel}
      </div>

      {showSchedule && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--mid-grey)', flexWrap: 'wrap' }}>
          <CalendarTodayOutlinedIcon style={{ fontSize: '0.8rem' }} /> {segment.date}
          <ArrowForwardIcon style={{ fontSize: '0.7rem', color: 'var(--emerald)' }} />
          <span />
          <ScaleIcon style={{ fontSize: '0.8rem' }} /> jusqu'à {kgRem} kg
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: showSchedule ? 2 : 0 }}>
        <div className="form-group" style={{ margin: 0, flex: compact ? '1 1 120px' : '1 1 140px' }}>
          <label className="form-label" style={{ fontSize: '0.72rem' }}>Poids ({title}) — par 10 kg</label>
          <select className="form-select" value={selKg} onChange={e => setSelKg(+e.target.value)} style={{ padding: '8px 12px' }}>
            {opts.map(k => (
              <option key={k} value={k}>{k} kg</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--mid-grey)' }}>{price} DH / 10 kg</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: compact ? '1.05rem' : '1.15rem', color: 'var(--emerald)' }}>
            Total : {total} DH
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={handleBook}>
          {busy ? '…' : `Réserver (${title})`}
        </button>
      </div>
    </div>
  )
}
