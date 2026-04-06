import api from './api'

export const adminApi = {
  getAllUsers: (params: { page?: number; search?: string } = {}) =>
    api.get('/api/admin/users', { params }),

  getUserById: (id: string) =>
    api.get(`/api/admin/users/${id}`),

  suspendUser: (id: string) =>
    api.patch(`/api/admin/users/${id}/suspend`),

  activateUser: (id: string) =>
    api.patch(`/api/admin/users/${id}/activate`),

  hardDeleteSnippet: (id: string) =>
    api.delete(`/api/admin/snippets/${id}`),
}
