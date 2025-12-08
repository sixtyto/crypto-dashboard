// This file is deprecated but kept for backward compatibility if any test still imports from it.
// The list of coins is now fetched dynamically using useCoins composable.

export const COINS = ['BTC', 'ETH', 'SOL'] as const
export type CoinSymbol = string

// These are no longer used in the main application flow
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
