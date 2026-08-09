import apiClient from './client.js'

export const predictionsApi = {
  forecast: (datasetId, targetColumn, periods) =>
    apiClient.get('/predictions/forecast', {
      params: { dataset_id: datasetId, target_column: targetColumn, periods },
    }),

  churn: (datasetId, targetColumn) =>
    apiClient.get('/predictions/churn', {
      params: { dataset_id: datasetId, target_column: targetColumn },
    }),

  segmentation: (datasetId, nClusters) =>
    apiClient.get('/predictions/segmentation', {
      params: { dataset_id: datasetId, n_clusters: nClusters },
    }),

  anomalies: (datasetId, contamination) =>
    apiClient.get('/predictions/anomalies', {
      params: { dataset_id: datasetId, contamination },
    }),
}
