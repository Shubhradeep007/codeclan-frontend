'use client'
import { useState, useEffect, useRef } from 'react'
import { snippetApi } from '@/lib/snippetApi'
import SnippetCard from '@/components/snippet/SnippetCard'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuthStore } from '@/store/authStore'

// ── Types ──────────────────────────────────────────────────────────────────
const LANG_SHOWCASE = [
  { key: 'js',   label: 'JavaScript', color: '#f7df1e', icon: 'JS' },
  { key: 'ts',   label: 'TypeScript', color: '#3178c6', icon: 'TS' },
  { key: 'py',   label: 'Python',     color: '#3572A5', icon: 'Py' },
  { key: 'go',   label: 'Go',         color: '#00ADD8', icon: 'Go' },
  { key: 'rs',   label: 'Rust',       color: '#dea584', icon: 'Rs' },
  { key: 'java', label: 'Java',       color: '#b07219', icon: 'Jv' },
  { key: 'cpp',  label: 'C++',        color: '#f34b7d', icon: '++' },
  { key: 'sql',  label: 'SQL',        color: '#e38c00', icon: 'SQL'},
  { key: 'bash', label: 'Bash',       color: '#89e051', icon: '$_' },
  { key: 'rb',   label: 'Ruby',       color: '#701516', icon: 'Rb' },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Deployment',
    desc: 'Publish your code snippets in seconds. Private, public, or scoped to a group — full visibility control.'
  },
  {
    icon: '🔭',
    title: 'Discover & Explore',
    desc: 'Browse 100s of community snippets. Filter by language, sort by votes or newest, full-text search.'
  },
  {
    icon: '👥',
    title: 'Dev Collectives',
    desc: 'Create or join Groups. Share code privately within your team with role-based access control.'
  },
  {
    icon: '🗳️',
    title: 'Community Voting',
    desc: 'Upvote what helps you. Downvote noise. Surfacing the best patterns the community has to offer.'
  },
  {
    icon: '🔒',
    title: 'Access Control',
    desc: 'Fine-grained permissions per group. Owners, moderators, members, and viewers — all built in.'
  },
  {
    icon: '🎨',
    title: 'Syntax Highlighting',
    desc: 'Monaco Editor-powered code blocks with full language support and a beautiful dark terminal feel.'
  },
]

const STEPS = [
  { num: '01', title: 'Sign Up', desc: 'Create your free account in under 30 seconds.' },
  { num: '02', title: 'Paste Your Code', desc: 'Use the Monaco editor — write or paste your snippet.' },
  { num: '03', title: 'Set Visibility', desc: 'Public for the world, private for you, or group-scoped.' },
  { num: '04', title: 'Share & Discover', desc: 'Get votes, get followers, explore what others built.' },
]

// ── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const step = target / 60
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLang, setActiveLang] = useState('')

  const heroRef  = useRef<HTMLDivElement>(null)
  const gridRef  = useRef<HTMLDivElement>(null)

  // ── GSAP hero entrance ─────────────────────────────────────────────────
  useGSAP(() => {
    gsap.from('.hp-hero-el', {
      y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out'
    })
    // Floating orb animation
    gsap.to('.hp-orb', {
      y: -20, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 1.5
    })
  }, { scope: heroRef })

  // ── Snippet grid entrance ──────────────────────────────────────────────
  useGSAP(() => {
    if (!loading && snippets.length > 0 && gridRef.current) {
      gsap.fromTo('.hp-snippet-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power2.out', clearProps: 'all' }
      )
    }
  }, [loading, snippets])

  // ── Fetch top snippets ─────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    snippetApi.getPublicFeed({ sort: 'top', limit: 6, lang: activeLang || undefined })
      .then(res => setSnippets(res.data.data.snippets || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeLang])

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px 60px',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(0,227,253,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,227,253,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
        }} />

        {/* Floating orbs */}
        <div className="hp-orb" style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(219,144,255,0.10) 0%, transparent 65%)',
          top: '-100px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
        }} />
        <div className="hp-orb" style={{
          position: 'absolute', width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,227,253,0.08) 0%, transparent 65%)',
          bottom: '0px', right: '-80px', pointerEvents: 'none',
        }} />
        <div className="hp-orb" style={{
          position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 65%)',
          top: '20%', left: '-80px', pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          {/* Status badge */}
          <div className="hp-hero-el" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,227,253,0.06)', border: '1px solid rgba(0,227,253,0.25)',
            borderRadius: '999px', padding: '6px 18px', marginBottom: '32px',
            fontSize: '12px', fontFamily: 'var(--font-mono)',
            color: 'var(--secondary)', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 8px var(--secondary)', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
            Connection Established — Beta v1.0
          </div>

          {/* Headline */}
          <h1 className="hp-hero-el" style={{
            fontSize: 'clamp(40px, 7vw, 76px)',
            fontWeight: 900,
            lineHeight: 1.03,
            letterSpacing: '-0.04em',
            marginBottom: '24px',
            color: 'var(--text-primary)',
          }}>
            Where Developers<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(0,227,253,0.3))',
            }}>
              Share Code
            </span>{' '}with the World
          </h1>

          {/* Subtitle */}
          <p className="hp-hero-el" style={{
            fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: '560px', margin: '0 auto 40px', fontFamily: 'var(--font-mono)',
          }}>
            CodeClan is your open-source command center for storing,
            sharing, and discovering elite code snippets across every language.
          </p>

          {/* CTA Buttons */}
          <div className="hp-hero-el" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <>
                <Link href="/snippets/create" className="btn btn-primary" style={{
                  padding: '14px 32px', fontSize: '15px', fontFamily: 'var(--font-mono)',
                  boxShadow: '0 0 24px rgba(0,227,253,0.3)', fontWeight: 700,
                }}>
                  ✨ New Snippet
                </Link>
                <Link href="/discover" className="btn btn-ghost" style={{
                  padding: '14px 32px', fontSize: '15px', fontFamily: 'var(--font-mono)',
                }}>
                  🔭 Explore All
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{
                  padding: '14px 32px', fontSize: '15px', fontFamily: 'var(--font-mono)',
                  boxShadow: '0 0 24px rgba(0,227,253,0.3)', fontWeight: 700,
                }}>
                  🚀 Get Started Free
                </Link>
                <Link href="/discover" className="btn btn-ghost" style={{
                  padding: '14px 32px', fontSize: '15px', fontFamily: 'var(--font-mono)',
                }}>
                  🔭 Browse Snippets
                </Link>
              </>
            )}
          </div>

          {/* Social proof */}
          <div className="hp-hero-el" style={{
            marginTop: '52px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {[
              { icon: '📦', value: 99, suffix: '+', label: 'Public Snippets' },
              { icon: '🌐', value: 10, suffix: '+', label: 'Languages' },
              { icon: '👥', value: 1, suffix: '', label: 'Dev Groups' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-space)', color: 'var(--text-primary)' }}>
                  {stat.icon} <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll arrow */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          color: 'var(--text-muted)', fontSize: '20px', animation: 'bounce 2s ease infinite',
        }}>↓</div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          LANGUAGE SHOWCASE
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '16px 0 48px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, transparent, rgba(9,19,39,0.6))',
        overflow: 'hidden',
      }}>
        {/* Scrolling marquee */}
        <div style={{ display: 'flex', gap: '0', animation: 'marquee 28s linear infinite', width: 'max-content' }}>
          {[...LANG_SHOWCASE, ...LANG_SHOWCASE].map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 28px', borderRight: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: `${l.color}22`, border: `1px solid ${l.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800,
                color: l.color,
              }}>{l.icon}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{
            display: 'inline-block', fontSize: '11px', fontFamily: 'var(--font-mono)',
            color: 'var(--secondary)', letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '16px', background: 'rgba(0,227,253,0.08)', padding: '4px 14px',
            borderRadius: '999px', border: '1px solid rgba(0,227,253,0.2)',
          }}>Core Features</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Everything a dev needs
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontFamily: 'var(--font-mono)', maxWidth: '500px', margin: '0 auto' }}>
            Built for developers who value clean code, fast discovery, and community collaboration.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{
              padding: '32px 28px',
              transition: 'all 0.3s ease',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,227,253,0.3)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px -10px rgba(0,227,253,0.15)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = ''
                ;(e.currentTarget as HTMLElement).style.transform = ''
                ;(e.currentTarget as HTMLElement).style.boxShadow = ''
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(0,227,253,0.08)', border: '1px solid rgba(0,227,253,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', marginBottom: '20px',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, rgba(9,19,39,0.8), var(--bg-base))',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', fontSize: '11px', fontFamily: 'var(--font-mono)',
            color: 'var(--primary)', letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '16px', background: 'rgba(219,144,255,0.08)', padding: '4px 14px',
            borderRadius: '999px', border: '1px solid rgba(219,144,255,0.2)',
          }}>How It Works</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '56px' }}>
            Up and running in 4 steps
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px',
          }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '24px', left: 'calc(50% + 32px)',
                    width: 'calc(100% - 64px)', height: '1px',
                    background: 'linear-gradient(90deg, rgba(0,227,253,0.3), transparent)',
                    display: 'none',  /* shown via CSS on wider screens */
                  }} />
                )}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, rgba(0,227,253,0.15), rgba(219,144,255,0.15))',
                  border: '2px solid rgba(0,227,253,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '14px',
                  color: 'var(--secondary)',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TOP SNIPPETS FEED (filtered by lang)
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span style={{
              display: 'inline-block', fontSize: '11px', fontFamily: 'var(--font-mono)',
              color: 'var(--secondary)', letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '12px', background: 'rgba(0,227,253,0.08)', padding: '4px 14px',
              borderRadius: '999px', border: '1px solid rgba(0,227,253,0.2)',
            }}>Community Feed</span>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              🔥 Top Rated Snippets
            </h2>
          </div>
          <Link href="/discover" className="btn btn-ghost btn-sm" style={{ fontFamily: 'var(--font-mono)' }}>
            View All →
          </Link>
        </div>

        {/* Language filter pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {[{ key: '', label: 'All' }, ...LANG_SHOWCASE].map(l => (
            <button
              key={l.key}
              onClick={() => setActiveLang(l.key)}
              style={{
                padding: '5px 16px', borderRadius: '999px', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                border: `1px solid ${activeLang === l.key ? 'rgba(0,227,253,0.5)' : 'var(--border-subtle)'}`,
                background: activeLang === l.key ? 'rgba(0,227,253,0.1)' : 'rgba(255,255,255,0.02)',
                color: activeLang === l.key ? 'var(--secondary)' : 'var(--text-muted)',
                transition: 'all 0.18s ease',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="snippet-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : snippets.length > 0 ? (
          <div className="snippet-grid" ref={gridRef}>
            {snippets.map(s => (
              <div key={s._id} className="hp-snippet-card">
                <SnippetCard snippet={s} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card" style={{ padding: '60px 24px' }}>
            <div className="icon">📭</div>
            <p>No snippets yet. Be the first to contribute!</p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      {!isAuthenticated && (
        <section style={{
          margin: '0 24px 80px',
          borderRadius: '24px',
          padding: '72px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(0,227,253,0.06) 0%, rgba(124,58,237,0.10) 50%, rgba(219,144,255,0.06) 100%)',
          border: '1px solid rgba(0,227,253,0.15)',
        }}>
          <div style={{
            position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,227,253,0.08), transparent 70%)',
            top: '-100px', right: '-100px', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(219,144,255,0.08), transparent 70%)',
            bottom: '-80px', left: '-80px', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '16px' }}>
              Ready to join CodeClan?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontFamily: 'var(--font-mono)', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
              Free forever. No credit card. Start sharing your best code with the world in minutes.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-primary" style={{
                padding: '14px 36px', fontSize: '16px', fontFamily: 'var(--font-mono)',
                fontWeight: 700, boxShadow: '0 0 28px rgba(0,227,253,0.3)',
              }}>
                🚀 Initialize Uplink
              </Link>
              <Link href="/login" className="btn btn-ghost" style={{
                padding: '14px 36px', fontSize: '16px', fontFamily: 'var(--font-mono)',
              }}>
                Log In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.8); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
