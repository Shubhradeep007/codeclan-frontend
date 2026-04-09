import api from './api'

export const userApi = {
  searchUsers: (q: string, params: { page?: number; limit?: number } = {}) =>
    api.get('/api/users/search', { params: { q, ...params } }),

  getPublicProfile: (username: string) =>
    api.get(`/api/users/profile/${username}`),

  toggleFollow: (userId: string) =>
    api.post(`/api/follow/${userId}`),

  checkFollowStatus: (userId: string) =>
    api.get(`/api/follow/status/${userId}`),

  getFollowers: (userId: string) =>
    api.get(`/api/follow/followers/${userId}`),

  getFollowing: (userId: string) =>
    api.get(`/api/follow/following/${userId}`)
}
