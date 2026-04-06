import api from './api'

export interface LoginPayload { user_email: string; user_password: string }
export interface RegisterPayload {
  user_name: string
  user_email: string
  user_password: string
  user_about?: string
  user_profile_image?: File
}

export const authApi = {
  register: (payload: RegisterPayload) => {
    const form = new FormData()
    form.append('user_name', payload.user_name)
    form.append('user_email', payload.user_email)
    form.append('user_password', payload.user_password)
    if (payload.user_about) form.append('user_about', payload.user_about)
    if (payload.user_profile_image) form.append('user_profile_image', payload.user_profile_image)
    return api.post('/api/users/register', form)
  },

  login: (payload: LoginPayload) =>
    api.post('/api/users/login', payload),

  getMe: () =>
    api.get('/api/users/me'),

  updateProfile: (id: string, payload: Partial<RegisterPayload>) => {
    const form = new FormData()
    if (payload.user_name) form.append('user_name', payload.user_name)
    if (payload.user_email) form.append('user_email', payload.user_email)
    if (payload.user_about !== undefined) form.append('user_about', payload.user_about)
    if (payload.user_profile_image) form.append('user_profile_image', payload.user_profile_image)
    return api.put(`/api/users/update/${id}`, form)
  },

  deleteAccount: (id: string) =>
    api.delete(`/api/users/delete/${id}`),
}
