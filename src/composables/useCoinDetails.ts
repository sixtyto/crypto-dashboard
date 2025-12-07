import type { MaybeRefOrGetter } from 'vue'
import type { CoinSymbol } from '../constants/coins'
import { computed, toValue } from 'vue'
import { COIN_MAP } from '../constants/coins'
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

export function useCoinDetails(coin: MaybeRefOrGetter<CoinSymbol>) {
  const uuid = computed(() =>
    COIN_MAP[toValue(coin)],
  )

  const url = computed(() => {
    if (!uuid.value)
      return ''
    return `https://api.coinranking.com/v2/coin/${uuid.value}`
  })

  const { data, error, isFetching } = useFetch<CoinRankingCoinResponse>(url)

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
  }
}
