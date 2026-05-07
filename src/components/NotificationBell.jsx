import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

import NotificationsOutlinedIcon  from '@mui/icons-material/NotificationsOutlined'
import WorkOutlinedIcon    from '@mui/icons-material/WorkOutlined'
import CheckCircleOutlineIcon     from '@mui/icons-material/CheckCircleOutlined'
import VerifiedUserOutlinedIcon   from '@mui/icons-material/VerifiedUserOutlined'
import CampaignOutlinedIcon       from '@mui/icons-material/CampaignOutlined'
import ChatBubbleOutlineIcon      from '@mui/icons-material/ChatBubbleOutlined'
import SyncAltIcon                from '@mui/icons-material/SyncAlt'

const TYPE_ICONS = {
  new_offer:          WorkOutlinedIcon,
  offer_accepted:     CheckCircleOutlineIcon,
  account_verified:   VerifiedUserOutlinedIcon,
  system:             CampaignOutlinedIcon,
  round_trip_booking: SyncAltIcon,
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [data, setData]   = useState({ notifications: [], unread: 0 })
  const [open, setOpen]   = useState(false)
  const panelRef          = useRef(null)

  async function fetchNotifs() {
    try {
      const res = await api.get('/notifications')
      setData(res)
    } catch { /* silent */ }
  }

  useEffect(() => {
    if (!user) return
    fetchNotifs()
    const id = setInterval(fetchNotifs, 30_000)
    return () => clearInterval(id)
  }, [user])

  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function markAll() {
    await api.put('/notifications/read-all')
    setData(prev => ({
      unread: 0,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }))
  }

  if (!user) return null

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          cursor: 'pointer',
          color: 'var(--text)',
          display: 'flex', alignItems: 'center',
        }}
      >
        <NotificationsOutlinedIcon style={{ fontSize: '1.2rem' }} />
        {data.unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            background: 'var(--emerald)', color: '#fff',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: '0.65rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {data.unread > 9 ? '9+' : data.unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 340, maxHeight: 420, overflowY: 'auto',
          background: 'var(--anthracite)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 2000,
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Notifications</span>
            {data.unread > 0 && (
              <button onClick={markAll} style={{ fontSize: '0.78rem', color: 'var(--emerald-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Tout marquer lu
              </button>
            )}
          </div>

          {data.notifications.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--mid-grey)', fontSize: '0.88rem' }}>
              Aucune notification
            </div>
          ) : (
            data.notifications.map(n => {
              const Icon = TYPE_ICONS[n.type] || ChatBubbleOutlineIcon
              return (
                <div key={n.id} style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: n.read ? 'transparent' : 'var(--emerald-glow)',
                  cursor: 'default',
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Icon style={{ fontSize: '1.1rem', marginTop: 2, color: 'var(--emerald)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>
                        {n.title}
                        {!n.read && <span className="notif-dot" style={{ marginLeft: 6 }} />}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--mid-grey)', marginTop: 4 }}>
                        {new Date(n.created_at).toLocaleString('fr-MA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}



