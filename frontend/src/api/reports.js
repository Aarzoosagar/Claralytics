import apiClient from './client.js'

export const reportsApi = {
  generate: (payload) => apiClient.post('/reports/generate', payload),

  list: () => apiClient.get('/reports'),

  download: (id) =>
    apiClient.get(`/reports/download/${id}`, { responseType: 'blob' }),
}
