import { useMutation } from '@tanstack/react-query'
import { predictionsApi } from '../api/predictions.js'

export function useForecast() {
  return useMutation({
    mutationFn: ({ datasetId, targetColumn, periods }) =>
      predictionsApi.forecast(datasetId, targetColumn, periods).then(
        (r) => r.data?.data || r.data
      ),
  })
}

export function useChurn() {
  return useMutation({
    mutationFn: ({ datasetId, targetColumn }) =>
      predictionsApi.churn(datasetId, targetColumn).then(
        (r) => r.data?.data || r.data
      ),
  })
}

export function useSegmentation() {
  return useMutation({
    mutationFn: ({ datasetId, nClusters }) =>
      predictionsApi.segmentation(datasetId, nClusters).then(
        (r) => r.data?.data || r.data
      ),
  })
}

export function useAnomalyDetection() {
  return useMutation({
    mutationFn: ({ datasetId, contamination }) =>
      predictionsApi.anomalies(datasetId, contamination).then(
        (r) => r.data?.data || r.data
      ),
  })
}
