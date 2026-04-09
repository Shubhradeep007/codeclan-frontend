'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { snippetApi } from '@/lib/snippetApi'
import { authApi } from '@/lib/authApi'
import SnippetCard from '@/components/snippet/SnippetCard'
import toast from 'react-hot-toast'
import FollowListModal from '@/components/follow/FollowListModal'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, _hasHydrated } = useAuthStore()
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ user_name: '', user_about: '' })
  const [editImage, setEditImage] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [myStats, setMyStats] = useState<any>(null)
  const [followModal, setFollowModal] = useState<{ type: 'followers' | 'following' } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) { router.push('/login'); return }
    if (user) {
      setEditForm({ user_name: user.user_name || '', user_about: user.user_about || '' })
    }
  }, [_hasHydrated, isAuthenticated, user])

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return
    setLoading(true)
    snippetApi.getMySnippets({ page, limit: 12 })
      .then(res => {
        const data = res.data.data
        setSnippets(data.snippets)
        setTotalPages(data.totalPages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, isAuthenticated])

  // Dedicated stats endpoint — single source of truth for all counts
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return
    authApi.getMyStats()
      .then(res => setMyStats(res.data.data))
      .catch(err => console.error('[Stats]', err?.response?.data || err.message))
  }, [_hasHydrated, isAuthenticated])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this snippet?')) return
    const isPublic = snippets.find(s => s._id === id)?.visibility === 'public'
    try {
      await snippetApi.delete(id)
      setSnippets(prev => prev.filter(s => s._id !== id))
      if (isPublic) {
         setProfileStats((prev: any) => prev ? { ...prev, publicSnippetCount: Math.max(0, prev.publicSnippetCount - 1) } : prev)
      }
      toast.success('Snippet deleted')
    } catch {
      toast.error('Failed to delete snippet')
    }
  }

  const handleToggleVisibility = async (id: string) => {
    try {
      const oldSnippet = snippets.find(s => s._id === id)
      const res = await snippetApi.toggleVisibility(id)
      const newVisibility = res.data.data.visibility
      
      setSnippets(prev => prev.map(s => s._id === id ? { ...s, visibility: newVisibility } : s))
      
      if (oldSnippet?.visibility === 'public' && newVisibility === 'private') {
        setProfileStats((prev: any) => prev ? { ...prev, publicSnippetCount: Math.max(0, prev.publicSnippetCount - 1) } : prev)
      } else if (oldSnippet?.visibility === 'private' && newVisibility === 'public') {
        setProfileStats((prev: any) => prev ? { ...prev, publicSnippetCount: prev.publicSnippetCount + 1 } : prev)
      }
      
      toast.success(`Now ${newVisibility}`)
    } catch {
      toast.error('Failed to update visibility')
    }
  }

  const handlePublish = async (id: string) => {
    if (!confirm('Publish this snippet to the public feed? This cannot be undone.')) return
    try {
      await snippetApi.publish(id)
      setSnippets(prev => prev.map(s => s._id === id ? { ...s, visibility: 'public' } : s))
      setProfileStats((prev: any) => prev ? { ...prev, publicSnippetCount: prev.publicSnippetCount + 1 } : prev)
      toast.success('Published to public feed! 🎉')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish')
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      const res = await authApi.updateProfile(user.id, {
        user_name: editForm.user_name,
        user_about: editForm.user_about,
        user_profile_image: editImage || undefined,
      })
      updateUser(res.data.data)
      toast.success('Profile updated!')
      setShowEditModal(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!_hasHydrated || !isAuthenticated) return null

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,211,238,0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <img
            src={user?.user_profile_image?.startsWith('http')
              ? user.user_profile_image
              : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.user_name}&backgroundColor=7c3aed`}
            alt={user?.user_name}
            className="avatar"
            style={{ width: 72, height: 72 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800 }}>{user?.user_name}</h1>
              {user?.role === 'admin' && <span className="badge badge-admin">Admin</span>}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>{user?.user_email}</p>
            {user?.user_about && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user.user_about}</p>}
            
            {myStats && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--primary)' }}>{myStats.publicSnippets ?? 0}</strong> Public Snippets</span>
                <span style={{ color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--primary)' }}>{myStats.totalSnippets ?? 0}</strong> Total Snippets</span>
                <button
                  onClick={() => setFollowModal({ type: 'followers' })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px', padding: 0 }}
                >
                  <strong style={{ color: 'var(--primary)' }}>{myStats.followerCount ?? 0}</strong> Followers
                </button>
                <button
                  onClick={() => setFollowModal({ type: 'following' })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px', padding: 0 }}
                >
                  <strong style={{ color: 'var(--primary)' }}>{myStats.followingCount ?? 0}</strong> Following
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(true)}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* My Snippets */}
      <div className="page-header">
        <h2 className="page-title" style={{ fontSize: '20px' }}>My Snippets</h2>
        <a href="/snippets/create" className="btn btn-primary btn-sm">✨ New Snippet</a>
      </div>

      {loading ? (
        <div className="snippet-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '200px' }}>
              <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '80px', marginBottom: '8px', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      ) : snippets.length > 0 ? (
        <>
          <div className="snippet-grid">
            {snippets.map(s => (
              <div key={s._id} style={{ position: 'relative' }}>
                <SnippetCard snippet={s} />
                {/* Action Overlay */}
                <div style={{
                  position: 'absolute', bottom: 8, right: 8,
                  display: 'flex', gap: '4px',
                }}>
                  <span className={`badge badge-${s.visibility}`}>{s.visibility}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.preventDefault(); router.push(`/snippets/${s._id}/edit`) }}
                    title="Edit"
                  >✏️</button>
                  {s.visibility !== 'public' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={(e) => { e.preventDefault(); handlePublish(s._id) }}
                      title="Publish to feed"
                    >📢</button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.preventDefault(); handleToggleVisibility(s._id) }}
                    title="Toggle visibility"
                  >👁</button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => { e.preventDefault(); handleDelete(s._id) }}
                    title="Delete"
                  >🗑</button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} / {totalPages}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next →</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="icon">📝</div>
          <h3 style={{ marginBottom: '8px' }}>No snippets yet</h3>
          <p style={{ marginBottom: '16px' }}>Share your first code snippet!</p>
          <a href="/snippets/create" className="btn btn-primary">✨ Create Snippet</a>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Edit Profile</h2>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  border: '2px dashed var(--border)', background: 'var(--bg-elevated)',
                  cursor: 'pointer', overflow: 'hidden',
                }}
              >
                <img
                  src={editPreview || (user?.user_profile_image?.startsWith('http') ? user.user_profile_image : `https://api.dicebear.com/8.x/initials/svg?seed=${user?.user_name}`)}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setEditImage(f); setEditPreview(URL.createObjectURL(f)) }
                }}
              />
            </div>

            <div className="form-group">
              <label className="label">Username</label>
              <input className="input" value={editForm.user_name} onChange={e => setEditForm(f => ({ ...f, user_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">About</label>
              <textarea className="input" value={editForm.user_about} onChange={e => setEditForm(f => ({ ...f, user_about: e.target.value }))} rows={3} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                {saving ? '⏳ Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {followModal && user?.id && (
        <FollowListModal
          userId={user.id}
          type={followModal.type}
          count={followModal.type === 'followers' ? (myStats?.followerCount ?? 0) : (myStats?.followingCount ?? 0)}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  )
}
