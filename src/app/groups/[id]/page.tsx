'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { groupApi } from '@/lib/groupApi'
import { formatDistanceToNow } from 'date-fns'
import SnippetCard from '@/components/snippet/SnippetCard'
import toast from 'react-hot-toast'

export default function GroupDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchAll = async () => {
      try {
        const [groupRes, snippetsRes] = await Promise.all([
          groupApi.getById(id as string),
          groupApi.getSnippets(id as string)
        ])
        setGroup(groupRes.data.data.group)
        setMembers(groupRes.data.data.members)
        setSnippets(snippetsRes.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load group')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id, isAuthenticated])

  const copyInvite = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code)
      toast.success('Invite code copied to clipboard!')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await groupApi.changeRole(group._id, userId, newRole)
      setMembers(prev => prev.map(m => m.user_id._id === userId ? { ...m, role: newRole } : m))
      toast.success('Role updated')
    } catch {
      toast.error('Failed to change role')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return
    try {
      await groupApi.removeMember(group._id, userId)
      setMembers(prev => prev.filter(m => m.user_id._id !== userId))
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  if (!isAuthenticated) return null

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '16px' }} />
    </div>
  )

  if (error || !group) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="icon">🔒</div>
        <h2>{error || 'Group not found'}</h2>
        <button className="btn btn-ghost" onClick={() => router.push('/groups')} style={{ marginTop: '16px' }}>← Back to Groups</button>
      </div>
    </div>
  )

  const isOwner = group.owner_id === user?.id

  return (
    <div className="page-container">
      {/* Header Card */}
      <div className="card" style={{ marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <img
          src={group.group_avatar?.startsWith('http') ? group.group_avatar : `https://api.dicebear.com/8.x/shapes/svg?seed=${group.group_name}&backgroundColor=7c3aed`}
          alt={group.group_name}
          className="avatar"
          style={{ width: 100, height: 100, borderRadius: '16px' }}
        />
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{group.group_name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', maxWidth: '600px' }}>
                {group.group_description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>👥 {members.length} members</span>
                <span>📅 Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" onClick={copyInvite}>🔗 Copy Invite Code</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Snippets Column */}
        <div style={{ gridColumn: '1 / span 2' }}>
           <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             Group Snippets
             <a href="/snippets/create" className="btn btn-primary btn-sm">✨ Share Snippet</a>
           </h2>
           {snippets.length > 0 ? (
             <div className="snippet-grid">
               {snippets.map(s => <SnippetCard key={s._id} snippet={s} />)}
             </div>
           ) : (
             <div className="empty-state card" style={{ padding: '40px 24px' }}>
               <div className="icon">📄</div>
               <p style={{ marginBottom: '12px' }}>No snippets shared in this group yet.</p>
             </div>
           )}
        </div>

        {/* Members Column */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Members ({members.length})</h2>
          <div className="card" style={{ padding: '0' }}>
            {members.map((m, idx) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: idx !== members.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                 <img
                    src={m.user_id.user_profile_image?.startsWith('http') ? m.user_id.user_profile_image : `https://api.dicebear.com/8.x/initials/svg?seed=${m.user_id.user_name}`}
                    alt={m.user_id.user_name}
                    className="avatar"
                    style={{ width: 36, height: 36 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.user_id.user_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.role}</div>
                  </div>
                  
                  {isOwner && m.user_id._id !== user?.id && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <select 
                        className="input" 
                        style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user_id._id, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Mod</option>
                      </select>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.user_id._id)} style={{ padding: '4px 8px' }}>
                        ✕
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
