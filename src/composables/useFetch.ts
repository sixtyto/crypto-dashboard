import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose, ref, toValue, watch } from 'vue'

interface UseFetchOptions {
  pollingInterval?: number
}

export function useFetch<T>(url: MaybeRefOrGetter<string>, options: UseFetchOptions = {}) {
  const data = ref<T | null>(null)
  const error = ref<any>(null)
  const isFetching = ref(false)
  const lastUpdated = ref<Date | null>(null)

  const fetchData = async () => {
    const urlValue = toValue(url)

    if (!urlValue) {
      return
    }

    isFetching.value = true
    error.value = null

    for (let i = 0; i < 4; i++) {
      try {
        const response = await fetch(urlValue)
        if (!response.ok) {
          const json = await response.json().catch(() => null)
          throw new Error(json?.message || `Error: ${response.status} ${response.statusText}`)
        }
        data.value = await response.json()
        error.value = null
        lastUpdated.value = new Date()
        break
      }
      catch (err) {
        error.value = err
        if (i < 3)
          await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    isFetching.value = false
  }

  let intervalId: ReturnType<typeof setInterval> | null = null

  const startPolling = () => {
    if (options.pollingInterval && options.pollingInterval > 0) {
      intervalId = setInterval(fetchData, options.pollingInterval)
    }
  }

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  watch(() => toValue(url), () => {
    stopPolling()
    fetchData()
    startPolling()
  }, { immediate: true })

  onScopeDispose(() => {
    stopPolling()
  })

  return { data, error, isFetching, lastUpdated, refetch: fetchData }
}
