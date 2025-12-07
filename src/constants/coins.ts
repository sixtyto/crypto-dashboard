export const COINS = ['BTC', 'ETH', 'SOL'] as const
export type CoinSymbol = typeof COINS[number]

export const COIN_MAP: Record<CoinSymbol, string> = {
  BTC: 'Qwsogvtv82FCd',
  ETH: 'razxDUgYGNAdQ',
  SOL: 'zNZHO_Sjf',
}
