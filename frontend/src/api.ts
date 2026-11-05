import axios from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rpa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const apiError = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.detail || 'Request failed. Please try again.' : 'Unexpected error. Please try again.'
