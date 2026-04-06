'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/authApi'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    user_about: '',
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
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
      // auto-login
      const loginRes = await authApi.login({ user_email: form.user_email, user_password: form.user_password })
      login(loginRes.data.data, loginRes.data.token)
      toast.success(`Welcome to CodeClan, ${form.user_name}!`)
      router.push('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="narrow-container">
      <div className="card-glass" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Join CodeClan</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Create your developer account</p>
        </div>

        {/* Avatar Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '2px dashed var(--border)',
              background: 'var(--bg-elevated)',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '28px' }}>👤</span>
            )}
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Click to upload avatar (optional)
          </span>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Username</label>
            <input
              id="reg-username"
              type="text"
              className="input"
              placeholder="cooldev42"
              value={form.user_name}
              onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))}
              required minLength={3} maxLength={30}
            />
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              id="reg-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.user_email}
              onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              id="reg-password"
              type="password"
              className="input"
              placeholder="Min 6 characters"
              value={form.user_password}
              onChange={e => setForm(f => ({ ...f, user_password: e.target.value }))}
              required minLength={6}
            />
          </div>

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
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? '⏳ Creating account…' : '🚀 Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in →</Link>
        </div>
      </div>
    </div>
  )
}
