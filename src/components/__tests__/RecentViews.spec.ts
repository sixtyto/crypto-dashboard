import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import RecentViews from '../RecentViews.vue'

// Mock useRecentViews
const mockRecentViews = ref<string[]>([])
const mockAddRecentView = vi.fn()

vi.mock('@/composables/useRecentViews', () => ({
  useRecentViews: () => ({
    recentViews: mockRecentViews,
    addRecentView: mockAddRecentView,
  }),
}))

describe('RecentViews', () => {
  const coins = [
    { uuid: '1', symbol: 'BTC', name: 'Bitcoin', iconUrl: 'btc.png' },
    { uuid: '2', symbol: 'ETH', name: 'Ethereum', iconUrl: 'eth.png' },
  ] as any[]

  it('renders nothing when no recent views', () => {
    mockRecentViews.value = []
    const wrapper = mount(RecentViews, {
      props: {
        coins,
        modelValue: 'BTC',
      },
    })

    expect(wrapper.find('.recent-views-container').exists()).toBe(false)
  })

  it('renders chips for recent views', () => {
    mockRecentViews.value = ['BTC', 'ETH']
    const wrapper = mount(RecentViews, {
      props: {
        coins,
        modelValue: 'BTC',
      },
    })

    const chips = wrapper.findAll('.chip')
    expect(chips.length).toBe(2)
    expect(chips[0].text()).toBe('BTC')
    expect(chips[1].text()).toBe('ETH')
  })

  it('highlights the active coin', () => {
    mockRecentViews.value = ['BTC', 'ETH']
    const wrapper = mount(RecentViews, {
      props: {
        coins,
        modelValue: 'BTC',
      },
    })

    const btcChip = wrapper.findAll('.chip')[0]
    expect(btcChip.classes()).toContain('active')
  })

  it('emits update event when clicked', async () => {
    mockRecentViews.value = ['BTC', 'ETH']
    const wrapper = mount(RecentViews, {
      props: {
        coins,
        modelValue: 'BTC',
      },
    })

    const ethChip = wrapper.findAll('.chip')[1]
    await ethChip.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['ETH'])
  })
})
