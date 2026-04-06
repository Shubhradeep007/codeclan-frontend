'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuthStore } from '@/store/authStore'
import { snippetApi, Language } from '@/lib/snippetApi'
import toast from 'react-hot-toast'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const LANGUAGES: { value: Language; label: string; monaco: string }[] = [
  { value: 'js',   label: 'JavaScript', monaco: 'javascript' },
  { value: 'ts',   label: 'TypeScript', monaco: 'typescript' },
  { value: 'py',   label: 'Python',     monaco: 'python' },
  { value: 'go',   label: 'Go',         monaco: 'go' },
  { value: 'rs',   label: 'Rust',       monaco: 'rust' },
  { value: 'java', label: 'Java',       monaco: 'java' },
  { value: 'cpp',  label: 'C++',        monaco: 'cpp' },
  { value: 'bash', label: 'Bash',       monaco: 'shell' },
  { value: 'sql',  label: 'SQL',        monaco: 'sql' },
  { value: 'php',  label: 'PHP',        monaco: 'php' },
  { value: 'rb',   label: 'Ruby',       monaco: 'ruby' },
  { value: 'other',label: 'Other',      monaco: 'plaintext' },
]

export default function EditSnippetPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const [form, setForm] = useState({
    snippet_title: '',
    snippet_code: '',
    snippet_language: 'js' as Language,
    snippet_description: '',
    snippet_tags: [] as string[],
    visibility: 'private' as 'private' | 'public' | 'group',
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [_hasHydrated, isAuthenticated, router])

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return

    snippetApi.getById(id as string)
      .then(res => {
        const data = res.data.data
        if (data.created_by._id !== user?.id) {
          toast.error("You don't have permission to edit this snippet")
          router.push(`/snippets/${id}`)
          return
        }
        setForm({
          snippet_title: data.snippet_title,
          snippet_code: data.snippet_code,
          snippet_language: data.snippet_language,
          snippet_description: data.snippet_description || '',
          snippet_tags: data.snippet_tags || [],
          visibility: data.visibility,
        })
      })
      .catch((err) => {
        toast.error('Snippet not found')
        router.push('/dashboard')
      })
      .finally(() => setFetching(false))
  }, [id, isAuthenticated, router, user?.id])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.snippet_tags.includes(t) && form.snippet_tags.length < 10) {
      setForm(f => ({ ...f, snippet_tags: [...f.snippet_tags, t] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => setForm(f => ({ ...f, snippet_tags: f.snippet_tags.filter(t => t !== tag) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.snippet_title.trim()) { toast.error('Title is required'); return }
    if (!form.snippet_code.trim()) { toast.error('Code is required'); return }
    setLoading(true)
    try {
      await snippetApi.update(id as string, form)
      toast.success('Snippet updated!')
      router.push(`/snippets/${id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update snippet')
    } finally {
      setLoading(false)
    }
  }

  const selectedLang = LANGUAGES.find(l => l.value === form.snippet_language)

  if (!_hasHydrated || !isAuthenticated) return null

  if (fetching) return (
     <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '16px' }} />
    </div>
  )

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1 className="page-title">✏️ Edit Snippet</h1>
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
            <label className="label">Title *</label>
            <input
              className="input"
              value={form.snippet_title}
              onChange={e => setForm(f => ({ ...f, snippet_title: e.target.value }))}
              required maxLength={120}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Language *</label>
            <select
              className="input"
              value={form.snippet_language}
              onChange={e => setForm(f => ({ ...f, snippet_language: e.target.value as Language }))}
            >
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Visibility</label>
            <select
              className="input"
              value={form.visibility}
              onChange={e => setForm(f => ({ ...f, visibility: e.target.value as any }))}
            >
              <option value="private">🔒 Private</option>
              <option value="public">🌐 Public</option>
              <option value="group">👥 Group</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Description</label>
          <textarea
            className="input"
            value={form.snippet_description}
            onChange={e => setForm(f => ({ ...f, snippet_description: e.target.value }))}
            rows={2}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label className="label">Tags (up to 10)</label>
          <div className="tags-input" onClick={() => document.getElementById('tag-input-edit')?.focus()}>
            {form.snippet_tags.map(tag => (
              <span key={tag} className="badge badge-tag" style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)}>
                {tag} ✕
              </span>
            ))}
            <input
              id="tag-input-edit"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } if (e.key === ',') { e.preventDefault(); addTag() } }}
              placeholder={form.snippet_tags.length < 10 ? 'Add tag, press Enter…' : ''}
              disabled={form.snippet_tags.length >= 10}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Code *</label>
          <div className="code-block-wrapper">
            <div className="code-block-header">
              <span>{selectedLang?.label || 'Code'}</span>
              <span>{form.snippet_code.length}/50000 chars</span>
            </div>
            <MonacoEditor
              height="360px"
              language={selectedLang?.monaco || 'plaintext'}
              defaultValue={form.snippet_code}
              onChange={v => setForm(f => ({ ...f, snippet_code: v || '' }))}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
