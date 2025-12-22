import { ref, watch } from 'vue'

export interface PriceAlert {
  id: string
  coinSymbol: string
  targetPrice: number
  condition: 'above' | 'below'
  isActive: boolean
}

const alerts = ref<PriceAlert[]>([])
let initialized = false

function initAlerts() {
  if (initialized)
    return

  if (typeof window === 'undefined' || !window.localStorage)
    return

  const savedAlerts = localStorage.getItem('crypto-price-alerts')
  if (savedAlerts) {
    try {
      alerts.value = JSON.parse(savedAlerts)
    }
    catch (e) {
      console.error('Failed to parse price alerts', e)
    }
  }
  initialized = true
}

export function usePriceAlerts() {
  initAlerts()

  watch(alerts, (newAlerts) => {
    localStorage.setItem('crypto-price-alerts', JSON.stringify(newAlerts))
  }, { deep: true })

  function addAlert(coinSymbol: string, targetPrice: number, condition: 'above' | 'below') {
    const newAlert: PriceAlert = {
      id: crypto.randomUUID(),
      coinSymbol,
      targetPrice,
      condition,
      isActive: true,
    }
    alerts.value.push(newAlert)
  }

  function removeAlert(id: string) {
    alerts.value = alerts.value.filter(a => a.id !== id)
  }

  function toggleAlert(id: string) {
    const alert = alerts.value.find(a => a.id === id)
    if (alert) {
      alert.isActive = !alert.isActive
    }
  }

  function checkAlerts(currentPrices: Record<string, number>): string[] {
    const triggered: string[] = []
    alerts.value.forEach((alert) => {
      if (!alert.isActive)
        return

      const price = currentPrices[alert.coinSymbol]
      if (price === undefined)
        return

      if (alert.condition === 'above' && price >= alert.targetPrice) {
        triggered.push(alert.id)
      }
      else if (alert.condition === 'below' && price <= alert.targetPrice) {
        triggered.push(alert.id)
      }
    })
    return triggered
  }

  return {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    checkAlerts,
  }
}
