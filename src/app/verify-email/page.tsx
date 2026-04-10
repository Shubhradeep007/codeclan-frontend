'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { authApi } from '@/lib/authApi'
import toast from 'react-hot-toast'
import Link from 'next/link'

type State = 'loading' | 'success' | 'error' | 'no-token'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [state, setState] = useState<State>(token ? 'loading' : 'no-token')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) return
    const verify = async () => {
      try {
        await authApi.verifyEmail(token)
        setState('success')
        toast.success('Email verified! Redirecting to login…')
        setTimeout(() => router.push('/login'), 2500)
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Verification failed. The link may have expired.')
        setState('error')
      }
    }
    verify()
  }, [token])

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        {state === 'loading' && (
          <>
            <div style={styles.icon}>🔍</div>
            <h1 style={styles.title}>Verifying…</h1>
            <p style={styles.subtitle}>Hold tight while we confirm your email address.</p>
            <div style={styles.loaderWrapper}>
              <div style={styles.loaderBar} />
            </div>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{ ...styles.icon, filter: 'drop-shadow(0 0 24px rgba(68,255,153,0.5))' }}>✅</div>
            <h1 style={{ ...styles.title, color: '#44ff99' }}>Email Verified!</h1>
            <p style={styles.subtitle}>Your account is now active. Redirecting you to the login page…</p>
            <div style={styles.progressWrapper}>
              <div style={styles.progressBar} />
            </div>
            <Link href="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '12px', marginTop: '24px' }}>
              Go to Login →
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={styles.icon}>❌</div>
            <h1 style={{ ...styles.title, color: 'var(--danger)' }}>Verification Failed</h1>
            <p style={styles.subtitle}>{errorMsg}</p>
            <div style={styles.divider} />
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Did your link expire?{' '}
              <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Register again →
              </Link>
            </p>
          </>
        )}

        {state === 'no-token' && (
          <>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Invalid Link</h1>
            <p style={styles.subtitle}>No verification token was found in the URL. Please use the link from your email.</p>
            <div style={styles.divider} />
            <Link href="/login" style={{ display: 'block', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>
              ← Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(219,144,255,0.2)', borderTopColor: '#db90ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <VerifyEmailContent />
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
    padding: '52px 40px',
    textAlign: 'center',
    boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  icon: { fontSize: '64px', marginBottom: '20px', filter: 'drop-shadow(0 0 12px rgba(219,144,255,0.4))' },
  title: { fontSize: '26px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.03em' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, margin: '0 0 24px' },
  divider: { height: '1px', background: 'linear-gradient(90deg, transparent, rgba(64,72,92,0.3), transparent)', margin: '24px 0' },
  loaderWrapper: {
    height: '3px',
    background: 'rgba(64,72,92,0.2)',
    borderRadius: '99px',
    overflow: 'hidden',
    margin: '24px 0 0',
  },
  loaderBar: {
    height: '100%',
    width: '40%',
    background: 'linear-gradient(90deg, transparent, #db90ff, transparent)',
    borderRadius: '99px',
    animation: 'slide 1.2s ease-in-out infinite',
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
