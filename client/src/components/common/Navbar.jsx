import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import ThemeToggle from '../ui/ThemeToggle'

/**
 * Navbar Component
 * Shows logo, navigation links, logout button, theme toggle
 */
export default function Navbar() {
  const { user, logout, openModal } = useAuth()
  const socketCtx = useSocket()
  const totalUnread = socketCtx?.totalUnread || 0

  return (
    <nav style={{
      background: 'var(--navbar-bg)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)'
    }}>
      <Link to={user ? "/dashboard" : "/"} style={{
        fontFamily: 'Clash Display, sans-serif',
        fontSize: '1.4rem',
        fontWeight: 700,
        color: 'var(--text)',
        textDecoration: 'none'
      }}>
        Connect<span style={{ color: '#6366F1' }}>ify</span>
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/browse" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Browse</Link>
            <Link to="/demands" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Posts</Link>
            <Link to="/requests" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Requests</Link>
            <Link to="/chat" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', position: 'relative' }}>
              Chat
              {totalUnread > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  background: '#6366F1',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}>
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </Link>
            <Link to="/profile/me" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Profile</Link>
            <ThemeToggle />
            <button
              onClick={logout}
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#6366F1',
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <ThemeToggle />
            <button
              onClick={() => openModal('login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            >
              Log in
            </button>
            <button
              onClick={() => openModal('register')}
              style={{
                background: '#6366F1',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
