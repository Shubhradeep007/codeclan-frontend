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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✨</div>
          <h1 style={styles.title}>Link Dispatched</h1>
          <p style={styles.subtitle}>
            A recovery link has been sent to
          </p>
          <div style={styles.emailPill}>{email}</div>
          <p style={styles.helperText}>
            Check your inbox (and spam folder) for the transmission. The link is valid for 1 hour.
          </p>
          <div style={styles.divider} />
          <Link href="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '12px', width: '100%' }}>
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>🔑</div>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>Enter your email to receive a recovery link</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉</span>
              <input
                type="email"
                style={styles.iconInput}
                placeholder="developer@codeclan.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '12px', fontSize: '15px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={styles.spinner} />
                Initializing Protocol…
              </span>
            ) : 'Send Reset Link'}
          </button>
        </form>

        <div style={styles.divider} />
        
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Remember your password?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    background: 'radial-gradient(ellipse at 50% 20%, rgba(219,144,255,0.08) 0%, transparent 60%)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'linear-gradient(135deg, rgba(20,31,55,0.7) 0%, rgba(15,25,47,0.85) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(219,144,255,0.2)',
    borderRadius: '20px',
    padding: '48px 40px',
    boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  headerIcon: { fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 12px rgba(219,144,255,0.5))' },
  title: { fontSize: '26px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em', textAlign: 'center' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', margin: 0, lineHeight: 1.5 },
  successIcon: { fontSize: '64px', textAlign: 'center', marginBottom: '20px', filter: 'drop-shadow(0 0 16px rgba(0,227,253,0.4))' },
  emailPill: {
    background: 'rgba(0,227,253,0.1)',
    border: '1px solid rgba(0,227,253,0.3)',
    borderRadius: '99px',
    padding: '8px 20px',
    color: 'var(--secondary)',
    fontWeight: 600,
    fontSize: '14px',
    textAlign: 'center',
    margin: '12px auto',
    display: 'inline-block',
    width: '100%',
    wordBreak: 'break-all',
  },
  helperText: { color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', lineHeight: 1.6, margin: '16px 0' },
  divider: { height: '1px', background: 'linear-gradient(90deg, transparent, rgba(64,72,92,0.3), transparent)', margin: '24px 0' },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgba(64,72,92,0.4)',
    transition: 'border-color 0.2s',
  },
  inputIcon: {
    position: 'absolute',
    left: 0,
    color: 'var(--text-muted)',
    fontSize: '14px',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  iconInput: {
    width: '100%',
    paddingLeft: '24px',
    paddingBottom: '10px',
    paddingTop: '10px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(0,0,0,0.3)',
    borderTopColor: '#000',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
}
