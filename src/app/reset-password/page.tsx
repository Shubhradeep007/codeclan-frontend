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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ff6e84' }
    if (score === 2) return { level: 2, label: 'Fair', color: '#ffb347' }
    if (score === 3) return { level: 3, label: 'Good', color: '#00e3fd' }
    return { level: 4, label: 'Strong', color: '#44ff99' }
  }

  const strength = getPasswordStrength(password)

  if (!token) {
    return (
      <div style={styles.pageWrapper}>
         <div style={styles.card}>
           <div style={styles.icon}>⚠️</div>
           <h1 style={styles.title}>Invalid Token</h1>
           <p style={styles.subtitle}>No reset token was provided in the URL.</p>
           <div style={styles.divider} />
           <Link href="/forgot-password" style={{ display: 'block', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>
              Request New Link →
           </Link>
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

  if (success) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <div style={{ ...styles.icon, filter: 'drop-shadow(0 0 24px rgba(68,255,153,0.5))' }}>✅</div>
          <h1 style={{ ...styles.title, color: '#44ff99' }}>Access Restored</h1>
          <p style={styles.subtitle}>Your password has been successfully updated.</p>
          <div style={styles.progressWrapper}>
            <div style={styles.progressBar} />
          </div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Redirecting to login portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>🛡️</div>
          <h1 style={styles.title}>New Password</h1>
          <p style={styles.subtitle}>Secure your account with a new password</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">New Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔑</span>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{ ...styles.iconInput, paddingRight: '44px' }}
                placeholder="Min 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {/* Strength bar */}
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={styles.strengthBarWrapper}>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      style={{
                        ...styles.strengthSegment,
                        background: i <= strength.level ? strength.color : 'rgba(64,72,92,0.2)'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: strength.color, fontWeight: 600 }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">Confirm Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔐</span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                style={{ ...styles.iconInput, paddingRight: '44px' }}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(s => !s)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
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
                Executing…
              </span>
            ) : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(219,144,255,0.2)', borderTopColor: '#db90ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        }>
            <ResetPasswordContent />
        </Suspense>
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
  icon: { fontSize: '64px', marginBottom: '20px', filter: 'drop-shadow(0 0 12px rgba(219,144,255,0.4))', textAlign: 'center' },
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
  eyeBtn: {
    position: 'absolute',
    right: 0,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    color: 'var(--text-muted)',
  },
  strengthBarWrapper: { display: 'flex', gap: '4px', marginBottom: '4px' },
  strengthSegment: { height: '3px', flex: 1, borderRadius: '99px', transition: 'background 0.3s' },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(0,0,0,0.3)',
    borderTopColor: '#000',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  progressWrapper: {
    height: '3px',
    background: 'rgba(64,72,92,0.2)',
    borderRadius: '99px',
    overflow: 'hidden',
    margin: '16px 0 0',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    background: 'linear-gradient(90deg, #44ff99, #00e3fd)',
    borderRadius: '99px',
    animation: 'growWidth 2.5s ease-out forwards',
  },
}
