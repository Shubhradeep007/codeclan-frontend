'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { authApi } from '@/lib/authApi'
import toast from 'react-hot-toast'
import Link from 'next/link'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="page-container fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh' }}>
         <div className="empty-state">
           <div className="icon">⚠️</div>
           <h3>Invalid Token</h3>
           <p>No reset token was provided in the URL.</p>
         </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setSuccess(true)
      toast.success('Password reset successful!')
      setTimeout(() => router.push('/login'), 2000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Link may be expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-space)', textAlign: 'center', marginBottom: '32px', fontSize: '28px' }}>
          New Password
        </h1>

        {success ? (
          <div style={{ textAlign: 'center', background: 'rgba(0, 227, 253, 0.1)', padding: '24px', borderRadius: '12px' }}>
            <p style={{ color: 'var(--primary)', marginBottom: '8px' }}>🔐 Access Restored</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Redirecting to login portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="label">New Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {loading ? 'Executing...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="page-container"><div className="skeleton" style={{ height: 400, borderRadius: 16 }}/></div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
