import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { useFetch } from './useFetch'

export interface CoinDetails {
  'price': string
  'change': string
  'marketCap': string
  '24hVolume': string
}

interface CoinRankingCoinResponse {
  status: string
  data: {
    coin: CoinDetails
  }
}

export function useCoinDetails(coinUuid: MaybeRefOrGetter<string>) {
  const url = computed(() => {
    const uuid = toValue(coinUuid)
    if (!uuid)
      return ''
    return `https://api.coinranking.com/v2/coin/${uuid}`
  })

  const { data, error, isFetching, lastUpdated } = useFetch<CoinRankingCoinResponse>(url, {
    pollingInterval: 30000,
  })

  const details = computed(() => {
    if (data.value && data.value.status === 'success') {
      return data.value.data.coin
    }
    return null
  })

  return {
    details,
    error,
    isFetching,
    lastUpdated,
  }
}
