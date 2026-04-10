'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { snippetApi } from '@/lib/snippetApi'
import SnippetCard from '@/components/snippet/SnippetCard'
import toast from 'react-hot-toast'

const LANGUAGES = [
  { value: '', label: 'All Languages' },
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rs', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'php', label: 'PHP' },
  { value: 'rb', label: 'Ruby' },
  { value: 'other', label: 'Other' },
]

const SORT_OPTIONS = [
  { value: 'top', label: '🔥 Top Rated' },
  { value: 'newest', label: '🆕 Newest' },
]

const LIMIT = 12

export default function DiscoverPage() {
  const router = useRouter()
  const [snippets, setSnippets] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [sort, setSort] = useState<'top' | 'newest'>('newest')
  const [lang, setLang] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  // Refs
  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isFetchingRef = useRef(false)

  // ──────────────────────────────────────────────────────
  // Reset & re-fetch whenever filters change
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    setSnippets([])
    setPage(1)
    setHasMore(true)
    setInitialLoading(true)
  }, [sort, lang, searchQ])

  // ──────────────────────────────────────────────────────
  // Fetch one page of results
  // ──────────────────────────────────────────────────────
  const fetchPage = useCallback(async (pageNum: number) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setLoading(true)

    try {
      let res: any
      if (searchQ.trim()) {
        res = await snippetApi.search(searchQ, { page: pageNum, limit: LIMIT, lang: lang || undefined })
      } else {
        res = await snippetApi.getPublicFeed({ page: pageNum, limit: LIMIT, sort, lang: lang || undefined })
      }

      const { snippets: newSnippets, total, totalPages } = res.data.data
      setTotalCount(total)
      setSnippets(prev => pageNum === 1 ? newSnippets : [...prev, ...newSnippets])
      setHasMore(pageNum < totalPages)
    } catch {
      toast.error('Failed to load snippets')
    } finally {
      setLoading(false)
      setInitialLoading(false)
      isFetchingRef.current = false
    }
  }, [sort, lang, searchQ])

  // Run on page change
  useEffect(() => {
    fetchPage(page)
  }, [page, fetchPage])

  // ──────────────────────────────────────────────────────
  // Intersection Observer for infinite scroll
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
        setPage(prev => prev + 1)
      }
    }, { threshold: 0.1 })

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [hasMore, snippets])

  // ──────────────────────────────────────────────────────
  // Search box with debounce
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearchQ(inputVal), 450)
    return () => clearTimeout(t)
  }, [inputVal])

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,227,253,0.08) 0%, rgba(124,58,237,0.12) 50%, rgba(0,227,253,0.06) 100%)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '40px 32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,227,253,0.12), transparent 70%)',
          top: '-80px', right: '-80px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)',
          bottom: '-60px', left: '-40px', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px' }}>⚡</span>
            <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
              Discover Code
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: '0 0 24px', maxWidth: '560px' }}>
            Explore public snippets from the CodeClan community. Filter by language, search by keyword, and get inspired.
          </p>

          {/* Stats pill */}
          {totalCount > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,227,253,0.1)', border: '1px solid rgba(0,227,253,0.25)',
              borderRadius: '999px', padding: '6px 16px', fontSize: '13px', fontFamily: 'var(--font-mono)',
              color: 'var(--secondary)',
            }}>
              📦 {totalCount.toLocaleString()} public snippets
            </div>
          )}
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
        marginBottom: '28px',
        background: 'rgba(14,23,42,0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '14px 18px',
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: '16px', pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search snippets by title, tag..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            className="input"
            style={{ paddingLeft: '36px', paddingRight: '12px', width: '100%' }}
          />
        </div>

        {/* Language filter */}
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="input"
          data-tooltip="Filter by language"
          style={{ flex: '0 1 170px', minWidth: '140px' }}
        >
          {LANGUAGES.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        {/* Sort */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value as 'top' | 'newest')}
              data-tooltip={opt.value === 'top' ? 'Sort by highest votes' : 'Sort by most recent'}
              className={`btn btn-sm ${sort === opt.value ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                transition: 'all 0.2s',
                ...(sort === opt.value ? { boxShadow: '0 0 14px rgba(0,227,253,0.25)' } : {}),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Clear search */}
        {(inputVal || lang) && (
          <button
            onClick={() => { setInputVal(''); setLang(''); }}
            data-tooltip="Clear all filters"
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--text-muted)', fontSize: '12px' }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Language Pills (quick filter) ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {LANGUAGES.filter(l => l.value).map(l => (
          <button
            key={l.value}
            onClick={() => setLang(prev => prev === l.value ? '' : l.value)}
            data-tooltip={lang === l.value ? `Remove ${l.label} filter` : `Filter by ${l.label}`}
            style={{
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${lang === l.value ? 'var(--primary)' : 'var(--border-subtle)'}`,
              background: lang === l.value ? 'rgba(0,227,253,0.12)' : 'rgba(255,255,255,0.03)',
              color: lang === l.value ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.18s ease',
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* ── Initial Loading Skeleton ── */}
      {initialLoading && (
        <div className="snippet-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '16px' }} />
          ))}
        </div>
      )}

      {/* ── Snippet Grid ── */}
      {!initialLoading && snippets.length > 0 && (
        <div className="snippet-grid" style={{ animationFillMode: 'both' }}>
          {snippets.map((s, idx) => (
            <div
              key={s._id}
              style={{
                animation: `fadeIn 0.4s ease ${Math.min(idx % LIMIT, 8) * 0.05}s both`,
              }}
            >
              <SnippetCard snippet={s} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!initialLoading && snippets.length === 0 && (
        <div className="empty-state card" style={{ padding: '80px 24px' }}>
          <div className="icon" style={{ fontSize: '48px' }}>🔭</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No snippets found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            {searchQ ? `No results for "${searchQ}"` : 'Be the first to share a public snippet!'}
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/snippets/create')}>
            ✨ Create a Snippet
          </button>
        </div>
      )}

      {/* ── Infinite Scroll Sentinel ── */}
      <div ref={sentinelRef} style={{ height: '1px' }} />

      {/* ── Loading More Spinner ── */}
      {loading && !initialLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', gap: '12px', alignItems: 'center' }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: '2px solid var(--border)', borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            Loading more snippets...
          </span>
        </div>
      )}

      {/* ── End of Feed ── */}
      {!hasMore && snippets.length > 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 0 24px',
          color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
            borderRadius: '999px', padding: '10px 24px',
          }}>
            <span>🎉</span>
            <span>You&apos;ve seen all {totalCount.toLocaleString()} snippets!</span>
          </div>
        </div>
      )}

      {/* ── Spin Keyframe (add to globals if not present) ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
