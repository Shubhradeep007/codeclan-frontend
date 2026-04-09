'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { userApi } from '@/lib/userApi'

interface FollowListModalProps {
  userId: string
  type: 'followers' | 'following'
  count: number
  onClose: () => void
}

export default function FollowListModal({ userId, type, count, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fn = type === 'followers' ? userApi.getFollowers : userApi.getFollowing
    fn(userId)
      .then(res => setUsers(res.data.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))

    // Close on Escape key
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [userId, type])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '420px', width: '100%', padding: '28px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-space)', fontSize: '20px', margin: 0, textTransform: 'capitalize' }}>
            {type === 'followers' ? '👥 Followers' : '👣 Following'}
            <span style={{ marginLeft: '10px', fontSize: '14px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {count}
            </span>
          </h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ fontSize: '18px', padding: '2px 8px', lineHeight: 1 }}
          >×</button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '10px' }} />
            ))
          ) : users.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="icon" style={{ fontSize: '32px' }}>📭</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                No {type} yet.
              </p>
            </div>
          ) : (
            users.map(u => (
              <Link
                key={u._id}
                href={`/user/${u.user_name}`}
                onClick={onClose}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', cursor: 'pointer',
                    transition: 'all 0.2s', border: '1px solid transparent'
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <img
                    src={u.user_profile_image?.startsWith('http')
                      ? u.user_profile_image
                      : `https://api.dicebear.com/8.x/initials/svg?seed=${u.user_name}`}
                    alt={u.user_name}
                    className="avatar"
                    style={{ width: 38, height: 38, border: '1.5px solid var(--border)' }}
                  />
                  <span style={{ fontFamily: 'var(--font-space)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {u.user_name}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
