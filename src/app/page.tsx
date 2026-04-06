'use client'
import { useState, useEffect } from 'react'
import { snippetApi } from '@/lib/snippetApi'
import SnippetCard from '@/components/snippet/SnippetCard'
import Link from 'next/link'

const LANGUAGES = ['js', 'ts', 'py', 'go', 'rs', 'java', 'cpp', 'bash', 'sql', 'php', 'rb', 'other']
const LANG_LABELS: Record<string, string> = {
  js:'JS', ts:'TS', py:'Python', go:'Go', rs:'Rust', java:'Java',
  cpp:'C++', bash:'Bash', sql:'SQL', php:'PHP', rb:'Ruby', other:'Other'
}

export default function HomePage() {
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'top' | 'newest'>('top')
  const [lang, setLang] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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
      <div style={{
        textAlign: 'center',
        padding: '48px 24px 40px',
        marginBottom: '8px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '99px',
          padding: '6px 16px',
          fontSize: '12px',
          color: '#a78bfa',
          fontWeight: 600,
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          ⚡ Code Snippet Community
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #f1f0ff 0%, #7c3aed 50%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Discover & Share<br />Code Snippets
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 28px' }}>
          Browse community-voted snippets, share your own, and collaborate in groups.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/snippets/create" className="btn btn-primary">
            ✨ Share a Snippet
          </Link>
          <Link href="/register" className="btn btn-ghost">
            Join the Community →
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <button
          className={`filter-chip ${sort === 'top' ? 'active' : ''}`}
          onClick={() => { setSort('top'); setPage(1) }}
        >🔥 Top Voted</button>
        <button
          className={`filter-chip ${sort === 'newest' ? 'active' : ''}`}
          onClick={() => { setSort('newest'); setPage(1) }}
        >🕐 Newest</button>
        <div className="divider" style={{ width: '1px', height: '20px', margin: '0 4px' }} />
        <button
          className={`filter-chip ${!lang ? 'active' : ''}`}
          onClick={() => { setLang(''); setPage(1) }}
        >All Languages</button>
        {LANGUAGES.map(l => (
          <button
            key={l}
            className={`filter-chip ${lang === l ? 'active' : ''}`}
            onClick={() => { setLang(l); setPage(1) }}
          >{LANG_LABELS[l]}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="snippet-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '220px' }}>
              <div className="skeleton" style={{ height: '18px', width: '70%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: '12px', width: '90%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '60px', marginBottom: '8px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '12px', width: '40%' }} />
            </div>
          ))}
        </div>
      ) : snippets.length > 0 ? (
        <div className="snippet-grid">
          {snippets.map(s => <SnippetCard key={s._id} snippet={s} />)}
        </div>
      ) : (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3 style={{ marginBottom: '8px' }}>No snippets yet</h3>
          <p>Be the first to share a snippet!</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next →</button>
        </div>
      )}
    </div>
  )
}
