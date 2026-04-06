'use client'
import { useState, useEffect } from 'react'
import { snippetApi } from '@/lib/snippetApi'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface VoteButtonsProps {
  snippetId: string
  initialScore: number
}

export default function VoteButtons({ snippetId, initialScore }: VoteButtonsProps) {
  const { isAuthenticated } = useAuthStore()
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<'up' | 'down' | 'none'>('none')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    snippetApi.getVoteStatus(snippetId)
      .then(res => setUserVote(res.data.data?.vote || 'none'))
      .catch(() => {})
  }, [snippetId, isAuthenticated])

  const handleVote = async (vote: 'up' | 'down') => {
    if (!isAuthenticated) { toast.error('Login to vote'); return }
    if (loading) return

    const newVote = userVote === vote ? 'none' : vote
    setLoading(true)
    try {
      const res = await snippetApi.castVote(snippetId, newVote)
      setScore(res.data.data?.vote_score ?? score)
      setUserVote(newVote)
    } catch {
      toast.error('Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        className={`vote-btn up ${userVote === 'up' ? 'active' : ''}`}
        onClick={() => handleVote('up')}
        disabled={loading}
        title="Upvote"
      >
        ▲ {score > 0 ? score : ''}
      </button>
      <span style={{ fontSize: '18px', fontWeight: 800, color: score > 0 ? 'var(--success)' : score < 0 ? 'var(--danger)' : 'var(--text-muted)', minWidth: '32px', textAlign: 'center' }}>
        {score}
      </span>
      <button
        className={`vote-btn down ${userVote === 'down' ? 'active' : ''}`}
        onClick={() => handleVote('down')}
        disabled={loading}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  )
}
