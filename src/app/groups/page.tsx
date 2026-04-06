'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { groupApi } from '@/lib/groupApi'
import GroupCard from '@/components/group/GroupCard'
import toast from 'react-hot-toast'

export default function GroupsPage() {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ group_name: '', group_description: '' })
  const [createImage, setCreateImage] = useState<File | null>(null)
  const [createPreview, setCreatePreview] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [showJoinModal, setShowJoinModal] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) { router.push('/login'); return }
    if (_hasHydrated && isAuthenticated) {
      fetchGroups()
    }
  }, [_hasHydrated, isAuthenticated])

  const fetchGroups = () => {
    setLoading(true)
    groupApi.getMyGroups()
      .then(res => setGroups(res.data.data || []))
      .catch(() => toast.error('Failed to load groups'))
      .finally(() => setLoading(false))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.group_name.trim()) return
    setCreating(true)
    try {
      await groupApi.create({ ...createForm, group_avatar: createImage || undefined })
      toast.success('Group created!')
      setShowCreateModal(false)
      fetchGroups()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return
    setJoining(true)
    try {
      await groupApi.joinByInvite(inviteCode.trim())
      toast.success('Successfully joined group!')
      setShowJoinModal(false)
      setInviteCode('')
      fetchGroups()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid invite code or already joined')
    } finally {
      setJoining(false)
    }
  }

  if (!_hasHydrated || !isAuthenticated) return null

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👥 My Groups</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost" onClick={() => setShowJoinModal(true)}>🔗 Join via Code</button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>✨ Create Group</button>
        </div>
      </div>

      {loading ? (
         <div className="snippet-grid">
         {Array.from({ length: 6 }).map((_, i) => (
           <div key={i} className="card" style={{ height: '140px' }}>
             <div className="skeleton" style={{ height: '48px', width: '48px', borderRadius: '12px', display: 'inline-block' }} />
             <div className="skeleton" style={{ height: '16px', width: '120px', display: 'inline-block', marginLeft: '12px', verticalAlign: 'top' }} />
           </div>
         ))}
       </div>
      ) : groups.length > 0 ? (
        <div className="snippet-grid">
          {groups.map(g => <GroupCard key={g._id} group={g} />)}
        </div>
      ) : (
        <div className="empty-state">
          <div className="icon">🏛️</div>
          <h3 style={{ marginBottom: '8px' }}>You aren't in any groups</h3>
          <p>Join a group with an invite code or create your own!</p>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Create New Group</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: '80px', height: '80px', borderRadius: '16px',
                    border: '2px dashed var(--border)', background: 'var(--bg-elevated)',
                    cursor: 'pointer', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}
                >
                  {createPreview ? (
                     <img src={createPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '24px', opacity: 0.5 }}>📷</span>
                  )}
                </button>
                <input
                  ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setCreateImage(f); setCreatePreview(URL.createObjectURL(f)) }
                  }}
                />
              </div>

              <div className="form-group">
                <label className="label">Group Name *</label>
                <input
                  className="input"
                  value={createForm.group_name}
                  onChange={e => setCreateForm(f => ({...f, group_name: e.target.value}))}
                  required minLength={3} maxLength={50}
                />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  value={createForm.group_description}
                  onChange={e => setCreateForm(f => ({...f, group_description: e.target.value}))}
                  rows={2} maxLength={500}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)} disabled={creating}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? '⏳ Creating…' : '✨ Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN MODAL */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => !joining && setShowJoinModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Join a Group</h2>
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label className="label">Invite Code *</label>
                <input
                  className="input"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  placeholder="e.g. ebc123-..."
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowJoinModal(false)} disabled={joining}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={joining}>
                  {joining ? '⏳ Joining…' : '🔗 Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
