'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getServices, createService, deleteService, getServiceMetricsSummary } from '@/lib/api'

interface Service {
  id: number
  name: string
  url: string
  interval_seconds: number
  timeout_seconds: number
}

interface ServiceMetrics {
  service_id: number
  service_name: string
  current_status: string
  avg_response_time_ms: number
  p95_response_time_ms: number
  p99_response_time_ms: number
  error_rate_percent: number
  uptime_percent_24h: number
  request_rate_rpm: number
  throughput_rps: number
  apdex_score: number
  checks_count: number
  last_check_timestamp: string
}

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [metrics, setMetrics] = useState<Record<number, ServiceMetrics>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    interval_seconds: 60,
    timeout_seconds: 10,
  })

  const fetchServices = async () => {
    try {
      const data = await getServices()
      setServices(data)

      // Fetch detailed metrics for each service
      for (const service of data) {
        try {
          const metricsData = await getServiceMetricsSummary(service.id)
          setMetrics((prev) => ({ ...prev, [service.id]: metricsData }))
        } catch (error) {
          // Service might not have any checks yet
          console.debug(`No metrics for service ${service.id}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
    const interval = setInterval(fetchServices, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createService(formData)
      setFormData({ name: '', url: '', interval_seconds: 60, timeout_seconds: 10 })
      setShowForm(false)
      fetchServices()
    } catch (error) {
      console.error('Failed to create service:', error)
    }
  }

  const handleDeleteService = async (id: number) => {
    try {
      await deleteService(id)
      fetchServices()
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  const getHealthStatus = (m: ServiceMetrics) => {
    if (m.current_status === 'down') return { color: 'red', label: 'DOWN', icon: '🔴' }
    if (m.error_rate_percent > 5) return { color: 'red', label: 'High Error Rate', icon: '🔴' }
    if (m.apdex_score < 0.8) return { color: 'orange', label: 'Poor Performance', icon: '🟠' }
    if (m.uptime_percent_24h < 95) return { color: 'orange', label: 'Low Uptime', icon: '🟠' }
    if (m.p99_response_time_ms > 2000) return { color: 'yellow', label: 'High Latency', icon: '🟡' }
    return { color: 'green', label: 'Healthy', icon: '🟢' }
  }

  const MetricBadge = ({ label, value, unit, threshold, isPercentage = false }: any) => {
    const numValue = parseFloat(value) || 0
    let bgColor = 'bg-slate-700'
    let textColor = 'text-slate-100'

    if (threshold) {
      if (isPercentage) {
        if (numValue >= threshold) {
          bgColor = 'bg-emerald-600'
          textColor = 'text-emerald-50'
        } else if (numValue >= threshold - 10) {
          bgColor = 'bg-amber-600'
          textColor = 'text-amber-50'
        } else {
          bgColor = 'bg-rose-600'
          textColor = 'text-rose-50'
        }
      } else {
        if (numValue <= threshold) {
          bgColor = 'bg-emerald-600'
          textColor = 'text-emerald-50'
        } else if (numValue <= threshold * 1.5) {
          bgColor = 'bg-amber-600'
          textColor = 'text-amber-50'
        } else {
          bgColor = 'bg-rose-600'
          textColor = 'text-rose-50'
        }
      }
    }

    return (
      <div className={`${bgColor} ${textColor} px-3 py-2 rounded-lg text-sm font-semibold`}>
        <div className="text-xs opacity-80">{label}</div>
        <div className="text-lg font-bold">
          {typeof value === 'number' ? value.toFixed(2) : value}
          <span className="text-xs ml-1 opacity-75">{unit}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold text-slate-100 tracking-tight">HealthTrack</h1>
            <p className="text-slate-400 mt-1">SRE Dashboard • Real-time Service Monitoring with SLO Tracking</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </motion.button>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4 mt-4 text-sm">
          <div className="text-slate-400">Services: <span className="font-bold text-slate-100">{services.length}</span></div>
          <div className="text-slate-400">Healthy: <span className="font-bold text-emerald-400">{services.filter(s => metrics[s.id]?.current_status === 'ok').length}</span></div>
          <div className="text-slate-400">Issues: <span className="font-bold text-rose-400">{services.filter(s => metrics[s.id]?.current_status !== 'ok').length}</span></div>
        </div>
      </motion.div>

      {/* Add Service Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleCreateService}
          className="mb-8 p-6 bg-slate-800 border border-slate-700 rounded-lg space-y-4"
        >
          <input
            type="text"
            placeholder="Service name (e.g., API Gateway)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="url"
            placeholder="Service URL (e.g., https://api.example.com/health)"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Check interval (seconds)"
              value={formData.interval_seconds}
              onChange={(e) => setFormData({ ...formData, interval_seconds: parseInt(e.target.value) })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="number"
              placeholder="Timeout (seconds)"
              value={formData.timeout_seconds}
              onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-slate-800 border border-slate-700 rounded-lg"
        >
          <p className="text-slate-400 mb-4">No services yet. Add one to get started!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {services.map((service, index) => {
            const m = metrics[service.id]
            const health = m ? getHealthStatus(m) : { color: 'gray', label: 'No Data', icon: '⚪' }

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{health.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold text-slate-100">{service.name}</h2>
                        <p className="text-xs text-slate-400 truncate">{service.url}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold`}>
                      {health.label}
                    </span>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Detailed Metrics */}
                {m ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
                    {/* Latency Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <MetricBadge label="Avg Latency" value={m.avg_response_time_ms} unit="ms" threshold={1000} />
                      <MetricBadge label="P95 Latency" value={m.p95_response_time_ms} unit="ms" threshold={1500} />
                      <MetricBadge label="P99 Latency" value={m.p99_response_time_ms} unit="ms" threshold={2000} />
                      <MetricBadge label="Apdex Score" value={m.apdex_score} unit="(0-1)" threshold={0.8} />
                    </div>

                    {/* SRE Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <MetricBadge label="Error Rate" value={m.error_rate_percent} unit="%" threshold={2} isPercentage />
                      <MetricBadge label="Uptime (24h)" value={m.uptime_percent_24h} unit="%" threshold={95} isPercentage />
                      <MetricBadge label="Request Rate" value={m.request_rate_rpm} unit="req/min" />
                      <MetricBadge label="Throughput" value={m.throughput_rps} unit="req/s" />
                    </div>

                    {/* Check Info */}
                    <div className="pt-3 border-t border-slate-600/50 flex items-center justify-between text-xs text-slate-400">
                      <span>{m.checks_count} checks • {new Date(m.last_check_timestamp).toLocaleTimeString()}</span>
                      <a
                        href="http://localhost:3001/d/healthtrack-overview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        View Grafana →
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <p>Waiting for first health check...</p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
