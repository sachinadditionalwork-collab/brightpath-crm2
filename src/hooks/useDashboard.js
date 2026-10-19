import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '../services/dashboardService'
import { useAuth } from './useAuth'

export function useDashboard() {
  const { user, profile } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentUser = profile || user

  const loadMetrics = useCallback(() => {
    setIsLoading(true)
    dashboardService
      .fetchDashboardMetrics(currentUser)
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
  }, [currentUser])

  useEffect(() => {
    let isMounted = true

    dashboardService
      .fetchDashboardMetrics(currentUser)
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
      dashboardService.fetchDashboardMetrics(currentUser).then((res) => {
        if (isMounted && res.data) {
          setMetrics(res.data)
        }
      })
    }

    window.addEventListener('brightpath:followups_changed', handleDataChange)
    window.addEventListener('brightpath:activities_changed', handleDataChange)
    window.addEventListener('brightpath:persona_changed', handleDataChange)

    return () => {
      isMounted = false
      window.removeEventListener('brightpath:followups_changed', handleDataChange)
      window.removeEventListener('brightpath:activities_changed', handleDataChange)
      window.removeEventListener('brightpath:persona_changed', handleDataChange)
    }
  }, [currentUser])

  return {
    metrics,
    isLoading,
    error,
    refreshDashboard: loadMetrics,
  }
}
