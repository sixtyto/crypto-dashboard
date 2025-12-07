import type { MaybeRefOrGetter } from 'vue'
import { ref, toValue, watch } from 'vue'

export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null)
  const error = ref<any>(null)
  const isFetching = ref(false)

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

  watch(() => toValue(url), () => {
    fetchData()
  }, { immediate: true })

  return { data, error, isFetching, refetch: fetchData }
}
