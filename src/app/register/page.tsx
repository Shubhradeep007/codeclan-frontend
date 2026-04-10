'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/authApi'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    user_about: '',
  })

  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ff6e84' }
    if (score === 2) return { level: 2, label: 'Fair', color: '#ffb347' }
    if (score === 3) return { level: 3, label: 'Good', color: '#00e3fd' }
    return { level: 4, label: 'Strong', color: '#44ff99' }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.user_password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await authApi.register({ ...form, user_profile_image: imageFile || undefined })
      setSentEmail(form.user_email)
      setSent(true)
    } catch (err: any) {
      console.error('Registration Catch Error:', err)
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(form.user_password)

  if (sent) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <div style={styles.successIcon}>📬</div>
          <h1 style={styles.title}>Check Your Inbox</h1>
          <p style={styles.subtitle}>
            We've sent a verification link to
          </p>
          <div style={styles.emailPill}>{sentEmail}</div>
          <p style={styles.helperText}>
            Click the link in the email to activate your account. The link expires in 24 hours.
          </p>
          <div style={styles.divider} />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Already verified?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign in →
            </Link>
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
            Didn't receive it? Check your spam folder.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>🚀</div>
          <h1 style={styles.title}>Join CodeClan</h1>
          <p style={styles.subtitle}>Create your developer account</p>
        </div>

        {/* Avatar Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={styles.avatarBtn}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(64,72,92,0.3)')}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px' }}>👤</span>
            )}
            <div style={styles.avatarOverlay}>
              <span style={{ fontSize: '16px' }}>📷</span>
            </div>
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Upload avatar (optional)
          </span>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="label">Username</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>@</span>
              <input
                id="reg-username"
                type="text"
                style={styles.iconInput}
                placeholder="cooldev42"
                value={form.user_name}
                onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))}
                required minLength={3} maxLength={30}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="label">Email</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉</span>
              <input
                id="reg-email"
                type="email"
                style={styles.iconInput}
                placeholder="you@example.com"
                value={form.user_email}
                onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="label">Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔑</span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                style={{ ...styles.iconInput, paddingRight: '44px' }}
                placeholder="Min 6 characters"
                value={form.user_password}
                onChange={e => setForm(f => ({ ...f, user_password: e.target.value }))}
                required minLength={6}
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
            {form.user_password && (
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

          {/* About */}
          <div className="form-group">
            <label className="label">About (optional)</label>
            <textarea
              id="reg-about"
              className="input"
              placeholder="Tell the community about yourself…"
              value={form.user_about}
              onChange={e => setForm(f => ({ ...f, user_about: e.target.value }))}
              rows={3}
            />
          </div>

          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={styles.spinner} />
                Creating Account…
              </span>
            ) : '🚀 Create Account'}
          </button>
        </form>

        <div style={styles.divider} />
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in →</Link>
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
    background: 'radial-gradient(ellipse at 60% 0%, rgba(219,144,255,0.08) 0%, transparent 55%), radial-gradient(ellipse at 0% 80%, rgba(0,227,253,0.06) 0%, transparent 50%)',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: 'linear-gradient(135deg, rgba(20,31,55,0.7) 0%, rgba(15,25,47,0.8) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(219,144,255,0.2)',
    borderRadius: '20px',
    padding: '48px 40px',
    boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  header: { textAlign: 'center', marginBottom: '36px' },
  headerIcon: { fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 12px rgba(219,144,255,0.5))' },
  title: { fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '14px', margin: 0 },
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
  helperText: { color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', lineHeight: 1.7, margin: '16px 0' },
  divider: { height: '1px', background: 'linear-gradient(90deg, transparent, rgba(64,72,92,0.3), transparent)', margin: '24px 0' },
  avatarBtn: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    border: '2px dashed rgba(64,72,92,0.3)',
    background: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative',
    transition: 'border-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
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
}
