import { mount } from '@vue/test-utils'
import { Chart } from 'chart.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import * as useCoinHistoryExports from '../../composables/useCoinHistory'
import CryptoChart from '../CryptoChart.vue'

const mockDataTrigger = ref(0)

// Mock Chart.js
vi.mock('chart.js', () => {
  function MockChart() {
    return {
      destroy: vi.fn(),
    }
  }
  const ChartSpy = vi.fn(MockChart)
  ;(ChartSpy as any).register = vi.fn()

  return {
    Chart: ChartSpy,
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    PointElement: vi.fn(),
    LineElement: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
    LineController: vi.fn(),
    Filler: vi.fn(),
    register: vi.fn(),
  }
})

// Mock useTheme
vi.mock('../../composables/useTheme', () => ({
  useTheme: () => ({ theme: ref('light') }),
}))

// Mock getStyle
vi.mock('../../utils/getStyle', () => ({
  getStyle: () => '#000000',
}))

describe('cryptoChart.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDataTrigger.value = 0

    // Mock getContext for Canvas
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
    })) as any

    // Default mock for useCoinHistory
    vi.spyOn(useCoinHistoryExports, 'useCoinHistory').mockImplementation((uuidGetter) => {
      const uuid = typeof uuidGetter === 'function' ? uuidGetter() : uuidGetter
      // Mock specific data based on UUID if needed, or generic
      if (uuid === 'btc-uuid') {
        return {
          history: computed(() => {
            const _ = mockDataTrigger.value
            return [
              { timestamp: 1000, price: '100' },
              { timestamp: 2000, price: '110' }, // +10%
            ]
          }),
          isFetching: ref(false),
          error: ref(null),
          lastUpdated: ref(new Date()),
        } as any
      }
      if (uuid === 'eth-uuid') {
        return {
          history: computed(() => {
            const _ = mockDataTrigger.value
            return [
              { timestamp: 1000, price: '50' },
              { timestamp: 2000, price: '60' }, // +20%
            ]
          }),
          isFetching: ref(false),
          error: ref(null),
          lastUpdated: ref(new Date()),
        } as any
      }
      return {
        history: computed(() => {
          const _ = mockDataTrigger.value
          return []
        }),
        isFetching: ref(false),
        error: ref(null),
        lastUpdated: ref(new Date()),
      } as any
    })
  })

  it('renders chart with single dataset when no comparison is provided', async () => {
    const wrapper = mount(CryptoChart, {
      props: {
        coinName: 'Bitcoin',
        coinUuid: 'btc-uuid',
        period: '24h',
      },
    })

    // Wait for watchers
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(Chart).toHaveBeenCalled()
    const chartConfig = vi.mocked(Chart).mock.calls[0][1] as any

    expect(chartConfig.data.datasets).toHaveLength(1)
    expect(chartConfig.data.datasets[0].label).toBe('Bitcoin')
    expect(chartConfig.data.datasets[0].data).toEqual([100, 110])

    // Y-axis tick callback check (simple check if it exists)
    expect(chartConfig.options.scales.y.ticks.callback).toBeDefined()
  })

  it('renders chart with two datasets and normalized data when comparison is provided', async () => {
    const wrapper = mount(CryptoChart, {
      props: {
        coinName: 'Bitcoin',
        coinUuid: 'btc-uuid',
        comparisonCoinName: 'Ethereum',
        comparisonCoinUuid: 'eth-uuid',
        period: '24h',
      },
    })

    // Wait for watchers
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(Chart).toHaveBeenCalled()
    const chartConfig = vi.mocked(Chart).mock.calls[0][1] as any

    expect(chartConfig.data.datasets).toHaveLength(2)

    // Check Dataset 1 (BTC) - Normalized
    // 100 -> 0%
    // 110 -> ((110-100)/100)*100 = 10%
    expect(chartConfig.data.datasets[0].label).toBe('Bitcoin')
    expect(chartConfig.data.datasets[0].data).toEqual([0, 10])

    // Check Dataset 2 (ETH) - Normalized
    // 50 -> 0%
    // 60 -> ((60-50)/50)*100 = 20%
    expect(chartConfig.data.datasets[1].label).toBe('Ethereum')
    expect(chartConfig.data.datasets[1].data).toEqual([0, 20])
  })

  it('updates chart when props change', async () => {
    const wrapper = mount(CryptoChart, {
      props: {
        coinName: 'Bitcoin',
        coinUuid: 'btc-uuid',
        period: '24h',
      },
    })

    await wrapper.vm.$nextTick()
    expect(Chart).toHaveBeenCalledTimes(1)

    // Update props to trigger re-render
    await wrapper.setProps({ period: '7d' })
    mockDataTrigger.value++
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // Should destroy old chart and create new one
    expect(Chart.mock.calls.length).toBeGreaterThan(1)
  })
})
