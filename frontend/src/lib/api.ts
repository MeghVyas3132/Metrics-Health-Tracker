import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getServices = async () => {
  const response = await api.get('/services')
  return response.data
}

export const createService = async (data: {
  name: string
  url: string
  interval_seconds: number
  timeout_seconds: number
}) => {
  const response = await api.post('/services', data)
  return response.data
}

export const deleteService = async (id: number) => {
  await api.delete(`/services/${id}`)
}

export const getServiceChecks = async (id: number, limit: number = 50) => {
  const response = await api.get(`/services/${id}/checks`, { params: { limit } })
  return response.data
}

export const getDetailedChecks = async (id: number, limit: number = 10) => {
  const response = await api.get(`/services/${id}/checks-detailed`, { params: { limit } })
  return response.data
}

export const getServiceMetricsSummary = async (id: number) => {
  const response = await api.get(`/services/${id}/metrics-summary`)
  return response.data
}

export const getMetrics = async () => {
  const response = await api.get('/metrics')
  return response.data
}

export default api
