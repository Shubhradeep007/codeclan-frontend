'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adminApi } from '@/lib/adminApi'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) return
    if (user?.role !== 'admin') {
      toast.error('Access Denied. Admins only.')
      router.push('/')
      return
    }

    const fetchUsers = async () => {
      setLoading(true)
      try {
        const res = await adminApi.getAllUsers({ page, search: search || undefined })
        setUsers(res.data.data.users)
        setTotalPages(res.data.data.totalPages)
      } catch {
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchUsers, 400)
    return () => clearTimeout(debounce)
  }, [isAuthenticated, user?.role, page, search, router])

  const toggleSuspend = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await adminApi.suspendUser(userId)
        toast.success('User suspended')
      } else {
        await adminApi.activateUser(userId)
        toast.success('User activated')
      }
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u))
    } catch {
      toast.error('Action failed')
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') return null

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      <div className="page-header">
        <h1 className="page-title">🛡️ Admin Dashboard</h1>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>User Management</h2>
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <span className="search-icon" style={{ fontSize: '14px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search user..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ padding: '6px 14px 6px 32px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>User</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Joined</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={u.user_profile_image?.startsWith('http') ? u.user_profile_image : `https://api.dicebear.com/8.x/initials/svg?seed=${u.user_name}`} 
                          alt="avatar" 
                          style={{ width: 32, height: 32, borderRadius: '50%' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{u.user_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span className={`badge badge-${u.role === 'admin' ? 'admin' : 'group'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ 
                        color: u.isActive ? 'var(--success)' : 'var(--danger)', 
                        fontSize: '13px', 
                        fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.isActive ? 'var(--success)' : 'var(--danger)' }}></span>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      {user.id !== u._id && (
                        <button 
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleSuspend(u._id, u.isActive)}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
