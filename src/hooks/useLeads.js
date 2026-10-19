import { useState, useEffect } from 'react'
import { leadService } from '../services/leadService'
import { useAuth } from './useAuth'

export function useLeads() {
  const { user, profile } = useAuth()
  const [leads, setLeads] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    source: 'ALL',
    page: 1,
    pageSize: 8,
  })

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 250)
    return () => clearTimeout(handler)
  }, [filters.search])

  useEffect(() => {
    let isMounted = true

    const loadLeads = () => {
      leadService
        .fetchLeads(
          {
            search: debouncedSearch,
            status: filters.status,
            source: filters.source,
            page: filters.page,
            pageSize: filters.pageSize,
          },
          profile || user
        )
        .then((result) => {
          if (isMounted) {
            if (result.error) {
              setError(result.error)
            } else {
              setLeads(result.data)
              setTotalCount(result.count)
            }
            setIsLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Error loading leads')
            setIsLoading(false)
          }
        })
    }

    loadLeads()

    const handlePersonaChange = () => {
      loadLeads()
    }

    window.addEventListener('brightpath:persona_changed', handlePersonaChange)

    return () => {
      isMounted = false
      window.removeEventListener('brightpath:persona_changed', handlePersonaChange)
    }
  }, [debouncedSearch, filters.status, filters.source, filters.page, filters.pageSize, refreshKey, profile, user])

  const setFilter = (key, value) => {
    setIsLoading(true)
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset page to 1 whenever a filter or search changes
      page: key === 'page' ? value : 1,
    }))
  }

  const resetFilters = () => {
    setIsLoading(true)
    setFilters({
      search: '',
      status: 'ALL',
      source: 'ALL',
      page: 1,
      pageSize: 8,
    })
  }

  const refreshLeads = () => {
    setIsLoading(true)
    setRefreshKey((k) => k + 1)
  }

  const createLead = async (leadPayload) => {
    const result = await leadService.createLead(leadPayload, profile || user)
    if (!result.error) {
      refreshLeads()
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error }
  }

  const updateLead = async (leadId, updates) => {
    const result = await leadService.updateLead(leadId, updates, profile || user)
    if (!result.error) {
      refreshLeads()
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error }
  }

  return {
    leads,
    totalCount,
    isLoading,
    error,
    filters,
    setFilter,
    resetFilters,
    createLead,
    updateLead,
    refreshLeads,
  }
}
