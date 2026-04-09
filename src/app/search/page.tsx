'use client'
import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { snippetApi } from '@/lib/snippetApi'
import { userApi } from '@/lib/userApi'
import SnippetCard from '@/components/snippet/SnippetCard'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

function UserCard({ user }: { user: any }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, { y: -4, scale: 1.02, duration: 0.3, ease: 'power2.out', boxShadow: '0 10px 30px -10px rgba(0, 227, 253, 0.3)' })
  }
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out', boxShadow: '0 10px 20px rgba(6, 14, 32, 0.4)' })
  }

  return (
    <Link href={`/user/${user.user_name}`} style={{ textDecoration: 'none' }}>
      <div 
        ref={cardRef} 
        className="card" 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px', height: '100%', boxShadow: '0 10px 20px rgba(6, 14, 32, 0.4)' }}
      >
        <img
          src={user.user_profile_image?.startsWith('http') ? user.user_profile_image : `https://api.dicebear.com/8.x/initials/svg?seed=${user.user_name}`}
          alt={user.user_name}
          className="avatar"
          style={{ width: 56, height: 56, border: '2px solid var(--primary)' }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-space)' }}>
            {user.user_name}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {user.publicSnippetCount} Public Snippets
          </p>
        </div>
      </div>
    </Link>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const tagParams = searchParams.get('tag')
  
  const [tab, setTab] = useState<'snippets' | 'users'>('snippets')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!loading && items.length > 0 && gridRef.current) {
      gsap.fromTo(gsap.utils.toArray('.gsap-item'),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: 'power2.out', clearProps: 'all' }
      )
    }
  }, [loading, items])

  useEffect(() => {
    if (!q && !tagParams) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    if (tab === 'snippets') {
      snippetApi.search(q, { tag: tagParams || undefined, page, limit: 12 })
        .then(res => {
          setItems(res.data.data.snippets)
          setTotalPages(res.data.data.totalPages)
        })
        .catch(() => setItems([]))
        .finally(() => setLoading(false))
    } else {
      userApi.searchUsers(q, { page, limit: 12 })
        .then(res => {
          setItems(res.data.data.users)
          setTotalPages(res.data.data.totalPages)
        })
        .catch(() => setItems([]))
        .finally(() => setLoading(false))
    }
  }, [q, tagParams, page, tab])

  return (
    <div className="page-container">
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-space)' }}>🔍 Search Results</h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {q && <span>Showing results for "<strong style={{ color: 'var(--primary)' }}>{q}</strong>" </span>}
          {tagParams && <span>with tag <span className="badge badge-tag">{tagParams}</span></span>}
        </p>
      </div>

      {!tagParams && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <button 
            suppressHydrationWarning
            className={`btn btn-sm ${tab === 'snippets' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => { setTab('snippets'); setPage(1) }}
          >
            📋 Snippets
          </button>
          <button 
            suppressHydrationWarning
            className={`btn btn-sm ${tab === 'users' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => { setTab('users'); setPage(1) }}
          >
            👥 Users
          </button>
        </div>
      )}

      {loading ? (
        <div className={tab === 'snippets' ? "snippet-grid" : ""} style={tab === 'users' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' } : {}}>
          {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="card skeleton" style={{ height: tab === 'snippets' ? '220px' : '90px' }} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div ref={gridRef} className={tab === 'snippets' ? "snippet-grid" : ""} style={tab === 'users' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' } : {}}>
            {items.map(item => (
              <div key={item._id || item.user_name} className="gsap-item">
                {tab === 'snippets' ? <SnippetCard snippet={item} /> : <UserCard user={item} />}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
              <button
                suppressHydrationWarning
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} / {totalPages}</span>
              <button
                suppressHydrationWarning
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
          <h3 style={{ marginBottom: '8px', fontFamily: 'var(--font-space)' }}>No {tab} found</h3>
          <p style={{ fontFamily: 'var(--font-mono)' }}>Try different keywords or filters.</p>
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
