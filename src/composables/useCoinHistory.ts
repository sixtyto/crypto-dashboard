import type { MaybeRefOrGetter } from 'vue'
import type { CoinSymbol } from '../constants/coins'
import { computed, toValue } from 'vue'
import { COIN_MAP } from '../constants/coins'
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

export function useCoinHistory(coin: MaybeRefOrGetter<CoinSymbol>, period: MaybeRefOrGetter<string>) {
  const uuid = computed(() => COIN_MAP[toValue(coin)])

  const url = computed(() => {
    if (!uuid.value)
      return ''
    return `https://api.coinranking.com/v2/coin/${uuid.value}/history?timePeriod=${toValue(period)}`
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
