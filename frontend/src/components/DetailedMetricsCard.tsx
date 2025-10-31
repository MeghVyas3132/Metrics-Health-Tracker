'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface MetricsCardProps {
  serviceId: number
  serviceName: string
  metrics: {
    current_status: string
    avg_response_time_ms: number
    p95_response_time_ms: number
    p99_response_time_ms: number
    error_rate_percent: number
    uptime_percent_24h: number
    request_rate_rpm: number
    throughput_rps: number
    apdex_score: number
    last_check_timestamp: string
  }
  onDelete: () => void
}

export default function DetailedMetricsCard({
  serviceId,
  serviceName,
  metrics,
  onDelete,
}: MetricsCardProps) {
  // Determine health status based on SRE metrics
  const getHealthStatus = () => {
    if (metrics.current_status === 'down') return { color: 'red', label: 'DOWN', severity: 'critical' }
    if (metrics.error_rate_percent > 5) return { color: 'red', label: 'High Error Rate', severity: 'critical' }
    if (metrics.apdex_score < 0.8) return { color: 'orange', label: 'Poor Performance', severity: 'warning' }
    if (metrics.uptime_percent_24h < 95) return { color: 'orange', label: 'Low Uptime', severity: 'warning' }
    if (metrics.p99_response_time_ms > 2000) return { color: 'yellow', label: 'High P99 Latency', severity: 'caution' }
    return { color: 'green', label: 'Healthy', severity: 'ok' }
  }

  const health = getHealthStatus()

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'border-l-4 border-l-green-500 bg-green-950/30 text-green-300',
      yellow: 'border-l-4 border-l-yellow-500 bg-yellow-950/30 text-yellow-300',
      orange: 'border-l-4 border-l-orange-500 bg-orange-950/30 text-orange-300',
      red: 'border-l-4 border-l-red-500 bg-red-950/30 text-red-300',
    }
    return colors[color] || colors.green
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const MetricBadge = ({ label, value, unit, threshold, isPercentage = false }: any) => {
    const numValue = parseFloat(value) || 0
    let bgColor = 'bg-slate-700'
    let textColor = 'text-slate-100'

    if (threshold) {
      if (isPercentage) {
        if (numValue >= threshold) {
          bgColor = 'bg-green-600'
          textColor = 'text-green-50'
        } else if (numValue >= threshold - 10) {
          bgColor = 'bg-yellow-600'
          textColor = 'text-yellow-50'
        } else {
          bgColor = 'bg-red-600'
          textColor = 'text-red-50'
        }
      } else {
        if (numValue <= threshold) {
          bgColor = 'bg-green-600'
          textColor = 'text-green-50'
        } else if (numValue <= threshold * 1.5) {
          bgColor = 'bg-yellow-600'
          textColor = 'text-yellow-50'
        } else {
          bgColor = 'bg-red-600'
          textColor = 'text-red-50'
        }
      }
    }

    return (
      <div className={`${bgColor} ${textColor} px-3 py-2 rounded-lg text-sm font-semibold`}>
        <div className="text-xs opacity-80">{label}</div>
        <div className="text-lg">
          {typeof value === 'number' ? value.toFixed(2) : value}
          <span className="text-xs ml-1">{unit}</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`card ${getStatusColor(health.color)} rounded-lg p-6 space-y-4`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-50">{serviceName}</h3>
          <p className="text-xs text-slate-400 mt-1">{formatTime(metrics.last_check_timestamp)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold`}>
            {health.label}
          </span>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricBadge
          label="Avg Latency"
          value={metrics.avg_response_time_ms}
          unit="ms"
          threshold={1000}
        />
        <MetricBadge
          label="P95 Latency"
          value={metrics.p95_response_time_ms}
          unit="ms"
          threshold={1500}
        />
        <MetricBadge
          label="P99 Latency"
          value={metrics.p99_response_time_ms}
          unit="ms"
          threshold={2000}
        />
        <MetricBadge
          label="Apdex Score"
          value={metrics.apdex_score}
          unit="(0-1)"
          threshold={0.8}
        />
      </div>

      {/* SRE Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricBadge
          label="Error Rate"
          value={metrics.error_rate_percent}
          unit="%"
          threshold={2}
          isPercentage={true}
        />
        <MetricBadge
          label="Uptime (24h)"
          value={metrics.uptime_percent_24h}
          unit="%"
          threshold={95}
          isPercentage={true}
        />
        <MetricBadge
          label="Request Rate"
          value={metrics.request_rate_rpm}
          unit="req/min"
        />
        <MetricBadge
          label="Throughput"
          value={metrics.throughput_rps}
          unit="req/s"
        />
      </div>

      {/* Status Indicators */}
      <div className="pt-3 border-t border-slate-600/50">
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-2">
            {metrics.current_status === 'ok' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>Status: {metrics.current_status.toUpperCase()}</span>
          </div>
          {metrics.apdex_score > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Apdex: {(metrics.apdex_score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Grafana Link */}
      <motion.a
        whileHover={{ scale: 1.02 }}
        href={`http://localhost:3000/grafana?service=${serviceId}`}
        className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-colors"
      >
        View Grafana Dashboard →
      </motion.a>
    </motion.div>
  )
}
