import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CryptoStats from '../CryptoStats.vue'

describe('CryptoStats.vue', () => {
  it('renders skeleton when loading', () => {
    const wrapper = mount(CryptoStats, {
      props: {
        details: null,
        isFetching: true
      }
    })

    expect(wrapper.findAll('.skeleton').length).toBeGreaterThan(0)
  })

  it('renders stats when loaded', () => {
    const details = {
        price: '50000.1234',
        change: '5.5',
        marketCap: '1000000000',
        '24hVolume': '50000000'
    }
    const wrapper = mount(CryptoStats, {
      props: {
        details,
        isFetching: false
      }
    })

    expect(wrapper.text()).toContain('$50,000.12')

    expect(wrapper.text()).toContain('+5.5%')

    // Matches $1B or $1.0B depending on environment
    expect(wrapper.text()).toMatch(/\$1(\.0)?B/)
  })

  it('renders negative change correctly', () => {
      const details = {
        price: '50000',
        change: '-2.5',
        marketCap: '1000',
        '24hVolume': '500'
    }
    const wrapper = mount(CryptoStats, {
      props: {
        details,
        isFetching: false
      }
    })

    expect(wrapper.text()).toContain('-2.5%')
    expect(wrapper.find('.text-red').exists()).toBe(true)
  })
})
