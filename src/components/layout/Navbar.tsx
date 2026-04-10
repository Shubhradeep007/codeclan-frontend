'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useState, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const navLinks = [
  { href: '/discover',   label: 'Discover',     icon: '🔭' },
  { href: '/dashboard',  label: 'My Snippets',  icon: '📋', auth: true },
  { href: '/snippets/create', label: 'New Snippet', icon: '✨', auth: true },
  { href: '/groups',     label: 'Groups',       icon: '👥', auth: true },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const navRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })
  }, { scope: navRef })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <nav className="navbar" ref={navRef}>
      {/* Brand */}
      <Link href="/" className="navbar-brand" style={{ marginRight: '16px' }}>
        ⚡ CodeClan
      </Link>

      {/* Search */}
      <form className="search-bar" onSubmit={handleSearch}>
        <span className="search-icon">🔍</span>
        <input
          suppressHydrationWarning
          type="text"
          placeholder="Search user & snippets..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>

      <div style={{ flex: 1 }} />

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {navLinks.filter(l => !l.auth || isAuthenticated).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            data-tooltip={link.label}
            data-tooltip-pos="bottom"
            className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
            style={{ borderRadius: '8px', padding: '8px 16px', borderLeft: 'none' }}
          >
            <span>{link.icon}</span>
            <span style={{ display: 'none' }} className="md-show">{link.label}</span>
          </Link>
        ))}

        {/* Admin */}
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            data-tooltip="Admin Panel"
            data-tooltip-pos="bottom"
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === '/admin' ? 'var(--danger)' : 'var(--text-muted)',
              background: pathname === '/admin' ? 'rgba(255,110,132,0.12)' : 'transparent',
              textDecoration: 'none',
              marginLeft: '8px'
            }}
          >
            🛡️ Admin
          </Link>
        )}
      </div>

      {/* Auth Section */}
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '12px' }}>
          {/* <Link
            href="/discover"
            data-tooltip="Browse public snippets"
            data-tooltip-pos="bottom"
            className="btn btn-primary btn-sm"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: 'none',
              boxShadow: '0 0 14px rgba(0,227,253,0.25)',
              color: '#000',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            ⚡ Discover
          </Link> */}
          <div style={{ position: 'relative' }}>
          <button
            suppressHydrationWarning
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 4px',
              borderRadius: '99px',
              background: 'rgba(25, 37, 63, 0.5)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)'
            }}
          >
            <img
              src={user?.user_profile_image?.startsWith('http') 
                ? user.user_profile_image 
                : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.user_name || 'Guest'}`}
              alt={user?.user_name}
              className="avatar"
              style={{ width: 28, height: 28 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/8.x/initials/svg?seed=${user?.user_name}`
              }}
            />
            {user?.user_name}
            <span style={{ color: 'var(--secondary)' }}>▾</span>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                background: 'linear-gradient(135deg, rgba(20, 31, 55, 0.95) 0%, rgba(15, 25, 47, 0.98) 100%)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '180px',
                zIndex: 300,
                boxShadow: 'var(--shadow-glow)',
                animation: 'fadeIn 0.2s ease',
                backdropFilter: 'blur(16px)'
              }}
            >
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
              >
                📋 My Dashboard
              </Link>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
              <button
                suppressHydrationWarning
                onClick={() => { logout(); setDropdownOpen(false); router.push('/') }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: 'var(--danger)',
                  fontSize: '14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                🚪 Log Out
              </button>
            </div>
          )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', marginLeft: '16px' }}>
          <Link href="/login" className="btn btn-ghost btn-sm" style={{ fontFamily: 'var(--font-mono)' }}>Login</Link>
          <Link href="/register" className="btn btn-primary btn-sm" style={{ fontFamily: 'var(--font-mono)' }}>Initialize Uplink</Link>
        </div>
      )}
    </nav>
  )
}
