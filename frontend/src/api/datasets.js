import apiClient from './client'

export const datasetsApi = {

  upload: async (file) => {

    const formData =
      new FormData()

    formData.append(
      'file',
      file
    )

    const res =
      await apiClient.post(
        '/upload/dataset',
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      )

    return res.data
  },

  getAll: async () => {

    const res =
      await apiClient.get(
        '/upload/datasets'
      )

    return res.data
  },
}