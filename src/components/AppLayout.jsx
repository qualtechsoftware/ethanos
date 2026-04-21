import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/useApp'
import {
  IconClipboard,
  IconHexagon,
  IconLogOut,
  IconMenu,
  IconUsers,
  IconX,
} from './Icons'

const baseNavItems = [{ to: '/tasks', label: 'Task log', icon: IconClipboard }]

export function AppLayout() {
  const { currentUser, logout } = useApp()

  const navItems = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return [
        ...baseNavItems,
        { to: '/admin/users', label: 'Admin', icon: IconUsers },
      ]
    }
    return baseNavItems
  }, [currentUser?.role])
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const onChange = () => {
      if (mq.matches) setNavOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  const pageTitle =
    navItems.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Ethanos'

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop ${navOpen ? 'is-open' : ''}`}
        onClick={() => setNavOpen(false)}
        aria-hidden
      />

      <aside className={`sidebar ${navOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden>
            <IconHexagon size={22} />
          </div>
          <div>
            <div className="brand-name">Ethanos</div>
            <div className="brand-tag">Task &amp; time</div>
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
          >
            <IconX size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Sections">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
              onClick={() => setNavOpen(false)}
            >
              <span className="nav-icon" aria-hidden>
                <Icon size={18} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar" aria-hidden>
              {(currentUser?.name || currentUser?.email || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="user-meta">
              <div className="user-name">{currentUser?.name || 'Signed in'}</div>
              <div className="user-email">{currentUser?.email}</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-block" onClick={logout}>
            <span className="nav-icon" aria-hidden>
              <IconLogOut size={18} />
            </span>
            Sign out
          </button>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="main-topbar">
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu size={22} />
          </button>
          <span className="main-topbar-title">{pageTitle}</span>
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
