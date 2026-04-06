'use client'
import Link from 'next/link'

interface Group {
  _id: string
  group_name: string
  group_description?: string
  group_avatar?: string
  invite_code?: string
  isActive: boolean
  owner_id: string
  createdAt: string
}

export default function GroupCard({ group, onJoin }: { group: Group; onJoin?: () => void }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={group.group_avatar?.startsWith('http')
            ? group.group_avatar
            : `https://api.dicebear.com/8.x/shapes/svg?seed=${group.group_name}&backgroundColor=7c3aed`}
          alt={group.group_name}
          className="avatar"
          style={{ width: 48, height: 48, borderRadius: '12px' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {group.group_name}
          </h3>
          {!group.isActive && <span className="badge badge-private" style={{ fontSize: '10px' }}>Archived</span>}
        </div>
      </div>

      {group.group_description && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {group.group_description}
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <Link href={`/groups/${group._id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
          View Group →
        </Link>
        {group.invite_code && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              navigator.clipboard.writeText(group.invite_code!)
              alert('Invite code copied!')
            }}
            title="Copy invite code"
          >
            🔗
          </button>
        )}
      </div>
    </div>
  )
}
