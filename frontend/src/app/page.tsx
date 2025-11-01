'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, BarChart3, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [grafanaUrl, setGrafanaUrl] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    interval_seconds: 60,
    timeout_seconds: 10,
  })

  // Use NEXT_PUBLIC_GRAFANA_URL from env (or fallback to localhost)
  const grafanaBaseUrl = 'http://localhost:3001'

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
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(id)
        fetchServices()
      } catch (error) {
        console.error('Failed to delete service:', error)
      }
    }
  }

  const getHealthStatus = (m: ServiceMetrics) => {
    if (m.current_status === 'down') return { color: 'emerald', label: 'DOWN', icon: '🔴', bgGradient: 'from-rose-950 to-rose-900' }
    if (m.error_rate_percent > 5) return { color: 'emerald', label: 'High Error', icon: '🔴', bgGradient: 'from-rose-950 to-rose-900' }
    if (m.apdex_score < 0.8) return { color: 'emerald', label: 'Degraded', icon: '🟠', bgGradient: 'from-amber-950 to-amber-900' }
    if (m.uptime_percent_24h < 95) return { color: 'emerald', label: 'Low Uptime', icon: '🟠', bgGradient: 'from-amber-950 to-amber-900' }
    if (m.p99_response_time_ms > 2000) return { color: 'emerald', label: 'Slow', icon: '🟡', bgGradient: 'from-yellow-950 to-yellow-900' }
    return { color: 'emerald', label: 'Healthy', icon: '🟢', bgGradient: 'from-emerald-950 to-emerald-900' }
  }

  const MetricBadge = ({ label, value, unit, threshold, isPercentage = false }: any) => {
    const numValue = parseFloat(value) || 0
    let bgColor = 'bg-slate-700'
    let textColor = 'text-slate-50'
    let borderColor = 'border-slate-600'

    if (threshold) {
      if (isPercentage) {
        if (numValue >= threshold) {
          bgColor = 'bg-emerald-600/20'
          textColor = 'text-emerald-100'
          borderColor = 'border-emerald-500/30'
        } else if (numValue >= threshold - 10) {
          bgColor = 'bg-amber-600/20'
          textColor = 'text-amber-100'
          borderColor = 'border-amber-500/30'
        } else {
          bgColor = 'bg-rose-600/20'
          textColor = 'text-rose-100'
          borderColor = 'border-rose-500/30'
        }
      } else {
        if (numValue <= threshold) {
          bgColor = 'bg-emerald-600/20'
          textColor = 'text-emerald-100'
          borderColor = 'border-emerald-500/30'
        } else if (numValue <= threshold * 1.5) {
          bgColor = 'bg-amber-600/20'
          textColor = 'text-amber-100'
          borderColor = 'border-amber-500/30'
        } else {
          bgColor = 'bg-rose-600/20'
          textColor = 'text-rose-100'
          borderColor = 'border-rose-500/30'
        }
      }
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`${bgColor} ${textColor} border ${borderColor} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg`}
      >
        <div className="text-xs opacity-70 mb-1">{label}</div>
        <div className="text-lg font-bold">
          {typeof value === 'number' ? value.toFixed(2) : value}
          <span className="text-xs ml-1 opacity-60">{unit}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.05em' }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight"
            >
              HealthTrack
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 mt-2"
            >
              SRE Dashboard • Real-time Service Monitoring with SLO Tracking
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium shadow-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Service
            </motion.button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-6 text-sm mt-4">
          <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-lg">
            <span className="text-slate-400">Services:</span>
            <span className="font-bold text-slate-100 ml-2">{services.length}</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-lg">
            <span className="text-slate-400">Healthy:</span>
            <span className="font-bold text-emerald-400 ml-2">{services.filter(s => metrics[s.id]?.current_status === 'ok').length}</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-lg">
            <span className="text-slate-400">Issues:</span>
            <span className="font-bold text-rose-400 ml-2">{services.filter(s => metrics[s.id]?.current_status !== 'ok').length}</span>
          </div>
        </div>
      </motion.div>

      {/* Add Service Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleCreateService}
            className="mb-8 p-6 bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/50 rounded-lg space-y-4 backdrop-blur-sm"
          >
            <input
              type="text"
              placeholder="Service name (e.g., API Gateway)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
            />
            <input
              type="url"
              placeholder="Service URL (e.g., https://api.example.com/health)"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Check interval (seconds)"
                value={formData.interval_seconds}
                onChange={(e) => setFormData({ ...formData, interval_seconds: parseInt(e.target.value) })}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Timeout (seconds)"
                value={formData.timeout_seconds}
                onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
              >
                Create Service
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-medium transition-all duration-300"
              >
                Cancel
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Service-specific Grafana Modal */}
      <AnimatePresence>
        {selectedServiceId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedServiceId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-850">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-slate-100">
                    Grafana Dashboard • {services.find(s => s.id === selectedServiceId)?.name}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedServiceId(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </motion.button>
              </div>

              {/* Grafana Iframe */}
              <div className="flex-1 overflow-hidden">
                {grafanaUrl ? (
                  <iframe
                    src={grafanaUrl}
                    className="w-full h-full border-none"
                    title="Grafana Dashboard"
                    onError={() => {
                      alert('Could not load Grafana dashboard. Make sure Grafana is reachable at: ' + grafanaUrl)
                    }}
                  />
                ) : (
                  <div className="p-6 text-center text-slate-300">
                    Set <code>NEXT_PUBLIC_GRAFANA_URL</code> in your environment to embed Grafana dashboards.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-850 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  💡 Tip: View full dashboard at <span className="text-blue-400">{grafanaUrl}</span>
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedServiceId(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-medium transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services Grid */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-64"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full"
          />
        </motion.div>
      ) : services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-gradient-to-br from-slate-800/50 to-slate-850/50 border border-slate-700/30 rounded-lg backdrop-blur-sm"
        >
          <p className="text-slate-400 text-lg mb-4">No services yet. Add one to get started!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-block transition-colors"
          >
            Create First Service
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => {
            const m = metrics[service.id]
            const health = m ? getHealthStatus(m) : { color: 'slate', label: 'No Data', icon: '⚪', bgGradient: 'from-slate-950 to-slate-900' }

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
                className={`bg-gradient-to-br ${health.bgGradient} border border-slate-700/50 rounded-lg p-6 hover:border-slate-600/80 transition-all duration-300 group hover:shadow-xl hover:shadow-slate-900/50`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-2xl"
                      >
                        {health.icon}
                      </motion.span>
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-slate-100 truncate">{service.name}</h2>
                        <p className="text-xs text-slate-400 truncate">{service.url}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-100">{health.label}</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        // Build Grafana URL for this service
                        const url = `${grafanaBaseUrl}/d/healthtrack-overview?var-service=${encodeURIComponent(service.name)}&refresh=10s&kiosk=tv`
                        setGrafanaUrl(url)
                        setSelectedServiceId(service.id)
                      }}
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                      title="View Grafana dashboard"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                      title="Delete service"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Detailed Metrics */}
                {m ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    {/* Latency Metrics */}
                    <div>
                      <p className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Latency Metrics</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MetricBadge label="Avg Latency" value={m.avg_response_time_ms} unit="ms" threshold={1000} />
                        <MetricBadge label="P95 Latency" value={m.p95_response_time_ms} unit="ms" threshold={1500} />
                        <MetricBadge label="P99 Latency" value={m.p99_response_time_ms} unit="ms" threshold={2000} />
                        <MetricBadge label="Apdex Score" value={m.apdex_score} unit="(0-1)" threshold={0.8} />
                      </div>
                    </div>

                    {/* SRE Metrics */}
                    <div>
                      <p className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">SRE Metrics</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MetricBadge label="Error Rate" value={m.error_rate_percent} unit="%" threshold={2} isPercentage />
                        <MetricBadge label="Uptime (24h)" value={m.uptime_percent_24h} unit="%" threshold={95} isPercentage />
                        <MetricBadge label="Request Rate" value={m.request_rate_rpm} unit="req/min" />
                        <MetricBadge label="Throughput" value={m.throughput_rps} unit="req/s" />
                      </div>
                    </div>

                    {/* Check Info */}
                    <div className="pt-3 border-t border-slate-600/30 flex items-center justify-between text-xs text-slate-400">
                      <span>{m.checks_count} checks • {new Date(m.last_check_timestamp).toLocaleTimeString()}</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="py-8 text-center text-slate-400 text-sm"
                  >
                    ⏳ Waiting for first health check...
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
