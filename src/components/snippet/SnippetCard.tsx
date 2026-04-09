'use client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

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
  sql: '#e38c00', php: '#4F5D95', rb: '#701516', other: '#db90ff',
}

const langLabels: Record<string, string> = {
  js: 'JavaScript', ts: 'TypeScript', py: 'Python', go: 'Go',
  rs: 'Rust', java: 'Java', cpp: 'C++', bash: 'Bash',
  sql: 'SQL', php: 'PHP', rb: 'Ruby', other: 'Other',
}

export default function SnippetCard({ snippet }: { snippet: Snippet }) {
  const preview = snippet.snippet_code.slice(0, 100).replace(/\n/g, ' ') + (snippet.snippet_code.length > 100 ? '…' : '')
  const langColor = langColors[snippet.snippet_language] || '#db90ff'
  const langLabel = langLabels[snippet.snippet_language] || snippet.snippet_language
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      y: -4,
      scale: 1.01,
      duration: 0.3,
      ease: 'power2.out',
      boxShadow: '0 20px 40px -10px rgba(0, 227, 253, 0.25)' 
    })
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
      boxShadow: '0 20px 40px rgba(6, 14, 32, 0.4)'
    })
  }

  return (
    <Link href={`/snippets/${snippet._id}`} style={{ textDecoration: 'none' }}>
      <div 
        ref={cardRef}
        className="card" 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px', 
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* The Neon No-Line Highlight */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: '2px',
          background: `linear-gradient(to bottom, ${langColor}, transparent)`
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <h3 style={{ 
            fontFamily: 'var(--font-space)',
            fontSize: '18px', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            textShadow: '0 0 10px rgba(255,255,255,0.1)'
          }}>
            {snippet.snippet_title}
          </h3>
          <span
            className="badge badge-lang"
            style={{ 
              background: `rgba(0,0,0,0.5)`, 
              color: langColor, 
              borderColor: `${langColor}55`, 
              boxShadow: `0 0 10px ${langColor}33`,
              flexShrink: 0 
            }}
          >
            {langLabel}
          </span>
        </div>

        {/* Description */}
        {snippet.snippet_description && (
          <p style={{ 
            fontFamily: 'var(--font-mono)',
            fontSize: '13px', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6 
          }}>
            {snippet.snippet_description}
          </p>
        )}

        {/* Code Preview - Terminal Style */}
        <div
          className="code-block-wrapper"
          style={{
            padding: '12px 16px',
            flex: 1,
            position: 'relative'
          }}
        >
          <div style={{
             position: 'absolute', top: 0, left: 0, right: 0, height: '24px', 
             background: 'rgba(25, 37, 63, 0.3)', borderBottom: '1px solid var(--border-subtle)',
             display: 'flex', alignItems: 'center', padding: '0 12px', gap: '6px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: '28px'
          }}>
            <span style={{ color: 'var(--primary)', marginRight: '8px'}}>&gt;</span> 
            {preview}
          </div>
        </div>

        {/* Tags */}
        {snippet.snippet_tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {snippet.snippet_tags.slice(0, 4).map(tag => (
              <span key={tag} className="badge badge-tag" style={{ border: 'none', background: 'var(--bg-elevated)'}}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {snippet.created_by && (
              <>
                <img
                  src={snippet.created_by.user_profile_image?.startsWith('http')
                    ? snippet.created_by.user_profile_image
                    : `https://api.dicebear.com/8.x/initials/svg?seed=${snippet.created_by.user_name}`}
                  alt={snippet.created_by.user_name}
                  className="avatar"
                  style={{ width: 24, height: 24 }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {snippet.created_by.user_name}
                </span>
              </>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              👁 {snippet.view_count}
            </span>
            <span style={{ 
              fontSize: '12px', 
              color: snippet.vote_score > 0 ? 'var(--secondary)' : snippet.vote_score < 0 ? 'var(--danger)' : 'var(--text-muted)',
              textShadow: snippet.vote_score > 0 ? '0 0 10px var(--secondary-glow)' : 'none'
            }}>
              ▲ {snippet.vote_score}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
