'use client'
import Link from 'next/link'

const FOOTER_LINKS = {
  Product: [
    { label: 'Discover',      href: '/discover' },
    { label: 'New Snippet',   href: '/snippets/create' },
    { label: 'My Dashboard',  href: '/dashboard' },
    { label: 'Groups',        href: '/groups' },
  ],
  Account: [
    { label: 'Register',        href: '/register' },
    { label: 'Login',           href: '/login' },
    { label: 'Forgot Password', href: '/forgot-password' },
  ],
  Explore: [
    { label: 'JavaScript',  href: '/discover?lang=js' },
    { label: 'TypeScript',  href: '/discover?lang=ts' },
    { label: 'Python',      href: '/discover?lang=py' },
    { label: 'Go',          href: '/discover?lang=go' },
    { label: 'Rust',        href: '/discover?lang=rs' },
    { label: 'SQL',         href: '/discover?lang=sql' },
  ],
}

const SOCIAL = [
  { label: 'GitHub',   href: 'https://github.com', icon: '🐙' },
  { label: 'Twitter',  href: 'https://twitter.com', icon: '🐦' },
  { label: 'Discord',  href: 'https://discord.com', icon: '💬' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'linear-gradient(180deg, transparent 0%, rgba(9,19,39,0.8) 100%)',
      marginTop: 'auto',
    }}>
      {/* ── Main grid ────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '64px 24px 40px',
        display: 'grid',
        gridTemplateColumns: '2fr repeat(3, 1fr)',
        gap: '48px',
      }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{
              fontSize: '22px', fontWeight: 900, fontFamily: 'var(--font-space)',
              background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
            }}>
              ⚡ CodeClan
            </span>
          </Link>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.8,
            fontFamily: 'var(--font-mono)', maxWidth: '240px', marginBottom: '28px',
          }}>
            The open-source developer hub for sharing, discovering, and collaborating on elite code snippets.
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {SOCIAL.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                data-tooltip={s.label}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,227,253,0.35)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(0,227,253,0.08)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = ''
                  ;(e.currentTarget as HTMLElement).style.background = ''
                  ;(e.currentTarget as HTMLElement).style.transform = ''
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section}>
            <h4 style={{
              fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              {section}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {links.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      color: 'var(--text-secondary)', fontSize: '13px',
                      fontFamily: 'var(--font-mono)', textDecoration: 'none',
                      transition: 'color 0.18s ease',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          © {year} CodeClan. Built with ⚡ by the community.
        </span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--success)', boxShadow: '0 0 6px var(--success)',
              display: 'inline-block', animation: 'pulse 2s ease infinite',
            }} />
            All systems operational
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            v1.0.0-beta
          </span>
        </div>
      </div>

      {/* ── Responsive grid collapse ─────────────────────────────── */}
      <style>{`
        .footer-grid {
          grid-template-columns: 2fr repeat(3, 1fr);
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
