import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HoldingsCalculator from '../HoldingsCalculator.vue'

describe('holdingsCalculator', () => {
  const mockProps = {
    currentPrice: '50000',
    coinSymbol: 'BTC',
    isFetching: false,
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(HoldingsCalculator, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Holdings Calculator')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('calculates total value correctly when amount is entered', async () => {
    const wrapper = mount(HoldingsCalculator, {
      props: mockProps,
    })

    const input = wrapper.find('input')
    await input.setValue(2)

    expect(wrapper.text()).toContain('$100,000.00')
  })

  it('handles empty or null amount', async () => {
    const wrapper = mount(HoldingsCalculator, {
      props: mockProps,
    })

    const input = wrapper.find('input')
    await input.setValue('')

    expect(wrapper.text()).toContain('$0.00')
  })

  it('persists amount to localStorage', async () => {
    const wrapper = mount(HoldingsCalculator, {
      props: mockProps,
    })

    const input = wrapper.find('input')
    await input.setValue(1.5)

    expect(localStorage.getItem('crypto-holdings-BTC')).toBe('1.5')
  })

  it('loads amount from localStorage on mount', () => {
    localStorage.setItem('crypto-holdings-BTC', '0.5')

    const wrapper = mount(HoldingsCalculator, {
      props: mockProps,
    })

    const input = wrapper.find<HTMLInputElement>('input')
    expect(input.element.value).toBe('0.5')
    expect(wrapper.text()).toContain('$25,000.00')
  })

  it('updates when coin symbol changes', async () => {
    localStorage.setItem('crypto-holdings-ETH', '10')

    const wrapper = mount(HoldingsCalculator, {
      props: mockProps,
    })

    expect(wrapper.text()).toContain('Amount Owned (BTC)')

    await wrapper.setProps({
      coinSymbol: 'ETH',
      currentPrice: '3000',
    })

    expect(wrapper.text()).toContain('Amount Owned (ETH)')
    const input = wrapper.find<HTMLInputElement>('input')
    expect(input.element.value).toBe('10')
    expect(wrapper.text()).toContain('$30,000.00')
  })

  it('shows skeleton loader when fetching', async () => {
    localStorage.setItem('crypto-holdings-BTC', '1')
    const wrapper = mount(HoldingsCalculator, {
      props: {
        ...mockProps,
        isFetching: true,
      },
    })

    expect(wrapper.find('.skeleton').exists()).toBe(true)
  })
})
