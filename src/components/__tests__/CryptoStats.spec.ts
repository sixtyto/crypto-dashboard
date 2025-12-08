import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CryptoStats from '../CryptoStats.vue'
import { ref } from 'vue'
import * as useCoinDetailsModule from '../../composables/useCoinDetails'

vi.mock('../../composables/useCoinDetails', () => ({
  useCoinDetails: vi.fn()
}))

describe('CryptoStats.vue', () => {
    const mockDetails = ref<any>(null)
    const mockIsFetching = ref(false)

    beforeEach(() => {
        mockDetails.value = null
        mockIsFetching.value = false
        vi.clearAllMocks()

        vi.mocked(useCoinDetailsModule.useCoinDetails).mockReturnValue({
            details: mockDetails,
            isFetching: mockIsFetching,
            error: ref(null)
        })
    })

  it('renders skeleton when loading', () => {
    mockIsFetching.value = true
    const wrapper = mount(CryptoStats, {
      props: { coin: 'BTC' }
    })

    expect(wrapper.findAll('.skeleton').length).toBeGreaterThan(0)
  })

  it('renders stats when loaded', () => {
    mockDetails.value = {
        price: '50000.1234',
        change: '5.5',
        marketCap: '1000000000',
        '24hVolume': '50000000'
    }
    const wrapper = mount(CryptoStats, {
      props: { coin: 'BTC' }
    })

    // Check price formatting
    expect(wrapper.text()).toContain('$50,000.12')

    // Check change
    expect(wrapper.text()).toContain('+5.5%')

    // Check market cap (compact)
    // 1B = 1,000,000,000
    // Intl compact output "$1.0B" with max fraction digits 1
    // Matches $1B or $1.0B depending on environment
    expect(wrapper.text()).toMatch(/\$1(\.0)?B/)
  })

  it('renders negative change correctly', () => {
       mockDetails.value = {
        price: '50000',
        change: '-2.5',
        marketCap: '1000',
        '24hVolume': '500'
    }
    const wrapper = mount(CryptoStats, {
      props: { coin: 'BTC' }
    })

    expect(wrapper.text()).toContain('-2.5%')
    expect(wrapper.find('.text-red').exists()).toBe(true)
  })
})
