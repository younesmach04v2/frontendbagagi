import Stars from './Stars'

export default function OfferCard({ offer, onAccept }) {
  return (
    <div className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onAccept(offer.id)}>
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-2">
          <div className="avatar avatar-md">{offer.initials}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.97rem' }}>{offer.driver}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--mid-grey)' }}>{offer.vehicle}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--emerald)' }}>
            {offer.price} <span style={{ fontSize: '0.75rem', color: 'var(--mid-grey)' }}>DH</span>
          </div>
          {offer.verified && (
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>✓ Vérifié</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {offer.features.map(f => (
          <span key={f} style={{ background: 'rgba(0,104,79,0.12)', color: 'var(--emerald-light)', padding: '3px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 }}>
            {f}
          </span>
        ))}
      </div>

      <div className="flex justify-between" style={{ fontSize: '0.85rem', color: 'var(--mid-grey)' }}>
        <span>📅 {offer.date}</span>
        <span>📦 {offer.capacity}</span>
        <Stars rating={offer.rating} />
      </div>
    </div>
  )
}
