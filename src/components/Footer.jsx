import SchoolOutlinedIcon       from '@mui/icons-material/SchoolOutlined'
import EmailOutlinedIcon        from '@mui/icons-material/EmailOutlined'
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined'
import LocationOnOutlinedIcon   from '@mui/icons-material/LocationOnOutlined'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border-nav)', padding: '40px 0' }}>
      <div className="container">
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div className="logo" style={{ marginBottom: 8 }}>bag<span>agi</span></div>
            <p style={{ fontSize: '0.82rem', maxWidth: 300, display: 'flex', alignItems: 'center', gap: 5 }}>
              <SchoolOutlinedIcon style={{ fontSize: '0.9rem', flexShrink: 0 }} />
              Créé par ceux qui galèrent, pour ceux qui galèrent.
            </p>
          </div>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            {[
              [EmailOutlinedIcon,        'contact@bagagi.ma'],
              [PhoneAndroidOutlinedIcon, 'WhatsApp disponible'],
              [LocationOnOutlinedIcon,   'Marrakech, Maroc'],
            ].map(([Icon, text]) => (
              <span key={text} style={{ fontSize: '0.82rem', color: 'var(--mid-grey)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon style={{ fontSize: '0.95rem' }} /> {text}
              </span>
            ))}
          </div>
        </div>
        <div className="divider" />
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--mid-grey)' }}>
          © 2025 Bagagi · Groupe 28 ENCG Marrakech · Tous droits réservés
        </div>
      </div>
    </footer>
  )
}
