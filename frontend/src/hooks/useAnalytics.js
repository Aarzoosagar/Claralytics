import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analytics.js'

export function useAnalyticsSummary(datasetId) {
  return useQuery({
    queryKey: ['analytics', 'summary', datasetId],
    queryFn: async () => {
      const res = await analyticsApi.summary(datasetId)
      return res?.data?.data ?? {}
    },
    enabled: !!datasetId,
  })
}

export function useCorrelations(datasetId) {
  return useQuery({
    queryKey: ['analytics', 'correlations', datasetId],
    queryFn: async () => {
      const res = await analyticsApi.correlations(datasetId)
      return res.data?.data || res.data
    },
    enabled: !!datasetId,
  })
}

export function useOutliers(datasetId) {
  return useQuery({
    queryKey: ['analytics', 'outliers', datasetId],
    queryFn: async () => {
      const res = await analyticsApi.outliers(datasetId)
      return res.data?.data || res.data
    },
    enabled: !!datasetId,
  })
}

export function useQuality(datasetId) {
  return useQuery({
    queryKey: ['analytics', 'quality', datasetId],
    queryFn: async () => {
      const res = await analyticsApi.quality(datasetId)
      return res.data?.data || res.data
    },
    enabled: !!datasetId,
  })
}

export function useKpis(datasetId) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', datasetId],
    queryFn: async () => {
      const res = await analyticsApi.kpis(datasetId)
      return res.data?.data || res.data
    },
    enabled: !!datasetId,
  })
}

export function useTrends(datasetId) {
  return useQuery({
    queryKey: ['dashboard', 'trends', datasetId],
    queryFn: async () => {
      const res = await analyticsApi.trends(datasetId)
      return res?.data?.data ?? {}
    },
    enabled: !!datasetId,
  })
}

export function useDashboardMetrics(datasetId) {
  return useQuery({
    queryKey: ['dashboard', 'metrics', datasetId],
    queryFn: async () => {
      const res = await analyticsApi.metrics(datasetId)
      return res?.data?.data ?? {}
    },
    enabled: !!datasetId,
  })
}
