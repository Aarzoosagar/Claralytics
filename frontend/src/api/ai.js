import apiClient from './client.js'

export const aiApi = {
  insights: (datasetId) =>
    apiClient.get('/ai/insights', { params: { dataset_id: datasetId } }),

  chat: (messages, datasetId) =>
    apiClient.post('/ai/chat', {
      messages,
      ...(datasetId && { dataset_id: datasetId }),
    }),
}
