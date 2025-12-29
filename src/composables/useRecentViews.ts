import { ref, watch } from 'vue'

const MAX_RECENT_VIEWS = 5
const STORAGE_KEY = 'crypto-recent-views'

const recentViews = ref<string[]>([])
let initialized = false

function initRecentViews() {
  if (initialized)
    return

  if (typeof window === 'undefined' || !window.localStorage)
    return

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      recentViews.value = JSON.parse(saved)
    }
    catch (e) {
      console.error('Failed to parse recent views', e)
    }
  }
  initialized = true
}

export function useRecentViews() {
  initRecentViews()

  watch(recentViews, (newViews) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newViews))
  }, { deep: true })

  function addRecentView(symbol: string) {
    if (!symbol)
      return

    // Remove if already exists to move it to the front
    const existingIndex = recentViews.value.indexOf(symbol)
    if (existingIndex > -1) {
      recentViews.value.splice(existingIndex, 1)
    }

    recentViews.value.unshift(symbol)

    if (recentViews.value.length > MAX_RECENT_VIEWS) {
      recentViews.value.pop()
    }
  }

  return {
    recentViews,
    addRecentView,
  }
}
