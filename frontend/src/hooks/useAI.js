import { useQuery, useMutation } from '@tanstack/react-query'
import { aiApi } from '../api/ai.js'

export function useInsights(datasetId) {
  return useQuery({
    queryKey: ['ai', 'insights', datasetId],
    queryFn: async () => {
      const res = await aiApi.insights(datasetId)
      return res.data?.data || res.data
    },
    enabled: !!datasetId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useAIChat() {
  return useMutation({
    mutationFn: ({ messages, datasetId }) =>
      aiApi.chat(messages, datasetId).then((r) => r.data?.data || r.data),
  })
}
