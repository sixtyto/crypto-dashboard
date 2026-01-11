import { ref } from 'vue'

export interface Holding {
  amount: number
  buyPrice: number | null
}

const holdings = ref<Record<string, Holding>>({})
let initialized = false

function initHoldings() {
  if (initialized)
    return

  if (typeof window === 'undefined' || !window.localStorage)
    return

  const newHoldings: Record<string, Holding> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('crypto-holdings-')) {
      const symbol = key.replace('crypto-holdings-', '')
      const val = localStorage.getItem(key)
      if (val) {
        try {
          if (val.startsWith('{')) {
            const data = JSON.parse(val)
            if (typeof data.amount === 'number') {
              newHoldings[symbol] = {
                amount: data.amount,
                buyPrice: data.buyPrice ?? null,
              }
            }
          }
          else {
            const num = Number.parseFloat(val)
            if (!Number.isNaN(num)) {
              newHoldings[symbol] = { amount: num, buyPrice: null }
            }
          }
        }
        catch (error) {
          console.error(`Failed to parse holding for ${symbol}:`, error)
        }
      }
    }
  }
  holdings.value = newHoldings
  initialized = true
}

export function useHoldings() {
  initHoldings()

  function updateHolding(symbol: string, amount: number | null, buyPrice?: number | null) {
    if (amount === null || amount <= 0) {
      if (symbol in holdings.value) {
        delete holdings.value[symbol]
        localStorage.removeItem(`crypto-holdings-${symbol}`)
      }
    }
    else {
      const currentHolding = holdings.value[symbol] || { amount: 0, buyPrice: null }
      const newHolding: Holding = {
        amount,
        buyPrice: buyPrice !== undefined ? buyPrice : currentHolding.buyPrice,
      }
      holdings.value[symbol] = newHolding
      localStorage.setItem(`crypto-holdings-${symbol}`, JSON.stringify(newHolding))
    }
  }

  function updateBuyPrice(symbol: string, buyPrice: number | null) {
    const current = holdings.value[symbol]
    if (current) {
      updateHolding(symbol, current.amount, buyPrice)
    }
  }

  return {
    holdings,
    updateHolding,
    updateBuyPrice,
  }
}

export function resetHoldingsState() {
  holdings.value = {}
  initialized = false
}
