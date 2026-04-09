'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { userApi } from '@/lib/userApi'
import SnippetCard from '@/components/snippet/SnippetCard'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import FollowListModal from '@/components/follow/FollowListModal'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function UserProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, isAuthenticated } = useAuthStore()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followModal, setFollowModal] = useState<{ type: 'followers' | 'following' } | null>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (username) {
      userApi.getPublicProfile(username as string)
        .then(res => {
          setProfile(res.data.data)
        })
        .catch(err => {
          setError('Failed to fetch profile or user not found.')
        })
        .finally(() => setLoading(false))
    }
  }, [username])

  useEffect(() => {
    if (isAuthenticated && profile?._id) {
      userApi.checkFollowStatus(profile._id)
        .then(res => setIsFollowing(res.data.isFollowing))
        .catch(() => {})
    }
  }, [profile?._id, isAuthenticated])

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to follow users.')
      return
    }
    setFollowLoading(true)
    try {
       const res = await userApi.toggleFollow(profile._id)
       setIsFollowing(res.data.data.isFollowing)
       
       setProfile((prev: any) => ({
          ...prev,
          followerCount: res.data.data.isFollowing ? prev.followerCount + 1 : prev.followerCount - 1
       }))
       
       toast.success(res.data.message)
    } catch {
       toast.error('Failed to toggle follow')
    } finally {
       setFollowLoading(false)
    }
  }

  useGSAP(() => {
    if (profile && headerRef.current) {
      gsap.from(headerRef.current, {
        y: -40, opacity: 0, duration: 0.8, ease: 'power3.out'
      })
    }
  }, [profile])

  useGSAP(() => {
    if (profile?.public_snippets?.length > 0 && gridRef.current) {
      gsap.fromTo(gsap.utils.toArray('.snippet-gsap'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out', clearProps: 'all' }
      )
    }
  }, [profile])


  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 160, borderRadius: 16, marginBottom: 40 }} />
        <div className="snippet-grid">
          {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="skeleton card" style={{ height: '220px' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="page-container">
        <div className="empty-state fade-in">
          <div className="icon">⚠️</div>
          <h3 style={{ fontFamily: 'var(--font-space)' }}>User Not Found</h3>
          <p style={{ fontFamily: 'var(--font-mono)' }}>The requested user profile does not exist or has been suspended.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div 
        ref={headerRef}
        className="card" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px', 
          padding: '32px', 
          marginBottom: '40px',
          background: 'radial-gradient(ellipse at top left, rgba(219, 144, 255, 0.15), transparent 60%), linear-gradient(135deg, rgba(20, 31, 55, 0.8) 0%, rgba(15, 25, 47, 0.9) 100%)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 40px rgba(219, 144, 255, 0.05)'
        }}
      >
        <img
          src={profile.user_profile_image?.startsWith('http') ? profile.user_profile_image : `https://api.dicebear.com/8.x/initials/svg?seed=${profile.user_name}`}
          alt={profile.user_name}
          className="avatar"
          style={{ width: 110, height: 110, border: '2px solid var(--primary)', padding: '4px', background: 'var(--bg-base)' }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '32px', color: 'var(--text-primary)', fontFamily: 'var(--font-space)' }}>
            {profile.user_name}
          </h1>
          {profile.user_about && (
            <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', maxWidth: '600px', lineHeight: 1.5 }}>
              {profile.user_about}
            </p>
          )}
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--primary)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 227, 253, 0.1)', padding: '6px 12px', borderRadius: '6px' }}>
              📅 Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 227, 253, 0.1)', padding: '6px 12px', borderRadius: '6px' }}>
              📋 {profile.publicSnippetCount || 0} Public Snippets
            </span>
            <button
              onClick={() => setFollowModal({ type: 'followers' })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 227, 253, 0.1)', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '13px', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,227,253,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(0,227,253,0.1)'}
            >
              👥 {profile.followerCount || 0} Followers
            </button>
            <button
              onClick={() => setFollowModal({ type: 'following' })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 227, 253, 0.1)', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '13px', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,227,253,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(0,227,253,0.1)'}
            >
              👣 {profile.followingCount || 0} Following
            </button>
          </div>
        </div>
        {isAuthenticated && user?.id !== profile._id && (
          <div style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
            <button 
                onClick={handleToggleFollow} 
                disabled={followLoading}
                className={`btn ${isFollowing ? 'btn-ghost' : 'btn-primary'}`}
                style={{ padding: '8px 24px', whiteSpace: 'nowrap' }}
            >
                {followLoading ? '...' : isFollowing ? 'Unfollow' : '+ Follow'}
            </button>
          </div>
        )}
      </div>

      <h2 style={{ fontFamily: 'var(--font-space)', marginBottom: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'var(--secondary)', textShadow: '0 0 10px var(--secondary-glow)' }}>//</span> Public Contributions
      </h2>

      {/* Snippets Grid */}
      {profile.public_snippets && profile.public_snippets.length > 0 ? (
        <div className="snippet-grid" ref={gridRef}>
          {profile.public_snippets.map((snippet: any) => (
            <div key={snippet._id} className="snippet-gsap">
              {/* Add created_by manually since $lookup inside user won't duplicate the user document inside created_by */}
              <SnippetCard snippet={{...snippet, created_by: { _id: profile._id, user_name: profile.user_name, user_profile_image: profile.user_profile_image }}} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state fade-in">
          <div className="icon">📭</div>
          <h3 style={{ marginBottom: '8px', fontFamily: 'var(--font-space)' }}>No public snippets</h3>
          <p style={{ fontFamily: 'var(--font-mono)' }}>This user hasn't initialized any public transmissions yet.</p>
        </div>
      )}
      {followModal && profile?._id && (
        <FollowListModal
          userId={profile._id}
          type={followModal.type}
          count={followModal.type === 'followers' ? (profile.followerCount || 0) : (profile.followingCount || 0)}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  )
}
