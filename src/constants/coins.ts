export const COINS = ['BTC', 'ETH', 'SOL'] as const
export type CoinSymbol = string

export const COIN_MAP: Record<string, string> = {
  BTC: 'Qwsogvtv82FCd',
  ETH: 'razxDUgYGNAdQ',
  SOL: 'zNZHO_Sjf',
}

export const COIN_OPTIONS: { value: string, label: string }[] = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'SOL', label: 'Solana (SOL)' },
]
