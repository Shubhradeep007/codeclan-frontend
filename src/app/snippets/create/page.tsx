'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function CreateSnippetPage() {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()
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

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
    }
  }, [_hasHydrated, isAuthenticated, router])

  if (!_hasHydrated || !isAuthenticated) {
    return null
  }

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
      const res = await snippetApi.create(form)
      toast.success('Snippet created! 🎉')
      router.push(`/snippets/${res.data.data._id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create snippet')
    } finally {
      setLoading(false)
    }
  }

  const selectedLang = LANGUAGES.find(l => l.value === form.snippet_language)

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1 className="page-title">✨ New Snippet</h1>
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
            <label className="label">Title *</label>
            <input
              id="snippet-title"
              className="input"
              placeholder="e.g. Debounce hook in React"
              value={form.snippet_title}
              onChange={e => setForm(f => ({ ...f, snippet_title: e.target.value }))}
              required maxLength={120}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="label">Language *</label>
            <select
              id="snippet-language"
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
              id="snippet-visibility"
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
            id="snippet-description"
            className="input"
            placeholder="Briefly describe what this snippet does…"
            value={form.snippet_description}
            onChange={e => setForm(f => ({ ...f, snippet_description: e.target.value }))}
            rows={2}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label className="label">Tags (up to 10)</label>
          <div className="tags-input" onClick={() => document.getElementById('tag-input')?.focus()}>
            {form.snippet_tags.map(tag => (
              <span key={tag} className="badge badge-tag" style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)}>
                {tag} ✕
              </span>
            ))}
            <input
              id="tag-input"
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
          <button id="snippet-submit" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Creating…' : '🚀 Create Snippet'}
          </button>
        </div>
      </form>
    </div>
  )
}
