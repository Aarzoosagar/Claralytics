import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { datasetsApi } from '../api/datasets.js'
import { useAppStore } from '../store/appStore.js'
import { useEffect } from 'react'

export function useDatasets() {
  const setDatasets = useAppStore((s) => s.setDatasets)

  const query = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const res = await datasetsApi.getAll()
      return res.data || []
    },
  })

  useEffect(() => {
    if (query.data) setDatasets(query.data)
  }, [query.data, setDatasets])

  return query
}

export function useUploadDataset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, onProgress }) =>
      datasetsApi.upload(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}

export function useDeleteDataset() {
  const queryClient = useQueryClient()
  const setActiveDataset = useAppStore((s) => s.setActiveDataset)
  const activeDatasetId = useAppStore((s) => s.activeDatasetId)

  return useMutation({
    mutationFn: (id) => datasetsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      if (activeDatasetId === id) setActiveDataset(null)
    },
  })
}
