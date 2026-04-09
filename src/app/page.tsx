'use client'
import { useState, useEffect, useRef } from 'react'
import { snippetApi } from '@/lib/snippetApi'
import SnippetCard from '@/components/snippet/SnippetCard'
import Link from 'next/link'
import { PixelTrail } from "@/components/ui/pixel-trail"
import { GooeyFilter } from "@/components/ui/gooey-filter"
import { useScreenSize } from "@/hooks/use-screen-size"
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuthStore } from '@/store/authStore'

const LANGUAGES = ['js', 'ts', 'py', 'go', 'rs', 'java', 'cpp', 'bash', 'sql', 'php', 'rb', 'other']
const LANG_LABELS: Record<string, string> = {
  js:'JS', ts:'TS', py:'Python', go:'Go', rs:'Rust', java:'Java',
  cpp:'C++', bash:'Bash', sql:'SQL', php:'PHP', rb:'Ruby', other:'Other'
}

export default function HomePage() {
  const screenSize = useScreenSize()
  const { isAuthenticated } = useAuthStore()
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'top' | 'newest'>('top')
  const [lang, setLang] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Hero intro animation
    gsap.from('.hero-element', {
      y: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: 'power3.out',
    })
  }, { scope: heroRef })

  useGSAP(() => {
    // Stagger snippet cards when they load
    if (!loading && snippets.length > 0 && gridRef.current) {
      gsap.fromTo(gsap.utils.toArray('.snippet-gsap-card'),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'all'
        }
      )
    }
  }, [loading, snippets])

  useEffect(() => {
    setLoading(true)
    snippetApi.getPublicFeed({ sort, lang: lang || undefined, page, limit: 12 })
      .then(res => {
        setSnippets(res.data.data.snippets)
        setTotalPages(res.data.data.totalPages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sort, lang, page])

  return (
    <div className="page-container">
      {/* Hero */}
      <div ref={heroRef} style={{
        textAlign: 'center',
        padding: '64px 24px 60px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'radial-gradient(ellipse at top, rgba(219, 144, 255, 0.05) 0%, transparent 70%)'
      }}>
        <GooeyFilter id="gooey-filter-pixel-trail" strength={5} />
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ filter: "url(#gooey-filter-pixel-trail)", opacity: 0.3 }}
        >
          <PixelTrail
            pixelSize={screenSize?.lessThan("md") ? 24 : 32}
            fadeDuration={0}
            delay={500}
            pixelClassName="bg-purple-500 rounded-full"
          />
        </div>
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-element" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            boxShadow: '0 0 20px var(--primary-glow)',
            borderRadius: '99px',
            padding: '6px 16px',
            fontSize: '12px',
            color: 'var(--primary)',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            ⚡ Connection Established
          </div>
          <h1 className="hero-element" style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: '20px',
            color: 'var(--text-primary)',
            textShadow: '0 0 30px rgba(219, 144, 255, 0.3)'
          }}>
            The Digital <span style={{ color: 'var(--secondary)', textShadow: '0 0 20px var(--secondary-glow)' }}>Curator</span>
          </h1>
          <p className="hero-element" style={{ 
            fontSize: '18px', 
            color: 'var(--text-secondary)', 
            maxWidth: '560px', 
            margin: '0 auto 36px',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.6
          }}>
            Browse elite community-voted snippets, deploy your own, and interface with top-tier developer collectives.
          </p>
          <div className="hero-element" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/snippets/create" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>
              Deploy Snippet
            </Link>
            {isAuthenticated ? (
              <a href="#discover" className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: '15px' }}>
                ⚡ Discover All
              </a>
            ) : (
              <Link href="/register" className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: '15px' }}>
                Initialize Uplink →
              </Link>
            )}
          </div>
        </div>
      </div>

    {/* Filters */}
      <div id="discover" className="filter-bar">
        <button
          suppressHydrationWarning
          className={`filter-chip ${sort === 'top' ? 'active' : ''}`}
          onClick={() => { setSort('top'); setPage(1) }}
        >🔥 Top Voted</button>
        <button
          suppressHydrationWarning
          className={`filter-chip ${sort === 'newest' ? 'active' : ''}`}
          onClick={() => { setSort('newest'); setPage(1) }}
        >🕐 Newest</button>
        <div className="divider" style={{ width: '1px', height: '24px', margin: '0 8px', display: 'inline-block' }} />
        <button
          suppressHydrationWarning
          className={`filter-chip ${!lang ? 'active' : ''}`}
          onClick={() => { setLang(''); setPage(1) }}
        >All Languages</button>
        {LANGUAGES.map(l => (
          <button
            suppressHydrationWarning
            key={l}
            className={`filter-chip ${lang === l ? 'active' : ''}`}
            onClick={() => { setLang(l); setPage(1) }}
          >{LANG_LABELS[l]}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="snippet-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '240px' }}>
              <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: '80px', marginBottom: '16px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '14px', width: '40%' }} />
            </div>
          ))}
        </div>
      ) : snippets.length > 0 ? (
        <div className="snippet-grid" ref={gridRef}>
          {snippets.map(s => (
            <div key={s._id} className="snippet-gsap-card">
              <SnippetCard snippet={s} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state fade-in">
          <div className="icon">📭</div>
          <h3 style={{ marginBottom: '12px', fontFamily: 'var(--font-space)', fontSize: '24px' }}>Sensors indicate no data</h3>
          <p style={{ fontFamily: 'var(--font-mono)' }}>Awaiting your first transmission.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '60px', flexWrap: 'wrap' }}>
          <button
            suppressHydrationWarning
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              suppressHydrationWarning
              key={p}
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
          <button
            suppressHydrationWarning
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next →</button>
        </div>
      )}
    </div>
  )
}
