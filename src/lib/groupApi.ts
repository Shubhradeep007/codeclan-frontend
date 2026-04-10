import api from './api'

export interface GroupPayload {
  group_name: string
  group_description?: string
  group_avatar?: File
}

export const groupApi = {
  create: (payload: GroupPayload) => {
    const form = new FormData()
    form.append('group_name', payload.group_name)
    if (payload.group_description) form.append('group_description', payload.group_description)
    if (payload.group_avatar) form.append('group_avatar', payload.group_avatar)
    return api.post('/api/group/create/group', form)
  },

  getMyGroups: () =>
    api.get('/api/group/mygroup'),

  joinByInvite: (invite_code: string) =>
    api.post('/api/group/invite', { invite_code }),

  changeRole: (group_id: string, user_id: string, role: string) =>
    api.put('/api/group/change-role', { group_id, user_id, role }),

  removeMember: (group_id: string, user_id: string) =>
    api.delete('/api/group/remove-member', { data: { group_id, user_id } }),

  getById: (id: string) =>
    api.get(`/api/group/${id}`),

  update: (id: string, payload: GroupPayload) => {
    const form = new FormData()
    if (payload.group_name) form.append('group_name', payload.group_name)
    if (payload.group_description) form.append('group_description', payload.group_description)
    if (payload.group_avatar) form.append('group_avatar', payload.group_avatar)
    return api.put(`/api/group/${id}`, form)
  },

  archive: (id: string) =>
    api.delete(`/api/group/${id}`),

  getSnippets: (id: string) =>
    api.get(`/api/group/${id}/snippets`),

  assignSnippet: (groupId: string, snippetId: string) =>
    api.patch(`/api/group/${groupId}/snippets/${snippetId}`),

  getPendingSnippets: (groupId: string) =>
    api.get(`/api/group/${groupId}/snippets/pending`),

  approveSnippet: (groupId: string, snippetId: string) =>
    api.patch(`/api/group/${groupId}/snippets/${snippetId}/approve`),

  rejectSnippet: (groupId: string, snippetId: string) =>
    api.delete(`/api/group/${groupId}/snippets/${snippetId}/reject`),
}
