'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { snippetApi } from '@/lib/snippetApi'
import { useAuthStore } from '@/store/authStore'
import VoteButtons from '@/components/snippet/VoteButtons'
import CommentSection from '@/components/comment/CommentSection'
import toast from 'react-hot-toast'

export default function SnippetDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [snippet, setSnippet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copyCodeMode, setCopyCodeMode] = useState(false)

  useEffect(() => {
    snippetApi.getById(id as string)
      .then(res => setSnippet(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Snippet not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Permanently delete this snippet?')) return
    try {
      await snippetApi.delete(id as string)
      toast.success('Snippet deleted')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to delete snippet')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.snippet_code)
    setCopyCodeMode(true)
    setTimeout(() => setCopyCodeMode(false), 2000)
    toast.success('Code copied!')
  }

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '16px' }} />
    </div>
  )

  if (error || !snippet) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="icon">😔</div>
        <h2>{error || 'Snippet not found'}</h2>
        <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginTop: '16px' }}>← Go Back</button>
      </div>
    </div>
  )

  const isOwner = user?.id === snippet.created_by?._id
  const isAdmin = user?.role === 'admin'

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '8px' }}>{snippet.snippet_title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {snippet.created_by && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img
                  src={snippet.created_by.user_profile_image?.startsWith('http')
                    ? snippet.created_by.user_profile_image
                    : `https://api.dicebear.com/8.x/initials/svg?seed=${snippet.created_by.user_name}`}
                  alt={snippet.created_by.user_name}
                  className="avatar"
                  style={{ width: 24, height: 24 }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{snippet.created_by.user_name}</span>
              </div>
            )}
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>👁 {snippet.view_count} views</span>
            <span className={`badge badge-${snippet.visibility}`}>{snippet.visibility}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <VoteButtons snippetId={snippet._id} initialScore={snippet.vote_score} />
          {(isOwner || isAdmin) && (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
              {isOwner && (
                <Link href={`/snippets/${snippet._id}/edit`} className="btn btn-ghost btn-sm">
                  ✏️ Edit
                </Link>
              )}
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                🗑 Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {snippet.snippet_description && (
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          {snippet.snippet_description}
        </p>
      )}

      {snippet.snippet_tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {snippet.snippet_tags.map((tag: string) => (
            <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}>
              <span className="badge badge-tag" style={{ cursor: 'pointer' }}>{tag}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="code-block-wrapper" style={{ marginBottom: '32px' }}>
        <div className="code-block-header">
          <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
            {snippet.snippet_language}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
            onClick={handleCopy}
          >
            {copyCodeMode ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
        <div style={{ padding: '0 0' }}>
          <SyntaxHighlighter
            language={snippet.snippet_language === 'other' ? 'javascript' : snippet.snippet_language}
            style={vscDarkPlus as any}
            customStyle={{ margin: 0, padding: '20px', background: 'transparent', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
            showLineNumbers={true}
          >
            {snippet.snippet_code}
          </SyntaxHighlighter>
        </div>
      </div>

      <div className="divider" />

      <CommentSection snippetId={snippet._id} />
    </div>
  )
}
