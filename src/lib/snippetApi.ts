import api from './api'

export type Language = 'js'|'ts'|'py'|'go'|'rs'|'java'|'cpp'|'bash'|'sql'|'php'|'rb'|'other'
export type Visibility = 'private'|'public'|'group'

export interface SnippetPayload {
  snippet_title: string
  snippet_code: string
  snippet_language: Language
  snippet_description?: string
  snippet_tags?: string[]
  visibility?: Visibility
}

export interface FeedParams {
  page?: number
  limit?: number
  sort?: 'top' | 'newest'
  lang?: string
  tag?: string
}

export const snippetApi = {
  getPublicFeed: (params: FeedParams = {}) =>
    api.get('/api/snippets/feed', { params }),

  search: (q: string, params: Omit<FeedParams, 'sort'> & { lang?: string; tag?: string } = {}) =>
    api.get('/api/snippets/search', { params: { q, ...params } }),

  getMySnippets: (params: { page?: number; limit?: number } = {}) =>
    api.get('/api/snippets/me', { params }),

  create: (payload: SnippetPayload) =>
    api.post('/api/snippets/create', payload),

  getById: (id: string) =>
    api.get(`/api/snippets/${id}`),

  update: (id: string, payload: Partial<SnippetPayload>) =>
    api.put(`/api/snippets/update/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/api/snippets/delete/${id}`),

  toggleVisibility: (id: string) =>
    api.patch(`/api/snippets/visibility/${id}`),

  publish: (id: string) =>
    api.patch(`/api/snippets/publish/${id}`),

  castVote: (id: string, vote: 'up' | 'down' | 'none') =>
    api.post(`/api/snippets/${id}/vote`, { vote }),

  getVoteStatus: (id: string) =>
    api.get(`/api/snippets/${id}/vote-status`),
}
