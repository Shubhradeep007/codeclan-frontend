import api from './api'

export const commentApi = {
  add: (snippet_id: string, content: string) =>
    api.post('/api/comments', { snippet_id, comment_body: content }),

  getBySnippet: (snippetId: string) =>
    api.get(`/api/comments/${snippetId}`),

  update: (id: string, content: string) =>
    api.put(`/api/comments/${id}`, { comment_body: content }),

  delete: (id: string) =>
    api.delete(`/api/comments/${id}`),
}
