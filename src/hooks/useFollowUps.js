import { useState, useEffect } from 'react'
import { followUpService } from '../services/followUpService'
import { useAuth } from './useAuth'

// Date classification helpers
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function useFollowUps(leadId = null) {
  const { user, profile } = useAuth()
  const [allFollowUps, setAllFollowUps] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('OVERDUE')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadData = () => {
      followUpService.fetchFollowUps({ leadId }, profile || user)
        .then((result) => {
          if (isMounted) {
            if (result.error) {
              setError(result.error)
            } else {
              setAllFollowUps(result.data)
            }
            setIsLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Error loading follow-ups')
            setIsLoading(false)
          }
        })
    }

    loadData()

    const handleExternalChange = () => {
      loadData()
    }

    window.addEventListener('brightpath:followups_changed', handleExternalChange)
    window.addEventListener('brightpath:persona_changed', handleExternalChange)

    return () => {
      isMounted = false
      window.removeEventListener('brightpath:followups_changed', handleExternalChange)
      window.removeEventListener('brightpath:persona_changed', handleExternalChange)
    }
  }, [leadId, refreshKey, profile, user])

  const refreshFollowUps = () => {
    setIsLoading(true)
    setRefreshKey((k) => k + 1)
  }

  // Categorize follow-ups based on due_at & status
  const now = new Date()

  const overdueList = allFollowUps.filter(
    (item) => item.status === 'pending' && new Date(item.due_at) < now
  )

  const todayList = allFollowUps.filter(
    (item) =>
      item.status === 'pending' &&
      isSameDay(new Date(item.due_at), now) &&
      new Date(item.due_at) >= now
  )

  const upcomingList = allFollowUps.filter(
    (item) =>
      item.status === 'pending' &&
      new Date(item.due_at) >= now &&
      !isSameDay(new Date(item.due_at), now)
  )

  const completedList = allFollowUps.filter((item) => item.status === 'completed')

  const counts = {
    overdue: overdueList.length,
    today: todayList.length,
    upcoming: upcomingList.length,
    completed: completedList.length,
  }

  const getActiveTabList = () => {
    switch (activeTab) {
      case 'OVERDUE':
        return overdueList
      case 'TODAY':
        return todayList
      case 'UPCOMING':
        return upcomingList
      case 'COMPLETED':
        return completedList
      default:
        return overdueList
    }
  }

  const scheduleFollowUp = async (payload) => {
    const result = await followUpService.createFollowUp(payload, profile || user)
    if (!result.error) {
      refreshFollowUps()
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error }
  }

  const completeFollowUp = async (id) => {
    const result = await followUpService.completeFollowUp(id, profile || user)
    if (!result.error) {
      refreshFollowUps()
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error }
  }

  const cancelFollowUp = async (id) => {
    const result = await followUpService.cancelFollowUp(id)
    if (!result.error) {
      refreshFollowUps()
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error }
  }

  return {
    allFollowUps,
    activeList: getActiveTabList(),
    counts,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    scheduleFollowUp,
    completeFollowUp,
    cancelFollowUp,
    refreshFollowUps,
  }
}
