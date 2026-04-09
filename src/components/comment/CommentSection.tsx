'use client'
import { useState, useEffect } from 'react'
import { commentApi } from '@/lib/commentApi'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Comment {
  _id: string
  comment_body: string
  is_deleted?: boolean
  author_id: { _id: string; user_name: string; user_profile_image?: string }
  createdAt: string
}

export default function CommentSection({ snippetId }: { snippetId: string }) {
  const { user, isAuthenticated } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    commentApi.getBySnippet(snippetId)
      .then(res => setComments(res.data.data?.comments || []))
      .catch(() => {})
  }, [snippetId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      const res = await commentApi.add(snippetId, content.trim())
      setComments(prev => [res.data.data, ...prev])
      setContent('')
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (id: string) => {
    try {
      const res = await commentApi.update(id, editContent)
      setComments(prev => prev.map(c => c._id === id ? res.data.data : c))
      setEditingId(null)
      toast.success('Comment updated')
    } catch {
      toast.error('Failed to update comment')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return
    try {
      await commentApi.delete(id)
      setComments(prev => prev.filter(c => c._id !== id))
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
        💬 Comments ({comments.length})
      </h3>

      {/* Add Comment */}
      {isAuthenticated ? (
        <form onSubmit={handleAdd} style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
          <textarea
            className="input"
            placeholder="Write a comment…"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-end', flexShrink: 0 }}>
            {loading ? '…' : 'Post'}
          </button>
        </form>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          <a href="/login" style={{ color: 'var(--primary)' }}>Log in</a> to comment.
        </p>
      )}

      {/* Comment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {comments.map(c => (
          <div key={c._id} className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Link href={`/user/${c.author_id.user_name}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <img
                  src={c.author_id.user_profile_image?.startsWith('http')
                    ? c.author_id.user_profile_image
                    : `https://api.dicebear.com/8.x/initials/svg?seed=${c.author_id.user_name}`}
                  alt={c.author_id.user_name}
                  className="avatar"
                  style={{ width: 28, height: 28, transition: '0.2s', border: '1px solid transparent' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                />
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-space)' }}>{c.author_id.user_name}</span>
              </Link>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
              </span>
              {(user?.id === c.author_id._id || user?.role === 'admin') && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setEditingId(c._id); setEditContent(c.comment_body) }}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                  >✏️</button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(c._id)}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                  >🗑</button>
                </div>
              )}
            </div>

            {editingId === c._id ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea
                  className="input"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={2}
                  style={{ resize: 'none', fontSize: '13px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleEdit(c._id)}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.comment_body}</p>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="empty-state" style={{ padding: '32px' }}>
            <div className="icon">💬</div>
            <p>No comments yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  )
}
