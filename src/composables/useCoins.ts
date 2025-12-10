import { computed } from 'vue'
import { useFetch } from './useFetch'

export interface Coin {
  uuid: string
  symbol: string
  name: string
  color: string | null
  iconUrl: string
  marketCap: string
  price: string
  listedAt: number
  tier: number
  change: string
  rank: number
}

interface CoinsResponse {
  status: string
  data: {
    coins: Coin[]
  }
}

export function useCoins() {
  const url = 'https://api.coinranking.com/v2/coins?limit=50'
  const { data, error, isFetching } = useFetch<CoinsResponse>(url)

  const coins = computed(() => {
    if (data.value && data.value.status === 'success') {
      return data.value.data.coins
    }
    return []
  })

  return {
    coins,
    error,
    isFetching,
  }
}
