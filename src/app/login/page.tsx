'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/authApi'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ user_email: '', user_password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(form)
      login(res.data.data, res.data.token)
      toast.success(`Welcome back, ${res.data.data.user_name}!`)
      router.push('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>⚡</div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your CodeClan account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="label">Email</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉</span>
              <input
                id="login-email"
                type="email"
                style={styles.iconInput}
                placeholder="you@example.com"
                value={form.user_email}
                onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="label" style={{ margin: 0 }}>Password</label>
              <Link
                href="/forgot-password"
                style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 500, textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔑</span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                style={{ ...styles.iconInput, paddingRight: '44px' }}
                placeholder="••••••••"
                value={form.user_password}
                onChange={e => setForm(f => ({ ...f, user_password: e.target.value }))}
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
          </div>

          <button
            type="submit"
            id="login-submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={styles.spinner} />
                Signing in…
              </span>
            ) : '⚡ Sign In'}
          </button>
        </form>

        <div style={styles.divider} />

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create one →
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
    background: 'radial-gradient(ellipse at 40% 0%, rgba(0,227,253,0.07) 0%, transparent 50%), radial-gradient(ellipse at 100% 80%, rgba(219,144,255,0.06) 0%, transparent 50%)',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'linear-gradient(135deg, rgba(20,31,55,0.7) 0%, rgba(15,25,47,0.8) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0,227,253,0.15)',
    borderRadius: '20px',
    padding: '48px 40px',
    boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  header: { textAlign: 'center', marginBottom: '36px' },
  headerIcon: { fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 16px rgba(0,227,253,0.5))' },
  title: { fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '14px', margin: 0 },
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
