import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { useFetch } from './useFetch'

export interface CoinRankingHistory {
  price: string
  timestamp: number
}

interface CoinRankingResponse {
  status: string
  data: {
    history: CoinRankingHistory[]
  }
}

export function useCoinHistory(coinUuid: MaybeRefOrGetter<string>, period: MaybeRefOrGetter<string>) {
  const url = computed(() => {
    const uuid = toValue(coinUuid)
    if (!uuid)
      return ''
    return `https://api.coinranking.com/v2/coin/${uuid}/history?timePeriod=${toValue(period)}`
  })

  const { data, error, isFetching, lastUpdated } = useFetch<CoinRankingResponse>(url, {
    pollingInterval: 30000,
  })

  const history = computed(() => {
    if (data.value && data.value.status === 'success') {
      return [...data.value.data.history].reverse()
    }
    return []
  })

  return {
    history,
    error,
    isFetching,
    lastUpdated,
  }
}
