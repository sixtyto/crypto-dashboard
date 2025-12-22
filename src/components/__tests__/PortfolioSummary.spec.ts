import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import PortfolioSummary from '../PortfolioSummary.vue'

// Mock Chart.js
vi.mock('chart.js', () => {
  return {
    Chart: class {
      destroy() {}
      static register() {}
    },
    PieController: {},
    ArcElement: {},
    Tooltip: {},
    Legend: {},
  }
})

// Mock useHoldings
vi.mock('@/composables/useHoldings', () => ({
  useHoldings: () => ({
    holdings: { value: { BTC: 1, ETH: 10 } },
  }),
}))

// Mock useTheme
vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    theme: { value: 'dark', __v_isRef: true },
  }),
}))

// Mock getStyle
vi.mock('@/utils/getStyle', () => ({
  getStyle: () => '#000000',
}))

describe('PortfolioSummary', () => {
  const coins = [
    {
      uuid: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      price: '50000',
      iconUrl: 'btc.png',
      color: '#f7931a',
    },
    {
      uuid: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      price: '3000',
      iconUrl: 'eth.png',
      color: '#3c3c3d',
    },
  ] as any[]

  it('renders correctly with assets', async () => {
    const wrapper = mount(PortfolioSummary, {
      props: { coins },
    })

    await nextTick()

    expect(wrapper.find('.header h3').text()).toBe('Portfolio Summary')
    // Total value: 1*50000 + 10*3000 = 80000
    expect(wrapper.find('.total-value').text()).toContain('$80,000.00')

    const rows = wrapper.findAll('.asset-row')
    expect(rows.length).toBe(2)
    expect(rows[0].text()).toContain('BTC')
    expect(rows[1].text()).toContain('ETH')
  })

  it('calculates individual asset values correctly', () => {
    const wrapper = mount(PortfolioSummary, {
      props: { coins },
    })

    const rows = wrapper.findAll('.asset-row')
    const btcRow = rows.find(r => r.text().includes('BTC'))
    const ethRow = rows.find(r => r.text().includes('ETH'))

    expect(btcRow?.text()).toContain('$50,000.00')
    expect(ethRow?.text()).toContain('$30,000.00')
  })
})
