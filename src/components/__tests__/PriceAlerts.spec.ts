import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import PriceAlerts from '../PriceAlerts.vue'

// Mock usePriceAlerts
const mockAlerts = ref<any[]>([])
const mockAddAlert = vi.fn()
const mockRemoveAlert = vi.fn()

vi.mock('@/composables/usePriceAlerts', () => ({
  usePriceAlerts: () => ({
    alerts: mockAlerts,
    addAlert: mockAddAlert,
    removeAlert: mockRemoveAlert,
  }),
}))

describe('PriceAlerts', () => {
  const defaultProps = {
    coinSymbol: 'BTC',
    currentPrice: '50000',
    coins: [],
  }

  it('renders correctly', () => {
    const wrapper = mount(PriceAlerts, {
      props: defaultProps,
    })

    expect(wrapper.find('h3').text()).toBe('Price Alerts (BTC)')
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('.add-btn').exists()).toBe(true)
  })

  it('adds an alert when button is clicked', async () => {
    const wrapper = mount(PriceAlerts, {
      props: defaultProps,
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(55000)
    await wrapper.find('.add-btn').trigger('click')

    expect(mockAddAlert).toHaveBeenCalledWith('BTC', 55000, 'above')
  })

  it('displays existing alerts', async () => {
    mockAlerts.value = [
      { id: '1', coinSymbol: 'BTC', targetPrice: 60000, condition: 'above', isActive: true },
    ]

    const wrapper = mount(PriceAlerts, {
      props: defaultProps,
    })

    expect(wrapper.findAll('.alert-item').length).toBe(1)
    expect(wrapper.find('.target-price').text()).toBe('$60,000.00')
  })

  it('shows triggered status when condition is met', async () => {
    mockAlerts.value = [
      { id: '1', coinSymbol: 'BTC', targetPrice: 40000, condition: 'above', isActive: true },
    ]

    const wrapper = mount(PriceAlerts, {
      props: { ...defaultProps, currentPrice: '50000' }, // Price is above target
    })

    expect(wrapper.find('.alert-item').classes()).toContain('triggered')
    expect(wrapper.find('.status-badge').exists()).toBe(true)
  })

  it('removes alert when delete button is clicked', async () => {
    mockAlerts.value = [
      { id: '1', coinSymbol: 'BTC', targetPrice: 60000, condition: 'above', isActive: true },
    ]

    const wrapper = mount(PriceAlerts, {
      props: defaultProps,
    })

    await wrapper.find('.delete-btn').trigger('click')
    expect(mockRemoveAlert).toHaveBeenCalledWith('1')
  })
})
