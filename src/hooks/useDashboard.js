import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '../services/dashboardService'

export function useDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMetrics = useCallback(() => {
    setIsLoading(true)
    dashboardService
      .fetchDashboardMetrics()
      .then((res) => {
        if (res.error) {
          setError(res.error)
        } else {
          setMetrics(res.data)
        }
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Error loading dashboard metrics.')
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    let isMounted = true

    dashboardService
      .fetchDashboardMetrics()
      .then((res) => {
        if (isMounted) {
          if (res.error) setError(res.error)
          else setMetrics(res.data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error loading dashboard metrics.')
          setIsLoading(false)
        }
      })

    const handleDataChange = () => {
      dashboardService.fetchDashboardMetrics().then((res) => {
        if (isMounted && res.data) {
          setMetrics(res.data)
        }
      })
    }

    window.addEventListener('brightpath:followups_changed', handleDataChange)
    window.addEventListener('brightpath:activities_changed', handleDataChange)

    return () => {
      isMounted = false
      window.removeEventListener('brightpath:followups_changed', handleDataChange)
      window.removeEventListener('brightpath:activities_changed', handleDataChange)
    }
  }, [])

  return {
    metrics,
    isLoading,
    error,
    refreshDashboard: loadMetrics,
  }
}
