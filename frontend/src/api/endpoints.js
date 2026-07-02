import api from './axios'

// --- Auth ---
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
}

// --- Users ---
export const userApi = {
  me: () => api.get('/users/me'),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/me', data),
  uploadProfilePicture: (formData) => api.post('/users/me/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCoverPhoto: (formData) => api.post('/users/me/cover-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  search: (query, page = 0, size = 20) => api.get('/users/search', { params: { query, page, size } }),
  suggested: (limit = 10) => api.get('/users/suggested', { params: { limit } })
}

// --- Friends ---
export const friendApi = {
  send: (receiverId) => api.post(`/friends/requests/${receiverId}`),
  accept: (requestId) => api.put(`/friends/requests/${requestId}/accept`),
  reject: (requestId) => api.put(`/friends/requests/${requestId}/reject`),
  cancel: (requestId) => api.delete(`/friends/requests/${requestId}`),
  remove: (friendId) => api.delete(`/friends/${friendId}`),
  pending: () => api.get('/friends/requests/pending'),
  sent: () => api.get('/friends/requests/sent'),
  list: () => api.get('/friends'),
  mutualCount: (otherUserId) => api.get(`/friends/mutual/${otherUserId}`)
}

// --- Posts ---
export const postApi = {
  create: (data) => api.post('/posts', data),
  update: (postId, data) => api.put(`/posts/${postId}`, data),
  remove: (postId) => api.delete(`/posts/${postId}`),
  get: (postId) => api.get(`/posts/${postId}`),
  feed: (page = 0, size = 10) => api.get('/posts/feed', { params: { page, size } }),
  timeline: (userId, page = 0, size = 10) => api.get(`/posts/user/${userId}`, { params: { page, size } }),
  like: (postId) => api.post(`/posts/${postId}/like`),
  unlike: (postId) => api.delete(`/posts/${postId}/like`),
  share: (postId, comment = '') => api.post(`/posts/${postId}/share`, null, { params: { comment } }),
  uploadImage: (formData) => api.post('/posts/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// --- Comments ---
export const commentApi = {
  add: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  remove: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
  list: (postId) => api.get(`/posts/${postId}/comments`)
}

// --- Messages ---
export const messageApi = {
  send: (data) => api.post('/messages', data),
  conversation: (otherUserId, page = 0, size = 30) => api.get(`/messages/conversation/${otherUserId}`, { params: { page, size } }),
  markRead: (otherUserId) => api.put(`/messages/conversation/${otherUserId}/read`),
  unreadCount: () => api.get('/messages/unread-count')
}

// --- Notifications ---
export const notificationApi = {
  list: (page = 0, size = 20) => api.get('/notifications', { params: { page, size } }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  unreadCount: () => api.get('/notifications/unread-count')
}

// --- Admin ---
export const adminApi = {
  users: (page = 0, size = 20) => api.get('/admin/users', { params: { page, size } }),
  disable: (userId) => api.put(`/admin/users/${userId}/disable`),
  enable: (userId) => api.put(`/admin/users/${userId}/enable`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  deletePost: (postId) => api.delete(`/admin/posts/${postId}`),
  dashboard: () => api.get('/admin/dashboard')
}
