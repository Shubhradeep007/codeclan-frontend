'use client'
import { useState } from 'react'
import { authApi } from '@/lib/authApi'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-space)', textAlign: 'center', marginBottom: '8px', fontSize: '28px' }}>
          Reset Password
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
          Enter your email and we'll transmit a link to reset your password.
        </p>

        {sent ? (
          <div style={{ textAlign: 'center', background: 'rgba(0, 227, 253, 0.1)', padding: '24px', borderRadius: '12px' }}>
            <p style={{ color: 'var(--primary)', marginBottom: '16px' }}>✉️ Link Dispatched</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Check your inbox (and spam folder) for the transmission.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="developer@codeclan.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {loading ? 'Initializing Protocol...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
