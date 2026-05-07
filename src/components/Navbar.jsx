import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'

import HomeOutlinedIcon      from '@mui/icons-material/HomeOutlined'
import SchoolOutlinedIcon    from '@mui/icons-material/SchoolOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import SwapHorizIcon         from '@mui/icons-material/SwapHoriz'
import SettingsOutlinedIcon  from '@mui/icons-material/SettingsOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon  from '@mui/icons-material/DarkModeOutlined'
import LogoutOutlinedIcon    from '@mui/icons-material/LogoutOutlined'
import LoginOutlinedIcon     from '@mui/icons-material/LoginOutlined'
import LuggageOutlinedIcon   from '@mui/icons-material/LuggageOutlined'
import ChatOutlinedIcon      from '@mui/icons-material/ChatOutlined'

const NAV_LINKS = [
  { path: '/',        label: 'Accueil',    roles: null,          Icon: HomeOutlinedIcon },
  { path: '/student', label: 'Étudiant',   roles: ['etudiant'],  Icon: SchoolOutlinedIcon },
  { path: '/driver',  label: 'Conducteur', roles: ['chauffeur'], Icon: DirectionsCarOutlinedIcon },
  { path: '/messages', label: 'Messages',  roles: ['etudiant', 'chauffeur'], Icon: ChatOutlinedIcon },
  { path: '/returns', label: 'Trajet',     roles: null,          Icon: SwapHorizIcon, dot: true },
  { path: '/admin',   label: 'Admin',      roles: ['admin'],     Icon: SettingsOutlinedIcon },
]

export default function Navbar() {
  const navigate             = useNavigate()
  const { pathname }         = useLocation()
  const { user, logout }     = useAuth()
  const { toast }            = useToast()
  const { theme, toggleTheme } = useTheme()

  function handleLogout() {
    logout()
    toast('À bientôt !', 'info')
    navigate('/')
  }

  const visibleLinks = NAV_LINKS.filter(l => !l.roles || (user && l.roles.includes(user.role)))

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate('/')}>
          <LuggageOutlinedIcon style={{ fontSize: '1.4rem', color: 'var(--emerald)' }} />
          bag<span>agi</span>
        </div>

        <div className="nav-links">
          {visibleLinks.map(({ path, label, Icon, dot }) => (
            <span
              key={path}
              className={`nav-link${pathname === path ? ' active' : ''}`}
              onClick={() => navigate(path)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Icon style={{ fontSize: '1rem' }} />
              {label}
              {dot && <span className="notif-dot" style={{ marginLeft: 2 }} />}
            </span>
          ))}

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark'
              ? <LightModeOutlinedIcon style={{ fontSize: '1.1rem' }} />
              : <DarkModeOutlinedIcon  style={{ fontSize: '1.1rem' }} />
            }
          </button>

          {user ? (
            <>
              <NotificationBell />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar avatar-sm" style={{ fontSize: '0.7rem' }}>
                  {user.prenom?.[0]}{user.nom?.[0]}
                </div>
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {user.prenom}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                  {user.role}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <LogoutOutlinedIcon style={{ fontSize: '1rem' }} />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}
                style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <LoginOutlinedIcon style={{ fontSize: '1rem' }} />
                Connexion
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/student')}
                style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <LuggageOutlinedIcon style={{ fontSize: '1rem' }} />
                Envoyer un bagage
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
