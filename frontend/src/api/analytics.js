import apiClient from './client.js'

export const analyticsApi = {
  summary: (datasetId) =>
    apiClient.get('/analytics/summary', { params: { dataset_id: datasetId } }),

  correlations: (datasetId) =>
    apiClient.get('/analytics/correlations', { params: { dataset_id: datasetId } }),

  outliers: (datasetId) =>
    apiClient.get('/analytics/outliers', { params: { dataset_id: datasetId } }),

  quality: (datasetId) =>
    apiClient.get('/analytics/quality', { params: { dataset_id: datasetId } }),

  metrics: (datasetId) =>
    apiClient.get('/dashboard/metrics', { params: { dataset_id: datasetId } }),

  trends: (datasetId) =>
    apiClient.get('/dashboard/trends', { params: { dataset_id: datasetId } }),

  kpis: (datasetId) =>
    apiClient.get('/dashboard/kpis', { params: { dataset_id: datasetId } }),
}
