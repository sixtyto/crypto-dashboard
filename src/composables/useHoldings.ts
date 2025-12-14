import { ref } from 'vue'

const holdings = ref<Record<string, number>>({})
let initialized = false

function initHoldings() {
  if (initialized)
    return

  if (typeof window === 'undefined' || !window.localStorage)
    return

  const newHoldings: Record<string, number> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('crypto-holdings-')) {
      const symbol = key.replace('crypto-holdings-', '')
      const val = localStorage.getItem(key)
      if (val) {
        const num = Number.parseFloat(val)
        if (!Number.isNaN(num)) {
          newHoldings[symbol] = num
        }
      }
    }
  }
  holdings.value = newHoldings
  initialized = true
}

export function useHoldings() {
  initHoldings()

  function updateHolding(symbol: string, amount: number | null) {
    if (amount === null || amount <= 0) {
      if (symbol in holdings.value) {
        delete holdings.value[symbol]
        localStorage.removeItem(`crypto-holdings-${symbol}`)
      }
    }
    else {
      holdings.value[symbol] = amount
      localStorage.setItem(`crypto-holdings-${symbol}`, amount.toString())
    }
  }

  return {
    holdings,
    updateHolding,
  }
}

export function resetHoldingsState() {
  holdings.value = {}
  initialized = false
}
