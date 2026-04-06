'use client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Snippet {
  _id: string
  snippet_title: string
  snippet_code: string
  snippet_language: string
  snippet_description?: string
  snippet_tags: string[]
  visibility: string
  vote_score: number
  view_count: number
  createdAt: string
  created_by?: {
    _id: string
    user_name: string
    user_profile_image?: string
  }
}

const langColors: Record<string, string> = {
  js: '#f7df1e', ts: '#3178c6', py: '#3572A5', go: '#00ADD8',
  rs: '#dea584', java: '#b07219', cpp: '#f34b7d', bash: '#89e051',
  sql: '#e38c00', php: '#4F5D95', rb: '#701516', other: '#7c3aed',
}

const langLabels: Record<string, string> = {
  js: 'JavaScript', ts: 'TypeScript', py: 'Python', go: 'Go',
  rs: 'Rust', java: 'Java', cpp: 'C++', bash: 'Bash',
  sql: 'SQL', php: 'PHP', rb: 'Ruby', other: 'Other',
}

export default function SnippetCard({ snippet }: { snippet: Snippet }) {
  const preview = snippet.snippet_code.slice(0, 120).replace(/\n/g, ' ') + (snippet.snippet_code.length > 120 ? '…' : '')
  const langColor = langColors[snippet.snippet_language] || '#7c3aed'
  const langLabel = langLabels[snippet.snippet_language] || snippet.snippet_language

  return (
    <Link href={`/snippets/${snippet._id}`} style={{ textDecoration: 'none' }}>
      <div className="card fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {snippet.snippet_title}
          </h3>
          <span
            className="badge badge-lang"
            style={{ background: `${langColor}22`, color: langColor, borderColor: `${langColor}44`, flexShrink: 0 }}
          >
            {langLabel}
          </span>
        </div>

        {/* Description */}
        {snippet.snippet_description && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {snippet.snippet_description}
          </p>
        )}

        {/* Code Preview */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: 'var(--text-muted)',
            background: 'var(--bg-base)',
            borderRadius: '8px',
            padding: '10px 12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}
        >
          {preview}
        </div>

        {/* Tags */}
        {snippet.snippet_tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {snippet.snippet_tags.slice(0, 4).map(tag => (
              <span key={tag} className="badge badge-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {snippet.created_by && (
              <>
                <img
                  src={snippet.created_by.user_profile_image?.startsWith('http')
                    ? snippet.created_by.user_profile_image
                    : `https://api.dicebear.com/8.x/initials/svg?seed=${snippet.created_by.user_name}`}
                  alt={snippet.created_by.user_name}
                  className="avatar"
                  style={{ width: 20, height: 20 }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{snippet.created_by.user_name}</span>
              </>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              👁 {snippet.view_count}
            </span>
            <span style={{ fontSize: '12px', color: snippet.vote_score > 0 ? 'var(--success)' : snippet.vote_score < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
              ▲ {snippet.vote_score}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
