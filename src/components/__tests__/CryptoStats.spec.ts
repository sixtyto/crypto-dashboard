import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import * as useCoinDetailsModule from '../../composables/useCoinDetails'
import CryptoStats from '../CryptoStats.vue'

vi.mock('../../composables/useCoinDetails', () => ({
  useCoinDetails: vi.fn(),
}))

describe('cryptoStats.vue', () => {
  const mockDetails = ref<any>(null)
  const mockIsFetching = ref(false)

  beforeEach(() => {
    mockDetails.value = null
    mockIsFetching.value = false
    vi.clearAllMocks()

    vi.mocked(useCoinDetailsModule.useCoinDetails).mockReturnValue({
      details: mockDetails,
      isFetching: mockIsFetching,
      error: ref(null),
    })
  })

  it('renders skeleton when loading', () => {
    mockIsFetching.value = true
    const wrapper = mount(CryptoStats, {
      props: { coin: 'BTC' },
    })

    expect(wrapper.findAll('.skeleton').length).toBeGreaterThan(0)
  })

  it('renders stats when loaded', () => {
    mockDetails.value = {
      'price': '50000.1234',
      'change': '5.5',
      'marketCap': '1000000000',
      '24hVolume': '50000000',
    }
    const wrapper = mount(CryptoStats, {
      props: { coin: 'BTC' },
    })

    expect(wrapper.text()).toContain('$50,000.12')
    expect(wrapper.text()).toContain('+5.5%')
    expect(wrapper.text()).toContain('$1.0B')
  })

  it('renders negative change correctly', () => {
    mockDetails.value = {
      'price': '50000',
      'change': '-2.5',
      'marketCap': '1000',
      '24hVolume': '500',
    }
    const wrapper = mount(CryptoStats, {
      props: { coin: 'BTC' },
    })

    expect(wrapper.text()).toContain('-2.5%')
    expect(wrapper.find('.text-red').exists()).toBe(true)
  })
})
