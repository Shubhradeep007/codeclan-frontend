'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

const navLinks = [
  { href: '/',           label: 'Public Feed',  icon: '🌐' },
  { href: '/search',     label: 'Search',       icon: '🔍' },
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link href="/" className="navbar-brand" style={{ marginRight: '16px' }}>
        ⚡ CodeClan
      </Link>

      {/* Search */}
      <form className="search-bar" onSubmit={handleSearch}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search snippets..."
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
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === link.href ? 'var(--primary)' : 'var(--text-secondary)',
              background: pathname === link.href ? 'rgba(124,58,237,0.12)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{link.icon}</span>
            <span style={{ display: 'none' }} className="md-show">{link.label}</span>
          </Link>
        ))}

        {/* Admin */}
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === '/admin' ? 'var(--danger)' : 'var(--text-muted)',
              background: pathname === '/admin' ? 'rgba(239,68,68,0.12)' : 'transparent',
              textDecoration: 'none',
            }}
          >
            🛡️
          </Link>
        )}
      </div>

      {/* Auth Section */}
      {isAuthenticated ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 4px',
              borderRadius: '99px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <img
              src={user?.user_profile_image?.startsWith('http') ? user.user_profile_image : '/default-avatar.png'}
              alt={user?.user_name}
              className="avatar"
              style={{ width: 28, height: 28 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/8.x/initials/svg?seed=${user?.user_name}`
              }}
            />
            {user?.user_name}
            <span style={{ color: 'var(--text-muted)' }}>▾</span>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '180px',
                zIndex: 300,
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                style={{ display: 'block', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}
              >
                📋 My Dashboard
              </Link>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
              <button
                onClick={() => { logout(); setDropdownOpen(false); router.push('/') }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: 'var(--danger)',
                  fontSize: '14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🚪 Log Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
          <Link href="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      )}
    </nav>
  )
}
