import type { Ref } from 'vue'
import { computed } from 'vue'
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

const coinMap: Record<string, string> = {
  BTC: 'Qwsogvtv82FCd',
  ETH: 'razxDUgYGNAdQ',
  SOL: 'zNZHO_Sjf',
}

export function useCoinHistory(coin: Ref<string>) {
  const uuid = computed(() => {
    const symbol = coin.value.toUpperCase()
    return coinMap[symbol]
  })

  const url = computed(() => {
    if (!uuid.value)
      return ''
    return `https://api.coinranking.com/v2/coin/${uuid.value}/history?timePeriod=7d`
  })

  const { data, error, isFetching } = useFetch<CoinRankingResponse>(url)

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
  }
}
