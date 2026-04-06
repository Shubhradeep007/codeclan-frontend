'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { snippetApi } from '@/lib/snippetApi'
import SnippetCard from '@/components/snippet/SnippetCard'
import Link from 'next/link'

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const tagParams = searchParams.get('tag')
  
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!q && !tagParams) {
      setSnippets([])
      setLoading(false)
      return
    }

    setLoading(true)
    snippetApi.search(q, { tag: tagParams || undefined, page, limit: 12 })
      .then(res => {
        setSnippets(res.data.data.snippets)
        setTotalPages(res.data.data.totalPages)
      })
      .catch(() => setSnippets([]))
      .finally(() => setLoading(false))
  }, [q, tagParams, page])

  return (
    <div className="page-container">
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1 className="page-title">🔍 Search Results</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {q && <span>Showing results for "<strong style={{ color: 'var(--text-primary)' }}>{q}</strong>" </span>}
          {tagParams && <span>with tag <span className="badge badge-tag">{tagParams}</span></span>}
        </p>
      </div>

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
        <>
          <div className="snippet-grid">
            {snippets.map(s => <SnippetCard key={s._id} snippet={s} />)}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} / {totalPages}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >Next →</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="icon">😵</div>
          <h3 style={{ marginBottom: '8px' }}>No results found</h3>
          <p>Try different keywords or filters.</p>
          <Link href="/" className="btn btn-ghost" style={{ marginTop: '16px' }}>Go back to home</Link>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-container"><div className="skeleton" style={{ height: 400, borderRadius: 16 }}/></div>}>
      <SearchContent />
    </Suspense>
  )
}
