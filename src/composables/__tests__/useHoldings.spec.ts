import { beforeEach, describe, expect, it } from 'vitest'
import { useHoldings } from '../useHoldings'

describe('useHoldings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('updates holdings and localStorage', () => {
    const { holdings, updateHolding } = useHoldings()

    updateHolding('BTC', 1.5)

    expect(holdings.value.BTC).toBe(1.5)
    expect(localStorage.getItem('crypto-holdings-BTC')).toBe('1.5')
  })

  it('removes holding when amount is null or zero', () => {
    const { holdings, updateHolding } = useHoldings()

    updateHolding('ETH', 10)
    expect(holdings.value.ETH).toBe(10)

    updateHolding('ETH', 0)
    expect(holdings.value.ETH).toBeUndefined()
    expect(localStorage.getItem('crypto-holdings-ETH')).toBeNull()

    updateHolding('LTC', 5)
    updateHolding('LTC', null)
    expect(holdings.value.LTC).toBeUndefined()
    expect(localStorage.getItem('crypto-holdings-LTC')).toBeNull()
  })
})
